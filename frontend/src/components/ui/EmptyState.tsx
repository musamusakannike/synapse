import React from 'react';

export default function EmptyState({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
      {icon && <div className="text-[var(--ink-300)]">{icon}</div>}
      <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--ink-900)]">{title}</h3>
      {description && <p className="text-sm text-[var(--text-muted)] max-w-sm">{description}</p>}
    </div>
  );
}
