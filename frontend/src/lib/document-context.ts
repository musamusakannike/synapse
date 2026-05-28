import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * Given an array of document IDs, fetches their extracted text
 * and combines it into a single context string for the AI.
 */
export async function buildDocumentContext(
  documentIds: string[],
  userId: string
): Promise<string> {
  if (!documentIds.length) return "";

  const { db } = await connectToDatabase();
  const docs = await db
    .collection("documents")
    .find({
      _id: { $in: documentIds.map((id) => new ObjectId(id)) },
      userId,
    })
    .toArray();

  if (!docs.length) return "";

  const sections = docs.map((doc, i) => {
    const text = doc.extractedText || "[No text could be extracted from this file]";
    const label = `Document ${i + 1}: "${doc.fileName}" (${doc.mimeType})`;
    return `--- ${label} ---\n${text}`;
  });

  return sections.join("\n\n");
}
