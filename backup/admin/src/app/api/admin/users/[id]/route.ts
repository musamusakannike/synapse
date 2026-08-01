import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get content counts
    const userId = id;
    const [courses, quizzes, documents, videos, questions, payments] = await Promise.all([
      db.collection("courses").countDocuments({ userId }),
      db.collection("quizzes").countDocuments({ userId }),
      db.collection("documents").countDocuments({ userId }),
      db.collection("videos").countDocuments({ userId }),
      db.collection("questions").countDocuments({ userId }),
      db.collection("payments").find({ userId, status: "success" }).toArray(),
    ]);

    const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        googleAuth: user.googleAuth || false,
        premium: user.premium || false,
        subscriptionStatus: user.subscriptionStatus || "free",
        subscriptionStartedAt: user.subscriptionStartedAt || null,
        subscriptionExpiresAt: user.subscriptionExpiresAt || null,
        paystackCustomerCode: user.paystackCustomerCode || null,
        generationsToday: user.generationsToday || 0,
        style: user.style || "textual",
        level: user.level || "self-learner",
        goals: user.goals || "",
        createdAt: user.createdAt,
      },
      contentCounts: { courses, quizzes, documents, videos, questions },
      paymentHistory: payments.map((p) => ({
        _id: p._id.toString(),
        reference: p.reference,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        plan: p.plan,
        source: p.source || "paystack",
        paidAt: p.paidAt || p.createdAt,
      })),
      totalSpent,
    });
  } catch (error) {
    console.error("Admin User Detail Error:", error);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Cascade delete all user content
    const userId = id;
    await Promise.all([
      db.collection("courses").deleteMany({ userId }),
      db.collection("lessons").deleteMany({ userId }),
      db.collection("quizzes").deleteMany({ userId }),
      db.collection("documents").deleteMany({ userId }),
      db.collection("videos").deleteMany({ userId }),
      db.collection("questions").deleteMany({ userId }),
      db.collection("payments").deleteMany({ userId }),
      db.collection("users").deleteOne({ _id: new ObjectId(id) }),
    ]);

    return NextResponse.json({ success: true, message: "User and all content deleted." });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
