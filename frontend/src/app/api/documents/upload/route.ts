import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { uploadToR2, isR2Configured } from "@/lib/r2";
import { extractTextFromBuffer, isSupportedMime } from "@/lib/document-extract";

// Allow up to 5 minutes for large scanned PDFs that require multi-batch OCR
export const maxDuration = 300;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      console.warn("[Upload API] Failed: Unauthorized (No token found in cookies)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = verifyJWT(token);
    if (!session) {
      console.warn("[Upload API] Failed: Unauthorized (Invalid token)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Upload API] Initiating document upload for user ID: ${session.userId}`);

    if (!isR2Configured) {
      console.error("[Upload API] Failed: R2 storage is not configured");
      return NextResponse.json(
        { error: "File storage is not configured. Please set up Cloudflare R2." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      console.warn("[Upload API] Failed: No file provided in form data");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`[Upload API] File received: "${file.name}" (Type: ${file.type}, Size: ${file.size} bytes)`);

    if (file.size > MAX_FILE_SIZE) {
      console.warn(`[Upload API] Failed: File size ${file.size} exceeds maximum limit of ${MAX_FILE_SIZE} bytes for: "${file.name}"`);
      return NextResponse.json(
        { error: "File too large. Maximum size is 20 MB." },
        { status: 400 }
      );
    }

    if (!isSupportedMime(file.type)) {
      console.warn(`[Upload API] Failed: Unsupported MIME type "${file.type}" for file: "${file.name}"`);
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Supported: PDF, DOCX, PNG, JPEG, WebP, GIF, TXT, Markdown.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const useMicroservice = !!process.env.OCR_MICROSERVICE_URL;
    let ocrStatus = "completed";
    let extractedText = "";

    if (useMicroservice) {
      ocrStatus = "processing";
      console.log(`[Upload API] OCR Microservice is enabled. Postponing extraction for: "${file.name}"`);
    } else {
      // Fallback: Run OCR synchronously
      try {
        console.log(`[Upload API] OCR Microservice URL is not set. Falling back to synchronous extraction for: "${file.name}"`);
        extractedText = await extractTextFromBuffer(buffer, file.type, file.name);
        console.log(`[Upload API] Synced text extraction completed successfully for: "${file.name}" (Extracted length: ${extractedText.length} chars)`);
      } catch (extractError: any) {
        console.error(`[Upload API] Synced text extraction failed for: "${file.name}". Error: ${extractError.message || extractError}`);
        ocrStatus = "failed";
      }
    }

    // Upload to R2
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const r2Key = `documents/${session.userId}/${timestamp}-${safeName}`;
    
    console.log(`[Upload API] Uploading buffer to R2 with key: "${r2Key}"`);
    const publicUrl = await uploadToR2(buffer, r2Key, file.type);
    console.log(`[Upload API] Uploaded successfully to R2. Public URL: ${publicUrl}`);

    // Save metadata to MongoDB
    console.log(`[Upload API] Saving metadata to MongoDB for document: "${file.name}"`);
    const { db } = await connectToDatabase();
    const result = await db.collection("documents").insertOne({
      userId: session.userId,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      r2Key,
      publicUrl,
      extractedText,
      ocrStatus,
      createdAt: new Date(),
    });
    console.log(`[Upload API] Metadata saved to MongoDB with document ID: ${result.insertedId}`);

    // Asynchronously call the microservice if enabled
    if (useMicroservice) {
      const microserviceUrl = process.env.OCR_MICROSERVICE_URL;
      const secret = process.env.OCR_MICROSERVICE_SECRET;
      
      console.log(`[Upload API] Triggering OCR microservice asynchronously for document: ${result.insertedId}`);
      
      // Fire-and-forget fetch to avoid blocking the API response
      fetch(`${microserviceUrl}/process-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "Authorization": `Bearer ${secret}` } : {}),
        },
        body: JSON.stringify({ documentId: result.insertedId.toString() }),
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`[Upload API] Microservice returned error: ${res.status} - ${text}`);
          // Update status in DB to failed
          await db.collection("documents").updateOne(
            { _id: result.insertedId },
            { $set: { ocrStatus: "failed", ocrError: `Microservice returned HTTP ${res.status}: ${text}` } }
          );
        } else {
          console.log(`[Upload API] Microservice successfully triggered for document ${result.insertedId}`);
        }
      }).catch(async (fetchErr) => {
        console.error(`[Upload API] Failed to contact microservice:`, fetchErr);
        await db.collection("documents").updateOne(
          { _id: result.insertedId },
          { $set: { ocrStatus: "failed", ocrError: fetchErr.message || String(fetchErr) } }
        );
      });
    }

    console.log(`[Upload API] Document "${file.name}" uploaded successfully!`);

    return NextResponse.json({
      success: true,
      document: {
        _id: result.insertedId.toString(),
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        publicUrl,
        ocrStatus,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Upload API] Critical error during document upload:", error);
    const message = error instanceof Error ? error.message : "Failed to upload document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
