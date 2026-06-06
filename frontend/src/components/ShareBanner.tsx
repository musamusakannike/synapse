"use client";

import Link from "next/link";

export function ShareBanner() {
  return (
    <div className="w-full bg-[var(--accent-subtle)] border-b border-[var(--accent-muted)] py-3 px-4 sm:px-6 relative z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg">💡</span>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
            You are viewing a shared learning resource from <span className="font-bold text-[var(--accent)]">Sabi Learn</span>. Sabi the way your brain dey work!
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/50 font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold bg-[var(--accent)] text-[var(--bg-primary)] px-4 py-1.5 rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  );
}
