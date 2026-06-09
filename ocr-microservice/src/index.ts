import "dotenv/config";
import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "./db.js";
import { downloadFromR2 } from "./r2.js";
import { extractTextFromBuffer } from "./document-extract.js";

const app = express();
const PORT = process.env.PORT || 3001;
const OCR_MICROSERVICE_SECRET = process.env.OCR_MICROSERVICE_SECRET;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Secure API endpoint to trigger document processing
app.post("/process-document", async (req, res) => {
  try {
    // Check authentication secret
    if (OCR_MICROSERVICE_SECRET) {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
      
      if (!token || token !== OCR_MICROSERVICE_SECRET) {
        console.warn("[Auth] Unauthorized access attempt: Invalid token.");
        return res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      console.warn("[Auth] WARNING: OCR_MICROSERVICE_SECRET is not set in environment. Running endpoint unsecured.");
    }

    const { documentId } = req.body;
    if (!documentId || !ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: "Invalid or missing documentId" });
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection("documents").findOne({ _id: new ObjectId(documentId) });

    if (!doc) {
      console.warn(`[API] Document not found: ${documentId}`);
      return res.status(404).json({ error: "Document not found" });
    }

    // Set initial status to processing
    await db.collection("documents").updateOne(
      { _id: doc._id },
      { $set: { ocrStatus: "processing", ocrError: null } }
    );

    // Respond immediately to Next.js caller to avoid timeouts
    res.json({ success: true, message: "OCR processing started asynchronously" });

    // Execute heavy OCR extraction asynchronously in background
    (async () => {
      const docObjId = doc._id;
      console.log(`[Background] Starting OCR pipeline for document ID: ${docObjId} (${doc.fileName})`);
      try {
        // Download document from R2
        console.log(`[Background] Downloading buffer from Cloudflare R2 key: "${doc.r2Key}"`);
        const buffer = await downloadFromR2(doc.r2Key);

        // Perform text extraction
        console.log(`[Background] Extracting text content from buffer...`);
        const extractedText = await extractTextFromBuffer(buffer, doc.mimeType, doc.fileName);

        console.log(`[Background] OCR successful. Extracted ${extractedText.length} characters. Updating DB...`);
        
        // Update document with extracted text and completed status
        await db.collection("documents").updateOne(
          { _id: docObjId },
          {
            $set: {
              extractedText,
              ocrStatus: "completed",
              ocrError: null,
            },
          }
        );
        console.log(`[Background] Database successfully updated for document ID: ${docObjId}`);
      } catch (ocrErr: any) {
        console.error(`[Background] Failed to process document ${docObjId}:`, ocrErr);
        
        // Update status to failed and store the error message
        await db
          .collection("documents")
          .updateOne(
            { _id: docObjId },
            {
              $set: {
                ocrStatus: "failed",
                ocrError: ocrErr.message || String(ocrErr),
              },
            }
          )
          .catch((dbErr) => {
            console.error(`[Background] Failed to write error state to MongoDB for ${docObjId}:`, dbErr);
          });
      }
    })();
  } catch (error: any) {
    console.error("[API] Error in process-document handler:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`[Server] OCR Microservice listening on port ${PORT}`);
  console.log(`[Server] Environment: MONGODB_DB=${process.env.MONGODB_DB || "synapse"}`);
  console.log(`[Server] R2 Configured: ${process.env.CLOUDFLARE_R2_ACCOUNT_ID ? "Yes" : "No"}`);
});
