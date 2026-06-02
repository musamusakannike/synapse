import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { isAllowedAdmin } from "@/lib/auth";

/**
 * POST — Create the first admin account.
 * Protected by JWT_SECRET as a header key.
 * Body: { email, password }
 */
export async function POST(request: Request) {
  try {
    const authKey = request.headers.get("x-admin-secret");
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || authKey !== jwtSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isAllowedAdmin(normalizedEmail)) {
      return NextResponse.json(
        { error: "This email is not in the ADMIN_EMAILS allowlist." },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    const existing = await db.collection("admins").findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Admin account already exists for this email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection("admins").insertOne({
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully.",
      adminId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Admin Seed Error:", error);
    return NextResponse.json({ error: "Failed to seed admin" }, { status: 500 });
  }
}
