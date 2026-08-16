import React from 'react';

export type BadgeTone = 'gold' | 'violet' | 'success' | 'danger' | 'warning' | 'neutral' | 'dark';

const tones: Record<BadgeTone, string> = {
  gold: 'bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]',
  violet: 'bg-[var(--brand-violet-100)] text-[var(--brand-violet-600)]',
  success: 'bg-[var(--success-100)] text-[var(--success)]',
  danger: 'bg-[var(--danger-100)] text-[var(--danger)]',
  warning: 'bg-[var(--warning-100)] text-[var(--warning)]',
  neutral: 'bg-[var(--surface-sunken)] text-[var(--ink-700)]',
  dark: 'bg-[var(--ink-900)] text-white',
};

export default function Badge({ children, tone = 'neutral', className = '' }: { children: React.ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-[var(--radius-full)] px-3 py-1 text-xs font-[var(--font-body)] font-semibold tracking-[var(--tracking-wide)] uppercase ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
