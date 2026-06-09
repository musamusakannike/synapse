import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
export const isR2Configured = !!(R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME);
let s3Client = null;
if (isR2Configured) {
    s3Client = new S3Client({
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID || "",
            secretAccessKey: R2_SECRET_ACCESS_KEY || "",
        },
        region: "auto",
    });
}
else {
    console.warn("[R2] Cloudflare R2 is not fully configured. File downloads may fail if they rely on R2 credentials.");
}
/**
 * Download an object from R2 as a Buffer.
 */
export async function downloadFromR2(key) {
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
    const chunks = [];
    const stream = response.Body;
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}
