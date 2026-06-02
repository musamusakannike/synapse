import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateQuizQuestions } from "@/lib/deepseek";
import { checkAndIncrementUsage } from "@/lib/paystack";
import { ObjectId } from "mongodb";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

interface QuizQuestion {
  question: string;
  type: string;
  options?: string[];
  answer: string;
  explanation: string;
}

/**
 * POST generate a new practice quiz with fresh questions that test the same
 * concepts the user got wrong. Source can be a quiz (with missed indices) or
 * an explicit list of questions (e.g. bookmarked ones).
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, questionIndices, questions: providedQuestions } = await request.json();

    const { db } = await connectToDatabase();

    let sourceQuestions: QuizQuestion[] = [];
    let topic = "practice";
    let sourceTitle = "missed questions";

    if (quizId && ObjectId.isValid(quizId)) {
      const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(quizId), userId });
      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }
      const all: QuizQuestion[] = quiz.questions || [];
      sourceQuestions =
        Array.isArray(questionIndices) && questionIndices.length > 0
          ? questionIndices.map((i: number) => all[i]).filter(Boolean)
          : all;
      topic = quiz.topic || quiz.title || topic;
      sourceTitle = quiz.title || sourceTitle;
    } else if (Array.isArray(providedQuestions) && providedQuestions.length > 0) {
      sourceQuestions = providedQuestions;
      topic = "your bookmarked questions";
      sourceTitle = "bookmarked questions";
    } else {
      return NextResponse.json(
        { error: "Provide a quizId or a list of questions to practice" },
        { status: 400 }
      );
    }

    if (sourceQuestions.length === 0) {
      return NextResponse.json({ error: "No questions available to practice" }, { status: 400 });
    }

    // Usage limit
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

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    const userProfile = {
      style: user?.style || "textual",
      level: user?.level || "self-learner",
      goals: user?.goals || "",
    };

    const missedContext = sourceQuestions
      .map(
        (q, i) =>
          `${i + 1}. Concept tested: ${q.question}\n   Correct answer: ${q.answer}\n   Why: ${q.explanation || ""}`
      )
      .join("\n\n");

    const documentContext = `The student previously struggled with the following questions. Generate BRAND-NEW questions that test the SAME underlying concepts (do not copy the wording). Reinforce the areas of weakness.\n\n${missedContext}`;

    const numQuestions = Math.min(
      Math.max(sourceQuestions.length, 5),
      user?.premium ? 20 : 10
    );

    const quizData = await generateQuizQuestions(
      topic,
      userProfile,
      documentContext,
      numQuestions
    );

    const result = await db.collection("quizzes").insertOne({
      userId,
      title: quizData.title || `Practice: ${sourceTitle}`,
      topic,
      questions: quizData.questions,
      attempts: [],
      isPractice: true,
      practiceFrom: quizId || null,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      quizId: result.insertedId.toString(),
      generationsToday: usage.generationsToday,
      limit: usage.limit,
    });
  } catch (error: unknown) {
    console.error("POST Similar Quiz Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate practice quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
