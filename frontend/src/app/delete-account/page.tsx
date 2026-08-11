import type { Metadata } from 'next';
import DeleteAccountClient from './DeleteAccountClient';

export const metadata: Metadata = {
  title: 'Delete Account & Data | SabiLearn',
  description: 'Request account and personal data deletion for your SabiLearn account in compliance with Google Play Store policies and privacy standards.',
  alternates: { canonical: '/delete-account' },
};

export default function DeleteAccountPage() {
  return <DeleteAccountClient />;
}
