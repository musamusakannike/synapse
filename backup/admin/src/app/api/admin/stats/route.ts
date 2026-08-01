import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const [
      totalUsers,
      premiumUsers,
      totalCourses,
      totalQuizzes,
      totalDocuments,
      totalVideos,
      totalQuestions,
      payments,
      recentUsers,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ premium: true }),
      db.collection("courses").countDocuments(),
      db.collection("quizzes").countDocuments(),
      db.collection("documents").countDocuments(),
      db.collection("videos").countDocuments(),
      db.collection("questions").countDocuments(),
      db.collection("payments").find({ status: "success" }).toArray(),
      db.collection("users").find().sort({ createdAt: -1 }).limit(5).project({ password: 0 }).toArray(),
    ]);

    // Revenue
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = payments
      .filter((p) => new Date(p.paidAt || p.createdAt) >= thisMonthStart)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // New users per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersByDay = await db
      .collection("users")
      .aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Fill in missing days
    const signupChart: { date: string; count: number }[] = [];
    const cursor = new Date(thirtyDaysAgo);
    while (cursor <= now) {
      const key = cursor.toISOString().slice(0, 10);
      const found = newUsersByDay.find((d) => d._id === key);
      signupChart.push({ date: key, count: found ? found.count : 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Recent payments
    const recentPayments = payments
      .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        premiumUsers,
        freeUsers: totalUsers - premiumUsers,
        totalCourses,
        totalQuizzes,
        totalDocuments,
        totalVideos,
        totalQuestions,
        totalRevenue,
        monthlyRevenue,
        totalPayments: payments.length,
      },
      signupChart,
      recentUsers: recentUsers.map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        premium: u.premium,
        createdAt: u.createdAt,
      })),
      recentPayments: recentPayments.map((p) => ({
        _id: p._id.toString(),
        reference: p.reference,
        userId: p.userId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        plan: p.plan,
        source: p.source || "paystack",
        paidAt: p.paidAt || p.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
