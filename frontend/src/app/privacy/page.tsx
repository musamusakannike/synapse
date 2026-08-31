import type { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabilearn.online';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How SabiLearn collects, uses, and protects your personal data and study activity.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: 'Privacy Policy — SabiLearn',
    description: 'How SabiLearn collects, uses, and protects your personal data and study activity.',
    url: `${SITE_URL}/privacy`,
    siteName: 'SabiLearn',
    locale: 'en_NG',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SabiLearn Privacy Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — SabiLearn',
    description: 'How SabiLearn collects, uses, and protects your personal data and study activity.',
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
        { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${SITE_URL}/privacy` },
      ],
    },
    {
      '@type': 'WebPage',
      name: 'Privacy Policy — SabiLearn',
      url: `${SITE_URL}/privacy`,
      description: 'How SabiLearn collects, uses, and protects your personal data and study activity.',
    },
  ],
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <h1 className="mb-6 text-3xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">Privacy policy</h1>
        <div className="space-y-5 leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
          <p>SabiLearn collects only the information needed to run your account: your name, email, and study activity (courses, flashcards, quiz results) so we can track your progress.</p>
          <p>We never sell your personal data. Study data may be used in aggregate, anonymized form to improve courses and AI study tools.</p>
          <p>You can request a copy of your data, or delete your account at any time from Settings.</p>
          <p>Payments (where applicable) are processed by a third-party provider — we do not store your card details.</p>
          <p>Questions about this policy can be sent to privacy@sabilearn.example.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
