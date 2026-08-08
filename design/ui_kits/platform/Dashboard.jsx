const { Badge, CourseCard, AIToolCard, StatCard, ProgressBar } = window.SabiLearnDesignSystem_2075a4;

const AI_TOOLS = [
  { key: "summarizer", title: "Summarizer", description: "Turn any lecture note or PDF into a short, clear summary.", cta: "Summarize a note" },
  { key: "quiz", title: "Quiz Generator", description: "Generate practice questions from your course material.", cta: "Generate a quiz" },
  { key: "flashcards", title: "Flashcards Generator", description: "Turn key terms into a spaced-repetition flashcard deck.", cta: "Build flashcards" },
  { key: "qa", title: "Q&A AI", description: "Ask a question about your course and get a grounded answer.", cta: "Ask a question" },
];

const ICONS = {
  summarizer: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h1M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>),
  quiz: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>),
  flashcards: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h13a2 2 0 012 2v9a2 2 0 01-2 2H4V6zM4 6L9 3h9"/></svg>),
  qa: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>),
};

function Dashboard({ onOpenTool, onOpenCatalog }) {
  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px 32px 80px", fontFamily: "var(--font-body)" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--ink-900)", margin: "0 0 6px", letterSpacing: "var(--tracking-tight)" }}>Welcome back, Ada.</h1>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "var(--text-base)" }}>You're 62% through Data Analysis this week — keep going.</p>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "44px", flexWrap: "wrap" }}>
        <StatCard value="12" label="Courses enrolled" trend="+2 this month" />
        <StatCard value="86%" label="Quiz average" trend="+4% this month" />
        <StatCard value="9-day" label="Learning streak" />
        <StatCard value="3" label="Certificates earned" />
      </div>

      <div style={{ marginBottom: "44px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "18px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--ink-900)", margin: 0 }}>Continue learning</h2>
          <a onClick={onOpenCatalog} style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--brand-gold-600)", cursor: "pointer", textDecoration: "none" }}>Browse all courses</a>
        </div>
        <div style={{ display: "flex", gap: "18px", overflowX: "auto", paddingBottom: "4px" }}>
          <CourseCard image="../../assets/images/studying-laptop.jpg" level="Beginner" title="Intro to Data Analysis" instructor="Chidi Okafor" progress={62} />
          <CourseCard image="../../assets/images/students-stairs.jpg" level="Intermediate" title="UI/UX Foundations" instructor="Funmi Bello" progress={28} />
          <CourseCard image="../../assets/images/vial-gloved-hand.jpg" level="Beginner" title="Chemistry for WAEC" instructor="Dr. Ibrahim Musa" progress={90} />
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--ink-900)", margin: "0 0 18px" }}>AI study tools</h2>
        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
          {AI_TOOLS.map((t) => (
            <AIToolCard key={t.key} icon={ICONS[t.key]} title={t.title} description={t.description} cta={t.cta} onClick={() => onOpenTool(t)} />
          ))}
        </div>
      </div>
    </div>
  );
}
window.Dashboard = Dashboard;
window.AI_TOOLS = AI_TOOLS;
