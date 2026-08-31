import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Compass, BookOpen, Bot, Newspaper, ArrowRight, Home } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Page not found — SabiLearn',
  description: 'The page you were looking for could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};

const helpfulLinks = [
  {
    icon: BookOpen,
    title: 'Browse courses',
    description: 'Explore web dev, design, business and more.',
    href: '/dashboard/courses',
    actionText: 'View courses',
  },
  {
    icon: Bot,
    title: 'AI study tools',
    description: 'Summarize lectures, create quizzes, and practice.',
    href: '/dashboard/ai',
    actionText: 'Open AI tools',
  },
  {
    icon: Newspaper,
    title: 'SabiLearn blog',
    description: 'Guides, study strategies, and tech tutorials.',
    href: '/blog',
    actionText: 'Read articles',
  },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto w-full max-w-[var(--container-max)]">
          {/* Hero 404 Card */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 inline-flex size-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] shadow-[var(--shadow-xs)]">
              <Compass className="size-8 stroke-[1.8]" />
            </div>

            <div className="mb-2 font-[var(--font-display)] text-5xl font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] sm:text-6xl">
              404
            </div>

            <h1 className="mb-3 text-2xl font-[var(--font-display)] font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] sm:text-3xl">
              Page not found
            </h1>

            <p className="mx-auto mb-8 max-w-md text-base leading-[var(--leading-relaxed)] text-[var(--text-muted)] sm:text-lg">
              We couldn't find the page you're looking for. The link might be broken, or the page may have been moved.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/" className="w-full sm:w-auto">
                <Button size="lg" fullWidth className="sm:w-auto">
                  <Home className="size-4 stroke-[2]" />
                  Back to home
                </Button>
              </Link>
              <Link href="/dashboard/courses" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" fullWidth className="sm:w-auto">
                  Browse courses
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Helpful Destinations */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="mb-6 text-center text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Or jump straight to
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {helpfulLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-xs)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:-translate-y-px hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-md)]"
                >
                  <div>
                    <div className="mb-3 inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-sunken)] text-[var(--ink-900)] transition-colors group-hover:bg-[var(--brand-gold-100)] group-hover:text-[var(--brand-gold-600)]">
                      <item.icon className="size-5 stroke-[1.8]" />
                    </div>
                    <h2 className="mb-1 text-base font-[var(--font-display)] font-bold text-[var(--ink-900)]">
                      {item.title}
                    </h2>
                    <p className="text-xs leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--brand-gold-600)] group-hover:text-[var(--ink-900)]">
                    <span>{item.actionText}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
