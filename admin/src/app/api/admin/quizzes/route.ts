import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const search = searchParams.get("search")?.trim() || "";

    const { db } = await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }

    const total = await db.collection("quizzes").countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const quizzes = await db.collection("quizzes")
      .find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();

    const userIds = [...new Set(quizzes.map((q) => q.userId))];
    const users = await db.collection("users")
      .find({ _id: { $in: userIds.filter(ObjectId.isValid).map((id) => new ObjectId(id)) } })
      .project({ name: 1, email: 1 }).toArray();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return NextResponse.json({
      success: true,
      quizzes: quizzes.map((q) => {
        const attempts = q.attempts || [];
        const best = attempts.length > 0
          ? Math.max(...attempts.map((a: { score: number; total: number }) => a.total > 0 ? Math.round((a.score / a.total) * 100) : 0))
          : null;
        const user = userMap.get(q.userId);
        return {
          _id: q._id.toString(),
          title: q.title,
          topic: q.topic,
          userId: q.userId,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "",
          questionCount: (q.questions || []).length,
          attemptCount: attempts.length,
          bestScore: best,
          createdAt: q.createdAt,
        };
      }),
      page, totalPages, total,
    });
  } catch (error) {
    console.error("Admin Quizzes Error:", error);
    return NextResponse.json({ error: "Failed to load quizzes" }, { status: 500 });
  }
}
