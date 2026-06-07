"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BetaBadge } from "@/components/BetaBadge";

gsap.registerPlugin(ScrollTrigger);

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll(".pricing-card");
      if (!cards) return;

      gsap.fromTo(
        cards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-base max-w-lg mx-auto">
            Start free. Upgrade when you&apos;re ready for unlimited access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free tier */}
          <div className="pricing-card p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
              Free
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold font-[family-name:var(--font-display)]">₦0</span>
              <span className="text-sm text-[var(--text-muted)]">/forever</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "10 AI generations per day",
                "Course creation",
                "Practice quizzes",
                "AI tutor questions",
                "Basic learning profiles",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full text-center py-3 rounded-full border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            >
              Get started
            </Link>
          </div>

          {/* Premium tier */}
          <div className="pricing-card relative p-8 rounded-2xl border border-[var(--accent)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-bold rounded-bl-lg">
              POPULAR
            </div>
            <div className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide mb-2">
              Premium
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold font-[family-name:var(--font-display)]">₦1,500</span>
              <span className="text-lg text-[var(--text-muted)] line-through">₦2,500</span>
              <span className="text-sm text-[var(--text-muted)]">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited AI generations",
                { text: "AI Explanatory Videos", beta: true },
                "Priority AI processing",
                "Advanced learning analytics",
                "All Free features included",
              ].map((item) => {
                const text = typeof item === "string" ? item : item.text;
                const isBeta = typeof item === "object" && item.beta;
                return (
                  <li key={text} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="flex items-center gap-2">
                      {text}
                      {isBeta && <BetaBadge />}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/register"
              className="block w-full text-center py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
