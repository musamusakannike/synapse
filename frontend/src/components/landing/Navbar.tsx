"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass py-3" : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bg-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
            Synapse
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            How it works
          </a>
          <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] px-5 py-2.5 rounded-full hover:bg-[var(--accent-hover)] transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
