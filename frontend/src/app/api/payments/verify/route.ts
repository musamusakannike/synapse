import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const baseUrl = new URL(request.url).origin;

  if (!reference) {
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=missing_reference`);
  }

  try {
    const txData = await verifyTransaction(reference);

    if (txData && txData.status === "success") {
      const userId = txData.metadata?.userId;
      if (userId) {
        const { db } = await connectToDatabase();
        await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          { $set: { premium: true } }
        );
        return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=success`);
      }
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=failed`);
  } catch (error) {
    console.error("Payment verification route error:", error);
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=error`);
  }
}
