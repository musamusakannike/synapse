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

    // 1. Fetch all successful payments for revenue stats
    const allSuccessfulPayments = await db
      .collection("payments")
      .find({ status: "success" })
      .toArray();

    const totalRevenue = allSuccessfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const organicRevenue = allSuccessfulPayments
      .filter((p) => !p.source || p.source === "paystack")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const grantedRevenue = allSuccessfulPayments
      .filter((p) => p.source === "admin_grant")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalCount = allSuccessfulPayments.length;
    const organicCount = allSuccessfulPayments.filter((p) => !p.source || p.source === "paystack").length;
    const grantedCount = allSuccessfulPayments.filter((p) => p.source === "admin_grant").length;

    // 2. Build query for paginated listing
    const query: Record<string, unknown> = {};

    // If search is provided, we can find users matching the email/name first, then filter by those userIds or match direct reference
    let matchedUserIds: string[] = [];
    if (search) {
      const users = await db
        .collection("users")
        .find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        })
        .project({ _id: 1 })
        .toArray();

      matchedUserIds = users.map((u) => u._id.toString());

      query.$or = [
        { reference: { $regex: search, $options: "i" } },
        { userId: { $in: matchedUserIds } },
      ];
    }

    const total = await db.collection("payments").countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const paymentsList = await db
      .collection("payments")
      .find(query)
      .sort({ paidAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get user details for joined info
    const listUserIds = [...new Set(paymentsList.map((p) => p.userId))];
    const listUsers = await db
      .collection("users")
      .find({
        _id: {
          $in: listUserIds.filter(ObjectId.isValid).map((id) => new ObjectId(id)),
        },
      })
      .project({ name: 1, email: 1 })
      .toArray();

    const userMap = new Map(listUsers.map((u) => [u._id.toString(), u]));

    return NextResponse.json({
      success: true,
      payments: paymentsList.map((p) => {
        const user = userMap.get(p.userId);
        return {
          _id: p._id.toString(),
          reference: p.reference || "N/A",
          userId: p.userId,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "Unknown Email",
          amount: p.amount || 0,
          currency: p.currency || "NGN",
          status: p.status || "failed",
          plan: p.plan || "monthly",
          source: p.source || "paystack",
          paidAt: p.paidAt || p.createdAt || new Date(),
        };
      }),
      revenueStats: {
        totalRevenue,
        organicRevenue,
        grantedRevenue,
        totalCount,
        organicCount,
        grantedCount,
      },
      page,
      totalPages,
      total,
    });
  } catch (error) {
    console.error("Admin Payments list error:", error);
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}
