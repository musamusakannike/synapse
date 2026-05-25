"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

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
  slate: { bg: "#1E293B", accent: "#94A3B8", text: "#F1F5F9" },
  white: { bg: "#FAFAFA", accent: "#18181B", text: "#18181B" },
};

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const res = await fetch(`/api/ai/video?id=${id}`);
      const data = await res.json();
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
  const scene = video.scenes[activeScene];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
      <button
        onClick={() => router.push("/dashboard/videos")}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-4 sm:mb-6"
      >
        ← Back to videos
      </button>

      <h1 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold mb-4 sm:mb-6">{video.title}</h1>

      {/* Video slide viewer */}
      <div
        className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12"
        style={{ backgroundColor: colors.bg }}
      >
        {/* Placeholder for illustration */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 py-1 rounded bg-black/20 text-xs text-white/60">
          Scene {scene.sceneNumber}/{video.scenes.length}
        </div>

        <h2
          className="text-xl sm:text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-center mb-4 sm:mb-6"
          style={{ color: colors.text }}
        >
          {scene.title}
        </h2>

        <ul className="space-y-2 text-center">
          {scene.bulletPoints.map((bp, i) => (
            <li key={i} className="text-sm md:text-base" style={{ color: colors.accent }}>
              {bp}
            </li>
          ))}
        </ul>

        {/* Image placeholder */}
        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/20">
          <p className="text-xs text-white/50 italic">
            Image prompt: {scene.illustrationPrompt}
          </p>
        </div>
      </div>

      {/* Narration */}
      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] mb-6">
        <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wide font-medium">Narration</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{scene.narration}</p>
      </div>

      {/* Scene navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveScene((p) => Math.max(0, p - 1))}
          disabled={activeScene === 0}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-2">
          {video.scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveScene(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                i === activeScene ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]"
              )}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveScene((p) => Math.min(video.scenes.length - 1, p + 1))}
          disabled={activeScene === video.scenes.length - 1}
          className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] disabled:opacity-30 font-medium transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
