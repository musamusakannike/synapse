'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, CreditCard, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Course } from '@/lib/types';
import { formatKobo } from '@/lib/money';

const SUBSCRIPTION_PRICE_KOBO = Number(
  process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_KOBO || 300000
);

interface CoursePaywallBannerProps {
  course: Course;
  onOpenPaywall: () => void;
}

export default function CoursePaywallBanner({
  course,
  onOpenPaywall,
}: CoursePaywallBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-900/5 p-6 shadow-lg md:p-8">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600">
              <Lock className="size-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Premium Content
            </span>
          </div>

          <h2 className="text-xl font-[var(--font-display)] font-extrabold text-[var(--ink-900)] md:text-2xl">
            Unlock Full Access to {course.title}
          </h2>

          <p className="text-sm leading-relaxed text-[var(--ink-800)]">
            Get lifetime access to this course for{' '}
            <strong className="text-[var(--ink-900)]">{formatKobo(course.price)}</strong>, or get unlimited access to
            every course on SabiLearn with an All-Access subscription for{' '}
            <strong className="text-[var(--ink-900)]">{formatKobo(SUBSCRIPTION_PRICE_KOBO)}/month</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-[var(--ink-700)]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-1.5 rounded-full bg-amber-500" />
              All Lessons & Quizzes
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Interactive MCQs & Flashcards
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Capstone Assessments
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
          <button
            onClick={onOpenPaywall}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--brand-gold)] px-6 py-3.5 text-sm font-bold text-slate-950 shadow-md transition-all hover:brightness-105"
          >
            <CreditCard className="size-4" />
            <span>Unlock for {formatKobo(course.price)}</span>
          </button>

          <Link
            href="/dashboard/subscribe"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] px-5 py-3 text-xs font-bold text-[var(--ink-900)] transition-colors hover:bg-[var(--surface-sunken)]"
          >
            <Sparkles className="size-3.5 text-amber-600" />
            <span>All-Access ({formatKobo(SUBSCRIPTION_PRICE_KOBO)}/mo)</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
