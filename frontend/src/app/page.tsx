import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, FileQuestion, MessageCircleQuestion, BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import FeatureDetailSection from '@/components/landing/FeatureDetailSection';
import PricingSection from '@/components/landing/PricingSection';
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
  { label: 'Pricing', href: '#pricing' },
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

      <FeatureDetailSection />

      <PricingSection />

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
