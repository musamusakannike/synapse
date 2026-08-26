import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  BookOpen,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import ContinueToDashboardPrompt from "@/components/ui/ContinueToDashboardPrompt";

export const metadata: Metadata = {
  title: "SabiLearn — Learn a skill. Sabi it for life.",
  description:
    "Courses, flashcards, practice quizzes, and AI study tools built for Nigerian learners. Start free, track your progress, and sabi a new skill for life.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SabiLearn — Learn a skill. Sabi it for life.",
    description:
      "Courses, flashcards, practice quizzes, and AI study tools built for Nigerian learners.",
    url: "/",
    type: "website",
  },
};

const navLinks = [
  { label: "Courses", href: "/dashboard/courses" },
  { label: "AI tools", href: "#ai-tools" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const steps = [
  {
    title: "Create your account",
    description: "Sign up free in under a minute — no card required.",
  },
  {
    title: "Enroll in a course",
    description:
      "Browse free and paid courses across web dev, design, business and more.",
  },
  {
    title: "Study your way",
    description:
      "Read topics, flip flashcards, take practice quizzes, or lean on AI tools.",
  },
  {
    title: "Track your progress",
    description: "See your streak, accuracy, and what needs more review.",
  },
];

const faqs = [
  {
    q: "Is SabiLearn free?",
    a: "Many courses are free to enroll in. Some advanced courses carry a one-time fee, shown clearly in ₦ before you enroll.",
  },
  {
    q: "What are the AI tools?",
    a: "Summarizer, quiz generator, flashcards generator, and Q&A AI — built to help you study faster, not to replace studying.",
  },
  {
    q: "Can I study on my phone?",
    a: "Yes — SabiLearn works fully in your mobile browser, no app download required.",
  },
  {
    q: "How do I track my progress?",
    a: "Your dashboard shows your study streak, accuracy, and topics that need review.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-page)]">
      <ContinueToDashboardPrompt />
      <Navbar links={navLinks} />

      <section className="relative overflow-hidden min-h-screen">
        <div className="max-w-[var(--container-max)] mx-auto px-6 sm:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-[var(--radius-full)] bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] text-xs font-semibold uppercase tracking-wide mb-5">
              For every Nigerian learner
            </span>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] leading-[var(--leading-tight)] mb-5">
              Learn a skill.{" "}
              <span className="text-[var(--brand-gold)]">Sabi</span> it for
              life.
            </h1>
            <p className="text-lg text-[var(--text-muted)] leading-[var(--leading-relaxed)] mb-8 max-w-lg">
              Courses, flashcards, practice quizzes, and AI study tools — built
              for how you actually learn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/register">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link href="/dashboard/courses">
                <Button size="lg" variant="secondary">
                  Browse courses
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:hidden relative rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-xl)] h-full min-h-[350px]">
            <Image
              src="/images/hero.webp"
              alt="Nigerian students studying together on SabiLearn"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 600px"
              className="object-cover"
            />
          </div>
        </div>
        <div className="hidden lg:block absolute inset-y-0 right-0 w-1/2">
          <Image
            src="/images/hero.webp"
            alt="Nigerian students studying together on SabiLearn"
            fill
            priority
            fetchPriority="high"
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="px-6 sm:px-8 py-16 bg-[var(--surface-card)] border-y border-[var(--line)]">
        <div className="max-w-[var(--container-max)] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { icon: BookOpen, value: "120+", label: "Courses" },
            { icon: Users, value: "15k+", label: "Learners" },
            { icon: Award, value: "92%", label: "Completion rate" },
            { icon: Sparkles, value: "4", label: "AI study tools" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <s.icon className="w-6 h-6 text-[var(--brand-gold-600)]" />
              <span className="font-[var(--font-display)] text-2xl font-bold text-[var(--ink-900)]">
                {s.value}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="ai-tools" className="px-6 sm:px-8 py-20 sm:py-28 bg-[var(--surface-page)]">
        <div className="max-w-[var(--container-max)] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 items-stretch max-w-5xl mx-auto">
            {/* AI Quiz Generation */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-full flex items-center justify-center mb-6 h-48 sm:h-52 relative">
                <Image
                  src="/images/ai-tools/ai-quiz.png"
                  alt="AI Quiz Generation"
                  width={320}
                  height={210}
                  className="object-contain max-h-full w-auto transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-[var(--ink-900)] mb-3 min-h-[3.5rem] flex items-center justify-center leading-snug">
                AI Quiz Generation
              </h3>
              <p className="text-sm sm:text-[15px] text-[var(--ink-500)] leading-relaxed mb-8 flex-1 max-w-[320px]">
                Generate smart quizzes instantly from any topic or document. Customize difficulty, question types, and track your progress.
              </p>
              <Link href="/dashboard/ai/quiz" className="w-full max-w-[280px] mt-auto">
                <button className="w-full py-3.5 px-6 rounded-[var(--radius-md)] bg-[var(--brand-gold)] hover:bg-[var(--brand-gold-600)] text-[var(--ink-900)] font-[var(--font-display)] font-semibold text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer">
                  Generate Quiz
                </button>
              </Link>
            </div>

            {/* AI Flashcards Generation */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-full flex items-center justify-center mb-6 h-48 sm:h-52 relative">
                <Image
                  src="/images/ai-tools/ai-flashcards.png"
                  alt="AI Flashcards Generation"
                  width={320}
                  height={210}
                  className="object-contain max-h-full w-auto transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-[var(--ink-900)] mb-3 min-h-[3.5rem] flex items-center justify-center leading-snug">
                AI Flashcards<br className="hidden sm:inline" /> Generation
              </h3>
              <p className="text-sm sm:text-[15px] text-[var(--ink-500)] leading-relaxed mb-8 flex-1 max-w-[320px]">
                Turn your notes into bite-sized flashcards with AI. Learn faster and remember more with spaced repetition.
              </p>
              <Link href="/auth/register" className="w-full max-w-[280px] mt-auto">
                <button className="w-full py-3.5 px-6 rounded-[var(--radius-md)] bg-[var(--brand-gold)] hover:bg-[var(--brand-gold-600)] text-[var(--ink-900)] font-[var(--font-display)] font-semibold text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer">
                  Generate Flashcards
                </button>
              </Link>
            </div>

            {/* AI Summary & Concept Simplification */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-full flex items-center justify-center mb-6 h-48 sm:h-52 relative">
                <Image
                  src="/images/ai-tools/ai-summary.png"
                  alt="AI Summary & Concept Simplification"
                  width={320}
                  height={210}
                  className="object-contain max-h-full w-auto transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold text-[var(--ink-900)] mb-3 min-h-[3.5rem] flex items-center justify-center leading-snug">
                AI Summary & Concept<br className="hidden sm:inline" /> Simplification
              </h3>
              <p className="text-sm sm:text-[15px] text-[var(--ink-500)] leading-relaxed mb-8 flex-1 max-w-[320px]">
                Get clear, concise summaries and simplified explanations of complex topics. Understand better, learn smarter.
              </p>
              <Link href="/auth/register" className="w-full max-w-[280px] mt-auto">
                <button className="w-full py-3.5 px-6 rounded-[var(--radius-md)] bg-[var(--brand-gold)] hover:bg-[var(--brand-gold-600)] text-[var(--ink-900)] font-[var(--font-display)] font-semibold text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer">
                  Summarize Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-6 sm:px-8 py-20 bg-[var(--surface-card)] border-y border-[var(--line)]"
      >
        <div className="max-w-[var(--container-max)] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-[var(--ink-900)] mb-3">
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col gap-3">
                <span className="w-10 h-10 rounded-full bg-[var(--brand-gold)] text-[var(--ink-900)] font-[var(--font-display)] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="font-[var(--font-display)] font-bold text-[var(--ink-900)]">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-[var(--leading-relaxed)]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 sm:px-8 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[var(--font-display)] text-3xl font-bold text-[var(--ink-900)] mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-lg)] p-5"
              >
                <summary className="font-semibold text-[var(--ink-900)] cursor-pointer list-none flex items-center justify-between">
                  {f.q}
                  <ArrowRight className="w-4 h-4 text-[var(--ink-300)] transition-transform group-open:rotate-90" />
                </summary>
                <p className="text-sm text-[var(--text-muted)] mt-3 leading-[var(--leading-relaxed)]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-20 bg-[var(--ink-900)] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
            Ready to sabi something new?
          </h2>
          <p className="text-slate-300 mb-8">
            Join thousands of learners building real skills on SabiLearn.
          </p>
          <Link href="/auth/register">
            <Button size="lg">Create your free account</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
