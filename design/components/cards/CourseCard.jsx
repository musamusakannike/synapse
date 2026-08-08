import React from "react";

export function CourseCard({ image, level = "Beginner", title, instructor, price, free = false, progress, dark = false }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", borderRadius: "var(--radius-2xl)",
      background: dark ? "var(--ink-900)" : "var(--surface-card)",
      overflow: "hidden", boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-body)",
      width: "280px", transition: "box-shadow var(--duration-normal) var(--ease-standard)",
    }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: "var(--surface-sunken)", overflow: "hidden" }}>
        {image && <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <span style={{
          position: "absolute", top: "12px", left: "12px", padding: "4px 12px",
          borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 600,
          background: "rgba(255,255,255,0.9)", color: "var(--ink-900)",
        }}>{level}</span>
      </div>
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <h4 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-md)", fontWeight: 700, color: dark ? "#fff" : "var(--ink-900)" }}>{title}</h4>
        {instructor && <span style={{ fontSize: "var(--text-xs)", color: dark ? "var(--ink-300)" : "var(--text-muted)" }}>{instructor}</span>}
        {typeof progress === "number" ? (
          <div style={{ marginTop: "6px" }}>
            <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: dark ? "rgba(255,255,255,0.15)" : "var(--surface-sunken)" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--brand-gold)", borderRadius: "var(--radius-full)" }} />
            </div>
            <span style={{ fontSize: "var(--text-xs)", color: dark ? "var(--ink-300)" : "var(--text-muted)" }}>{progress}% complete</span>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: dark ? "var(--brand-gold)" : "var(--ink-900)" }}>
              {free ? "Free" : `₦${price?.toLocaleString?.() ?? price}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
