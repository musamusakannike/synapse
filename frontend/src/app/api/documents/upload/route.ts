import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { uploadToR2, isR2Configured } from "@/lib/r2";
import { extractTextFromBuffer, isSupportedMime } from "@/lib/document-extract";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: Request) {
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

    if (!isR2Configured) {
      return NextResponse.json(
        { error: "File storage is not configured. Please set up Cloudflare R2." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20 MB." },
        { status: 400 }
      );
    }

    if (!isSupportedMime(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Supported: PDF, DOCX, PNG, JPEG, WebP, GIF, TXT, Markdown.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text content
    let extractedText = "";
    try {
      extractedText = await extractTextFromBuffer(buffer, file.type, file.name);
    } catch {
      extractedText = "";
    }

    // Upload to R2
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const r2Key = `documents/${session.userId}/${timestamp}-${safeName}`;
    const publicUrl = await uploadToR2(buffer, r2Key, file.type);

    // Save metadata to MongoDB
    const { db } = await connectToDatabase();
    const result = await db.collection("documents").insertOne({
      userId: session.userId,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      r2Key,
      publicUrl,
      extractedText,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      document: {
        _id: result.insertedId.toString(),
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        publicUrl,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Document Upload Error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
