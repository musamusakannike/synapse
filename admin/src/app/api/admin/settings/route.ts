import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const admin = await db.collection("admins").findOne({ _id: new ObjectId(session.adminId) });

    if (!admin) {
      return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await db.collection("admins").updateOne(
      { _id: new ObjectId(session.adminId) },
      { $set: { password: hashedNewPassword, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Admin Change Password Error:", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
