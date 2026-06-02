import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// Map shared type to DB collection name
const COLLECTION_MAP: Record<string, string> = {
  course: "courses",
  quiz: "quizzes",
  video: "videos",
  chat: "questions",
};

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

/**
 * GET - Retrieve shared resources without authentication
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type parameters" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Special Case: Lesson sharing (lessons are parented by courses)
    if (type === "lesson") {
      const lesson = await db.collection("lessons").findOne({ _id: new ObjectId(id) });
      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      // Verify the parent course is public
      const course = await db.collection("courses").findOne({ _id: new ObjectId(lesson.courseId) });
      if (!course || !course.isPublic) {
        return NextResponse.json({ error: "Access denied - course is private" }, { status: 403 });
      }

      return NextResponse.json({ success: true, lesson });
    }

    const collectionName = COLLECTION_MAP[type];
    if (!collectionName) {
      return NextResponse.json({ error: "Invalid sharing type" }, { status: 400 });
    }

    const resource = await db.collection(collectionName).findOne({
      _id: new ObjectId(id),
      isPublic: true,
    });

    if (!resource) {
      return NextResponse.json({ error: `${type} not found or is private` }, { status: 404 });
    }

    return NextResponse.json({ success: true, [type]: resource });
  } catch (error: any) {
    console.error("GET Share Link Error:", error);
    return NextResponse.json({ error: "Failed to load public resource" }, { status: 500 });
  }
}

/**
 * POST - Toggle dynamic sharing on a resource (Authenticated)
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type, isPublic = true } = await request.json();
    if (!id || !type) {
      return NextResponse.json({ error: "Missing required properties" }, { status: 400 });
    }

    const collectionName = COLLECTION_MAP[type];
    if (!collectionName) {
      return NextResponse.json({ error: "Invalid sharing type" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Verify ownership first
    const resource = await db.collection(collectionName).findOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!resource) {
      return NextResponse.json({ error: `${type} not found or access denied` }, { status: 404 });
    }

    // Toggle public visibility
    await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: { isPublic } }
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://synapse.codiac.online";
    const shareUrl = `${baseUrl}/share/${type}/${id}`;

    return NextResponse.json({
      success: true,
      isPublic,
      shareUrl,
    });
  } catch (error: any) {
    console.error("POST Share Link Error:", error);
    return NextResponse.json({ error: "Failed to configure sharing visibility" }, { status: 500 });
  }
}
