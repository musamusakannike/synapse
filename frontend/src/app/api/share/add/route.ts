import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { syncUserSubscriptionStatus } from "@/lib/paystack";
import { ObjectId } from "mongodb";

const COLLECTION_MAP: Record<string, string> = {
  course: "courses",
  quiz: "quizzes",
  video: "videos",
  chat: "questions",
};

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload || null;
}

/**
 * POST - Clone a shared resource into the authenticated user's library.
 * Premium-only action.
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const premiumActive = await syncUserSubscriptionStatus(session.userId);
    if (!premiumActive) {
      return NextResponse.json(
        { error: "Premium subscription required to add shared content to your library.", code: "PREMIUM_REQUIRED" },
        { status: 403 }
      );
    }

    const { id, type } = await request.json();
    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    }

    const collectionName = COLLECTION_MAP[type];
    if (!collectionName) {
      return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const resource = await db.collection(collectionName).findOne({
      _id: new ObjectId(id),
      isPublic: true,
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found or is private" }, { status: 404 });
    }

    // Don't clone if user already owns it
    if (resource.userId === session.userId) {
      return NextResponse.json({ error: "You already own this resource", code: "ALREADY_OWNED" }, { status: 409 });
    }

    // Check if already cloned
    const existingClone = await db.collection(collectionName).findOne({
      userId: session.userId,
      clonedFrom: id,
    });

    if (existingClone) {
      return NextResponse.json({ error: "Already added to your library", code: "ALREADY_ADDED" }, { status: 409 });
    }

    // Clone the resource — strip ownership/metadata fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _omit1, userId: _omit2, isPublic: _omit3, createdAt: _omit4, ...rest } = resource;
    const clone = {
      ...rest,
      userId: session.userId,
      clonedFrom: id,
      isPublic: false,
      createdAt: new Date(),
    };

    const result = await db.collection(collectionName).insertOne(clone);

    // For courses, also clone all associated lessons
    if (type === "course") {
      const lessons = await db.collection("lessons").find({ courseId: id }).toArray();
      if (lessons.length > 0) {
        const clonedLessons = lessons.map((lesson) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id: _lid, userId: _luid, courseId: _lcid, ...lessonRest } = lesson;
          return {
            ...lessonRest,
            userId: session.userId,
            courseId: result.insertedId.toString(),
            createdAt: new Date(),
          };
        });
        await db.collection("lessons").insertMany(clonedLessons);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${type} added to your library`,
      clonedId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Share Add Error:", error);
    return NextResponse.json({ error: "Failed to add resource" }, { status: 500 });
  }
}
