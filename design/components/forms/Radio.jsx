import React from "react";

export function Radio({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-body)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      <span
        onClick={() => !disabled && onChange && onChange(true)}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "var(--radius-full)",
          border: `1.5px solid ${checked ? "var(--brand-gold)" : "var(--line-strong)"}`,
          background: "var(--surface-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "var(--brand-gold)" }} />}
      </span>
      {label && <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-900)" }}>{label}</span>}
    </label>
  );
}
