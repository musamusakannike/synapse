import pdf from "pdf-parse";
import * as mammoth from "mammoth";
import axios from "axios";
import { createWorker } from "tesseract.js";
import { Jimp } from "jimp";
import { callDeepSeek } from "./deepseek.js";
const TEXT_MIME_TYPES = new Set(["text/plain", "text/markdown"]);
const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
// OCR confidence threshold - if extracted text is too short, try OCR
const OCR_MIN_LENGTH_THRESHOLD = 50;
export function isSupportedMime(mime) {
    return (mime === "application/pdf" ||
        mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        TEXT_MIME_TYPES.has(mime) ||
        IMAGE_MIME_TYPES.has(mime));
}
export function isImageMime(mime) {
    return IMAGE_MIME_TYPES.has(mime);
}
/**
 * Perform OCR on an image using Google Cloud Vision API (DOCUMENT_TEXT_DETECTION).
 * Uses the REST API directly via axios — no heavy SDK needed.
 */
async function performGoogleVisionOCR(buffer, mimeType, fileName) {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
        console.error("[Google Vision API] Failure: GOOGLE_CLOUD_VISION_API_KEY is not configured.");
        throw new Error("GOOGLE_CLOUD_VISION_API_KEY is not configured.");
    }
    const base64Data = buffer.toString("base64");
    const requestBody = {
        requests: [
            {
                image: { content: base64Data },
                features: [
                    { type: "DOCUMENT_TEXT_DETECTION" },
                ],
                imageContext: {
                    languageHints: ["en"],
                },
            },
        ],
    };
    console.log(`[Google Vision API] Sending POST request to Google Vision API for file: "${fileName || "image"}" (Buffer size: ${buffer.length} bytes)`);
    try {
        const response = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, requestBody, {
            headers: { "Content-Type": "application/json" },
            timeout: 60000,
        });
        console.log(`[Google Vision API] Response received. HTTP status: ${response.status}`);
        const result = response.data?.responses?.[0];
        if (result?.error) {
            console.error(`[Google Vision API] API returned internal error: ${JSON.stringify(result.error)}`);
            throw new Error(`Google Vision API error: ${result.error.message}`);
        }
        // DOCUMENT_TEXT_DETECTION returns fullTextAnnotation with structured text
        const extractedText = result?.fullTextAnnotation?.text?.trim() ||
            result?.textAnnotations?.[0]?.description?.trim();
        if (!extractedText) {
            console.warn(`[Google Vision API] No text was detected/extracted in: "${fileName || "image"}"`);
            throw new Error(`No text could be extracted by Google Vision from: ${fileName || "image"}`);
        }
        console.log(`[Google Vision API] Successfully extracted ${extractedText.length} characters from: "${fileName || "image"}"`);
        return extractedText;
    }
    catch (error) {
        const errorDetails = error.response
            ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
            : error.message || error;
        console.error(`[Google Vision API] Request failed for "${fileName || "image"}": ${errorDetails}`);
        throw error;
    }
}
/**
 * Helper to convert PDF.js raw pixel data to an RGBA Buffer for Jimp
 */
function rawPixelDataToRGBA(data, width, height) {
    const totalPixels = width * height;
    const rgba = Buffer.alloc(totalPixels * 4);
    if (data.length === totalPixels * 4) {
        // Already RGBA
        return Buffer.from(data.buffer || data);
    }
    else if (data.length === totalPixels * 3) {
        // RGB -> RGBA
        for (let i = 0; i < totalPixels; i++) {
            rgba[i * 4] = data[i * 3]; // R
            rgba[i * 4 + 1] = data[i * 3 + 1]; // G
            rgba[i * 4 + 2] = data[i * 3 + 2]; // B
            rgba[i * 4 + 3] = 255; // A
        }
    }
    else if (data.length === totalPixels) {
        // Grayscale -> RGBA
        for (let i = 0; i < totalPixels; i++) {
            const val = data[i];
            rgba[i * 4] = val; // R
            rgba[i * 4 + 1] = val; // G
            rgba[i * 4 + 2] = val; // B
            rgba[i * 4 + 3] = 255; // A
        }
    }
    else {
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
async function performOCR(buffer, mimeType, fileName) {
    // 1. Try Google Cloud Vision OCR first if API key is present
    if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
        try {
            console.log(`[OCR] Attempting Google Cloud Vision OCR for: ${fileName || "image"}`);
            const text = await performGoogleVisionOCR(buffer, mimeType, fileName);
            console.log(`[OCR] Google Cloud Vision OCR succeeded for: ${fileName || "image"}`);
            console.log(`[OCR Method] SUCCESS: Google Cloud Vision API was used for image: "${fileName || "image"}"`);
            return `[Image Content - ${fileName || "image"}]:\n${text}`;
        }
        catch (visionError) {
            console.warn(`[OCR] Google Cloud Vision OCR failed, falling back to local OCR pipeline: ${visionError.message || visionError}`);
        }
    }
    else {
        console.log(`[OCR] Google Cloud Vision API Key is not set. Using local OCR pipeline for: ${fileName || "image"}`);
    }
    // 2. Fallback to Local OCR + DeepSeek text correction
    try {
        console.log(`[OCR] Starting local OCR fallback for image: ${fileName || "image"} (${mimeType})`);
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
            console.log(`[OCR Method] SUCCESS (Fallback): Local Tesseract OCR was used, but no text was detected in: "${fileName || "image"}"`);
            return `[Image Content - ${fileName || "image"}]: No text detected in image.`;
        }
        console.log(`[OCR] Raw text extracted successfully (${rawText.length} chars). Cleaning up with DeepSeek...`);
        console.log(`[OCR Method] SUCCESS: Local Tesseract OCR was used for image: "${fileName || "image"}"`);
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
        }
        catch (deepseekError) {
            console.warn("DeepSeek OCR post-processing cleanup failed, falling back to raw text:", deepseekError);
        }
        return `[Image Content - ${fileName || "image"}]:\n${cleanedText.trim()}`;
    }
    catch (error) {
        console.error("Local OCR Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return `[Image: ${fileName || "image"} - OCR failed: ${errorMessage}]`;
    }
}
function shouldUseOCROnPDF(extractedText) {
    if (!extractedText || extractedText.trim().length < OCR_MIN_LENGTH_THRESHOLD) {
        return true;
    }
    // 1. Check if text consists mostly of common scanner watermarks/metadata
    const watermarks = [
        /camscanner/gi,
        /scanned\s+(with|by)/gi,
        /wps\s+office/gi,
        /adobe\s+scan/gi,
        /microsoft\s+lens/gi,
        /office\s+lens/gi,
        /scanner\s+app/gi,
        /scanbot/gi,
        /tiny\s+scanner/gi,
        /trial\s+version/gi,
    ];
    let cleanText = extractedText;
    for (const regex of watermarks) {
        cleanText = cleanText.replace(regex, "");
    }
    cleanText = cleanText.trim();
    // If the text without watermarks is too short, treat it as scanned
    if (cleanText.length < OCR_MIN_LENGTH_THRESHOLD) {
        console.log(`[PDF Extraction] Extracted text consists mostly of scanner watermarks (original: ${extractedText.length} chars, cleaned: ${cleanText.length} chars). Triggering OCR.`);
        return true;
    }
    // 2. Repetition/Uniqueness ratio check (e.g. "CamScanner" repeated many times)
    const words = extractedText.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    if (words.length >= 5) {
        const uniqueWords = new Set(words);
        const uniquenessRatio = uniqueWords.size / words.length;
        if (uniquenessRatio < 0.25) { // If less than 25% of words are unique
            console.log(`[PDF Extraction] Low text uniqueness ratio detected (${(uniquenessRatio * 100).toFixed(1)}% unique words out of ${words.length}). Triggering OCR.`);
            return true;
        }
    }
    // 3. Check if text looks like garbage/scrambled characters (common in scanned PDFs)
    const printableRatio = extractedText.replace(/[^\x20-\x7E\n\r\t]/g, "").length / extractedText.length;
    if (printableRatio < 0.8) {
        console.log(`[PDF Extraction] Low printable character ratio detected (${(printableRatio * 100).toFixed(1)}%). Triggering OCR.`);
        return true;
    }
    return false;
}
/**
 * Perform OCR on a single batch of up to 5 PDF pages using Google Cloud Vision
 * files:annotate (synchronous). Returns extracted text for those pages.
 */
async function performGoogleVisionPDFBatch(base64Data, pageNumbers, // 1-indexed, max 5 per call
apiKey, fileName) {
    const requestBody = {
        requests: [
            {
                inputConfig: {
                    content: base64Data,
                    mimeType: "application/pdf",
                },
                features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
                pages: pageNumbers,
            },
        ],
    };
    console.log(`[Google Vision API] Sending POST request to files:annotate for PDF: "${fileName || "document"}" pages [${pageNumbers.join(", ")}]`);
    const response = await axios.post(`https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`, requestBody, {
        headers: { "Content-Type": "application/json" },
        timeout: 120000,
    });
    console.log(`[Google Vision API] HTTP status: ${response.status}`);
    const fileResponse = response.data?.responses?.[0];
    if (!fileResponse) {
        console.warn(`[Google Vision API] Top-level responses array is empty or missing.`);
        return "";
    }
    if (fileResponse?.error) {
        console.error(`[Google Vision API] Top-level error: ${JSON.stringify(fileResponse.error)}`);
        throw new Error(`Google Vision PDF API error: ${fileResponse.error.message}`);
    }
    const pageResponses = fileResponse?.responses;
    console.log(`[Google Vision API] Inner page responses count: ${pageResponses?.length ?? 0}`);
    if (!pageResponses || pageResponses.length === 0) {
        console.warn(`[Google Vision API] No inner page responses returned for pages [${pageNumbers.join(", ")}].`);
        return "";
    }
    let batchText = "";
    for (let i = 0; i < pageResponses.length; i++) {
        const pageRes = pageResponses[i];
        const pageNum = pageRes.context?.pageNumber ?? pageNumbers[i];
        if (pageRes.error) {
            console.warn(`[Google Vision API] Error on page ${pageNum}: ${JSON.stringify(pageRes.error)}`);
            continue;
        }
        const fullText = pageRes.fullTextAnnotation?.text?.trim();
        const legacyText = pageRes.textAnnotations?.[0]?.description?.trim();
        const text = fullText || legacyText;
        if (text) {
            batchText += `\n--- Page ${pageNum} ---\n${text}\n`;
        }
        else {
            console.warn(`[Google Vision API] Page ${pageNum} returned no text content.`);
        }
    }
    return batchText;
}
/**
 * Perform OCR on a PDF directly using Google Cloud Vision API (files:annotate).
 * Handles PDFs of any page count by batching in groups of 5 pages (API limit).
 * Splits oversized PDFs into chunks to stay within the 10MB base64 payload limit.
 */
async function performGoogleVisionPDFOCR(buffer, fileName) {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_CLOUD_VISION_API_KEY is not configured.");
    }
    // Google Vision files:annotate endpoint has a payload limit of 10MB (base64 encoded).
    // base64 inflates size by ~33%, so the raw buffer limit is ~7.5MB to be safe.
    const MAX_RAW_BYTES = 7.5 * 1024 * 1024;
    if (buffer.length > MAX_RAW_BYTES) {
        throw new Error(`PDF buffer size (${(buffer.length / 1024 / 1024).toFixed(1)}MB) exceeds the safe limit for direct Google Vision API upload. Falling back to page-by-page rendering.`);
    }
    // Determine total page count using pdf-parse before batching
    let totalPages = 1;
    try {
        const pdfMeta = await pdf(buffer, { max: 0 }); // max:0 = parse metadata only, no text
        totalPages = pdfMeta.numpages || 1;
    }
    catch {
        // If we can't parse page count, fall back to assuming up to 20 pages
        totalPages = 20;
    }
    console.log(`[Google Vision API] PDF has ${totalPages} pages. Processing in batches of 5...`);
    const base64Data = buffer.toString("base64");
    const BATCH_SIZE = 5; // Google Vision synchronous limit per request
    let combinedText = "";
    let successPages = 0;
    // Build batches: [1-5], [6-10], [11-15], [16-20], etc.
    for (let startPage = 1; startPage <= totalPages; startPage += BATCH_SIZE) {
        const batchPages = [];
        for (let p = startPage; p < startPage + BATCH_SIZE && p <= totalPages; p++) {
            batchPages.push(p);
        }
        try {
            const batchText = await performGoogleVisionPDFBatch(base64Data, batchPages, apiKey, fileName);
            if (batchText.trim()) {
                combinedText += batchText;
                successPages += batchPages.length;
            }
        }
        catch (batchError) {
            console.warn(`[Google Vision API] Batch failed for pages [${batchPages.join(", ")}]: ${batchError.message || batchError}`);
        }
    }
    if (!combinedText.trim()) {
        throw new Error("Google Vision API completed but returned no text content.");
    }
    console.log(`[Google Vision API] Successfully extracted text from ${successPages}/${totalPages} PDF pages.`);
    return combinedText.trim();
}
/**
 * Convert PDF to image for OCR (simplified approach)
 */
async function extractTextFromPDFWithOCR(buffer, fileName) {
    // First try standard PDF text extraction
    const result = await pdf(buffer);
    const extractedText = result.text.trim();
    // If text extraction looks good, return it
    if (!shouldUseOCROnPDF(extractedText)) {
        console.log(`[PDF Extraction] Native text layer was extracted successfully (${extractedText.length} chars). Skipping OCR fallback.`);
        console.log(`[OCR Method] SUCCESS: Native text extraction was used (no OCR required) for: "${fileName || "document"}"`);
        return extractedText;
    }
    // 1. Try direct Google Vision PDF OCR first
    if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
        try {
            console.log(`[OCR] Attempting direct Google Cloud Vision PDF OCR for: ${fileName || "document"}`);
            const directText = await performGoogleVisionPDFOCR(buffer, fileName);
            console.log(`[OCR] Direct Google Cloud Vision PDF OCR succeeded for: ${fileName || "document"}`);
            console.log(`[OCR Method] SUCCESS: Direct Google Cloud Vision API was used for PDF: "${fileName || "document"}"`);
            // Clean up text using DeepSeek if needed
            console.log(`[OCR] Direct PDF text extracted (${directText.length} chars). Running DeepSeek cleanup...`);
            const systemPrompt = `You are a post-processing helper for OCR. The user will provide text recognized from pages of a scanned PDF document.
Your task is to fix spelling mistakes, grammar, spacing, and restore the original flow and paragraphs of the text.
Do NOT summarize, comment, or explain. Respond ONLY with the cleaned-up, transcribed text. If the text seems like gibberish or is unparseable, just return the raw text as is.`;
            let cleanedText = directText;
            try {
                cleanedText = await callDeepSeek([
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Here is the raw OCR text from the scanned PDF:\n\n${directText}` }
                ], false);
            }
            catch (deepseekError) {
                console.warn("DeepSeek PDF OCR post-processing cleanup failed, falling back to raw text:", deepseekError);
            }
            const headerText = extractedText.length > 0
                ? `${extractedText}\n\n[Scanned/Handwritten content extracted via OCR below]:\n`
                : "";
            return `${headerText}${cleanedText.trim()}`;
        }
        catch (directVisionError) {
            console.warn(`[OCR] Direct Google Cloud Vision PDF OCR failed, falling back to page-by-page rendering: ${directVisionError.message || directVisionError}`);
        }
    }
    // 2. Fallback to local image extraction and page-by-page OCR
    console.log(`[OCR] PDF standard text extraction is insufficient. Starting local PDF image extraction for: ${fileName || "document"}`);
    // DOMMatrix polyfill for Node.js
    if (typeof global.DOMMatrix === "undefined") {
        global.DOMMatrix = class DOMMatrix {
        };
    }
    try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        // Configure pdfjs worker path pointing to the node_modules location
        try {
            const { createRequire } = await import("module");
            const require = createRequire(import.meta.url);
            const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
            pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
        }
        catch (workerErr) {
            console.warn("[OCR] Failed to configure pdfjs workerSrc:", workerErr.message || workerErr);
        }
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const pdfDocument = await loadingTask.promise;
        const maxPages = pdfDocument.numPages;
        let combinedOCRText = "";
        console.log(`[OCR] PDF has ${pdfDocument.numPages} pages. Processing all ${maxPages} pages...`);
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const opList = await page.getOperatorList();
            const pageImages = [];
            for (let i = 0; i < opList.fnArray.length; i++) {
                const fn = opList.fnArray[i];
                if (fn === pdfjs.OPS.paintImageXObject ||
                    fn === pdfjs.OPS.paintInlineImageXObject ||
                    fn === pdfjs.OPS.paintImageXObjectRepeat) {
                    const objId = opList.argsArray[i][0];
                    try {
                        const obj = await new Promise((resolve, reject) => {
                            page.objs.get(objId, (resolvedObj) => {
                                if (resolvedObj)
                                    resolve(resolvedObj);
                                else
                                    reject(new Error(`Failed to resolve object: ${objId}`));
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
                    }
                    catch (objErr) {
                        console.warn(`[OCR] Failed to resolve image object ${objId} on page ${pageNum}:`, objErr);
                    }
                }
            }
            if (pageImages.length > 0) {
                console.log(`[OCR] Found ${pageImages.length} images on page ${pageNum}. Transcribing...`);
                let pageTexts = [];
                let useLocalOCR = true;
                if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
                    try {
                        console.log(`[OCR] Attempting Google Cloud Vision OCR for page ${pageNum}...`);
                        for (let imgIdx = 0; imgIdx < pageImages.length; imgIdx++) {
                            const text = await performGoogleVisionOCR(pageImages[imgIdx], "image/png", `page_${pageNum}_img_${imgIdx + 1}.png`);
                            if (text)
                                pageTexts.push(text);
                        }
                        useLocalOCR = false;
                        console.log(`[OCR] Google Cloud Vision OCR succeeded for page ${pageNum}`);
                        console.log(`[OCR Method] SUCCESS: Google Cloud Vision API was used for PDF page ${pageNum}`);
                    }
                    catch (visionError) {
                        console.warn(`[OCR] Google Cloud Vision OCR failed for page ${pageNum}, falling back to local OCR: ${visionError.message || visionError}`);
                        pageTexts = [];
                        useLocalOCR = true;
                    }
                }
                if (useLocalOCR) {
                    console.log(`[OCR] Running local Tesseract OCR for page ${pageNum}...`);
                    const worker = await createWorker("eng");
                    for (let imgIdx = 0; imgIdx < pageImages.length; imgIdx++) {
                        const ocrResult = await worker.recognize(pageImages[imgIdx]);
                        const pageText = ocrResult.data.text?.trim() || "";
                        if (pageText)
                            pageTexts.push(pageText);
                    }
                    await worker.terminate();
                    console.log(`[OCR Method] SUCCESS: Local Tesseract OCR was used for PDF page ${pageNum}`);
                }
                for (let imgIdx = 0; imgIdx < pageTexts.length; imgIdx++) {
                    combinedOCRText += `\n--- Page ${pageNum} Image ${imgIdx + 1} ---\n${pageTexts[imgIdx]}\n`;
                }
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
            }
            catch (deepseekError) {
                console.warn("DeepSeek PDF OCR post-processing cleanup failed, falling back to raw text:", deepseekError);
            }
            // If we had some partially extracted text, prepend it
            const headerText = extractedText.length > 0
                ? `${extractedText}\n\n[Scanned/Handwritten content extracted via OCR below]:\n`
                : "";
            return `${headerText}${cleanedText.trim()}`;
        }
    }
    catch (ocrError) {
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
 */
export async function extractTextFromBuffer(buffer, mimeType, fileName) {
    // Handle PDFs
    if (mimeType === "application/pdf") {
        return extractTextFromPDFWithOCR(buffer, fileName);
    }
    // Handle DOCX
    if (mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        console.log(`[Text Extraction] Extracting text natively from DOCX file: "${fileName || "document"}"`);
        const result = await mammoth.extractRawText({ buffer });
        console.log(`[OCR Method] SUCCESS: Native DOCX extraction was used (no OCR required) for: "${fileName || "document"}"`);
        return result.value.trim();
    }
    // Handle plain text files
    if (TEXT_MIME_TYPES.has(mimeType)) {
        console.log(`[Text Extraction] Extracting text natively from plain text/markdown file: "${fileName || "document"}"`);
        console.log(`[OCR Method] SUCCESS: Native text extraction was used (no OCR required) for: "${fileName || "document"}"`);
        return buffer.toString("utf-8").trim();
    }
    // Handle images with OCR
    if (IMAGE_MIME_TYPES.has(mimeType)) {
        return performOCR(buffer, mimeType, fileName);
    }
    throw new Error(`Unsupported file type: ${mimeType}`);
}
