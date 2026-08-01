import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please provide name, email and password." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const today = new Date().toISOString().split("T")[0];

    // Insert user
    const result = await db.collection("users").insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      googleAuth: false,
      premium: false,
      generationsToday: 0,
      lastGenerationResetDate: today,
      style: "textual",
      level: "self-learner",
      goals: "",
      createdAt: new Date(),
    });

    const userId = result.insertedId.toString();

    // Sign JWT
    const token = signJWT({
      userId,
      email: email.toLowerCase(),
      name,
    });

    // Set HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Send welcome email asynchronously
    sendWelcomeEmail(email.toLowerCase(), name).catch((err) => {
      console.error("Failed to send welcome email during manual registration:", err);
    });


    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email: email.toLowerCase(),
        premium: false,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 });
  }
}
