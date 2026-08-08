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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[var(--surface-page)]">
      {/* Left Image Side Panel - Full height, flush to left screen edge on desktop */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-[45%] xl:w-[40%] min-h-screen flex-col justify-between overflow-hidden bg-[var(--ink-900)] p-8 lg:p-12 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/students-stairs.jpg"
          alt="Students studying"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

        {/* Top Header - Logo Link (Non-floating) */}
        <div className="relative z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold font-[var(--font-display)] text-white hover:opacity-90 transition-opacity"
          >
            Sabi<span className="text-[var(--brand-gold)]">Learn</span>
          </Link>
        </div>

        {/* Bottom Banner Content */}
        <div className="relative z-20 space-y-2">
          <p className="text-2xl lg:text-3xl font-bold leading-tight text-white">{panelTitle}</p>
          <p className="text-sm lg:text-base text-slate-200">{panelSubtitle}</p>
        </div>
      </div>

      {/* Right Side Content Panel */}
      <div className="flex flex-1 flex-col justify-center items-center p-6 sm:p-10 lg:p-16 min-h-screen">
        <div className="w-full max-w-[440px] flex flex-col justify-center">
          {/* Mobile Logo Link (Non-floating) */}
          <div className="mb-8 md:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold font-[var(--font-display)] text-[var(--ink-900)]"
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

