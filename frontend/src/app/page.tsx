import type { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import FeatureDetailSection from '@/components/landing/FeatureDetailSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/ui/Footer';
import ContinueToDashboardPrompt from '@/components/ui/ContinueToDashboardPrompt';
import SwepChrome from '@/components/swep/SwepChrome';

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
  { label: 'SWEP', href: '/swep' },
  { label: 'Courses', href: '/dashboard/courses' },
  { label: 'AI tools', href: '#ai-tools' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <SwepChrome />
      <ContinueToDashboardPrompt />
      <Navbar links={navLinks} />

      <HeroSection />

      <FeaturesSection />

      <FeatureDetailSection />

      <PricingSection />

      <TestimonialsSection />

      <CTASection />

      <Footer />
    </div>
  );
}
