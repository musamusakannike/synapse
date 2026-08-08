import React from "react";

export function Input({ label, placeholder, error, helpText, disabled, type = "text", value, onChange, ...props }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontFamily: "var(--font-body)", width: "100%" }}>
      {label && <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink-900)" }}>{label}</span>}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          padding: "11px 14px",
          borderRadius: "var(--radius-md)",
          border: `1.5px solid ${error ? "var(--danger)" : focused ? "var(--ink-900)" : "var(--line)"}`,
          background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
          color: "var(--ink-900)",
          outline: "none",
          transition: "border var(--duration-fast) var(--ease-standard)",
        }}
        {...props}
      />
      {(error || helpText) && (
        <span style={{ fontSize: "var(--text-xs)", color: error ? "var(--danger)" : "var(--text-muted)" }}>{error || helpText}</span>
      )}
    </label>
  );
}
