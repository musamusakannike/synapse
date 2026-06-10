import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyGoogleToken } from "@/lib/firebase";
import { signJWT } from "@/lib/jwt";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "idToken is required" }, { status: 400 });
    }

    // Verify token using Firebase Admin
    const decodedToken = await verifyGoogleToken(idToken);

    const email = decodedToken.email;
    const name = decodedToken.name || decodedToken.email?.split("@")[0] || "Google User";

    if (!email) {
      return NextResponse.json({ error: "Failed to authenticate Google user token." }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Check if user exists
    let user = await db.collection("users").findOne({ email: email.toLowerCase() });

    const today = new Date().toISOString().split("T")[0];

    if (!user) {
      // Create user
      const result = await db.collection("users").insertOne({
        name: name || "Google Scholar",
        email: email.toLowerCase(),
        googleAuth: true,
        premium: false,
        generationsToday: 0,
        lastGenerationResetDate: today,
        style: "textual",
        level: "self-learner",
        goals: "",
        createdAt: new Date(),
      });
      user = {
        _id: result.insertedId,
        name: name || "Google Scholar",
        email: email.toLowerCase(),
        premium: false,
      } as any;

      // Send welcome email asynchronously
      sendWelcomeEmail(email.toLowerCase(), name || "Google Scholar").catch((err) => {
        console.error("Failed to send welcome email during Google registration:", err);
      });
    } else {

      // Ensure googleAuth is flag set in database
      await db.collection("users").updateOne(
        { _id: user!._id },
        { $set: { googleAuth: true } }
      );
    }

    // Create session JWT token
    const token = signJWT({
      userId: user!._id.toString(),
      email: user!.email,
      name: user!.name,
    });

    // Set secure HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user!._id.toString(),
        name: user!.name,
        email: user!.email,
        premium: user!.premium || false,
      },
    });
  } catch (error: any) {
    console.error("Google Auth Route Error:", error);
    return NextResponse.json({ error: error.message || "Google Authentication failed" }, { status: 500 });
  }
}
