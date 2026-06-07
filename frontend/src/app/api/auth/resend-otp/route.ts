import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function getOtpEmailHtml(name: string, otp: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>New Reset Code</title></head>
<body style="background-color:#0C0C0E;margin:0;padding:0;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;">
  <div style="background-color:#0C0C0E;padding:40px 20px;text-align:center;">
    <div style="max-width:480px;margin:0 auto;background-color:#141416;border:1px solid #2A2A30;border-radius:16px;padding:40px;text-align:left;">
      <div style="text-align:center;margin-bottom:30px;">
        <a href="https://sabilearn.online" style="font-size:22px;font-weight:800;letter-spacing:4px;color:#F5F2ED;text-decoration:none;text-transform:uppercase;">SABI<span style="color:#E8A838;">LEARN</span></a>
      </div>
      <div style="height:1px;background-color:#2A2A30;margin:0 0 25px;"></div>
      <h1 style="font-size:22px;font-weight:700;color:#F5F2ED;margin:0 0 12px;">New reset code</h1>
      <p style="font-size:15px;color:#A8A29E;line-height:1.6;margin:0 0 24px;">Hi ${name}, here is your new reset code. It expires in <strong style="color:#F5F2ED;">15 minutes</strong>.</p>
      <div style="background-color:#1C1C20;border:1px solid #2A2A30;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;">
        <p style="font-size:13px;font-weight:700;letter-spacing:1px;color:#E8A838;margin:0 0 12px;text-transform:uppercase;">Your new code</p>
        <p style="font-size:40px;font-weight:800;letter-spacing:12px;color:#F5F2ED;margin:0;">${otp}</p>
      </div>
      <p style="font-size:13px;color:#6B6560;">&copy; ${year} Sabi Learn. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      { $set: { resetOtp: otp, resetOtpExpiry: otpExpiry } }
    );

    await sendEmail({
      to: email.toLowerCase(),
      subject: "Your new Sabi Learn reset code",
      html: getOtpEmailHtml(user.name, otp),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json({ error: "Failed to resend code" }, { status: 500 });
  }
}
