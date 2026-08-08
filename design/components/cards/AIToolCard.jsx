import React from "react";

export function AIToolCard({ icon, title, description, cta = "Try it", onClick }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "16px", padding: "24px",
      borderRadius: "var(--radius-2xl)", background: "var(--brand-violet)", color: "#fff",
      fontFamily: "var(--font-body)", width: "260px", boxShadow: "var(--shadow-md)",
    }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h4 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-md)", fontWeight: 700 }}>{title}</h4>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--brand-violet-100)", lineHeight: "var(--leading-relaxed)" }}>{description}</p>
      </div>
      <button onClick={onClick} style={{
        marginTop: "auto", background: "#fff", color: "var(--brand-violet-600)", border: "none",
        padding: "10px 18px", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)",
        fontWeight: 600, fontSize: "var(--text-sm)", cursor: "pointer", alignSelf: "flex-start",
      }}>{cta}</button>
    </div>
  );
}
