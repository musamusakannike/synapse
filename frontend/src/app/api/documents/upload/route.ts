import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { uploadToR2, downloadFromR2, isR2Configured } from "@/lib/r2";
import { extractTextFromBuffer, isSupportedMime } from "@/lib/document-extract";

// Allow up to 5 minutes for large scanned PDFs that require multi-batch OCR
export const maxDuration = 300;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// Helper to get user session from cookie or Authorization header (for mobile support)
async function getSessionUser(request: Request) {
  // 1. Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyJWT(token);
    if (payload) return payload;
  }

  // 2. Fall back to cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  return verifyJWT(token);
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      console.warn("[Upload API] Failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Upload API] Initiating document registration/upload for user ID: ${session.userId}`);

    if (!isR2Configured) {
      console.error("[Upload API] Failed: R2 storage is not configured");
      return NextResponse.json(
        { error: "File storage is not configured. Please set up Cloudflare R2." },
        { status: 503 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let fileName = "";
    let mimeType = "";
    let sizeBytes = 0;
    let r2Key = "";
    let publicUrl = "";
    let buffer: Buffer | null = null;
    let isDirectUpload = false;

    if (contentType.includes("application/json")) {
      // Direct-to-R2 upload: Client sends file metadata
      const body = await request.json().catch(() => ({}));
      fileName = body.fileName;
      mimeType = body.mimeType;
      sizeBytes = body.sizeBytes;
      r2Key = body.r2Key;
      publicUrl = body.publicUrl;
      isDirectUpload = true;

      if (!fileName || !mimeType || !r2Key || !publicUrl) {
        console.warn("[Upload API] Failed: Missing metadata in JSON payload");
        return NextResponse.json({ error: "Missing required metadata fields" }, { status: 400 });
      }
    } else {
      // Legacy Multipart Form Upload
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        console.warn("[Upload API] Failed: No file provided in form data");
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      fileName = file.name;
      mimeType = file.type;
      sizeBytes = file.size;

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    console.log(`[Upload API] Processing file: "${fileName}" (Type: ${mimeType}, Size: ${sizeBytes} bytes, DirectUpload: ${isDirectUpload})`);

    if (sizeBytes > MAX_FILE_SIZE) {
      console.warn(`[Upload API] Failed: File size ${sizeBytes} exceeds maximum limit of ${MAX_FILE_SIZE} bytes for: "${fileName}"`);
      return NextResponse.json(
        { error: "File too large. Maximum size is 20 MB." },
        { status: 400 }
      );
    }

    if (!isSupportedMime(mimeType)) {
      console.warn(`[Upload API] Failed: Unsupported MIME type "${mimeType}" for file: "${fileName}"`);
      return NextResponse.json(
        { error: `Unsupported file type: ${mimeType}. Supported: PDF, DOCX, PNG, JPEG, WebP, GIF, TXT, Markdown.` },
        { status: 400 }
      );
    }

    const useMicroservice = !!process.env.OCR_MICROSERVICE_URL;
    let ocrStatus = "completed";
    let extractedText = "";

    // If microservice is enabled, we postpone extraction (it runs in background via callback)
    if (useMicroservice) {
      ocrStatus = "processing";
      console.log(`[Upload API] OCR Microservice is enabled. Postponing extraction for: "${fileName}"`);
    } else {
      // Fallback: Run OCR synchronously
      try {
        console.log(`[Upload API] OCR Microservice URL is not set. Falling back to synchronous extraction for: "${fileName}"`);
        
        // If it was a direct upload, we need to download the buffer from R2 first
        if (isDirectUpload && !buffer) {
          console.log(`[Upload API] Downloading direct-uploaded buffer from R2 for OCR: "${r2Key}"`);
          buffer = await downloadFromR2(r2Key);
        }

        if (buffer) {
          extractedText = await extractTextFromBuffer(buffer, mimeType, fileName);
          console.log(`[Upload API] Synced text extraction completed successfully for: "${fileName}" (Extracted length: ${extractedText.length} chars)`);
        } else {
          throw new Error("File buffer is empty or could not be retrieved");
        }
      } catch (extractError: any) {
        console.error(`[Upload API] Synced text extraction failed for: "${fileName}". Error: ${extractError.message || extractError}`);
        ocrStatus = "failed";
      }
    }

    // If it was a multipart upload, we need to upload the buffer to R2 now
    if (!isDirectUpload) {
      const timestamp = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      r2Key = `documents/${session.userId}/${timestamp}-${safeName}`;
      
      console.log(`[Upload API] Uploading multipart buffer to R2 with key: "${r2Key}"`);
      if (!buffer) {
        throw new Error("No buffer available to upload");
      }
      publicUrl = await uploadToR2(buffer, r2Key, mimeType);
      console.log(`[Upload API] Uploaded successfully to R2. Public URL: ${publicUrl}`);
    }

    // Save metadata to MongoDB
    console.log(`[Upload API] Saving metadata to MongoDB for document: "${fileName}"`);
    const { db } = await connectToDatabase();
    const result = await db.collection("documents").insertOne({
      userId: session.userId,
      fileName,
      mimeType,
      sizeBytes,
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

    console.log(`[Upload API] Document "${fileName}" registered/uploaded successfully!`);

    return NextResponse.json({
      success: true,
      document: {
        _id: result.insertedId.toString(),
        fileName,
        mimeType,
        sizeBytes,
        publicUrl,
        ocrStatus,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Upload API] Critical error during document upload/registration:", error);
    const message = error instanceof Error ? error.message : "Failed to upload/register document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
