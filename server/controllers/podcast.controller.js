import asyncHandler from "express-async-handler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import wav from "wav";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Podcast from "../models/podcast.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store for temporary audio files
const audioStore = new Map();

// Clean up old audio files every 30 minutes
setInterval(() => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  for (const [id, data] of audioStore.entries()) {
    if (data.timestamp < thirtyMinutesAgo) {
      // Delete the actual file
      if (fs.existsSync(data.filePath)) {
        fs.unlinkSync(data.filePath);
      }
      audioStore.delete(id);
    }
  }
}, 30 * 60 * 1000);

async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on("finish", resolve);
    writer.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}

export const generatePodcastScript = asyncHandler(async (req, res) => {
  console.log(
    "[PodcastController] generatePodcastScript - Starting script generation"
  );
  const {
    articleTitle,
    articleContent,
    podcastStyle = "professional",
  } = req.body;
  console.log(
    `[PodcastController] generatePodcastScript - Received request with title: "${articleTitle.substring(
      0,
      50
    )}..." and style: ${podcastStyle}`
  );

  if (!articleTitle || !articleContent) {
    console.error(
      "[PodcastController] generatePodcastScript - Missing required fields"
    );
    res.status(400);
    throw new Error("Article title and content are required");
  }

  // Create a detailed prompt for podcast script generation
  let styleInstructions = "";
  switch (podcastStyle.toLowerCase()) {
    case "casual":
      styleInstructions =
        "Use a casual, friendly, and conversational tone as if talking to a friend.";
      break;
    case "energetic":
      styleInstructions =
        "Use an energetic, enthusiastic, and upbeat tone with excitement about the topic.";
      break;
    case "educational":
      styleInstructions =
        "Use an educational, informative tone that breaks down complex topics clearly.";
      break;
    default:
      styleInstructions =
        "Use a professional, clear, and engaging tone suitable for a news podcast.";
  }

  const podcastPrompt = `You are a professional podcast host creating a script for a brief daily news podcast. Your task is to summarize the following article in a conversational and engaging style, suitable for direct text-to-speech conversion.

**CRITICAL INSTRUCTIONS:**
- DO NOT use any Markdown formatting, asterisks, or special characters
- DO NOT begin with conversational filler like "Of course, here is a summary..." or "Welcome to..."
- Just provide the summary directly as if you're already in the middle of presenting
- ${styleInstructions}
- Keep the script between 200-400 words for a 1-3 minute podcast
- Use natural speech patterns with appropriate pauses (represented by periods and commas)
- Include smooth transitions between different points
- End with a natural conclusion that doesn't sound abrupt

Article Details:
Title: ${articleTitle}
Content: ${articleContent}

Generate only the podcast script text without any introductory text or formatting:`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(podcastPrompt);
  const response = await result.response;
  const scriptText = response.text();

  console.log(
    "[PodcastController] generatePodcastScript - Cleaning up script text"
  );
  // Clean up the response to ensure it's pure text
  let cleanedScript = scriptText.trim();

  // Remove any markdown formatting if present
  cleanedScript = cleanedScript.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold
  cleanedScript = cleanedScript.replace(/\*(.*?)\*/g, "$1"); // Remove italic
  cleanedScript = cleanedScript.replace(/#{1,6}\s*(.*)/g, "$1"); // Remove headers
  cleanedScript = cleanedScript.replace(/`(.*?)`/g, "$1"); // Remove code formatting

  const wordCount = cleanedScript.split(" ").length;
  console.log(
    `[PodcastController] generatePodcastScript - Generated script with ${wordCount} words`
  );

  res.status(200).json({
    script: cleanedScript,
    articleTitle: articleTitle,
    podcastStyle: podcastStyle,
    wordCount: cleanedScript.split(" ").length,
    estimatedDuration:
      Math.ceil(cleanedScript.split(" ").length / 150) + " minutes", // ~150 words per minute
    timestamp: new Date().toISOString(),
  });
});

export const generatePodcastAudio = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  console.log(
    "[PodcastController] generatePodcastAudio - Starting audio generation"
  );
  const {
    script,
    voiceGender = "NEUTRAL",
    voiceSpeed = 1.0,
    voicePitch = 0.0,
  } = req.body;
  console.log(
    `[PodcastController] generatePodcastAudio - Voice settings - Gender: ${voiceGender}`
  );

  if (!script) {
    console.error(
      "[PodcastController] generatePodcastAudio - No script provided"
    );
    res.status(400);
    throw new Error("Script text is required");
  }

  try {
    const audioResult = await convertToAudio(
      script,
      voiceGender,
      voiceSpeed,
      voicePitch
    );
    console.log(
      `[PodcastController] generatePodcastAudio - Converted script to audio`
    );

    res.status(200).json({
      ...audioResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[PodcastController] generatePodcastAudio - Error after ${duration}ms:`,
      error.message
    );
    console.error(
      "[PodcastController] generatePodcastAudio - Error details:",
      error
    );
    res.status(500);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
});

export const generateFullPodcast = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const {
    articleTitle,
    articleContent,
    podcastStyle = "professional",
    voiceGender = "NEUTRAL",
    voiceSpeed = 1.0,
    voicePitch = 0.0,
  } = req.body;

  console.log(
    "[PodcastController] generateFullPodcast - Starting full podcast generation"
  );
  console.log(
    `[PodcastController] generateFullPodcast - Article: "${articleTitle.substring(
      0,
      50
    )}..."`
  );
  console.log(
    `[PodcastController] generateFullPodcast - Style: ${podcastStyle}, Voice: ${voiceGender}`
  );

  if (!articleTitle || !articleContent) {
    console.error(
      "[PodcastController] generateFullPodcast - Missing required fields"
    );
    res.status(400);
    throw new Error("Article title and content are required");
  }

  try {
    // First generate the script
    const scriptResult = await generateScript(
      articleTitle,
      articleContent,
      podcastStyle
    );
    console.log(
      `[PodcastController] generateFullPodcast - Generated script with ${scriptResult.wordCount} words`
    );

    // Then convert to audio
    const audioResult = await convertToAudio(
      scriptResult.script,
      voiceGender,
      voiceSpeed,
      voicePitch
    );
    console.log(
      `[PodcastController] generateFullPodcast - Converted script to audio`
    );
    const generationTime = Date.now() - startTime;

    // Save to database
    const podcast = new Podcast({
      user: req.user._id,
      articleTitle,
      articleContent,
      script: scriptResult.script,
      podcastStyle,
      voiceSettings: {
        gender: voiceGender,
        speed: voiceSpeed,
        pitch: voicePitch,
      },
      audioMetadata: {
        audioId: audioResult.audioId,
        fileName: audioResult.fileName,
        fileSize: audioResult.fileSize,
        duration: scriptResult.estimatedDuration,
      },
      analytics: {
        wordCount: scriptResult.wordCount,
        estimatedDuration: scriptResult.estimatedDuration,
        generationTime,
      },
      status: "audio_generated",
    });

    await podcast.save();

    res.status(200).json({
      podcastId: podcast._id,
      script: scriptResult.script,
      audioId: audioResult.audioId,
      downloadUrl: audioResult.downloadUrl,
      fileName: audioResult.fileName,
      fileSize: audioResult.fileSize,
      articleTitle: articleTitle,
      podcastStyle: podcastStyle,
      voiceSettings: audioResult.voiceSettings,
      wordCount: scriptResult.wordCount,
      estimatedDuration: scriptResult.estimatedDuration,
      generationTime: generationTime + "ms",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Save failed attempt to database
    const podcast = new Podcast({
      user: res.locals.user._id,
      articleTitle,
      articleContent,
      script: "Generation failed",
      podcastStyle,
      voiceSettings: {
        gender: voiceGender,
        speed: voiceSpeed,
        pitch: voicePitch,
      },
      analytics: {
        generationTime: Date.now() - startTime,
      },
      status: "failed",
    });

    await podcast.save();
    throw error;
  }
});

export const downloadAudio = asyncHandler(async (req, res) => {
  console.log(
    `[PodcastController] downloadAudio - Request to download audio ID: ${req.params.audioId}`
  );
  const { audioId } = req.params;

  const audioData = audioStore.get(audioId);
  if (!audioData) {
    console.error(
      `[PodcastController] downloadAudio - Audio not found for ID: ${audioId}`
    );
    res.status(404).json({ error: "Audio file not found or expired" });
    return;
  }

  if (!audioData || !fs.existsSync(audioData.filePath)) {
    res.status(404);
    throw new Error("Audio file not found or expired");
  }

  // Set appropriate headers for audio download
  res.setHeader("Content-Type", "audio/wav");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${audioData.fileName}"`
  );
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Stream the audio file
  const fileStream = fs.createReadStream(audioData.filePath);
  fileStream.pipe(res);
});

// Helper functions for the combined endpoint
async function generateScript(articleTitle, articleContent, podcastStyle) {
  let styleInstructions = "";
  switch (podcastStyle.toLowerCase()) {
    case "casual":
      styleInstructions =
        "Use a casual, friendly, and conversational tone as if talking to a friend.";
      break;
    case "energetic":
      styleInstructions =
        "Use an energetic, enthusiastic, and upbeat tone with excitement about the topic.";
      break;
    case "educational":
      styleInstructions =
        "Use an educational, informative tone that breaks down complex topics clearly.";
      break;
    default:
      styleInstructions =
        "Use a professional, clear, and engaging tone suitable for a news podcast.";
  }

  const podcastPrompt = `You are a professional podcast host creating a script for a brief daily news podcast. Your task is to summarize the following article in a conversational and engaging style, suitable for direct text-to-speech conversion.

**CRITICAL INSTRUCTIONS:**
- DO NOT use any Markdown formatting, asterisks, or special characters
- DO NOT begin with conversational filler like "Of course, here is a summary..." or "Welcome to..."
- Just provide the summary directly as if you're already in the middle of presenting
- ${styleInstructions}
- Keep the script between 200-400 words for a 1-3 minute podcast
- Use natural speech patterns with appropriate pauses (represented by periods and commas)
- Include smooth transitions between different points
- End with a natural conclusion that doesn't sound abrupt

Article Details:
Title: ${articleTitle}
Content: ${articleContent}

Generate only the podcast script text without any introductory text or formatting:`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(podcastPrompt);
  const response = await result.response;
  const scriptText = response.text();

  // Clean up the response
  let cleanedScript = scriptText.trim();
  cleanedScript = cleanedScript.replace(/\*\*(.*?)\*\*/g, "$1");
  cleanedScript = cleanedScript.replace(/\*(.*?)\*/g, "$1");
  cleanedScript = cleanedScript.replace(/#{1,6}\s*(.*)/g, "$1");
  cleanedScript = cleanedScript.replace(/`(.*?)`/g, "$1");

  return {
    script: cleanedScript,
    wordCount: cleanedScript.split(" ").length,
    estimatedDuration:
      Math.ceil(cleanedScript.split(" ").length / 150) + " minutes",
  };
}

async function convertToAudio(script, voiceGender, voiceSpeed, voicePitch) {
  console.log("Converting to audio...");

  let voiceName;
  switch (voiceGender.toUpperCase()) {
    case "MALE":
      voiceName = "Puck"; // A standard prebuilt voice
      break;
    case "FEMALE":
      voiceName = "Kore"; // A standard prebuilt voice
      break;
    default:
      voiceName = "Zephyr"; // A standard prebuilt voice
      break;
  }

  const ttsModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-tts",
  });

  // Corrected modification based on Gemini API documentation for TTS
  const ttsResponse = await ttsModel.generateContent({
    contents: [{ parts: [{ text: script }] }],
    config: {
      // Use 'config' as the top-level property
      responseModalities: ["AUDIO"], // Specify that the response should be audio
      speechConfig: {
        voiceConfig: {
          // Nested voice configuration
          prebuiltVoiceConfig: {
            // Use prebuiltVoiceConfig for specifying voice by name
            voiceName: voiceName, // The specific voice is identified by 'voiceName'
          },
        },
      },
    },
  });

  // Corrected data access from the generateContent result
  const data =
    ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) {
    throw new Error("TTS API did not return audio data.");
  }
  const audioBuffer = Buffer.from(data, "base64");

  const audioId =
    Date.now().toString(36) + Math.random().toString(36).substr(2);
  const fileName = `podcast_${audioId}.wav`;
  const filePath = path.join(__dirname, "..", "temp", fileName);

  const tempDir = path.join(__dirname, "..", "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  await saveWaveFile(filePath, audioBuffer);
  console.log("Audio saved to file");

  audioStore.set(audioId, {
    filePath: filePath,
    fileName: fileName,
    timestamp: Date.now(),
  });

  const stats = fs.statSync(filePath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

  return {
    audioId: audioId,
    downloadUrl: `http://localhost:5000/api/podcast/download/${audioId}`,
    fileName: fileName,
    fileSize: fileSizeInMB + " MB",
    voiceSettings: {
      gender: voiceGender,
      speed: voiceSpeed,
      pitch: voicePitch,
      voiceName: voiceName,
    },
  };
}

export const getPodcastHistory = asyncHandler(async (req, res) => {
  console.log(
    "[PodcastController] getPodcastHistory - Fetching podcast history"
  );
  const { page = 1, limit = 10 } = req.query;
  console.log(
    `[PodcastController] getPodcastHistory - Page: ${page}, Limit: ${limit}`
  );

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: {
      path: "user",
      select: "name email",
    },
  };

  const podcasts = await Podcast.paginate({ user: req.user._id }, options);

  res.status(200).json({
    podcasts: podcasts.docs,
    pagination: {
      currentPage: podcasts.page,
      totalPages: podcasts.totalPages,
      totalDocs: podcasts.totalDocs,
      hasNextPage: podcasts.hasNextPage,
      hasPrevPage: podcasts.hasPrevPage,
    },
  });
});

export const getPodcastById = asyncHandler(async (req, res) => {
  const { podcastId } = req.params;

  const podcast = await Podcast.findOne({
    _id: podcastId,
    user: req.user._id,
  }).populate("user", "name email");

  if (!podcast) {
    res.status(404);
    throw new Error("Podcast not found");
  }

  res.status(200).json({ podcast });
});

export const deletePodcast = asyncHandler(async (req, res) => {
  const { podcastId } = req.params;

  const podcast = await Podcast.findOne({
    _id: podcastId,
    user: req.user._id,
  });

  if (!podcast) {
    res.status(404);
    throw new Error("Podcast not found");
  }

  // Delete associated audio file if it exists
  if (podcast.audioMetadata?.audioId) {
    const audioData = audioStore.get(podcast.audioMetadata.audioId);
    if (audioData && fs.existsSync(audioData.filePath)) {
      fs.unlinkSync(audioData.filePath);
    }
    audioStore.delete(podcast.audioMetadata.audioId);
  }

  await Podcast.findByIdAndDelete(podcastId);

  res.status(200).json({
    message: "Podcast deleted successfully",
    deletedPodcastId: podcastId,
  });
});
