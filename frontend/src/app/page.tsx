import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, FileQuestion, MessageCircleQuestion, BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';
import AIToolCard from '@/components/ui/AIToolCard';
import ContinueToDashboardPrompt from '@/components/ui/ContinueToDashboardPrompt';

export const metadata: Metadata = {
  title: 'SabiLearn — Learn a skill. Sabi it for life.',
  description: 'Courses, interactive exercises, practice quizzes, and AI study tools built for Nigerian learners. Start free, track your progress, and sabi a new skill for life.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SabiLearn — Learn a skill. Sabi it for life.',
    description: 'Courses, interactive exercises, practice quizzes, and AI study tools built for Nigerian learners.',
    url: '/',
    type: 'website',
  },
};

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Courses', href: '/dashboard/courses' },
  { label: 'AI tools', href: '#ai-tools' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '#faq' },
];

const steps = [
  { title: 'Create your account', description: 'Sign up free in under a minute — no card required.' },
  { title: 'Enroll in a course', description: 'Browse free and paid courses across web dev, design, business and more.' },
  { title: 'Study your way', description: 'Read topics, take interactive exercises, pass quizzes, or lean on AI tools.' },
  { title: 'Track your progress', description: 'See your streak, earned XP leaderboard, and course resumption cards.' },
];

const faqs = [
  { q: 'Is SabiLearn free?', a: 'Many courses are free to enroll in. Some advanced courses carry a one-time fee, shown clearly in ₦ before you enroll.' },
  { q: 'What are the AI tools?', a: 'Summarizer, quiz generator, and Q&A AI — built to help you study faster, not to replace studying.' },
  { q: 'Can I study on my phone?', a: 'Yes — SabiLearn works fully in your mobile browser, no app download required.' },
  { q: 'How do I track my progress?', a: 'Your dashboard shows your study streak, XP leaderboard, and course progress.' },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <ContinueToDashboardPrompt />
      <Navbar links={navLinks} />

      <HeroSection />

      <FeaturesSection />

      <section className="border-y border-[var(--line)] bg-[var(--surface-card)] px-6 py-16 sm:px-8">
        <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { icon: BookOpen, value: '120+', label: 'Courses' },
            { icon: Users, value: '15k+', label: 'Learners' },
            { icon: Award, value: '92%', label: 'Completion rate' },
            { icon: Sparkles, value: '3', label: 'AI study tools' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <s.icon className="size-6 text-[var(--brand-gold-600)]" />
              <span className="text-2xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">{s.value}</span>
              <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="ai-tools" className="px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="mb-3 text-3xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">Study smarter with AI</h2>
            <p className="text-[var(--text-muted)]">Task-first AI tools that fit into your study flow — not a replacement for it.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <AIToolCard icon={<Sparkles className="size-5" />} title="Summarizer" description="Turn any lecture note into a short summary." cta="Learn more" />
            <AIToolCard icon={<FileQuestion className="size-5" />} title="Quiz generator" description="Build a quick multiple-choice quiz from a topic." cta="Learn more" />
            <AIToolCard icon={<MessageCircleQuestion className="size-5" />} title="Q&A AI" description="Ask a study question, get a plain-English answer." cta="Learn more" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[var(--line)] bg-[var(--surface-card)] px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="mb-3 text-3xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">How it works</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-gold)] font-[var(--font-display)] font-bold text-[var(--ink-900)]">{i + 1}</span>
                <h3 className="font-[var(--font-display)] font-bold text-[var(--ink-900)]">{s.title}</h3>
                <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--text-muted)]">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-card)] p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-[var(--ink-900)]">
                  {f.q}
                  <ArrowRight className="size-4 text-[var(--ink-300)] transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-[var(--leading-relaxed)] text-[var(--text-muted)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--ink-900)] px-6 py-20 text-center text-white sm:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-[var(--font-display)] font-bold sm:text-4xl">Ready to sabi something new?</h2>
          <p className="mb-8 text-slate-300">Join thousands of learners building real skills on SabiLearn.</p>
          <Link href="/auth/register"><Button size="lg">Create your free account</Button></Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
