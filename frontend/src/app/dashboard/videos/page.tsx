"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface Video {
  _id: string;
  title: string;
  topic: string;
  styleTheme: string;
  scenes: Array<{
    sceneNumber: number;
    title: string;
    bulletPoints: string[];
    narration: string;
    durationSeconds: number;
  }>;
  createdAt: string;
}

export default function VideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [theme, setTheme] = useState("emerald");
  const [numScenes, setNumScenes] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/ai/video");
      const data = await res.json();
      if (data.success) setVideos(data.videos || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setError("");
    setGenerating(true);

    try {
      const res = await fetch("/api/ai/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, styleTheme: theme, numScenes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate video");
      } else {
        setTopic("");
        await fetchVideos();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold mb-2">
        AI Videos
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6 sm:mb-8">
        Generate explanatory video presentations on any topic.
        {!user?.premium && (
          <span className="text-[var(--accent)] ml-1">Premium feature — </span>
        )}
        {!user?.premium && (
          <Link href="/dashboard/billing" className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline">
            upgrade to access
          </Link>
        )}
      </p>

      {user?.premium && (
        <form onSubmit={handleGenerate} className="flex flex-col gap-3 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How neural networks work"
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              type="submit"
              disabled={generating || !topic.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {generating ? "Generating..." : "Create Video"}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              >
                <option value="emerald">Emerald</option>
                <option value="lime">Lime</option>
                <option value="slate">Slate</option>
                <option value="white">White</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Scenes (3–8)
              </label>
              <div className="flex gap-2 flex-wrap">
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumScenes(n)}
                    disabled={generating}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                      numScenes === n
                        ? "bg-[var(--accent)] text-[var(--bg-primary)] border-[var(--accent)]"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-[var(--text-muted)]">
            {user?.premium ? "No videos yet. Create your first one above." : "Upgrade to Premium to create AI explanatory videos."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <Link
              key={video._id}
              href={`/dashboard/videos/${video._id}`}
              className="block p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] transition-all"
            >
              <h3 className="font-[family-name:var(--font-display)] text-base font-semibold mb-1">
                {video.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {video.scenes?.length || 0} scenes • {video.styleTheme} theme •{" "}
                {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
