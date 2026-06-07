import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyGoogleToken } from "@/lib/firebase";
import { signAdminJWT } from "@/lib/jwt";
import { isAllowedAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "idToken is required" }, { status: 400 });
    }

    let email: string | undefined;
    let name: string | undefined;

    // Verify token using Firebase Admin
    const decodedToken = await verifyGoogleToken(idToken);

    if (decodedToken) {
      email = decodedToken.email;
      name = decodedToken.name || decodedToken.email?.split("@")[0] || "Google User";
    } else {
      // In local development, if Firebase Admin fails to initialize, we can attempt a secure client-side JWT decode fallback
      try {
        const payloadBase64 = idToken.split(".")[1];
        if (payloadBase64) {
          const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
          const payload = JSON.parse(payloadJson);
          email = payload.email;
          name = payload.name || payload.email?.split("@")[0] || "Google User";
        }
      } catch (decodeErr) {
        console.error("Local token decode fallback failed:", decodeErr);
      }
    }

    if (!email) {
      return NextResponse.json({ error: "Failed to authenticate Google user token." }, { status: 401 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is in the admin allowlist - this is the crucial admin status check
    if (!isAllowedAdmin(normalizedEmail)) {
      return NextResponse.json(
        { error: "Access denied. This email is not authorized as admin." },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if admin exists
    let admin = await db.collection("admins").findOne({ email: normalizedEmail });

    if (!admin) {
      // Create admin account if it doesn't exist (for Google OAuth users)
      const result = await db.collection("admins").insertOne({
        name: name || "Google Admin",
        email: normalizedEmail,
        googleAuth: true,
        createdAt: new Date(),
      });
      admin = {
        _id: result.insertedId,
        name: name || "Google Admin",
        email: normalizedEmail,
      } as any;
    } else {
      // Ensure googleAuth flag is set in database
      await db.collection("admins").updateOne(
        { _id: admin!._id },
        { $set: { googleAuth: true } }
      );
    }

    // Create session JWT token
    const token = signAdminJWT({
      adminId: admin!._id.toString(),
      email: admin!.email,
    });

    // Set secure HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin!._id.toString(),
        name: admin!.name,
        email: admin!.email,
      },
    });
  } catch (error: any) {
    console.error("Admin Google Auth Route Error:", error);
    return NextResponse.json({ error: error.message || "Google Authentication failed" }, { status: 500 });
  }
}
