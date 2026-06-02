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

/**
 * POST generate a comprehensive final exam quiz for a completed course.
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId || !ObjectId.isValid(courseId)) {
      return NextResponse.json({ error: "Valid course ID required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(courseId),
      userId,
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const modules = course.outline?.modules || [];
    const allLessons = modules.flatMap((m: { lessons?: unknown[] }) => m.lessons || []);
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter((l: { isCompleted?: boolean }) => l.isCompleted).length;

    if (totalLessons === 0 || completedLessons < totalLessons) {
      return NextResponse.json(
        { error: "Complete all lessons before generating the final exam." },
        { status: 400 }
      );
    }

    // Enforce usage limits
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

    // Build context from generated lesson content for relevant, comprehensive questions
    const lessons = await db
      .collection("lessons")
      .find({ courseId, userId })
      .sort({ sequenceOrder: 1 })
      .toArray();

    const outlineContext = modules
      .map((m: { title: string; lessons?: Array<{ title: string }> }) => {
        const lessonTitles = (m.lessons || []).map((l) => `  - ${l.title}`).join("\n");
        return `${m.title}\n${lessonTitles}`;
      })
      .join("\n");

    const lessonContext = lessons
      .map((l) => `Lesson: ${l.lessonTitle}\nSummary: ${l.summary || ""}`)
      .join("\n\n")
      .slice(0, 8000); // keep context bounded

    const documentContext = `This is a cumulative final exam for the course "${course.title}".\n\nCourse outline:\n${outlineContext}\n\nLesson material:\n${lessonContext}`;

    const numQuestions = Math.min(Math.max(totalLessons * 2, 8), user?.premium ? 25 : 15);

    const quizData = await generateQuizQuestions(
      `Final exam covering the entire course: ${course.title}`,
      userProfile,
      documentContext,
      numQuestions
    );

    const result = await db.collection("quizzes").insertOne({
      userId,
      title: `Final Exam: ${course.title}`,
      topic: course.title,
      questions: quizData.questions,
      attempts: [],
      isFinalExam: true,
      examForCourse: courseId,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      quizId: result.insertedId.toString(),
      generationsToday: usage.generationsToday,
      limit: usage.limit,
    });
  } catch (error: unknown) {
    console.error("POST Final Exam Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate final exam";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
