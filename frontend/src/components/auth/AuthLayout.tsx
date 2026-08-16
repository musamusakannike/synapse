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
    <div className="flex min-h-screen w-full flex-col bg-[var(--surface-page)] md:flex-row">
      {/* Left Image Side Panel - Full height, flush to left screen edge on desktop */}
      <div className="relative hidden min-h-screen shrink-0 flex-col justify-between overflow-hidden bg-[var(--ink-900)] p-8 md:flex md:w-1/2 lg:w-[45%] lg:p-12 xl:w-[40%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/students-stairs.jpg"
          alt="Students studying"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

        {/* Top Header - Logo Link (Non-floating) */}
        <div className="relative z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-[var(--font-display)] font-bold text-white transition-opacity hover:opacity-90"
          >
            Sabi<span className="text-[var(--brand-gold)]">Learn</span>
          </Link>
        </div>

        {/* Bottom Banner Content */}
        <div className="relative z-20 space-y-2">
          <p className="text-2xl leading-tight font-bold text-white lg:text-3xl">{panelTitle}</p>
          <p className="text-sm text-slate-200 lg:text-base">{panelSubtitle}</p>
        </div>
      </div>

      {/* Right Side Content Panel */}
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="flex w-full max-w-[440px] flex-col justify-center">
          {/* Mobile Logo Link (Non-floating) */}
          <div className="mb-8 md:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-[var(--font-display)] font-bold text-[var(--ink-900)]"
            >
              Sabi<span className="text-[var(--brand-gold)]">Learn</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

