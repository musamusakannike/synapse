import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import {
  generateQuizQuestions,
  generateCourseOutline,
  generateVideoScript,
} from "@/lib/deepseek";
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
 * POST convert a Q&A answer to quiz, course, or video
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId, convertTo, numQuestions = 5, numScenes = 5 } = await request.json();
    if (!questionId || !convertTo) {
      return NextResponse.json(
        { error: "Question ID and conversion type required" },
        { status: 400 }
      );
    }

    if (!["quiz", "course", "video"].includes(convertTo)) {
      return NextResponse.json(
        { error: "Invalid conversion type. Must be quiz, course, or video" },
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

    const { db } = await connectToDatabase();

    // Fetch the question
    const questionDoc = await db.collection("questions").findOne({
      _id: new ObjectId(questionId),
      userId,
    });

    if (!questionDoc) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Get user profile
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile = {
      style: user.style || "textual",
      level: user.level || "self-learner",
      goals: user.goals || "",
    };

    const topic = questionDoc.question;
    // Use the answer as document context for better relevance
    const documentContext = `Based on the following Q&A context:\nQuestion: ${questionDoc.question}\n\nAnswer: ${questionDoc.answer}`;

    let result;

    switch (convertTo) {
      case "quiz": {
        const quizData = await generateQuizQuestions(
          topic,
          userProfile,
          documentContext,
          Math.min(numQuestions, user.premium ? 100 : 15)
        );

        const insertResult = await db.collection("quizzes").insertOne({
          userId,
          title: quizData.title || `Quiz: ${topic}`,
          topic: topic,
          questions: quizData.questions,
          attempts: [],
          createdAt: new Date(),
          convertedFrom: questionId,
        });

        result = {
          success: true,
          type: "quiz",
          quizId: insertResult.insertedId.toString(),
          title: quizData.title,
          generationsToday: usage.generationsToday,
          limit: usage.limit,
        };
        break;
      }

      case "course": {
        const courseData = await generateCourseOutline(
          topic,
          userProfile.level,
          userProfile.style,
          userProfile.goals,
          documentContext
        );

        const insertResult = await db.collection("courses").insertOne({
          userId,
          title: courseData.title,
          level: courseData.level || userProfile.level,
          style: courseData.style || userProfile.style,
          outline: courseData.outline,
          createdAt: new Date(),
          convertedFrom: questionId,
        });

        result = {
          success: true,
          type: "course",
          courseId: insertResult.insertedId.toString(),
          title: courseData.title,
          generationsToday: usage.generationsToday,
          limit: usage.limit,
        };
        break;
      }

      case "video": {
        const styleTheme = user.style === "visual" ? "emerald" : "slate";
        const videoData = await generateVideoScript(
          topic,
          styleTheme,
          userProfile,
          Math.min(Math.max(3, numScenes), 8),
          documentContext
        );

        const insertResult = await db.collection("videos").insertOne({
          userId,
          title: videoData.title,
          topic: topic,
          styleTheme,
          scenes: videoData.scenes,
          createdAt: new Date(),
          convertedFrom: questionId,
        });

        result = {
          success: true,
          type: "video",
          videoId: insertResult.insertedId.toString(),
          title: videoData.title,
          generationsToday: usage.generationsToday,
          limit: usage.limit,
        };
        break;
      }
    }

    if (!result) {
      throw new Error("Conversion failed - no result generated");
    }

    // Update the question with conversion info
    await db.collection("questions").updateOne(
      { _id: new ObjectId(questionId) },
      {
        $set: {
          convertedTo: convertTo,
          convertedAt: new Date(),
          conversionResultId:
            result.quizId || result.courseId || result.videoId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Convert Answer Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert answer" },
      { status: 500 }
    );
  }
}
