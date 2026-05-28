import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { deleteFromR2 } from "@/lib/r2";
import { ObjectId } from "mongodb";

/**
 * GET — list all documents for the authenticated user
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const documents = await db
      .collection("documents")
      .find(
        { userId: session.userId },
        {
          projection: {
            fileName: 1,
            mimeType: 1,
            sizeBytes: 1,
            publicUrl: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error("List Documents Error:", error);
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 });
  }
}

/**
 * DELETE — remove a document by ID
 */
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("id");
    if (!docId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection("documents").findOne({
      _id: new ObjectId(docId),
      userId: session.userId,
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from R2
    try {
      await deleteFromR2(doc.r2Key);
    } catch (r2Err) {
      console.error("R2 deletion error (non-fatal):", r2Err);
    }

    // Delete from MongoDB
    await db.collection("documents").deleteOne({ _id: new ObjectId(docId) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Document Error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
