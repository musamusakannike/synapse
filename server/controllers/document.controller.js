const fs = require("fs/promises");
const path = require("path");
const Document = require("../models/document.model");
const GeminiService = require("../config/gemini.config");

// Lazy-load heavy libs only when needed
let pdfParse; // pdf-parse
let mammoth; // DOCX -> text

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

function buildDefaultSummaryPrompt(filename) {
  return `You are an assistant that summarizes documents for study and quick review.\n` +
    `Summarize the key points, highlight important definitions, formulas (if any), and provide a concise bullet list of takeaway.\n` +
    `Keep it clear and structured.\n\n` +
    `Document: ${filename}`;
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
      // 1) Extract text
      const extractedText = await extractTextFromFile(savedPath, mimetype);

      // 2) Summarize with Gemini
      const prompt = req.body?.prompt || buildDefaultSummaryPrompt(originalname);
      // If we already have text, pass as plain text to Gemini
      const summary = await GeminiService.processDocument(
        Buffer.from(extractedText, "utf8"),
        "text/plain",
        prompt
      );

      doc.extractedText = extractedText;
      doc.summary = summary;
      doc.processingStatus = "completed";
      await doc.save();
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
      const effectivePrompt = prompt || buildDefaultSummaryPrompt(doc.originalName);
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
