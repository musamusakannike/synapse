const COLUMNS = [
  {
    title: "Product",
    links: ["Quiz Generator", "Courses", "Learn to Code", "For Schools", "Pricing"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help Center", "WAEC Syllabus", "JAMB Syllabus", "Community"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-card py-14">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-3">
            <span className="font-display text-xl font-extrabold text-primary-active">
              Sabi<span className="text-gold-500">Learn</span>
            </span>
            <p className="max-w-xs font-body text-sm leading-relaxed text-ink-muted">
              Turn your notes into quizzes, follow ready-made courses, and
              learn to code — all in one clean app for Nigerian students.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="font-body text-sm font-bold text-ink">{col.title}</span>
              {col.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="font-body text-sm text-ink-muted no-underline hover:text-primary-active"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-center md:flex-row md:text-left">
          <span className="font-body text-sm text-ink-muted">
            &copy; {new Date().getFullYear()} SabiLearn &middot; sabilearn.online
          </span>
          <span className="font-body text-sm text-ink-muted">
            Made for students across Nigeria
          </span>
        </div>
      </div>
    </footer>
  );
}
