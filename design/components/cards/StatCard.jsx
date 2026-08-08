import React from "react";

export function StatCard({ value, label, trend }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "6px", padding: "20px",
      borderRadius: "var(--radius-lg)", background: "var(--surface-card)", boxShadow: "var(--shadow-xs)",
      fontFamily: "var(--font-body)", minWidth: "160px",
    }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--ink-900)" }}>{value}</span>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{label}</span>
      {trend && <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: trend.startsWith("-") ? "var(--danger)" : "var(--success)" }}>{trend}</span>}
    </div>
  );
}
