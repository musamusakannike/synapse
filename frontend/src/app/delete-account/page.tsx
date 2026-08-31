import type { Metadata } from 'next';
import DeleteAccountClient from './DeleteAccountClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabilearn.online';

export const metadata: Metadata = {
  title: 'Delete Account & Personal Data',
  description:
    'Request account and personal data deletion for your SabiLearn account in compliance with Google Play Store policies and privacy standards.',
  alternates: { canonical: `${SITE_URL}/delete-account` },
  openGraph: {
    title: 'Delete Account & Personal Data — SabiLearn',
    description:
      'Request account and personal data deletion for your SabiLearn account in compliance with privacy standards.',
    url: `${SITE_URL}/delete-account`,
    siteName: 'SabiLearn',
    locale: 'en_NG',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SabiLearn Account Deletion' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delete Account & Personal Data — SabiLearn',
    description:
      'Request account and personal data deletion for your SabiLearn account.',
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
        { '@type': 'ListItem', position: 2, name: 'Delete Account', item: `${SITE_URL}/delete-account` },
      ],
    },
    {
      '@type': 'WebPage',
      name: 'Delete Account & Data — SabiLearn',
      url: `${SITE_URL}/delete-account`,
      description:
        'Request account and personal data deletion for your SabiLearn account in compliance with Google Play Store policies.',
    },
  ],
};

export default function DeleteAccountPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DeleteAccountClient />
    </>
  );
}
