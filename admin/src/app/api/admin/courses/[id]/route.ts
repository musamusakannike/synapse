import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const { db } = await connectToDatabase();
    const course = await db.collection("courses").findOne({ _id: new ObjectId(id) });

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Admin Get Course Error:", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const { db } = await connectToDatabase();

    // Delete course and its lessons
    await Promise.all([
      db.collection("courses").deleteOne({ _id: new ObjectId(id) }),
      db.collection("lessons").deleteMany({ courseId: id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Delete Course Error:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
