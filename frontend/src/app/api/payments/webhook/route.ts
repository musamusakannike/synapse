import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  activateMonthlySubscription,
  PREMIUM_SUBSCRIPTION_PLAN,
} from "@/lib/paystack";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!PAYSTACK_SECRET_KEY) {
      console.error("Paystack webhook received but PAYSTACK_SECRET_KEY is not configured.");
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // Verify webhook source using HMAC SHA512 signature matching
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    const hashBuffer = Buffer.from(hash, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");

    if (
      hashBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(hashBuffer, signatureBuffer)
    ) {
      console.warn("Invalid webhook signature received.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "charge.success") {
      const data = payload.data;
      const userId = data.metadata?.userId;

      if (userId && data.metadata?.plan === PREMIUM_SUBSCRIPTION_PLAN) {
        await activateMonthlySubscription(userId, {
          reference: data.reference,
          amount: data.amount,
          currency: data.currency,
          paidAt: data.paid_at,
          customerCode: data.customer?.customer_code,
        });
      }
    }

    // Always respond with a 200 OK to Paystack
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
