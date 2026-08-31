import type { Metadata } from 'next';
import SwepPracticePageClient from '@/components/swep/SwepPracticePageClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabilearn.online';

export const metadata: Metadata = {
  title: 'SWEP 2026 Interactive Practice & Quiz — University of Ilorin',
  description:
    'Take timed or untimed practice quizzes on SWEP 2026 past questions. Filter by workshop unit, test your engineering knowledge, and view step-by-step explanations on SabiLearn.',
  keywords: [
    'SWEP 2026 practice',
    'SWEP quiz Unilorin',
    'SWEP past questions quiz',
    'workshop practice quiz',
    'Unilorin engineering quiz',
    'SabiLearn SWEP practice',
  ],
  alternates: { canonical: `${SITE_URL}/swep/practice` },
  openGraph: {
    title: 'SWEP 2026 Interactive Practice & Quiz — SabiLearn',
    description:
      'Practice SWEP 2026 past questions with instant answer evaluation and workshop explanations.',
    url: `${SITE_URL}/swep/practice`,
    siteName: 'SabiLearn',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SWEP 2026 Interactive Practice — SabiLearn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SWEP 2026 Interactive Practice & Quiz — SabiLearn',
    description:
      'Take SWEP 2026 past question quizzes with instant explanations and score tracking.',
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
        { '@type': 'ListItem', position: 2, name: 'SWEP 2026', item: `${SITE_URL}/swep` },
        { '@type': 'ListItem', position: 3, name: 'Practice', item: `${SITE_URL}/swep/practice` },
      ],
    },
    {
      '@type': 'Quiz',
      name: 'SWEP 2026 Interactive Workshop Quiz',
      description:
        'Interactive practice quiz covering all SWEP engineering workshop units for University of Ilorin students.',
      isAccessibleForFree: true,
      educationalLevel: 'Undergraduate',
      provider: {
        '@type': 'Organization',
        name: 'SabiLearn',
        url: SITE_URL,
      },
    },
  ],
};

export default function SwepPublicPracticePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SwepPracticePageClient />
    </>
  );
}
