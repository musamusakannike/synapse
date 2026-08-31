import type { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabilearn.online';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms and conditions for using SabiLearn — courses, AI study tools, pricing, and account rules.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: 'Terms of Service — SabiLearn',
    description:
      'The terms and conditions for using SabiLearn — courses, AI study tools, pricing, and account rules.',
    url: `${SITE_URL}/terms`,
    siteName: 'SabiLearn',
    locale: 'en_NG',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SabiLearn Terms of Service' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service — SabiLearn',
    description:
      'The terms and conditions for using SabiLearn — courses, AI study tools, pricing, and account rules.',
    images: ['/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${SITE_URL}/terms` },
      ],
    },
    {
      '@type': 'WebPage',
      name: 'Terms of Service — SabiLearn',
      url: `${SITE_URL}/terms`,
      description:
        'The terms and conditions for using SabiLearn — courses, AI study tools, pricing, and account rules.',
    },
  ],
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="mb-6 text-3xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">
          Terms of service
        </h1>
        <div className="space-y-5 leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
          <p>
            By using SabiLearn you agree to use the platform for personal learning purposes only, and
            not to redistribute course content without permission.
          </p>
          <p>
            Course prices are shown in ₦ and are final at the point of enrollment unless stated
            otherwise.
          </p>
          <p>
            AI study tools (Summarizer, Quiz generator, Flashcards generator, Q&amp;A AI) are study
            aids — always verify important information against your course material.
          </p>
          <p>
            We may suspend accounts that violate these terms, including sharing login credentials or
            abusive behavior toward other learners.
          </p>
          <p>
            These terms may be updated from time to time; continued use of SabiLearn after an update
            means you accept the revised terms.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
