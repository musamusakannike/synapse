import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * Default total character budget for combined document context that gets
 * injected into AI prompts. Long documents (PDFs, transcripts) are otherwise
 * passed in full, which is slow, costly, and degrades output quality.
 *
 * Roughly ~4 chars per token, so ~16k chars ≈ ~4k tokens of context.
 */
const DEFAULT_MAX_TOTAL_CHARS = 16000;

interface BuildDocumentContextOptions {
  /** Total character budget shared across all selected documents. */
  maxTotalChars?: number;
}

/**
 * Truncate text to a budget while preserving the most informative parts.
 * Keeps the head (intro/definitions) and the tail (conclusions/summaries),
 * dropping the middle with a clear marker so the model knows content is missing.
 */
export function truncateToBudget(text: string, maxChars: number): string {
  if (maxChars <= 0) return "";
  if (text.length <= maxChars) return text;

  const marker = "\n\n…[content truncated to fit context limit]…\n\n";
  const keep = maxChars - marker.length;
  if (keep <= 0) return text.slice(0, maxChars);

  const headLen = Math.ceil(keep * 0.6);
  const tailLen = keep - headLen;
  const head = text.slice(0, headLen);
  const tail = tailLen > 0 ? text.slice(text.length - tailLen) : "";
  return `${head}${marker}${tail}`;
}

/**
 * Given an array of document IDs, fetches their extracted text and combines it
 * into a single context string for the AI.
 *
 * The combined context is capped at a total character budget (split fairly
 * across documents) so large uploads don't blow up prompt size, latency, or cost.
 */
export async function buildDocumentContext(
  documentIds: string[],
  userId: string,
  options: BuildDocumentContextOptions = {}
): Promise<string> {
  if (!documentIds.length) return "";

  const maxTotalChars = options.maxTotalChars ?? DEFAULT_MAX_TOTAL_CHARS;

  const validIds = documentIds.filter((id) => ObjectId.isValid(id));
  if (!validIds.length) return "";

  const { db } = await connectToDatabase();
  const docs = await db
    .collection("documents")
    .find({
      _id: { $in: validIds.map((id) => new ObjectId(id)) },
      userId,
    })
    .toArray();

  if (!docs.length) return "";

  // Split the budget fairly across documents.
  const perDocBudget = Math.floor(maxTotalChars / docs.length);

  const sections = docs.map((doc, i) => {
    const rawText = doc.extractedText || "[No text could be extracted from this file]";
    const text = truncateToBudget(rawText, perDocBudget);
    const label = `Document ${i + 1}: "${doc.fileName}" (${doc.mimeType})`;
    return `--- ${label} ---\n${text}`;
  });

  return truncateToBudget(sections.join("\n\n"), maxTotalChars);
}
