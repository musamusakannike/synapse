import React from "react";

export function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-body)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          border: `1.5px solid ${checked ? "var(--brand-gold)" : "var(--line-strong)"}`,
          background: checked ? "var(--brand-gold)" : "var(--surface-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-900)" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {label && <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-900)" }}>{label}</span>}
    </label>
  );
}
