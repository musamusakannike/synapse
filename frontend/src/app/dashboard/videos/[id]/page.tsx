"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import dynamic from "next/dynamic";
import { VideoComposition } from "@/remotion/VideoComposition";

// Dynamically import Remotion Player to avoid SSR (Server Side Rendering) issues with browser APIs
const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

interface Scene {
  sceneNumber: number;
  title: string;
  bulletPoints: string[];
  illustrationPrompt: string;
  narration: string;
  durationSeconds: number;
}

interface Video {
  _id: string;
  title: string;
  topic: string;
  styleTheme: string;
  scenes: Scene[];
}

const themeColors: Record<string, { bg: string; accent: string; text: string }> = {
  emerald: { bg: "#064E3B", accent: "#34D399", text: "#ECFDF5" },
  lime: { bg: "#1A2E05", accent: "#84CC16", text: "#F7FEE7" },
  slate: { bg: "#1E293B", accent: "#38BDF8", text: "#F1F5F9" },
  white: { bg: "#FAFAFA", accent: "#4F46E5", text: "#18181B" },
};

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const res = await fetch(`/api/api/ai/video?id=${id}`); // note: wait, is the API endpoint actually /api/ai/video or /api/api/ai/video? Let's check original. Original was /api/ai/video
      // Let's restore original url /api/ai/video
      const resReal = await fetch(`/api/ai/video?id=${id}`);
      const data = await resReal.json();
      if (data.success) setVideo(data.video);
      else router.push("/dashboard/videos");
    } catch {
      router.push("/dashboard/videos");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !video) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const colors = themeColors[video.styleTheme] || themeColors.emerald;
  
  // Calculate total composition frames at 30fps
  const totalDurationSeconds = video.scenes.reduce(
    (acc, scene) => acc + (scene.durationSeconds || 10),
    0
  );
  const totalFrames = totalDurationSeconds * 30;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
      <button
        onClick={() => router.push("/dashboard/videos")}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-4 sm:mb-6"
      >
        ← Back to videos
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold">{video.title}</h1>
          <p className="text-xs text-[var(--text-muted)]">Topic: {video.topic}</p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto bg-[var(--accent)]/10 text-[var(--accent)] capitalize border border-[var(--accent)]/25">
          {video.styleTheme} Theme
        </div>
      </div>

      {/* Remotion Interactive Player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-[var(--bg-secondary)] border border-[var(--border)] shadow-2xl">
        <Player
          component={VideoComposition}
          inputProps={{
            scenes: video.scenes,
            styleTheme: video.styleTheme,
          }}
          durationInFrames={totalFrames}
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          style={{
            width: "100%",
            height: "100%",
          }}
          controls
          loop
        />
      </div>

      {/* Narrative Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] font-[family-name:var(--font-display)]">Video Narrative & Scenes</h3>
        <div className="grid gap-4">
          {video.scenes.map((scene, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-bold border border-[var(--accent)]/20">
                    {scene.sceneNumber}
                  </span>
                  <h4 className="font-semibold text-sm text-[var(--text-primary)]">{scene.title}</h4>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">({scene.durationSeconds || 10}s)</span>
                </div>
                <ul className="space-y-1 pl-7 list-disc text-xs text-[var(--text-secondary)] mb-3">
                  {scene.bulletPoints.map((bp, i) => (
                    <li key={i}>{bp}</li>
                  ))}
                </ul>
                <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <p className="text-[10px] text-[var(--text-muted)] mb-0.5 uppercase font-medium tracking-wide">Narration Voiceover</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">"{scene.narration}"</p>
                </div>
              </div>
              <div className="md:w-64 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex flex-col justify-between">
                <span className="text-[10px] text-[var(--accent)] uppercase font-semibold tracking-wider mb-2">🎨 Scene Graphic Concept</span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{scene.illustrationPrompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

