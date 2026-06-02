import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";
import OpenAI from "openai";

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

// OCR confidence threshold - if extracted text is too short, try OCR
const OCR_MIN_LENGTH_THRESHOLD = 50;

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
 * Initialize OpenAI client configured for DeepSeek API
 * DeepSeek's API is fully compatible with OpenAI SDK format
 */
function getVisionClient(): OpenAI | null {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn("DEEPSEEK_API_KEY not configured - OCR features will be unavailable");
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
    timeout: 60000,
    maxRetries: 2,
  });
}

/**
 * Perform OCR on an image using DeepSeek's vision model
 * Converts image buffer to base64 and sends to vision-capable model
 */
async function performOCR(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  const client = getVisionClient();
  if (!client) {
    return `[Image: ${fileName || "image"} - OCR unavailable: API key not configured]`;
  }

  try {
    // Convert buffer to base64 data URL
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const model = process.env.DEEPSEEK_VISION_MODEL || "deepseek-v4";

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert OCR (Optical Character Recognition) engine. Your task is to extract ALL readable text from the provided image accurately. " +
            "Preserve the structure, layout, and formatting as much as possible. " +
            "If the image contains handwritten text, transcribe it carefully. " +
            "If the image contains diagrams, charts, or tables, describe their content. " +
            "If no text is visible, state 'No text detected in image.' " +
            "Respond ONLY with the extracted text, no additional commentary.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all text content from this image${fileName ? ` (${fileName})` : ""}. Include handwritten notes, printed text, and any visible labels.`,
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const extractedText = response.choices[0]?.message?.content?.trim();

    if (!extractedText) {
      return `[Image: ${fileName || "image"} - No text could be extracted]`;
    }

    return `[Image Content - ${fileName || "image"}]:\n${extractedText}`;
  } catch (error) {
    console.error("OCR Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return `[Image: ${fileName || "image"} - OCR failed: ${errorMessage}]`;
  }
}

/**
 * Check if PDF text extraction seems insufficient (possibly scanned/handwritten PDF)
 * Triggers OCR fallback if text is too short
 */
function shouldUseOCROnPDF(extractedText: string): boolean {
  if (!extractedText || extractedText.trim().length < OCR_MIN_LENGTH_THRESHOLD) {
    return true;
  }
  // Check if text looks like garbage/scrambled characters (common in scanned PDFs)
  const printableRatio =
    extractedText.replace(/[^\x20-\x7E\n\r\t]/g, "").length / extractedText.length;
  return printableRatio < 0.8;
}

/**
 * Convert first page of PDF to image for OCR (simplified approach)
 * In production, you might want to use a PDF-to-image library
 */
async function extractTextFromPDFWithOCR(
  buffer: Buffer,
  fileName?: string
): Promise<string> {
  // First try standard PDF text extraction
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const extractedText = result.text.trim();

  // If text extraction looks good, return it
  if (!shouldUseOCROnPDF(extractedText)) {
    return extractedText;
  }

  // PDF may be scanned/image-based, note this limitation
  // Full PDF-to-image conversion requires additional libraries like pdf2pic or pdf-poppler
  // For now, return the partial extraction with a note
  if (extractedText.length > 0) {
    return `${extractedText}\n\n[Note: This PDF appears to contain scanned or image-based content. Some text may not have been fully extracted.]`;
  }

  return `[PDF: ${fileName || "document"} - This appears to be a scanned/image-based PDF with no extractable text layer. Consider converting to a text-based PDF or uploading as images for OCR.]`;
}

/**
 * Extract text content from a document buffer based on its MIME type.
 * 
 * Features:
 * - PDF: Text extraction with scanned PDF detection
 * - DOCX: Structured text extraction via mammoth
 * - Images: OCR using DeepSeek vision model for handwritten/printed text
 * - Text files: Direct UTF-8 decoding
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  // Handle PDFs
  if (mimeType === "application/pdf") {
    return extractTextFromPDFWithOCR(buffer, fileName);
  }

  // Handle DOCX
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  // Handle plain text files
  if (TEXT_MIME_TYPES.has(mimeType)) {
    return buffer.toString("utf-8").trim();
  }

  // Handle images with OCR
  if (IMAGE_MIME_TYPES.has(mimeType)) {
    return performOCR(buffer, mimeType, fileName);
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

/**
 * Batch OCR multiple images efficiently
 * Useful when processing multiple handwritten notes
 */
export async function batchOCR(
  items: Array<{ buffer: Buffer; mimeType: string; fileName?: string }>
): Promise<string[]> {
  const client = getVisionClient();
  if (!client) {
    return items.map(
      (item) => `[Image: ${item.fileName || "image"} - OCR unavailable]`
    );
  }

  // Process in parallel with concurrency limit
  const CONCURRENCY = 3;
  const results: string[] = [];

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const batchPromises = batch.map((item) =>
      performOCR(item.buffer, item.mimeType, item.fileName)
    );
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
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
