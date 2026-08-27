'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, LayoutDashboard, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error to console or error reporting service
    console.error('Root application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto w-full max-w-xl text-center">
          {/* Danger icon badge */}
          <div className="mx-auto mb-6 inline-flex size-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--danger-100)] text-[var(--danger)] shadow-[var(--shadow-xs)]">
            <AlertTriangle className="size-8 stroke-[1.8]" />
          </div>

          <h1 className="mb-3 text-3xl font-[var(--font-display)] font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] sm:text-4xl">
            Something went wrong
          </h1>

          <p className="mx-auto mb-8 max-w-md text-base leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
            We ran into an unexpected error while loading this page. You can try refreshing the page or head back to safety.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => reset()} fullWidth className="sm:w-auto">
              <RotateCcw className="size-4 stroke-[2]" />
              Try again
            </Button>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" fullWidth className="sm:w-auto">
                <LayoutDashboard className="size-4 stroke-[2]" />
                Go to dashboard
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button size="lg" variant="ghost" fullWidth className="sm:w-auto">
                <Home className="size-4 stroke-[2]" />
                Home
              </Button>
            </Link>
          </div>

          {/* Collapsible diagnostic details */}
          <div className="mt-12 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="mx-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--ink-900)]"
            >
              <span>{showDetails ? 'Hide error details' : 'Show error details'}</span>
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
                  {error.message || 'Unknown application error occurred.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
