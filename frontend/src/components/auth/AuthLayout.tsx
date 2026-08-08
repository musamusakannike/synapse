'use client';

import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  panelTitle: string;
  panelSubtitle: string;
}

export default function AuthLayout({ children, panelTitle, panelSubtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--surface-page)] p-4 sm:p-6 lg:p-8">
      <Link
        href="/"
        className="fixed left-4 top-4 sm:left-6 sm:top-6 z-50 flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-card)]/90 px-4 py-2 text-sm font-semibold text-[var(--ink-700)] shadow-[var(--shadow-sm)] hover:text-[var(--ink-900)] transition-colors"
      >
        Sabi<span className="text-[var(--brand-gold)]">Learn</span>
      </Link>

      <div className="relative z-10 flex w-full max-w-[1100px] flex-col items-stretch gap-8 md:flex-row md:gap-12 lg:gap-16">
        <div className="relative hidden min-h-[600px] w-[440px] shrink-0 flex-col justify-end overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--ink-900)] shadow-[var(--shadow-xl)] md:flex lg:w-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/students-stairs.jpg"
            alt="Students studying"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="relative z-20 flex flex-col gap-4 p-9">
            <span className="font-[var(--font-display)] text-2xl font-bold text-white">
              Sabi<span className="text-[var(--brand-gold)]">Learn</span>
            </span>
            <div className="space-y-2">
              <h3 className="font-[var(--font-display)] text-2xl lg:text-3xl font-bold leading-tight text-white">{panelTitle}</h3>
              <p className="text-sm lg:text-base text-slate-200">{panelSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center py-6 md:py-8">{children}</div>
      </div>
    </div>
  );
}
