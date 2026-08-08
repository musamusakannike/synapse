import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-page)]">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--ink-900)] mb-6">Privacy policy</h1>
        <div className="space-y-5 text-[var(--text-muted)] leading-[var(--leading-relaxed)]">
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
