"use client";

interface FetchErrorProps {
  /** Short message describing what failed to load, e.g. "Couldn't load your courses." */
  message?: string;
  /** Called when the user clicks the retry button. */
  onRetry: () => void;
  /** Disables the retry button while a retry is in flight. */
  retrying?: boolean;
}

/**
 * Consistent error + retry state for client pages whose data fetch failed.
 * Replaces silently-ignored fetch errors so users can recover without a reload.
 */
export function FetchError({
  message = "Something went wrong while loading this page.",
  onRetry,
  retrying = false,
}: FetchErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[var(--danger)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <p className="mb-4 max-w-sm text-sm text-[var(--text-secondary)]">{message}</p>
      <button
        onClick={onRetry}
        disabled={retrying}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {retrying ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            Retrying...
          </>
        ) : (
          "Try again"
        )}
      </button>
    </div>
  );
}
