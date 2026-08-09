"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromR2 = exports.uploadToR2 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const r2_config_1 = require("../config/r2.config");
/**
 * Uploads a file buffer to the Cloudflare R2 bucket.
 * Returns the access URL of the uploaded file if R2_PUBLIC_URL is configured, otherwise returns the object key.
 */
const uploadToR2 = async (fileBuffer, fileKey, contentType) => {
    if (!r2_config_1.R2_BUCKET_NAME) {
        throw new Error('R2 Bucket name is not configured. Check process.env.R2_BUCKET_NAME.');
    }
    const command = new client_s3_1.PutObjectCommand({
        Bucket: r2_config_1.R2_BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: contentType,
    });
    await r2_config_1.r2Client.send(command);
    if (r2_config_1.R2_PUBLIC_URL) {
        const baseUrl = r2_config_1.R2_PUBLIC_URL.endsWith('/') ? r2_config_1.R2_PUBLIC_URL.slice(0, -1) : r2_config_1.R2_PUBLIC_URL;
        const cleanKey = fileKey.startsWith('/') ? fileKey.slice(1) : fileKey;
        return `${baseUrl}/${cleanKey}`;
    }
    return fileKey;
};
exports.uploadToR2 = uploadToR2;
/**
 * Deletes an object from the Cloudflare R2 bucket.
 */
const deleteFromR2 = async (fileKey) => {
    if (!r2_config_1.R2_BUCKET_NAME) {
        throw new Error('R2 Bucket name is not configured. Check process.env.R2_BUCKET_NAME.');
    }
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: r2_config_1.R2_BUCKET_NAME,
        Key: fileKey,
    });
    await r2_config_1.r2Client.send(command);
};
exports.deleteFromR2 = deleteFromR2;
