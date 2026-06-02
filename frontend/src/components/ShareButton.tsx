"use client";

import { useState } from "react";

interface ShareButtonProps {
  id: string;
  type: "course" | "quiz" | "video" | "chat";
  className?: string;
}

export function ShareButton({ id, type, className }: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleShare = async () => {
    setSharing(true);
    setError("");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, isPublic: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate share link");
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to share");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        disabled={sharing}
        className={
          className ||
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all disabled:opacity-50"
        }
      >
        {sharing ? (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.636-2.318m0 0a3 3 0 102.267-4.343 3 3 0 00-2.267 4.343zM8.684 13.258l4.636 2.318m-4.636-2.318a3 3 0 11-4.242-4.242 3 3 0 014.242 4.242zm5.96 4.886a3 3 0 11-5.714-2.14 3 3 0 015.714 2.14z" />
          </svg>
        )}
        {copied ? "Link Copied!" : "Share"}
      </button>

      {error && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-[var(--danger)] text-white text-[10px] whitespace-nowrap animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
}
