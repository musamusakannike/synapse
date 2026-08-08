import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-page)]">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-[var(--font-display)] text-3xl font-bold text-[var(--ink-900)] mb-6">Terms of service</h1>
        <div className="space-y-5 text-[var(--text-muted)] leading-[var(--leading-relaxed)]">
          <p>By using SabiLearn you agree to use the platform for personal learning purposes only, and not to redistribute course content without permission.</p>
          <p>Course prices are shown in ₦ and are final at the point of enrollment unless stated otherwise.</p>
          <p>AI study tools (Summarizer, Quiz generator, Flashcards generator, Q&amp;A AI) are study aids — always verify important information against your course material.</p>
          <p>We may suspend accounts that violate these terms, including sharing login credentials or abusive behavior toward other learners.</p>
          <p>These terms may be updated from time to time; continued use of SabiLearn after an update means you accept the revised terms.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
