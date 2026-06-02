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
    if (search) query.$or = [
      { title: { $regex: search, $options: "i" } },
      { topic: { $regex: search, $options: "i" } },
    ];

    const total = await db.collection("videos").countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const videos = await db.collection("videos")
      .find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();

    const userIds = [...new Set(videos.map((v) => v.userId))];
    const users = await db.collection("users")
      .find({ _id: { $in: userIds.filter(ObjectId.isValid).map((id) => new ObjectId(id)) } })
      .project({ name: 1, email: 1 }).toArray();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return NextResponse.json({
      success: true,
      videos: videos.map((v) => {
        const user = userMap.get(v.userId);
        return {
          _id: v._id.toString(),
          title: v.title,
          topic: v.topic,
          styleTheme: v.styleTheme,
          sceneCount: (v.scenes || []).length,
          userId: v.userId,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "",
          createdAt: v.createdAt,
        };
      }),
      page, totalPages, total,
    });
  } catch (error) {
    console.error("Admin Videos Error:", error);
    return NextResponse.json({ error: "Failed to load videos" }, { status: 500 });
  }
}
