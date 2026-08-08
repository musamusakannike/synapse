import React from "react";

export function ProgressBar({ value = 0, max = 100, tone = "gold", label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = tone === "violet" ? "var(--brand-violet)" : tone === "success" ? "var(--success)" : "var(--brand-gold)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontFamily: "var(--font-body)", width: "100%" }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height: "8px", borderRadius: "var(--radius-full)", background: "var(--surface-sunken)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "var(--radius-full)", transition: "width var(--duration-slow) var(--ease-standard)" }} />
      </div>
    </div>
  );
}
