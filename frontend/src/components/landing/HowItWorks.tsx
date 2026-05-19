"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Upload your materials",
    description:
      "Drop in PDFs, lecture slides, or text documents. Synapse reads and understands your content instantly.",
  },
  {
    number: "02",
    title: "Ask anything",
    description:
      "Chat naturally with your AI tutor. Ask questions, request summaries, or generate quizzes — all from one interface.",
  },
  {
    number: "03",
    title: "Learn and retain",
    description:
      "Get personalized explanations, flashcards, and quizzes that adapt to your pace. Revisit weak areas and track your progress.",
  },
];

const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header
      gsap.fromTo(
        ".hiw-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hiw-header",
            start: "top 85%",
          },
        }
      );

      // Steps — staggered
      gsap.fromTo(
        ".hiw-step",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".hiw-steps-container",
            start: "top 80%",
          },
        }
      );

      // Connecting line animation
      gsap.fromTo(
        ".hiw-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: ".hiw-steps-container",
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="landing-section py-20 md:py-32"
      style={{
        background: "var(--l-bg-elevated)",
      }}
    >
      <div className="landing-container">
        {/* Header */}
        <div className="hiw-header text-center mb-16 md:mb-20" style={{ opacity: 0 }}>
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              color: "var(--l-accent)",
              background: "var(--l-accent-glow)",
              border: "1px solid rgba(66,133,244,0.15)",
            }}
          >
            How it works
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4"
            style={{ color: "var(--l-text-heading)" }}
          >
            Three steps to
            <br className="hidden md:block" />{" "}
            smarter learning
          </h2>
        </div>

        {/* Steps */}
        <div className="hiw-steps-container relative">
          {/* Connecting line (desktop only) */}
          <div
            className="hiw-line hidden lg:block absolute top-[48px] left-[16.6%] right-[16.6%] h-[1px]"
            style={{
              background: "linear-gradient(90deg, var(--l-accent), var(--l-border-hover), var(--l-accent))",
              transformOrigin: "left",
              opacity: 0.3,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="hiw-step text-center"
                style={{ opacity: 0 }}
              >
                {/* Number circle */}
                <div className="flex justify-center mb-6">
                  <div
                    className="relative w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--l-bg)",
                      border: "1px solid var(--l-border)",
                    }}
                  >
                    {/* Glow ring */}
                    <div
                      className="absolute inset-[-1px] rounded-full"
                      style={{
                        background: `linear-gradient(135deg, rgba(66,133,244,0.2), transparent, rgba(66,133,244,0.1))`,
                        borderRadius: "50%",
                        zIndex: 0,
                      }}
                    />
                    <span
                      className="relative z-10 text-2xl font-bold"
                      style={{ color: "var(--l-accent)" }}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                <h3
                  className="text-xl md:text-2xl font-bold mb-3"
                  style={{ color: "var(--l-text-heading)" }}
                >
                  {step.title}
                </h3>

                <p
                  className="text-sm md:text-base leading-relaxed max-w-xs mx-auto"
                  style={{ color: "var(--l-muted)" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
