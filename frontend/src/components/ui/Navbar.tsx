'use client';

import React from 'react';
import Link from 'next/link';

interface NavLink {
  label: string;
  href: string;
}

export default function Navbar({ links = [], active }: { links?: NavLink[]; active?: string }) {
  return (
    <header className="flex items-center justify-between px-6 sm:px-8 py-4 bg-[var(--surface-card)] border-b border-[var(--line)] font-[var(--font-body)] sticky top-0 z-40">
      <Link href="/" className="font-[var(--font-display)] font-bold text-lg text-[var(--ink-900)]">
        Sabi<span className="text-[var(--brand-gold)]">Learn</span>
      </Link>
      <nav className="hidden md:flex gap-7">
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
        <Link href="/auth/login" className="hidden sm:inline text-sm font-semibold text-[var(--ink-700)] hover:text-[var(--ink-900)]">
          Log in
        </Link>
        <Link
          href="/auth/register"
          className="font-[var(--font-display)] font-semibold text-sm bg-[var(--ink-900)] text-white px-5 py-2.5 rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
