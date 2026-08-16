import type { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How SabiLearn collects, uses, and protects your personal data and study activity.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)]">
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
