'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Critical global error:', error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[var(--surface-page)] font-[var(--font-body)] text-[var(--text-body)]">
        <header className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-card)] px-6 py-4 sm:px-8">
          <div className="text-lg font-[var(--font-display)] font-bold text-[var(--ink-900)]">
            Sabi<span className="text-[var(--brand-gold)]">Learn</span>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-8">
          <div className="mx-auto w-full max-w-lg rounded-[var(--radius-2xl)] border border-[var(--line)] bg-[var(--surface-card)] p-8 text-center shadow-[var(--shadow-lg)] sm:p-10">
            <div className="mx-auto mb-6 inline-flex size-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--danger-100)] text-[var(--danger)]">
              <AlertTriangle className="size-8 stroke-[1.8]" />
            </div>

            <h1 className="mb-3 text-2xl font-[var(--font-display)] font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] sm:text-3xl">
              Critical application error
            </h1>

            <p className="mx-auto mb-8 max-w-md text-sm leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
              A system-level error prevented SabiLearn from loading properly. Please try resetting the view or reload the page.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--brand-gold)] px-6 py-3 font-[var(--font-display)] text-sm font-semibold text-[var(--ink-900)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:-translate-y-px hover:bg-[var(--brand-gold-600)] sm:w-auto"
              >
                <RotateCcw className="size-4 stroke-[2]" />
                Try again
              </button>

              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--ink-900)] bg-transparent px-6 py-3 font-[var(--font-display)] text-sm font-semibold text-[var(--ink-900)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:-translate-y-px hover:bg-[var(--surface-sunken)] sm:w-auto"
              >
                <RefreshCw className="size-4 stroke-[2]" />
                Reload home
              </button>
            </div>

            {error?.digest && (
              <div className="mt-8 rounded-[var(--radius-md)] bg-[var(--surface-sunken)] px-3 py-2 text-xs font-[var(--font-mono)] text-[var(--text-muted)]">
                Error Reference: {error.digest}
              </div>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
