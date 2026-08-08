function App() {
  const [page, setPage] = React.useState("login");
  const [course, setCourse] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState(null);

  return (
    <div>
      {page === "login" && <window.Login onLogin={() => setPage("dashboard")} />}
      {page !== "login" && (
        <div>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", background: "#fff", borderBottom: "1px solid var(--line)", fontFamily: "var(--font-body)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--ink-900)" }}>Sabi<span style={{ color: "var(--brand-gold)" }}>Learn</span></div>
            <nav style={{ display: "flex", gap: "28px" }}>
              {[["dashboard", "Dashboard"], ["catalog", "Courses"]].map(([key, label]) => (
                <a key={key} onClick={() => setPage(key)} style={{ fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer", textDecoration: "none", color: page === key ? "var(--brand-gold-600)" : "var(--ink-700)" }}>{label}</a>
              ))}
            </nav>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", background: "var(--ink-900)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-sm)" }}>A</div>
          </header>
          {page === "dashboard" && <window.Dashboard onOpenTool={setActiveTool} onOpenCatalog={() => setPage("catalog")} />}
          {page === "catalog" && <window.CourseCatalog onOpenCourse={(c) => { setCourse(c); setPage("course"); }} />}
          {page === "course" && <window.CourseDetail course={course} onBack={() => setPage("catalog")} />}
        </div>
      )}
      <window.AIToolDialog tool={activeTool} onClose={() => setActiveTool(null)} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
