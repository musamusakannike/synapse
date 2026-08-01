import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { sendAdminUpgradeEmail } from "@/lib/mail";


/**
 * POST — Upgrade a user's subscription by N months.
 * Body: { months: number }
 */
export async function POST(
  request: Request,
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

    const { months } = await request.json();
    if (!months || months < 1 || months > 24) {
      return NextResponse.json(
        { error: "Months must be between 1 and 24." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate new expiry: extend from current expiry if still active, otherwise from now
    const now = new Date();
    const currentExpiry = user.subscriptionExpiresAt
      ? new Date(user.subscriptionExpiresAt)
      : null;
    const baseDate =
      currentExpiry && currentExpiry > now ? currentExpiry : now;

    const newExpiry = new Date(baseDate);
    for (let i = 0; i < months; i++) {
      const day = newExpiry.getDate();
      newExpiry.setDate(1);
      newExpiry.setMonth(newExpiry.getMonth() + 1);
      const lastDay = new Date(
        newExpiry.getFullYear(),
        newExpiry.getMonth() + 1,
        0
      ).getDate();
      newExpiry.setDate(Math.min(day, lastDay));
    }

    // Update user subscription
    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          premium: true,
          subscriptionStatus: "active",
          subscriptionStartedAt: user.subscriptionStartedAt || now,
          subscriptionExpiresAt: newExpiry,
        },
      }
    );

    // Create an admin grant payment record for audit trail
    await db.collection("payments").insertOne({
      reference: `admin_grant_${Date.now()}_${id.slice(-6)}`,
      userId: id,
      amount: 0,
      currency: "NGN",
      status: "success",
      plan: "premium_monthly",
      source: "admin_grant",
      grantedBy: session.email,
      grantedMonths: months,
      paidAt: now,
      subscriptionExpiresAt: newExpiry,
      createdAt: now,
    });

    // Send admin upgrade email asynchronously
    if (user.email) {
      sendAdminUpgradeEmail(user.email, user.name || "Scholar", months, newExpiry).catch((err) => {
        console.error("Failed to send admin upgrade email:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: `Subscription extended by ${months} month${months > 1 ? "s" : ""}.`,
      subscriptionExpiresAt: newExpiry,
    });
  } catch (error) {
    console.error("Admin Upgrade Error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}
