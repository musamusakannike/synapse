import pdf from "pdf-parse";
import * as mammoth from "mammoth";
import OpenAI from "openai";
import { createWorker } from "tesseract.js";
import { Jimp } from "jimp";
import { callDeepSeek } from "./deepseek";

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
/**
 * Helper to convert PDF.js raw pixel data to an RGBA Buffer for Jimp
 */
function rawPixelDataToRGBA(data: Uint8Array | Uint8ClampedArray, width: number, height: number): Buffer {
  const totalPixels = width * height;
  const rgba = Buffer.alloc(totalPixels * 4);
  
  if (data.length === totalPixels * 4) {
    // Already RGBA
    return Buffer.from(data.buffer || data);
  } else if (data.length === totalPixels * 3) {
    // RGB -> RGBA
    for (let i = 0; i < totalPixels; i++) {
      rgba[i * 4] = data[i * 3];       // R
      rgba[i * 4 + 1] = data[i * 3 + 1]; // G
      rgba[i * 4 + 2] = data[i * 3 + 2]; // B
      rgba[i * 4 + 3] = 255;             // A
    }
  } else if (data.length === totalPixels) {
    // Grayscale -> RGBA
    for (let i = 0; i < totalPixels; i++) {
      const val = data[i];
      rgba[i * 4] = val;     // R
      rgba[i * 4 + 1] = val; // G
      rgba[i * 4 + 2] = val; // B
      rgba[i * 4 + 3] = 255; // A
    }
  } else {
    // Fallback/unknown format: try to pad or truncate
    const minLength = Math.min(data.length, totalPixels * 4);
    for (let i = 0; i < minLength; i++) {
      rgba[i] = data[i];
    }
    // fill rest of alpha
    for (let i = 0; i < totalPixels; i++) {
      rgba[i * 4 + 3] = 255;
    }
  }
  
  return rgba;
}

/**
 * Perform OCR on an image using Tesseract.js locally and clean it up using DeepSeek
 */
async function performOCR(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  try {
    console.log(`[OCR] Starting local OCR for image: ${fileName || "image"} (${mimeType})`);
    
    // 1. Read image with Jimp
    const image = await Jimp.read(buffer);
    
    // 2. Pre-process image to optimize OCR quality
    // Scale up if width is small to improve character clarity
    if (image.width < 1200) {
      image.scale(2);
    }
    image.greyscale();
    image.contrast(0.2); // enhance contrast
    
    // Get processed image as PNG buffer
    const processedBuffer = await image.getBuffer("image/png");
    
    // 3. Perform local OCR using Tesseract.js
    const worker = await createWorker("eng");
    const ocrResult = await worker.recognize(processedBuffer);
    await worker.terminate();
    
    const rawText = ocrResult.data.text?.trim() || "";
    
    if (!rawText) {
      return `[Image Content - ${fileName || "image"}]: No text detected in image.`;
    }
    
    console.log(`[OCR] Raw text extracted successfully (${rawText.length} chars). Cleaning up with DeepSeek...`);
    
    // 4. Clean up raw OCR output using DeepSeek text API
    const systemPrompt = `You are a post-processing helper for OCR. The user will provide text recognized from a handwritten document.
Your task is to fix spelling mistakes, grammar, spacing, and restore the original flow and paragraphs of the text.
Since the source was handwritten, characters might be mismatched (e.g., '1' for 'l', 'rn' for 'm', etc.). Use context to intelligently correct them.
Do NOT summarize, comment, or explain. Respond ONLY with the cleaned-up, transcribed text. If the text seems like gibberish or is unparseable, just return the raw text as is.`;

    let cleanedText = rawText;
    try {
      cleanedText = await callDeepSeek([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the raw OCR text to clean up:\n\n${rawText}` }
      ], false);
    } catch (deepseekError) {
      console.warn("DeepSeek OCR post-processing cleanup failed, falling back to raw text:", deepseekError);
    }
    
    return `[Image Content - ${fileName || "image"}]:\n${cleanedText.trim()}`;
  } catch (error) {
    console.error("Local OCR Error:", error);
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
  const result = await pdf(buffer);

  const extractedText = result.text.trim();

  // If text extraction looks good, return it
  if (!shouldUseOCROnPDF(extractedText)) {
    return extractedText;
  }

  console.log(`[OCR] PDF standard text extraction is insufficient. Starting local PDF image extraction for: ${fileName || "document"}`);

  // Dynamic import of pdfjs-dist and polyfill DOMMatrix for Node.js
  if (typeof (global as any).DOMMatrix === "undefined") {
    (global as any).DOMMatrix = class DOMMatrix {};
  }
  
  try {
    const pdfjs = await import("pdfjs-dist");
    
    // Set worker src to avoid worker loading warnings/errors in Next.js
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.mjs`;
    }

    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    const pdfDocument = await loadingTask.promise;
    
    // Process up to 10 pages to avoid timeouts/heavy resource consumption
    const maxPages = Math.min(pdfDocument.numPages, 10);
    let combinedOCRText = "";

    console.log(`[OCR] PDF has ${pdfDocument.numPages} pages. Processing the first ${maxPages} pages...`);

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const opList = await page.getOperatorList();
      const pageImages: Buffer[] = [];

      // Find image objects in operator list
      for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        if (
          fn === pdfjs.OPS.paintImageXObject ||
          fn === pdfjs.OPS.paintInlineImageXObject ||
          fn === pdfjs.OPS.paintImageXObjectRepeat
        ) {
          const objId = opList.argsArray[i][0];
          try {
            const obj = await new Promise<any>((resolve, reject) => {
              page.objs.get(objId, (resolvedObj: any) => {
                if (resolvedObj) resolve(resolvedObj);
                else reject(new Error(`Failed to resolve object: ${objId}`));
              });
            });

            if (obj && obj.data && obj.width && obj.height) {
              const rgbaBuffer = rawPixelDataToRGBA(obj.data, obj.width, obj.height);
              const jimpImage = new Jimp({
                width: obj.width,
                height: obj.height,
                data: rgbaBuffer
              });

              // Pre-process image
              if (jimpImage.width < 1200) {
                jimpImage.scale(2);
              }
              jimpImage.greyscale();
              jimpImage.contrast(0.2);

              const pageImgBuf = await jimpImage.getBuffer("image/png");
              pageImages.push(pageImgBuf);
            }
          } catch (objErr) {
            console.warn(`[OCR] Failed to resolve image object ${objId} on page ${pageNum}:`, objErr);
          }
        }
      }

      if (pageImages.length > 0) {
        console.log(`[OCR] Found ${pageImages.length} images on page ${pageNum}. Transcribing...`);
        const worker = await createWorker("eng");
        for (let imgIdx = 0; imgIdx < pageImages.length; imgIdx++) {
          const ocrResult = await worker.recognize(pageImages[imgIdx]);
          const pageText = ocrResult.data.text?.trim() || "";
          if (pageText) {
            combinedOCRText += `\n--- Page ${pageNum} Image ${imgIdx + 1} ---\n${pageText}\n`;
          }
        }
        await worker.terminate();
      }
    }

    if (combinedOCRText.trim()) {
      console.log(`[OCR] Extraction complete. Combined text length: ${combinedOCRText.length}. Running DeepSeek cleanup...`);
      const systemPrompt = `You are a post-processing helper for OCR. The user will provide text recognized from pages of a scanned PDF document.
Your task is to fix spelling mistakes, grammar, spacing, and restore the original flow and paragraphs of the text.
Since the source was a scanned PDF, characters might be mismatched (e.g., '1' for 'l', 'rn' for 'm', etc.). Use context to intelligently correct them.
Do NOT summarize, comment, or explain. Respond ONLY with the cleaned-up, transcribed text. If the text seems like gibberish or is unparseable, just return the raw text as is.`;

      let cleanedText = combinedOCRText;
      try {
        cleanedText = await callDeepSeek([
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the raw OCR text from the scanned PDF:\n\n${combinedOCRText}` }
        ], false);
      } catch (deepseekError) {
        console.warn("DeepSeek PDF OCR post-processing cleanup failed, falling back to raw text:", deepseekError);
      }

      // If we had some partially extracted text, prepend it or append it
      const headerText = extractedText.length > 0
        ? `${extractedText}\n\n[Scanned/Handwritten content extracted via OCR below]:\n`
        : "";

      return `${headerText}${cleanedText.trim()}`;
    }
  } catch (ocrError) {
    console.error("Local PDF OCR failed:", ocrError);
  }

  // Fallback if OCR failed or extracted no text
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
