import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// Helper to get user from session token cookie
async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = verifyJWT(token);
  if (!payload) return null;

  return payload;
}

/**
 * GET current authenticated user profile
 */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(session.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        premium: user.premium || false,
        style: user.style || "textual",
        level: user.level || "self-learner",
        goals: user.goals || "",
        generationsToday: user.generationsToday || 0,
      },
    });
  } catch (error: any) {
    console.error("Auth Me GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT update study preferences
 */
export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, style, level, goals } = await request.json();

    const { db } = await connectToDatabase();
    const updateDoc: any = {};

    if (name) updateDoc.name = name;
    if (style) updateDoc.style = style;
    if (level) updateDoc.level = level;
    if (goals !== undefined) updateDoc.goals = goals;

    if (Object.keys(updateDoc).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.userId) },
      { $set: updateDoc }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Auth Me PUT Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

/**
 * POST logout (clears token cookie)
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
