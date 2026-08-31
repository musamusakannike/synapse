import type { Metadata } from 'next';
import SwepPublicPageClient from '@/components/swep/SwepPublicPageClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabilearn.online';

export const metadata: Metadata = {
  title: 'SWEP 2026 Past Questions & Workshop Practice — University of Ilorin',
  description:
    'Practice 300+ SWEP 2026 past questions across all workshop units for University of Ilorin (Unilorin) engineering students. Instant feedback, hints, and explanations on SabiLearn.',
  keywords: [
    'SWEP 2026',
    'SWEP Unilorin',
    'University of Ilorin SWEP',
    'SWEP past questions',
    'engineering workshop practice',
    'Unilorin past questions',
    'SabiLearn SWEP',
    'SWEP quiz practice',
  ],
  alternates: { canonical: `${SITE_URL}/swep` },
  openGraph: {
    title: 'SWEP 2026 Past Questions & Practice — SabiLearn',
    description:
      'Free interactive SWEP past questions and workshop practice hub for University of Ilorin engineering students.',
    url: `${SITE_URL}/swep`,
    siteName: 'SabiLearn',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SWEP 2026 Past Questions — SabiLearn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SWEP 2026 Past Questions & Practice — SabiLearn',
    description:
      'Practice SWEP 2026 past questions with instant feedback and workshop explanations for Unilorin learners.',
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
      ],
    },
    {
      '@type': 'Course',
      name: 'SWEP 2026 Workshop Past Questions & Practice',
      description:
        'Interactive practice tests, workshop past questions, and answer explanations for University of Ilorin SWEP 2026.',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'SabiLearn',
        url: SITE_URL,
      },
      isAccessibleForFree: true,
      educationalLevel: 'Undergraduate',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
      },
    },
    {
      '@type': 'Quiz',
      name: 'SWEP 2026 Practice Questions',
      about: 'Students Work Experience Programme (SWEP) Engineering Workshops',
      educationalLevel: 'Undergraduate',
      provider: {
        '@type': 'Organization',
        name: 'SabiLearn',
      },
    },
  ],
};

export default function SwepPublicPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SwepPublicPageClient />
    </>
  );
}
