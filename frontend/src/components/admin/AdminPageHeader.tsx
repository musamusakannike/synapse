import React from 'react';

export default function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="mb-1 text-2xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">{title}</h1>
        {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
