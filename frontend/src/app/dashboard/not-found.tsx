import React from 'react';
import Link from 'next/link';
import { Compass, BookOpen, LayoutDashboard, Sparkles, Bot } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DashboardNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 inline-flex size-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] shadow-[var(--shadow-xs)]">
        <Compass className="size-7 stroke-[1.8]" />
      </div>

      <div className="mb-1 font-[var(--font-display)] text-4xl font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)]">
        404
      </div>

      <h1 className="mb-2 text-2xl font-[var(--font-display)] font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] sm:text-3xl">
        Item not found
      </h1>

      <p className="mb-8 max-w-md text-sm leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
        The course, lesson, quiz, or resource you were looking for is unavailable or has been removed.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/dashboard/courses">
          <Button size="md">
            <BookOpen className="size-4 stroke-[2]" />
            Browse all courses
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="md" variant="secondary">
            <LayoutDashboard className="size-4 stroke-[2]" />
            Dashboard home
          </Button>
        </Link>
        <Link href="/dashboard/ai">
          <Button size="md" variant="ghost">
            <Bot className="size-4 stroke-[2]" />
            AI tools
          </Button>
        </Link>
      </div>
    </div>
  );
}
