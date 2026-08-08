import React from 'react';

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  trend?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ value, label, trend, icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1.5 p-5 rounded-[var(--radius-lg)] bg-[var(--surface-card)] shadow-[var(--shadow-xs)] font-[var(--font-body)] min-w-[140px]">
      <div className="flex items-center justify-between">
        <span className="font-[var(--font-display)] text-[length:var(--text-3xl)] font-bold text-[var(--ink-900)]">{value}</span>
        {icon && <span className="text-[var(--brand-gold)]">{icon}</span>}
      </div>
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      {trend && (
        <span className={`text-xs font-semibold ${trend.startsWith('-') ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>{trend}</span>
      )}
    </div>
  );
}
