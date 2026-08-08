import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../config/r2.config';

/**
 * Uploads a file buffer to the Cloudflare R2 bucket.
 * Returns the access URL of the uploaded file if R2_PUBLIC_URL is configured, otherwise returns the object key.
 */
export const uploadToR2 = async (
  fileBuffer: Buffer,
  fileKey: string,
  contentType: string
): Promise<string> => {
  if (!R2_BUCKET_NAME) {
    throw new Error('R2 Bucket name is not configured. Check process.env.R2_BUCKET_NAME.');
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  if (R2_PUBLIC_URL) {
    const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
    const cleanKey = fileKey.startsWith('/') ? fileKey.slice(1) : fileKey;
    return `${baseUrl}/${cleanKey}`;
  }

  return fileKey;
};

/**
 * Deletes an object from the Cloudflare R2 bucket.
 */
export const deleteFromR2 = async (fileKey: string): Promise<void> => {
  if (!R2_BUCKET_NAME) {
    throw new Error('R2 Bucket name is not configured. Check process.env.R2_BUCKET_NAME.');
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });

  await r2Client.send(command);
};
