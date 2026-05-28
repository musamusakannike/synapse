import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";

export type SupportedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/gif"
  | "text/plain"
  | "text/markdown";

const TEXT_MIME_TYPES = new Set(["text/plain", "text/markdown"]);
const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function isSupportedMime(mime: string): mime is SupportedMimeType {
  return (
    mime === "application/pdf" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    TEXT_MIME_TYPES.has(mime) ||
    IMAGE_MIME_TYPES.has(mime)
  );
}

export function isImageMime(mime: string): boolean {
  return IMAGE_MIME_TYPES.has(mime);
}

/**
 * Extract text content from a document buffer based on its MIME type.
 * Images return a placeholder since DeepSeek is text-only — the caller
 * should handle image description separately if needed.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text.trim();
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (TEXT_MIME_TYPES.has(mimeType)) {
    return buffer.toString("utf-8").trim();
  }

  if (IMAGE_MIME_TYPES.has(mimeType)) {
    return `[Uploaded image: ${fileName || "image"}. The image content has been provided as context.]`;
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

/** Human-readable label for a MIME type */
export function mimeLabel(mime: string): string {
  const labels: Record<string, string> = {
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "image/png": "PNG",
    "image/jpeg": "JPEG",
    "image/webp": "WebP",
    "image/gif": "GIF",
    "text/plain": "Text",
    "text/markdown": "Markdown",
  };
  return labels[mime] || mime;
}
