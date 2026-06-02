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
    if (search) query.fileName = { $regex: search, $options: "i" };

    const total = await db.collection("documents").countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const docs = await db.collection("documents")
      .find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();

    const userIds = [...new Set(docs.map((d) => d.userId))];
    const users = await db.collection("users")
      .find({ _id: { $in: userIds.filter(ObjectId.isValid).map((id) => new ObjectId(id)) } })
      .project({ name: 1, email: 1 }).toArray();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return NextResponse.json({
      success: true,
      documents: docs.map((d) => {
        const user = userMap.get(d.userId);
        return {
          _id: d._id.toString(),
          fileName: d.fileName,
          mimeType: d.mimeType,
          sizeBytes: d.sizeBytes,
          userId: d.userId,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "",
          hasInsights: !!d.insights,
          createdAt: d.createdAt,
        };
      }),
      page, totalPages, total,
    });
  } catch (error) {
    console.error("Admin Documents Error:", error);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}
