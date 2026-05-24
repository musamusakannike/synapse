import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateVideoScript } from "@/lib/deepseek";
import { ObjectId } from "mongodb";

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

    const { topic, styleTheme } = await request.json();
    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const targetTheme = styleTheme || "emerald"; // emerald, lime, slate, white

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Explanatory Video is a Premium-Only Feature!
    if (!user.premium) {
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

    // Generate video scene script outline
    const videoScript = await generateVideoScript(topic, targetTheme, userProfile);

    // Save Video Project
    const result = await db.collection("videos").insertOne({
      userId,
      title: videoScript.title || `Explanatory Video: ${topic}`,
      topic,
      styleTheme: targetTheme,
      scenes: videoScript.scenes,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      videoId: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error("POST Video Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate video script" }, { status: 500 });
  }
}
