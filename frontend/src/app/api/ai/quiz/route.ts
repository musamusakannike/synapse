import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase, QuizDocument } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateQuizQuestions } from "@/lib/deepseek";
import { checkAndIncrementUsage } from "@/lib/paystack";
import { buildDocumentContext } from "@/lib/document-context";
import { ObjectId } from "mongodb";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

/**
 * GET user's quizzes or a specific quiz
 */
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");

    if (quizId) {
      const quiz = await db.collection("quizzes").findOne({
        _id: new ObjectId(quizId),
        userId,
      });
      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, quiz });
    }

    const quizzes = await db
      .collection("quizzes")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, quizzes });
  } catch (error: any) {
    console.error("GET Quiz Error:", error);
    return NextResponse.json({ error: "Failed to retrieve quiz" }, { status: 500 });
  }
}

/**
 * POST spin up a new quiz
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, documentIds } = await request.json();
    if ((!topic || topic.trim() === "") && (!documentIds || documentIds.length === 0)) {
      return NextResponse.json({ error: "Please provide a topic or upload a document" }, { status: 400 });
    }

    // Daily Limit Checker
    const usage = await checkAndIncrementUsage(userId);
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

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile = {
      style: user.style || "textual",
      level: user.level || "self-learner",
      goals: user.goals || "",
    };

    // Build document context if provided
    let documentContext = "";
    if (documentIds && documentIds.length > 0) {
      documentContext = await buildDocumentContext(documentIds, userId);
    }

    // Spin questions using DeepSeek
    const topicText = topic?.trim() || "Quiz based on the uploaded document(s)";
    const quizData = await generateQuizQuestions(topicText, userProfile, documentContext);

    // Save to MongoDB
    const result = await db.collection("quizzes").insertOne({
      userId,
      title: quizData.title || `Quiz: ${topicText}`,
      topic: topicText,
      questions: quizData.questions,
      attempts: [],
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      quizId: result.insertedId.toString(),
      generationsToday: usage.generationsToday,
      limit: usage.limit,
    });
  } catch (error: any) {
    console.error("POST Quiz Error:", error);
    return NextResponse.json({ error: error.message || "Failed to spin up quiz" }, { status: 500 });
  }
}

/**
 * PUT log quiz attempt results
 */
export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, score, total } = await request.json();
    if (!quizId || score === undefined || total === undefined) {
      return NextResponse.json({ error: "Missing score/total parameters" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("quizzes").updateOne(
      { _id: new ObjectId(quizId), userId },
      {
        $push: {
          attempts: {
            score,
            total,
            takenAt: new Date(),
          },
        } as any,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT Quiz Attempt Error:", error);
    return NextResponse.json({ error: "Failed to record quiz score" }, { status: 500 });
  }
}
