const fs = require("fs/promises");
const path = require("path");
const Document = require("../models/document.model");
const GeminiService = require("../config/gemini.config");
const { createChatWithAttachment } = require("./chat.controller");

// Lazy-load heavy libs only when needed
let pdfParse; // pdf-parse
let mammoth; // DOCX -> text

function isImageFile(mimeType, ext) {
  const imageMimeTypes = [
    "image/jpeg",
    "image/png", 
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff"
  ];
  
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"];
  
  return imageMimeTypes.includes(mimeType) || imageExtensions.includes(ext);
}

async function extractTextFromFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  if (mimeType === "application/pdf" || ext === ".pdf") {
    if (!pdfParse) {
      pdfParse = require("pdf-parse");
    }
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    if (!mammoth) {
      mammoth = require("mammoth");
    }
    const buffer = await fs.readFile(filePath);
    const { value } = await mammoth.extractRawText({ buffer });
    return value || "";
  }

  // Plain text or anything else we treat as text
  const content = await fs.readFile(filePath, "utf8");
  return content;
}

async function processImageFile(filePath, mimeType) {
  // For images, we need to read as base64 for Gemini vision API
  const buffer = await fs.readFile(filePath);
  const base64Image = buffer.toString("base64");
  
  return {
    isImage: true,
    base64Data: base64Image,
    mimeType: mimeType
  };
}

function buildDefaultSummaryPrompt(filename, userGuidance = "") {
  let basePrompt = `You are an intelligent learning assistant that processes documents for study and quick review.\n` +
    `Analyze the following document and provide a comprehensive summary.\n` +
    `Focus on key points, important definitions, formulas (if any), and provide a structured bullet list of takeaways.\n` +
    `Keep it clear, concise, and suitable for learning purposes.\n\n` +
    `Document: ${filename}`;
    
  if (userGuidance && userGuidance.trim()) {
    basePrompt += `\n\nUser Instructions: ${userGuidance.trim()}\n` +
      `Please follow these specific instructions while processing the document.`;
  }
  
  return basePrompt;
}

function buildImageAnalysisPrompt(filename, userGuidance = "") {
  let basePrompt = `You are an intelligent learning assistant that analyzes images for educational purposes.\n` +
    `Analyze this image and provide a comprehensive description.\n` +
    `Focus on identifying key elements, text content, diagrams, charts, or any educational information visible.\n` +
    `If there's text in the image, extract and summarize it. If there are diagrams or charts, explain what they show.\n` +
    `Provide a structured analysis that would be useful for learning and study purposes.\n\n` +
    `Image: ${filename}`;
    
  if (userGuidance && userGuidance.trim()) {
    basePrompt += `\n\nUser Instructions: ${userGuidance.trim()}\n` +
      `Please follow these specific instructions while analyzing this image.`;
  }
  
  return basePrompt;
}

// POST /api/documents  (with file)
async function uploadDocument(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, filename, mimetype, size, path: savedPath } = req.file;

    let doc = await Document.create({
      userId,
      filename,
      originalName: originalname,
      mimeType: mimetype,
      size,
      filePath: savedPath,
      processingStatus: "processing",
    });

    try {
      const userGuidance = req.body?.prompt || "";
      let summary;
      let extractedText = "";

      // Check if it's an image file
      const ext = path.extname(savedPath).toLowerCase();
      const isImage = isImageFile(mimetype, ext);

      if (isImage) {
        // Process image with Gemini vision API
        const imageData = await processImageFile(savedPath, mimetype);
        const prompt = userGuidance ? 
          buildImageAnalysisPrompt(originalname, userGuidance) : 
          buildImageAnalysisPrompt(originalname);
        
        summary = await GeminiService.processImage(
          imageData.base64Data,
          imageData.mimeType,
          prompt
        );
        
        doc.extractedText = `Image analysis: ${summary}`;
        doc.summary = summary;
      } else {
        // Process regular document
        extractedText = await extractTextFromFile(savedPath, mimetype);
        const prompt = userGuidance ? 
          buildDefaultSummaryPrompt(originalname, userGuidance) : 
          buildDefaultSummaryPrompt(originalname);
        
        summary = await GeminiService.processDocument(
          Buffer.from(extractedText, "utf8"),
          "text/plain",
          prompt
        );

        doc.extractedText = extractedText;
        doc.summary = summary;
      }

      doc.processingStatus = "completed";
      await doc.save();

      // 3) Create a chat with document attachment
      try {
        const attachmentType = isImage ? "image" : "document";
        const chatTitle = `${originalname} - ${isImage ? "Image" : "Document"}`;
        const messageContent = `I've processed your ${isImage ? "image" : "document"} "${originalname}". Here's a summary:\n\n${summary}\n\nYou can ask me questions about this ${isImage ? "image" : "document"}!`;
        
        await createChatWithAttachment(
          userId,
          chatTitle,
          attachmentType,
          doc._id,
          isImage ? "Image" : "Document",
          attachmentType,
          {
            documentId: doc._id,
            originalName: originalname,
            summary: summary,
            extractedText: extractedText.substring(0, 5000), // Limit text size in attachment
            mimeType: mimetype,
            isImage: isImage,
          },
          messageContent
        );
      } catch (chatError) {
        console.error("Failed to create chat for document:", chatError);
        // Continue without failing the document upload
      }
    } catch (processingError) {
      console.error("Document processing failed:", processingError);
      doc.processingStatus = "failed";
      doc.processingError = processingError?.message || "Processing failed";
      await doc.save();
    }

    return res.status(201).json({ message: "Document uploaded", document: doc });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/documents
async function listDocuments(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const docs = await Document.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(docs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/documents/:id
async function getDocument(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const doc = await Document.findOne({ _id: id, userId });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    return res.status(200).json(doc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/documents/:id
async function deleteDocument(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const doc = await Document.findOneAndDelete({ _id: id, userId });
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // best-effort file removal
    if (doc.filePath) {
      try {
        await fs.unlink(doc.filePath);
      } catch (e) {
        // ignore
      }
    }

    return res.status(200).json({ message: "Document deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/documents/:id/reprocess  (optionally with new prompt)
async function reprocessDocument(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { prompt } = req.body || {};

    const doc = await Document.findOne({ _id: id, userId });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (!doc.filePath || !doc.mimeType) {
      return res.status(400).json({ message: "Document missing file metadata" });
    }

    doc.processingStatus = "processing";
    doc.processingError = undefined;
    await doc.save();

    try {
      const extractedText = await extractTextFromFile(doc.filePath, doc.mimeType);
      const userGuidance = prompt || "";
      const effectivePrompt = userGuidance ? 
        buildDefaultSummaryPrompt(doc.originalName, userGuidance) : 
        buildDefaultSummaryPrompt(doc.originalName);
      const summary = await GeminiService.processDocument(
        Buffer.from(extractedText, "utf8"),
        "text/plain",
        effectivePrompt
      );
      doc.extractedText = extractedText;
      doc.summary = summary;
      doc.processingStatus = "completed";
      await doc.save();
    } catch (processingError) {
      console.error("Reprocess failed:", processingError);
      doc.processingStatus = "failed";
      doc.processingError = processingError?.message || "Processing failed";
      await doc.save();
    }

    return res.status(200).json(doc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument,
  deleteDocument,
  reprocessDocument,
};
