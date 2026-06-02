import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { initializeTransaction, PREMIUM_SUBSCRIPTION_PRICE_NGN } from "@/lib/paystack";
import { ObjectId } from "mongodb";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize Paystack subscription at NGN 2,500
    const checkoutData = await initializeTransaction(
      user.email,
      PREMIUM_SUBSCRIPTION_PRICE_NGN,
      session.userId
    );

    return NextResponse.json({
      success: true,
      authorizationUrl: checkoutData.authorization_url,
      reference: checkoutData.reference,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initialize checkout";
    console.error("Payment Initialize Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
