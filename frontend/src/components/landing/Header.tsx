"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "Quiz Generator", href: "#quiz-generator" },
  { label: "Courses", href: "#courses" },
  { label: "Learn to Code", href: "#learn-to-code" },
  { label: "For Schools", href: "#schools" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-card/90 backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center justify-between py-3">
        <a href="#top" className="flex items-center gap-2">
          {/*
            Logo prompt (also see README-assets.md):
            "Minimal geometric logomark for an African edtech brand called
            SabiLearn: a single abstract blob/leaf shape formed from two
            overlapping rounded triangles, forest green (#0E9F6E) with a
            small gold (#E8A015) spark accent, flat vector, on transparent
            background, no text."
          */}
          <span
            className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-card"
            aria-hidden="true"
          >
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor">
              <path d="M16 2c6 3 12 5 12 13S22 30 16 30 4 23 4 15 10 5 16 2Z" opacity="0.9" />
              <circle cx="16" cy="14" r="3.2" fill="var(--gold-400)" />
            </svg>
          </span>
          <span className="font-display text-xl font-extrabold text-primary-active">
            Sabi<span className="text-gold-500">Learn</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-[15px] font-semibold text-ink-secondary no-underline transition-colors hover:text-primary-active"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#login"
            className="rounded-pill px-4 py-2 font-body text-sm font-semibold text-ink-secondary transition-colors hover:bg-sunken"
          >
            Log in
          </a>
          <a
            href="#get-started"
            className="rounded-pill bg-primary px-5 py-2.5 font-body text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Get started free
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="container-page flex flex-col gap-1 border-t border-line/70 pb-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-3 font-body text-sm font-semibold text-ink-secondary no-underline"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex gap-3">
            <a
              href="#login"
              className="flex-1 rounded-pill border border-line px-4 py-2.5 text-center font-body text-sm font-semibold text-ink-secondary"
            >
              Log in
            </a>
            <a
              href="#get-started"
              className="flex-1 rounded-pill bg-primary px-4 py-2.5 text-center font-body text-sm font-bold text-white"
            >
              Get started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
