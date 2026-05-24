import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_mockkey";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // Verify webhook source using HMAC SHA512 signature matching
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("Invalid webhook signature received.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "charge.success") {
      const data = payload.data;
      const userId = data.metadata?.userId;

      if (userId) {
        console.log(`Paystack Webhook: Activating premium for user ${userId}`);
        const { db } = await connectToDatabase();
        await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          { $set: { premium: true } }
        );
      }
    }

    // Always respond with a 200 OK to Paystack
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
