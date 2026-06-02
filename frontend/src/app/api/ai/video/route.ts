import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateVideoScript } from "@/lib/deepseek";
import { syncUserSubscriptionStatus } from "@/lib/paystack";
import { buildDocumentContext } from "@/lib/document-context";
import { ObjectId } from "mongodb";
import { generateTTSBuffer } from "@/lib/tts";
import { isR2Configured, uploadToR2 } from "@/lib/r2";
import path from "path";
import fs from "fs";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

/**
 * GET video projects list or a specific video project
 */
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");

    if (videoId) {
      const video = await db.collection("videos").findOne({
        _id: new ObjectId(videoId),
        userId,
      });
      if (!video) {
        return NextResponse.json({ error: "Video project not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, video });
    }

    const videos = await db
      .collection("videos")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, videos });
  } catch (error: any) {
    console.error("GET Video Error:", error);
    return NextResponse.json({ error: "Failed to retrieve video projects" }, { status: 500 });
  }
}

/**
 * POST generate visual slideshow explanatory video scenes
 * Premium-only feature!
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, styleTheme, numScenes, documentIds } = await request.json();
    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const targetTheme = styleTheme || "emerald"; // emerald, lime, slate, white
    const targetNumScenes = Math.max(3, Math.min(8, Number(numScenes) || 5));

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Explanatory Video is a Premium-Only Feature!
    const premiumActive = await syncUserSubscriptionStatus(userId);

    if (!premiumActive) {
      return NextResponse.json(
        {
          error: "Synapse AI Explanatory Video requires Premium Subscription.",
          code: "PREMIUM_REQUIRED",
        },
        { status: 403 }
      );
    }

    const userProfile = {
      style: user.style || "textual",
      level: user.level || "self-learner",
      goals: user.goals || "",
    };

    // Build document context if provided
    let documentContext = "";
    if (documentIds && documentIds.length > 0) {
      documentContext = await buildDocumentContext(documentIds, userId);
    }

    // Generate video scene script outline
    const videoScript = await generateVideoScript(topic, targetTheme, userProfile, targetNumScenes, documentContext);

    // Save Video Project
    const result = await db.collection("videos").insertOne({
      userId,
      title: videoScript.title || `Explanatory Video: ${topic}`,
      topic,
      styleTheme: targetTheme,
      scenes: videoScript.scenes,
      createdAt: new Date(),
    });

    const videoId = result.insertedId.toString();

    // Generate TTS voiceover narration for each scene and attach audio urls
    const updatedScenes = [...videoScript.scenes];
    try {
      await Promise.all(
        updatedScenes.map(async (scene: any) => {
          if (!scene.narration) return;
          const fileName = `scene-${scene.sceneNumber}.mp3`;
          
          // Generate raw audio buffer
          const audioBuffer = await generateTTSBuffer(scene.narration);
          
          if (isR2Configured) {
            // Upload to Cloudflare R2
            const r2Key = `audio/${videoId}/${fileName}`;
            const publicUrl = await uploadToR2(audioBuffer, r2Key, "audio/mpeg");
            scene.audioUrl = publicUrl;
            console.log(`Successfully uploaded scene ${scene.sceneNumber} voiceover to Cloudflare R2: ${publicUrl}`);
          } else {
            // Fallback: Save local file
            const relativePath = `/audio/${videoId}/${fileName}`;
            const absolutePath = path.join(process.cwd(), "public", "audio", videoId, fileName);
            
            const dir = path.dirname(absolutePath);
            await fs.promises.mkdir(dir, { recursive: true });
            await fs.promises.writeFile(absolutePath, audioBuffer);
            
            scene.audioUrl = relativePath;
            console.log(`R2 not configured. Saved scene ${scene.sceneNumber} voiceover locally: ${relativePath}`);
          }
        })
      );

      // Persist the scenes with their respective audioUrl fields
      await db.collection("videos").updateOne(
        { _id: result.insertedId },
        { $set: { scenes: updatedScenes } }
      );
    } catch (ttsError) {
      console.error("Failed to generate voiceover narration audio files:", ttsError);
    }

    return NextResponse.json({
      success: true,
      videoId,
    });
  } catch (error: any) {
    console.error("POST Video Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate video script" }, { status: 500 });
  }
}
