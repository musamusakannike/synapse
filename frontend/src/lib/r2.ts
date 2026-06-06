import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

export const isR2Configured = !!(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET_NAME &&
  R2_PUBLIC_URL
);

// Initialize S3 client for R2 if credentials are provided
let s3Client: S3Client | null = null;

if (isR2Configured) {
  s3Client = new S3Client({
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID || "",
      secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
    region: "auto",
  });
} else {
  console.warn(
    "Cloudflare R2 is not fully configured in your environment. Sabi Learn will default to saving generated voiceover files on the local filesystem."
  );
}

/**
 * Uploads a binary buffer to Cloudflare R2 and returns its public URL.
 * 
 * @param buffer The raw audio file Buffer.
 * @param key The destination key/path in the bucket (e.g., "audio/my-video/scene-1.mp3").
 * @param contentType The MIME type (e.g., "audio/mpeg").
 */
export async function uploadToR2(buffer: Buffer, key: string, contentType: string): Promise<string> {
  if (!isR2Configured || !s3Client || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error("Cannot upload to Cloudflare R2: Client is not initialized or configured.");
  }

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Clean up trailing and leading slashes for the public URL
    const baseUrl = R2_PUBLIC_URL.replace(/\/$/, "");
    const cleanKey = key.replace(/^\//, "");
    
    return `${baseUrl}/${cleanKey}`;
  } catch (error: any) {
    console.error("Cloudflare R2 Upload Error:", error);
    throw new Error(`Cloudflare R2 upload failed: ${error.message}`);
  }
}

/**
 * Delete an object from Cloudflare R2 by key.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!isR2Configured || !s3Client || !R2_BUCKET_NAME) {
    throw new Error("Cannot delete from Cloudflare R2: Client is not initialized or configured.");
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Download an object from R2 as a Buffer.
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  if (!isR2Configured || !s3Client || !R2_BUCKET_NAME) {
    throw new Error("Cannot download from Cloudflare R2: Client is not initialized or configured.");
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error("Empty response body from R2");
  }

  const chunks: Uint8Array[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** Build a public URL for an R2 key */
export function r2PublicUrl(key: string): string {
  const baseUrl = (R2_PUBLIC_URL || "").replace(/\/$/, "");
  const cleanKey = key.replace(/^\//, "");
  return `${baseUrl}/${cleanKey}`;
}
