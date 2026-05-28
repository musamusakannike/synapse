import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateTutorAnswer } from "@/lib/deepseek";
import { checkAndIncrementUsage } from "@/lib/paystack";
import { buildDocumentContext } from "@/lib/document-context";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
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
    const { question, documentIds } = await request.json();
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

    // 6. Query DeepSeek API
    const questionText = question?.trim() || "Analyze and explain the key concepts from the uploaded document(s).";
    const answerMarkdown = await generateTutorAnswer(questionText, userProfile, documentContext);

    // 7. Log Q&A activity in database
    await db.collection("questions").insertOne({
      userId: session.userId,
      question: questionText,
      documentIds: documentIds || [],
      answer: answerMarkdown,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      answer: answerMarkdown,
      generationsToday: usage.generationsToday,
      limit: usage.limit,
    });
  } catch (error: any) {
    console.error("AI Tutor Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process academic query" }, { status: 500 });
  }
}
