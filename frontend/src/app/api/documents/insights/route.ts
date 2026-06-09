import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateDocumentInsights, type DocumentInsights } from "@/lib/deepseek";
import { checkAndIncrementUsage, refundUsage } from "@/lib/paystack";
import { ObjectId } from "mongodb";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

/**
 * GET — fetch cached insights for a document
 */
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("id");
    if (!docId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection("documents").findOne({
      _id: new ObjectId(docId),
      userId,
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document: {
        _id: doc._id.toString(),
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        publicUrl: doc.publicUrl,
        createdAt: doc.createdAt,
        extractedText: doc.extractedText || "",
        ocrStatus: doc.ocrStatus || "completed",
        ocrError: doc.ocrError || null,
      },
      insights: doc.insights || null,
    });
  } catch (error) {
    console.error("GET Document Insights Error:", error);
    return NextResponse.json({ error: "Failed to fetch document insights" }, { status: 500 });
  }
}

/**
 * POST — generate insights for a document (uses AI generation quota)
 */
export async function POST(request: Request) {
  let usageRefundUserId: string | null = null;
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await request.json();
    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const doc = await db.collection("documents").findOne({
      _id: new ObjectId(documentId),
      userId,
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!doc.extractedText || doc.extractedText.trim().length === 0) {
      if (doc.ocrStatus === "processing") {
        return NextResponse.json(
          { error: "OCR is currently extracting text from this document. Please wait a few moments and try again." },
          { status: 423 }
        );
      }
      if (doc.ocrStatus === "failed") {
        return NextResponse.json(
          { error: `OCR text extraction failed for this document: ${doc.ocrError || "Unknown error"}. Please delete and re-upload.` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "No text content available for this document. Only text-based documents can generate insights." },
        { status: 400 }
      );
    }

    // If insights already exist, return cached
    if (doc.insights) {
      return NextResponse.json({
        success: true,
        insights: doc.insights,
        cached: true,
      });
    }

    // Rate limit check
    const usage = await checkAndIncrementUsage(userId);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Daily generation limit reached",
          code: "LIMIT_REACHED",
          limit: usage.limit,
          generationsToday: usage.generationsToday,
        },
        { status: 403 }
      );
    }

    // Fetch user profile
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    const userProfile = {
      style: user?.style || "textual",
      level: user?.level || "self-learner",
      goals: user?.goals || "",
    };

    // Reserve a refund of this generation in case the AI call fails after the increment
    if (!usage.premium) usageRefundUserId = userId;

    // Generate insights
    const insights: DocumentInsights = await generateDocumentInsights(
      doc.extractedText,
      doc.fileName,
      userProfile
    );

    // Cache insights in the document
    await db.collection("documents").updateOne(
      { _id: new ObjectId(documentId) },
      { $set: { insights, insightsGeneratedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      insights,
      cached: false,
      generationsToday: usage.generationsToday,
      limit: usage.limit,
    });
  } catch (error) {
    if (usageRefundUserId) await refundUsage(usageRefundUserId).catch(() => {});
    console.error("POST Document Insights Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate insights";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
