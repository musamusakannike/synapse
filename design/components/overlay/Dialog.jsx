import React from "react";

export function Dialog({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(14,14,26,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-card)", borderRadius: "var(--radius-xl)",
          padding: "28px", width: "min(440px, 90vw)", boxShadow: "var(--shadow-xl)",
          display: "flex", flexDirection: "column", gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--ink-900)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "var(--ink-500)", lineHeight: 1 }}>&times;</button>
        </div>
        <div style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: "var(--leading-relaxed)" }}>{children}</div>
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>{footer}</div>}
      </div>
    </div>
  );
}
