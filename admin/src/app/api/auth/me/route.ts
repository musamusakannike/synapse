import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/auth";

/**
 * GET — return the current admin session
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: session.adminId,
        email: session.email,
      },
    });
  } catch (error) {
    console.error("Admin Me Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST — logout (clears admin_token cookie)
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    return NextResponse.json({ success: true, message: "Logged out" });
  } catch {
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
