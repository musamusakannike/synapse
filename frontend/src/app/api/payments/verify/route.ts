import { NextResponse } from "next/server";
import {
  activateMonthlySubscription,
  PREMIUM_SUBSCRIPTION_PLAN,
  verifyTransaction,
} from "@/lib/paystack";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const baseUrl = new URL(request.url).origin;

  if (!reference) {
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=missing_reference`);
  }

  try {
    const txData = await verifyTransaction(reference);

    if (txData?.status === "success" && txData.metadata?.plan === PREMIUM_SUBSCRIPTION_PLAN) {
      const userId = txData.metadata?.userId;
      if (userId) {
        await activateMonthlySubscription(userId, {
          reference: txData.reference,
          amount: txData.amount,
          currency: txData.currency,
          paidAt: txData.paid_at,
          customerCode: txData.customer?.customer_code,
        });
        return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=success`);
      }
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=failed`);
  } catch (error) {
    console.error("Payment verification route error:", error);
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=error`);
  }
}
