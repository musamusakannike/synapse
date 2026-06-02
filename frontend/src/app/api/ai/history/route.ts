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
 * GET user's Q&A history
 */
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const pinnedOnly = searchParams.get("pinned") === "true";

    let query: any = { userId };

    if (pinnedOnly) {
      query.pinned = true;
    }

    const questions = await db
      .collection("questions")
      .find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .toArray();

    // Filter by search if provided
    let filteredQuestions = questions;
    if (search) {
      filteredQuestions = questions.filter(
        (q) =>
          q.question.toLowerCase().includes(search) ||
          q.answer.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      questions: filteredQuestions,
    });
  } catch (error: any) {
    console.error("GET History Error:", error);
    return NextResponse.json({ error: "Failed to retrieve history" }, { status: 500 });
  }
}

/**
 * PATCH toggle pin status
 */
export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId, pinned } = await request.json();
    if (!questionId) {
      return NextResponse.json({ error: "Question ID required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("questions").updateOne(
      { _id: new ObjectId(questionId), userId },
      {
        $set: {
          pinned: pinned,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, pinned });
  } catch (error: any) {
    console.error("PATCH History Error:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

/**
 * DELETE a question from history
 */
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("id");

    if (!questionId) {
      return NextResponse.json({ error: "Question ID required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("questions").deleteOne({
      _id: new ObjectId(questionId),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE History Error:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
