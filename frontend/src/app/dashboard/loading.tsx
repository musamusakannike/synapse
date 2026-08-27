import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
        <div className="h-4 w-72 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
      </div>

      {/* Stats summary row skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]"
          >
            <div className="size-12 rounded-[var(--radius-lg)] bg-[var(--surface-sunken)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-16 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
              <div className="h-6 w-24 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
            </div>
          </div>
        ))}
      </div>

      {/* Continue learning skeleton rail */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
          <div className="h-4 w-20 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
        </div>

        <div className="rounded-[var(--radius-2xl)] border border-[var(--line)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-xs)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 rounded-[var(--radius-full)] bg-[var(--brand-gold-100)]" />
              <div className="h-6 w-3/4 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
              <div className="h-4 w-1/2 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
            </div>
            <div className="h-11 w-32 rounded-[var(--radius-md)] bg-[var(--surface-sunken)]" />
          </div>
          <div className="mt-6 h-2 w-full rounded-full bg-[var(--surface-sunken)]" />
        </div>
      </div>

      {/* AI Tools grid skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-32 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)]"
            >
              <div className="space-y-3">
                <div className="size-10 rounded-[var(--radius-md)] bg-[var(--brand-violet-100)]" />
                <div className="h-5 w-3/4 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
                <div className="h-4 w-full rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]" />
              </div>
              <div className="mt-6 h-9 w-full rounded-[var(--radius-md)] bg-[var(--surface-sunken)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
