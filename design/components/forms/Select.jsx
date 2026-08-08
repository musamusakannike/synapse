import React from "react";

export function Select({ label, options = [], value, onChange, disabled, placeholder = "Select" }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontFamily: "var(--font-body)", width: "100%" }}>
      {label && <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink-900)" }}>{label}</span>}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          padding: "11px 14px",
          borderRadius: "var(--radius-md)",
          border: "1.5px solid var(--line)",
          background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
          color: "var(--ink-900)",
          outline: "none",
          appearance: "none",
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
    </label>
  );
}
