import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase, CourseDocument, LessonDocument } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateCourseOutline, generateLessonContent } from "@/lib/deepseek";
import { checkAndIncrementUsage } from "@/lib/paystack";
import { ObjectId } from "mongodb";

// Authenticate session helper
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

/**
 * GET user's courses or a specific course by ID
 */
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");
    const lessonId = searchParams.get("lessonId");

    // Case 1: Fetch single lesson details
    if (lessonId) {
      const lesson = await db.collection("lessons").findOne({
        _id: new ObjectId(lessonId),
        userId,
      });
      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, lesson });
    }

    // Case 2: Fetch single course details (with fully enriched lessons)
    if (courseId) {
      const course = await db.collection("courses").findOne({
        _id: new ObjectId(courseId),
        userId,
      });
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, course });
    }

    // Case 3: List all courses for this user
    const courses = await db
      .collection("courses")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    console.error("GET Course Error:", error);
    return NextResponse.json({ error: "Failed to retrieve course data" }, { status: 500 });
  }
}

/**
 * POST create a new course outline
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic } = await request.json();
    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Rate Limit check
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

    // Generate Custom Course outline from DeepSeek
    const courseData = await generateCourseOutline(
      topic,
      userProfile.level,
      userProfile.style,
      userProfile.goals
    );

    // Save Course in MongoDB
    const result = await db.collection("courses").insertOne({
      userId,
      title: courseData.title || `Course: ${topic}`,
      level: userProfile.level,
      style: userProfile.style,
      outline: courseData.outline,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      courseId: result.insertedId.toString(),
      generationsToday: usage.generationsToday,
      limit: usage.limit,
    });
  } catch (error: any) {
    console.error("POST Course Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate course outline" }, { status: 500 });
  }
}

/**
 * PUT incrementally generate lesson content (Context Aware)
 */
export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, moduleTitle, lessonTitle } = await request.json();
    if (!courseId || !moduleTitle || !lessonTitle) {
      return NextResponse.json({ error: "Missing required properties" }, { status: 400 });
    }

    // Rate Limit check
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

    const course = await db.collection("courses").findOne({
      _id: new ObjectId(courseId),
      userId,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Context-Awareness: Get previous generated lesson text
    const lastLesson = await db
      .collection("lessons")
      .find({ courseId, userId })
      .sort({ sequenceOrder: -1 })
      .limit(1)
      .toArray();

    const previousContent = lastLesson.length > 0 ? lastLesson[0].content : undefined;
    const nextOrder = lastLesson.length > 0 ? lastLesson[0].sequenceOrder + 1 : 1;

    // Generate detailed lesson content
    const lessonData = await generateLessonContent(
      course.title,
      moduleTitle,
      lessonTitle,
      {
        style: user.style || "textual",
        level: user.level || "self-learner",
        goals: user.goals || "",
      },
      previousContent
    );

    // Save Lesson document
    const newLessonResult = await db.collection("lessons").insertOne({
      courseId,
      userId,
      moduleTitle,
      lessonTitle,
      summary: lessonData.summary,
      content: lessonData.content,
      sequenceOrder: nextOrder,
      createdAt: new Date(),
    });

    const newLessonId = newLessonResult.insertedId.toString();

    // Update Course outline state to reference the generated lesson ID and set isCompleted = true
    const updatedModules = course.outline.modules.map((m: any) => {
      if (m.title === moduleTitle) {
        return {
          ...m,
          lessons: m.lessons.map((l: any) => {
            if (l.title === lessonTitle) {
              return { ...l, isCompleted: true, generatedLessonId: newLessonId };
            }
            return l;
          }),
        };
      }
      return m;
    });

    await db.collection("courses").updateOne(
      { _id: new ObjectId(courseId) },
      { $set: { "outline.modules": updatedModules } }
    );

    return NextResponse.json({
      success: true,
      lessonId: newLessonId,
      summary: lessonData.summary,
      content: lessonData.content,
      generationsToday: usage.generationsToday,
      limit: usage.limit,
    });
  } catch (error: any) {
    console.error("Incremental Lesson Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate lesson content" }, { status: 500 });
  }
}
