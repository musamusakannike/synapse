import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-[family-name:var(--font-display)] text-sm font-bold">Synapse</span>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Synapse. Personalized AI learning for everyone.
        </p>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}
