import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import FeatureDetailSection from '@/components/landing/FeatureDetailSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';
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

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <ContinueToDashboardPrompt />
      <Navbar links={navLinks} />

      <HeroSection />

      <FeaturesSection />

      <FeatureDetailSection />

      <PricingSection />

      <TestimonialsSection />

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
