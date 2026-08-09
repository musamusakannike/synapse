import React from 'react';
import Link from 'next/link';

const cols = [
  { title: 'Learn', links: [{ l: 'Courses', href: '/dashboard/courses' }, { l: 'Blog', href: '/blog' }, { l: 'AI tools', href: '/dashboard' }] },
  { title: 'Company', links: [{ l: 'About', href: '/' }, { l: 'Contact', href: '/' }] },
  { title: 'Legal', links: [{ l: 'Terms', href: '/terms' }, { l: 'Privacy', href: '/privacy' }] },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--ink-900)] text-white px-6 sm:px-8 pt-14 pb-8 font-[var(--font-body)]">
      <div className="flex flex-wrap justify-between gap-8 max-w-[var(--container-max)] mx-auto">
        <div>
          <div className="font-[var(--font-display)] font-bold text-lg">
            Sabi<span className="text-[var(--brand-gold)]">Learn</span>
          </div>
          <p className="text-[var(--ink-300)] text-sm mt-2.5 max-w-[220px] leading-[var(--leading-relaxed)]">
            Learn a skill. Sabi it for life.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="flex flex-col gap-2.5">
            <span className="text-sm font-bold text-white">{c.title}</span>
            {c.links.map((l) => (
              <Link key={l.l} href={l.href} className="text-sm text-[var(--ink-300)] no-underline hover:text-white transition-colors">
                {l.l}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 mt-10 pt-5 text-center text-[var(--ink-300)] text-xs">
        &copy; 2026 SabiLearn. Made in Nigeria. Built by{' '}
        <a href="https://www.codiac.online" target="_blank" rel="noopener" className="text-[var(--ink-300)] hover:text-white underline underline-offset-2">
          Codiac
        </a>
        .
      </div>
    </footer>
  );
}
