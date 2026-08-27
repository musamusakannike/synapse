'use client';

import React from 'react';
import Link from 'next/link';

interface NavLink {
  label: string;
  href: string;
}

export default function Navbar({ links = [], active }: { links?: NavLink[]; active?: string }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-card)] px-6 py-4 font-[var(--font-body)] sm:px-8">
      <Link href="/" className="text-lg font-[var(--font-display)] font-bold text-[var(--ink-900)]">
        Sabi<span className="text-[var(--brand-gold)]">Learn</span>
      </Link>
      <nav className="hidden gap-7 md:flex">
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className={`text-sm font-semibold no-underline transition-colors ${l.label === active ? 'text-[var(--brand-gold-600)]' : 'text-[var(--ink-700)] hover:text-[var(--ink-900)]'}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <Link href="/auth/login" className="hidden text-sm font-semibold text-[var(--ink-700)] hover:text-[var(--ink-900)] sm:inline">
          Log in
        </Link>
        <Link
          href="/auth/register"
          className="rounded-[var(--radius-md)] bg-[var(--ink-900)] px-5 py-2.5 text-sm font-[var(--font-display)] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
