import React from "react";

export function Navbar({ links = [], active, loggedIn = false, onLogin, onEnroll }) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 32px", background: "var(--surface-card)", borderBottom: "1px solid var(--line)",
      fontFamily: "var(--font-body)",
    }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--ink-900)" }}>
        Sabi<span style={{ color: "var(--brand-gold)" }}>Learn</span>
      </div>
      <nav style={{ display: "flex", gap: "28px" }}>
        {links.map((l) => (
          <a key={l.label} href={l.href || "#"} style={{
            fontSize: "var(--text-sm)", fontWeight: 600, textDecoration: "none",
            color: l.label === active ? "var(--brand-gold-600)" : "var(--ink-700)",
          }}>{l.label}</a>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {!loggedIn && <a onClick={onLogin} style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink-700)", cursor: "pointer", textDecoration: "none" }}>Log in</a>}
        <button onClick={onEnroll} style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-sm)",
          background: "var(--ink-900)", color: "#fff", border: "none", padding: "10px 20px",
          borderRadius: "var(--radius-md)", cursor: "pointer",
        }}>Get started</button>
      </div>
    </header>
  );
}
