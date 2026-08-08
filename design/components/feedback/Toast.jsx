import React from "react";

const tones = {
  info: { bg: "var(--ink-900)", fg: "#fff" },
  success: { bg: "var(--success)", fg: "#fff" },
  danger: { bg: "var(--danger)", fg: "#fff" },
};

export function Toast({ children, tone = "info", onClose }) {
  const t = tones[tone] || tones.info;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        borderRadius: "var(--radius-lg)",
        background: t.bg,
        color: t.fg,
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        boxShadow: "var(--shadow-lg)",
        maxWidth: "360px",
      }}
    >
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px", padding: 0, lineHeight: 1, opacity: 0.7 }}>
          &times;
        </button>
      )}
    </div>
  );
}
