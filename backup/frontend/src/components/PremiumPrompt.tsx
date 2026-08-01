"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface PremiumPromptProps {
  /** Short headline tied to the moment of intent, e.g. "Unlock larger quizzes". */
  title: string;
  /** One-line explanation of the value. */
  description: string;
  /** Inline banner (default) or a centered modal overlay for high-intent moments. */
  variant?: "banner" | "modal";
  /** CTA label. Defaults to "Upgrade to Premium". */
  ctaLabel?: string;
  /** Called when the modal is dismissed (modal variant only). */
  onClose?: () => void;
  className?: string;
}

/**
 * Reusable premium upsell, wired to moments of intent (larger quizzes, video,
 * unlimited uploads, exports, advanced analytics). Matches the warm-dark theme.
 */
export function PremiumPrompt({
  title,
  description,
  variant = "banner",
  ctaLabel = "Upgrade to Premium",
  onClose,
  className,
}: PremiumPromptProps) {
  const card = (
    <div
      className={cn(
        "rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)] p-4 sm:p-5",
        variant === "modal" && "max-w-md w-full shadow-[var(--shadow-lg)] bg-[var(--bg-elevated)]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
          <LockIcon className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            {title}
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)]">
              Premium
            </span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{description}</p>
          <div className="flex items-center gap-3 mt-3">
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors"
            >
              {ctaLabel}
            </Link>
            {variant === "modal" && onClose && (
              <button
                onClick={onClose}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "modal") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
          {card}
        </div>
      </div>
    );
  }

  return card;
}
