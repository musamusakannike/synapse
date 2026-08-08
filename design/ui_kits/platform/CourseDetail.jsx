const { Button, Badge, Tabs } = window.SabiLearnDesignSystem_2075a4;

function CourseDetail({ course, onBack }) {
  const [tab, setTab] = React.useState("overview");
  if (!course) return null;
  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <div style={{ position: "relative", height: "320px", background: "var(--ink-900)", overflow: "hidden" }}>
        <img src={course.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 32px", maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <a onClick={onBack} style={{ color: "var(--ink-300)", fontSize: "var(--text-sm)", cursor: "pointer", marginBottom: "16px", textDecoration: "none" }}>&larr; Back to courses</a>
          <Badge tone="gold">{course.level}</Badge>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, color: "#fff", margin: "12px 0 6px", letterSpacing: "var(--tracking-tight)" }}>{course.title}</h1>
          <span style={{ color: "var(--ink-300)", fontSize: "var(--text-base)" }}>Taught by {course.instructor}</span>
        </div>
      </div>

      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "36px 32px 80px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "48px" }}>
        <div>
          <Tabs tabs={[{ label: "Overview", value: "overview" }, { label: "Curriculum", value: "curriculum" }, { label: "Reviews", value: "reviews" }]} active={tab} onChange={setTab} />
          <div style={{ marginTop: "24px", color: "var(--text-body)", fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)" }}>
            {tab === "overview" && <p>Build practical, job-ready skills with hands-on projects, mentor feedback, and AI-assisted study tools built into every lesson.</p>}
            {tab === "curriculum" && (
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "20px" }}>
                <li>Module 1 — Foundations</li>
                <li>Module 2 — Core techniques</li>
                <li>Module 3 — Applied project</li>
                <li>Module 4 — Certification exam</li>
              </ul>
            )}
            {tab === "reviews" && <p>"Clear, practical, and the AI quiz generator kept me on track." — Bola, student</p>}
          </div>
        </div>

        <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-xl)", padding: "24px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "16px", height: "fit-content" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--ink-900)" }}>
            {course.free ? "Free" : `₦${course.price?.toLocaleString()}`}
          </span>
          <Button fullWidth>Enroll now</Button>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Full access · Certificate on completion · AI study tools included</span>
        </div>
      </div>
    </div>
  );
}
window.CourseDetail = CourseDetail;
