import React from 'react';

interface ProgressBarProps {
  value?: number;
  max?: number;
  tone?: 'gold' | 'violet' | 'success';
  label?: string;
}

export default function ProgressBar({ value = 0, max = 100, tone = 'gold', label }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = tone === 'violet' ? 'var(--brand-violet)' : tone === 'success' ? 'var(--success)' : 'var(--brand-gold)';
  return (
    <div className="flex flex-col gap-1.5 font-[var(--font-body)] w-full">
      {label && (
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2 rounded-[var(--radius-full)] bg-[var(--surface-sunken)] overflow-hidden">
        <div
          className="h-full rounded-[var(--radius-full)] transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-standard)]"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
