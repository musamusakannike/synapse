import React from "react";

export function Tabs({ tabs = [], active, onChange }) {
  const [internal, setInternal] = React.useState(tabs[0]?.value);
  const current = active ?? internal;
  const set = (v) => { setInternal(v); onChange && onChange(v); };
  return (
    <div style={{ display: "flex", gap: "4px", background: "var(--surface-sunken)", padding: "4px", borderRadius: "var(--radius-lg)", fontFamily: "var(--font-body)", width: "fit-content" }}>
      {tabs.map((t) => {
        const isActive = t.value === current;
        return (
          <button
            key={t.value}
            onClick={() => set(t.value)}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: "pointer",
              background: isActive ? "var(--surface-card)" : "transparent",
              color: isActive ? "var(--ink-900)" : "var(--ink-500)",
              boxShadow: isActive ? "var(--shadow-xs)" : "none",
              transition: "all var(--duration-fast) var(--ease-standard)",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
