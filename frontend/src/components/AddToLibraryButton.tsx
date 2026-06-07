"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AddToLibraryButtonProps {
  resourceId: string;
  type: "quiz" | "course" | "video" | "chat";
}

export function AddToLibraryButton({ resourceId, type }: AddToLibraryButtonProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const labelMap: Record<string, string> = {
    quiz: "Quiz",
    course: "Course",
    video: "Video",
    chat: "Chat",
  };

  const handleAdd = async () => {
    if (loading) return;

    if (!user) {
      router.push(`/login?redirect=/share/${type}/${resourceId}`);
      return;
    }

    if (!user.premium) {
      setShowUpgradePrompt(true);
      return;
    }

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/share/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resourceId, type }),
      });
      const data = await res.json();

      if (data.success) {
        setAdded(true);
      } else if (data.code === "ALREADY_ADDED" || data.code === "ALREADY_OWNED") {
        setAdded(true);
      } else if (data.code === "PREMIUM_REQUIRED") {
        setShowUpgradePrompt(true);
      } else {
        setError(data.error || "Failed to add");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  if (added) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Added to your {labelMap[type]}s
      </div>
    );
  }

  if (showUpgradePrompt) {
    return (
      <div className="flex flex-col gap-2 items-start">
        <p className="text-xs text-[var(--text-muted)]">
          Adding shared content to your library is a Premium feature.
        </p>
        <button
          onClick={() => router.push("/dashboard/billing")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleAdd}
        disabled={adding}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] text-sm font-medium text-[var(--text-primary)] transition-colors disabled:opacity-50"
      >
        {adding ? (
          <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
        {adding ? "Adding..." : `Add to My ${labelMap[type]}s`}
      </button>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
