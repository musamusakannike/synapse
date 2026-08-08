import React from "react";

const tones = {
  gold: { bg: "var(--brand-gold-100)", fg: "var(--brand-gold-600)" },
  violet: { bg: "var(--brand-violet-100)", fg: "var(--brand-violet-600)" },
  success: { bg: "var(--success-100)", fg: "var(--success)" },
  danger: { bg: "var(--danger-100)", fg: "var(--danger)" },
  warning: { bg: "var(--warning-100)", fg: "var(--warning)" },
  neutral: { bg: "var(--surface-sunken)", fg: "var(--ink-700)" },
  dark: { bg: "var(--ink-900)", fg: "#fff" },
};

export function Badge({ children, tone = "neutral" }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
        background: t.bg,
        color: t.fg,
      }}
    >
      {children}
    </span>
  );
}
