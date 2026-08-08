import React from "react";

export function Switch({ label, checked, onChange, disabled }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-body)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: "40px",
          height: "24px",
          borderRadius: "var(--radius-full)",
          background: checked ? "var(--brand-violet)" : "var(--line-strong)",
          position: "relative",
          transition: "background var(--duration-fast) var(--ease-standard)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: checked ? "19px" : "3px",
            width: "18px",
            height: "18px",
            borderRadius: "var(--radius-full)",
            background: "#fff",
            transition: "left var(--duration-fast) var(--ease-standard)",
            boxShadow: "var(--shadow-xs)",
          }}
        />
      </span>
      {label && <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-900)" }}>{label}</span>}
    </label>
  );
}
