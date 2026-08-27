'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, LayoutDashboard, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Dashboard route error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 inline-flex size-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--danger-100)] text-[var(--danger)] shadow-[var(--shadow-xs)]">
        <AlertTriangle className="size-7 stroke-[1.8]" />
      </div>

      <h1 className="mb-2 text-2xl font-[var(--font-display)] font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] sm:text-3xl">
        Could not load this section
      </h1>

      <p className="mb-8 max-w-md text-sm leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
        An error occurred while loading this dashboard page. You can try refreshing the data or go back to your main overview.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="md" onClick={() => reset()}>
          <RotateCcw className="size-4 stroke-[2]" />
          Try again
        </Button>
        <Link href="/dashboard">
          <Button size="md" variant="secondary">
            <LayoutDashboard className="size-4 stroke-[2]" />
            Dashboard home
          </Button>
        </Link>
      </div>

      {/* Diagnostics */}
      <div className="mt-10 w-full max-w-lg text-left">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="mx-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--ink-900)]"
        >
          <span>{showDetails ? 'Hide details' : 'Show details'}</span>
          {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>

        {showDetails && (
          <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--ink-900)] p-4 text-xs font-[var(--font-mono)] text-[var(--ink-100)] shadow-[var(--shadow-md)]">
            {error.digest && (
              <div className="mb-2 text-[var(--brand-gold)]">
                Digest: <span className="text-white">{error.digest}</span>
              </div>
            )}
            <div className="break-all whitespace-pre-wrap">
              {error.message || 'Unknown dashboard error occurred.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
