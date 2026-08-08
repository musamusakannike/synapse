import React from "react";

export function Footer() {
  const cols = [
    { title: "Learn", links: ["Courses", "AI Tools", "Certificates"] },
    { title: "Company", links: ["About", "Careers", "Contact"] },
    { title: "Legal", links: ["Terms", "Privacy"] },
  ];
  return (
    <footer style={{ background: "var(--ink-900)", color: "#fff", padding: "56px 32px 32px", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "32px", maxWidth: "var(--container-max)", margin: "0 auto" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)" }}>
            Sabi<span style={{ color: "var(--brand-gold)" }}>Learn</span>
          </div>
          <p style={{ color: "var(--ink-300)", fontSize: "var(--text-sm)", marginTop: "10px", maxWidth: "220px", lineHeight: "var(--leading-relaxed)" }}>
            Learn a skill. Sabi it for life.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#fff" }}>{c.title}</span>
            {c.links.map((l) => (
              <a key={l} href="#" style={{ fontSize: "var(--text-sm)", color: "var(--ink-300)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "40px", paddingTop: "20px", textAlign: "center", color: "var(--ink-300)", fontSize: "var(--text-xs)" }}>
        &copy; 2026 SabiLearn. Made in Nigeria.
      </div>
    </footer>
  );
}
