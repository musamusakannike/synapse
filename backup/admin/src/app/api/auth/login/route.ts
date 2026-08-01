import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { signAdminJWT } from "@/lib/jwt";
import { isAllowedAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide email and password." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is in the admin allowlist
    if (!isAllowedAdmin(normalizedEmail)) {
      return NextResponse.json(
        { error: "Access denied. This email is not authorized as admin." },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const admin = await db.collection("admins").findOne({ email: normalizedEmail });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin account not found. Please seed your admin account first." },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = signAdminJWT({
      adminId: admin._id.toString(),
      email: admin.email,
    });

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
        id: admin._id.toString(),
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
