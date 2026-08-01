import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getPresignedUploadUrl, isR2Configured } from "@/lib/r2";

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
      console.warn("[Presign API] Failed: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isR2Configured) {
      console.error("[Presign API] Failed: Cloudflare R2 storage is not configured");
      return NextResponse.json(
        { error: "File storage is not configured. Please set up Cloudflare R2." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { fileName, mimeType, sizeBytes } = body;

    if (!fileName || !mimeType) {
      console.warn("[Presign API] Failed: Missing fileName or mimeType in request body");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`[Presign API] Initiating presigned URL generation for User: ${session.userId}, File: "${fileName}" (Size: ${sizeBytes} bytes)`);

    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const r2Key = `documents/${session.userId}/${timestamp}-${safeName}`;

    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(r2Key, mimeType);

    console.log(`[Presign API] Successfully generated presigned URL. Key: "${r2Key}"`);

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      r2Key,
    });
  } catch (error: any) {
    console.error("[Presign API] Critical error during generation:", error);
    const message = error instanceof Error ? error.message : "Failed to generate presigned URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
