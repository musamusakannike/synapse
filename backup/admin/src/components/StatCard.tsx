"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: { value: number; positive: boolean };
  loading?: boolean;
  accent?: string;
}

export function StatCard({ label, value, sub, icon, trend, loading, accent }: StatCardProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: accent ? `${accent}20` : "var(--accent-muted)" }}
          >
            <span style={{ color: accent || "var(--accent)" }}>{icon}</span>
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-16 skeleton mt-1" />
      ) : (
        <p className="font-[family-name:var(--font-display)] text-2xl font-bold">{value}</p>
      )}
      <div className="flex items-center gap-2 mt-1">
        {sub && <p className="text-[11px] text-[var(--text-muted)]">{sub}</p>}
        {trend && (
          <span
            className={cn(
              "text-[11px] font-semibold",
              trend.positive ? "text-[var(--success)]" : "text-[var(--danger)]"
            )}
          >
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
