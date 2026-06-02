import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

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
      query.title = { $regex: search, $options: "i" };
    }

    const total = await db.collection("courses").countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const courses = await db.collection("courses")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get user info for each course
    const userIds = [...new Set(courses.map((c) => c.userId))];
    const users = await db.collection("users")
      .find({ _id: { $in: userIds.map((id) => {
        try { return new (require("mongodb").ObjectId)(id); } catch { return id; }
      })} })
      .project({ name: 1, email: 1 })
      .toArray();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return NextResponse.json({
      success: true,
      courses: courses.map((c) => {
        const modules = c.outline?.modules || [];
        const allLessons = modules.flatMap((m: { lessons?: unknown[] }) => m.lessons || []);
        const completed = allLessons.filter((l: { isCompleted?: boolean }) => l.isCompleted).length;
        const user = userMap.get(c.userId);
        return {
          _id: c._id.toString(),
          title: c.title,
          userId: c.userId,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "",
          level: c.level,
          style: c.style,
          moduleCount: modules.length,
          lessonCount: allLessons.length,
          completedCount: completed,
          progress: allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0,
          createdAt: c.createdAt,
        };
      }),
      page, totalPages, total,
    });
  } catch (error) {
    console.error("Admin Courses Error:", error);
    return NextResponse.json({ error: "Failed to load courses" }, { status: 500 });
  }
}
