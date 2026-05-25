"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Tell us how you learn",
    description: "Set your curriculum level, study style, and goals. Synapse uses this to personalize everything.",
  },
  {
    number: "02",
    title: "Generate your course",
    description: "Enter any topic. The AI builds a custom outline with modules and lessons — no two are alike.",
  },
  {
    number: "03",
    title: "Learn at your pace",
    description: "Each lesson is generated with context from the last, creating a natural flow that builds on itself.",
  },
  {
    number: "04",
    title: "Test your understanding",
    description: "Spin up a quiz on any topic. Review explanations. Track your progress over time.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll(".step-item");
      if (!items) return;

      gsap.fromTo(
        items,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight">
            From question to mastery in minutes
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-base max-w-lg mx-auto">
            A simple flow that delivers complex, personalized education.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="step-item flex items-start gap-6 p-6 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border)] transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--accent-muted)] flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--accent)] font-[family-name:var(--font-display)]">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
