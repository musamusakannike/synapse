import React from 'react';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && <div className="text-[var(--ink-300)]">{icon}</div>}
      <h3 className="text-lg font-[var(--font-display)] font-semibold text-[var(--ink-900)]">{title}</h3>
      {description && <p className="max-w-sm text-sm text-[var(--text-muted)]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
      {children}
    </div>
  );
}

