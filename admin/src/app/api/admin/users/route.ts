import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search")?.trim() || "";
    const filter = searchParams.get("filter") || "all"; // all, free, active, expired

    const { db } = await connectToDatabase();

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (filter === "free") {
      query.premium = { $ne: true };
    } else if (filter === "active") {
      query.premium = true;
      query.subscriptionExpiresAt = { $gt: new Date() };
    } else if (filter === "expired") {
      query.subscriptionStatus = "expired";
    }

    const total = await db.collection("users").countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const users = await db
      .collection("users")
      .find(query)
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        googleAuth: u.googleAuth || false,
        premium: u.premium || false,
        subscriptionStatus: u.subscriptionStatus || "free",
        subscriptionExpiresAt: u.subscriptionExpiresAt || null,
        generationsToday: u.generationsToday || 0,
        style: u.style || "textual",
        level: u.level || "self-learner",
        createdAt: u.createdAt,
      })),
      page,
      totalPages,
      total,
    });
  } catch (error) {
    console.error("Admin Users Error:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
