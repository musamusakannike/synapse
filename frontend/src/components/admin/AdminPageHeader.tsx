import React from 'react';

export default function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div className="min-w-0">
        <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--ink-900)] mb-1">{title}</h1>
        {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
