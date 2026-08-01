import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { ObjectId } from "mongodb";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

/**
 * GET user's bookmarked (missed) questions
 */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const bookmarks = await db
      .collection("bookmarks")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      bookmarks: bookmarks.map((b) => ({
        _id: b._id.toString(),
        question: b.question,
        type: b.type,
        options: b.options || [],
        answer: b.answer,
        explanation: b.explanation,
        sourceQuizId: b.sourceQuizId,
        sourceQuizTitle: b.sourceQuizTitle,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET Bookmarks Error:", error);
    return NextResponse.json({ error: "Failed to load bookmarks" }, { status: 500 });
  }
}

/**
 * POST add a bookmark for a missed question
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sourceQuizId, sourceQuizTitle, question, type, options, answer, explanation } =
      await request.json();

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Avoid duplicates: one bookmark per (user, quiz, question text)
    const existing = await db.collection("bookmarks").findOne({
      userId,
      sourceQuizId: sourceQuizId || null,
      question,
    });
    if (existing) {
      return NextResponse.json({ success: true, bookmarkId: existing._id.toString(), already: true });
    }

    const result = await db.collection("bookmarks").insertOne({
      userId,
      sourceQuizId: sourceQuizId || null,
      sourceQuizTitle: sourceQuizTitle || null,
      question,
      type: type || "multiple-choice",
      options: options || [],
      answer,
      explanation: explanation || "",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, bookmarkId: result.insertedId.toString() });
  } catch (error) {
    console.error("POST Bookmark Error:", error);
    return NextResponse.json({ error: "Failed to bookmark question" }, { status: 500 });
  }
}

/**
 * DELETE remove a bookmark — by id, or by sourceQuizId + question text
 */
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const { db } = await connectToDatabase();

    if (id && ObjectId.isValid(id)) {
      await db.collection("bookmarks").deleteOne({ _id: new ObjectId(id), userId });
      return NextResponse.json({ success: true });
    }

    const sourceQuizId = searchParams.get("sourceQuizId");
    const question = searchParams.get("question");
    if (question) {
      await db.collection("bookmarks").deleteOne({
        userId,
        sourceQuizId: sourceQuizId || null,
        question,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Bookmark identifier required" }, { status: 400 });
  } catch (error) {
    console.error("DELETE Bookmark Error:", error);
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 });
  }
}
