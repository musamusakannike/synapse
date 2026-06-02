"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { VideoComposition } from "@/remotion/VideoComposition";
import type { Scene } from "@/remotion/SceneDispatcher";
import { ShareBanner } from "@/components/ShareBanner";
import Link from "next/link";

// Dynamically import Remotion Player to avoid SSR issues
const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

interface Video {
  _id: string;
  title: string;
  topic: string;
  styleTheme: string;
  scenes: Scene[];
}

export default function PublicVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicVideo();
  }, [id]);

  const fetchPublicVideo = async () => {
    try {
      const res = await fetch(`/api/share?id=${id}&type=video`);
      const data = await res.json();
      if (data.success) {
        setVideo(data.video);
      } else {
        setError(data.error || "Shared video not found");
      }
    } catch {
      setError("Failed to load shared video");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0C0C0E]">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0C0C0E] text-center p-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-4">
          Video Not Available
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
          {error || "This video has been set to private or does not exist."}
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          Go to Synapse Home
        </Link>
      </div>
    );
  }

  const totalDurationSeconds = video.scenes.reduce(
    (acc, scene) => acc + (scene.durationSeconds || 12),
    0
  );
  const totalFrames = totalDurationSeconds * 30;

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0C0E]">
      <ShareBanner />
      
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
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
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-bold border border-[var(--accent)]/20">
                      {scene.sceneNumber}
                    </span>
                    <h4 className="font-semibold text-sm text-[var(--text-primary)]">{scene.title}</h4>
                    {scene.layoutType && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                        {scene.layoutType}
                      </span>
                    )}
                    <span className="text-xs text-[var(--text-muted)] ml-auto">({scene.durationSeconds || 12}s)</span>
                  </div>
                  {scene.bulletPoints && scene.bulletPoints.length > 0 && (
                    <ul className="space-y-1 pl-7 list-disc text-xs text-[var(--text-secondary)] mb-3">
                      {scene.bulletPoints.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  )}
                  {scene.timelineSteps && (
                    <ul className="space-y-1 pl-7 list-decimal text-xs text-[var(--text-secondary)] mb-3">
                      {scene.timelineSteps.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  )}
                  {scene.heroStatement && (
                    <p className="pl-7 text-sm font-bold text-[var(--accent)] mb-3 italic">"{scene.heroStatement}"</p>
                  )}
                  {scene.spotlightTerm && (
                    <div className="pl-7 mb-3">
                      <span className="font-bold text-[var(--accent)]">{scene.spotlightTerm}</span>
                      {scene.spotlightDefinition && <p className="text-xs text-[var(--text-secondary)] mt-1">{scene.spotlightDefinition}</p>}
                    </div>
                  )}
                  {scene.quoteText && (
                    <p className="pl-7 text-xs italic text-[var(--text-secondary)] mb-3">"{scene.quoteText}" {scene.quoteAuthor ? `— ${scene.quoteAuthor}` : ""}</p>
                  )}
                  {scene.statCallouts && (
                    <div className="pl-7 flex flex-wrap gap-2 mb-3">
                      {scene.statCallouts.map((s, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20">
                          {s.value} <span className="font-normal opacity-70">{s.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
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
    </div>
  );
}
