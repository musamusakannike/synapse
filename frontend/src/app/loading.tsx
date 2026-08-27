import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      {/* Top indeterminate gold progress line */}
      <div className="relative h-1 w-full overflow-hidden bg-[var(--line)]">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-[var(--brand-gold-100)] via-[var(--brand-gold)] to-[var(--brand-gold-600)]" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="flex flex-col items-center text-center">
          {/* Logo Brand Animation */}
          <div className="relative mb-6 flex size-16 items-center justify-center rounded-[var(--radius-2xl)] border border-[var(--line)] bg-[var(--surface-card)] shadow-[var(--shadow-md)]">
            <LoadingSpinner size="lg" />
          </div>

          <div className="mb-2 font-[var(--font-display)] text-xl font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)]">
            Sabi<span className="text-[var(--brand-gold)]">Learn</span>
          </div>

          <p className="text-sm font-medium text-[var(--text-muted)]">
            Loading your study space…
          </p>
        </div>

        {/* Shimmer skeleton preview cards in SabiLearn card layout */}
        <div className="mt-12 w-full max-w-2xl space-y-4">
          <div className="h-6 w-40 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]"
              >
                <div className="mb-3 h-4 w-24 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
                <div className="mb-2 h-5 w-3/4 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
                <div className="h-4 w-1/2 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
