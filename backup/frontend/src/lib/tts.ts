import fs from "fs";
import path from "path";

/**
 * Splits a sentence/paragraph into smaller chunks strictly below the maxLength limit,
 * trying to respect sentence boundaries (periods, exclamation marks, question marks)
 * so that the spoken phrasing sounds natural.
 */
function splitTextIntoChunks(text: string, maxLength: number = 200): string[] {
  // Matches full sentences including punctuation
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    // If a single sentence exceeds the maxLength, break it by words
    if (trimmedSentence.length > maxLength) {
      const words = trimmedSentence.split(/\s+/);
      for (const word of words) {
        if ((currentChunk + " " + word).trim().length > maxLength) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = word;
        } else {
          currentChunk = currentChunk ? currentChunk + " " + word : word;
        }
      }
    } else if ((currentChunk + " " + trimmedSentence).trim().length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence;
    } else {
      currentChunk = currentChunk ? currentChunk + " " + trimmedSentence : trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Synthesizes text to speech using Google Translate's free engine, returning the audio data as a raw MP3 Buffer.
 * Fully modular and does not perform any disk operations.
 * 
 * @param text The narration text to synthesize.
 * @returns A Promise resolving to the continuous MP3 audio Buffer.
 */
export async function generateTTSBuffer(text: string): Promise<Buffer> {
  const chunks = splitTextIntoChunks(text, 200);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(
      chunk
    )}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TTS from Google for chunk: "${chunk}". Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    buffers.push(Buffer.from(arrayBuffer));
  }

  return Buffer.concat(buffers);
}

/**
 * Legacy wrapper: Generates an MP3 narration voiceover file for a given text and writes it directly to disk.
 * 
 * @param text The narration text to synthesize.
 * @param outputPath The absolute destination file path on the system.
 */
export async function generateTTS(text: string, outputPath: string): Promise<void> {
  const finalBuffer = await generateTTSBuffer(text);
  
  // Ensure the target directory structure exists
  const dir = path.dirname(outputPath);
  await fs.promises.mkdir(dir, { recursive: true });
  
  // Write the combined MP3 buffer to file
  await fs.promises.writeFile(outputPath, finalBuffer);
}
