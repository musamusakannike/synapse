import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateTutorAnswer } from "@/lib/deepseek";
import { checkAndIncrementUsage, refundUsage } from "@/lib/paystack";
import { buildDocumentContext } from "@/lib/document-context";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  let usageRefundUserId: string | null = null;
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const { question, documentIds, questionId } = await request.json();
    if ((!question || question.trim() === "") && (!documentIds || documentIds.length === 0)) {
      return NextResponse.json({ error: "Please provide a question or upload a document" }, { status: 400 });
    }

    // 3. Enforce Freemium rate limits
    const usage = await checkAndIncrementUsage(session.userId);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Daily generation limit reached",
          code: "LIMIT_REACHED",
          limit: usage.limit,
          generationsToday: usage.generationsToday,
        },
        { status: 403 }
      );
    }

    // 4. Retrieve student learning preferences
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile = {
      style: user.style || "textual",
      level: user.level || "self-learner",
      goals: user.goals || "",
    };

    // 5. Build document context if provided
    let documentContext = "";
    if (documentIds && documentIds.length > 0) {
      documentContext = await buildDocumentContext(documentIds, session.userId);
    }

    // Reserve a refund of this generation in case the AI call fails after the increment
    if (!usage.premium) usageRefundUserId = session.userId;

    // 6. Query DeepSeek API
    const questionText = question?.trim() || "Analyze and explain the key concepts from the uploaded document(s).";

    // Retrieve previous messages history if questionId is provided
    let history = [];
    let existingQuestion = null;
    if (questionId) {
      if (ObjectId.isValid(questionId)) {
        existingQuestion = await db.collection("questions").findOne({
          _id: new ObjectId(questionId),
          userId: session.userId,
        });
      }
      if (existingQuestion) {
        if (existingQuestion.messages && Array.isArray(existingQuestion.messages)) {
          history = existingQuestion.messages;
        } else {
          // Backward compatibility: create initial history messages
          history = [
            { role: "user", content: existingQuestion.question, createdAt: existingQuestion.createdAt },
            { role: "assistant", content: existingQuestion.answer, createdAt: existingQuestion.createdAt }
          ];
        }
      }
    }

    const answerMarkdown = await generateTutorAnswer(questionText, userProfile, documentContext, history);

    // 7. Log Q&A activity in database
    if (questionId && existingQuestion) {
      const updatedMessages = [
        ...history,
        { role: "user", content: questionText, createdAt: new Date() },
        { role: "assistant", content: answerMarkdown, createdAt: new Date() }
      ];
      await db.collection("questions").updateOne(
        { _id: new ObjectId(questionId), userId: session.userId },
        {
          $set: {
            messages: updatedMessages,
            answer: answerMarkdown,
            updatedAt: new Date(),
          }
        }
      );

      return NextResponse.json({
        success: true,
        questionId: questionId,
        answer: answerMarkdown,
        generationsToday: usage.generationsToday,
        limit: usage.limit,
      });
    } else {
      const newMessages = [
        { role: "user", content: questionText, createdAt: new Date() },
        { role: "assistant", content: answerMarkdown, createdAt: new Date() }
      ];
      const result = await db.collection("questions").insertOne({
        userId: session.userId,
        question: questionText,
        documentIds: documentIds || [],
        answer: answerMarkdown,
        messages: newMessages,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        questionId: result.insertedId.toString(),
        answer: answerMarkdown,
        generationsToday: usage.generationsToday,
        limit: usage.limit,
      });
    }
  } catch (error: any) {
    if (usageRefundUserId) await refundUsage(usageRefundUserId).catch(() => {});
    console.error("AI Tutor Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process academic query" }, { status: 500 });
  }
}
