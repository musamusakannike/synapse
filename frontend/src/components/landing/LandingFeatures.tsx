"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "AI Study Tutor",
    description:
      "Get personalized explanations, worked examples, and step-by-step guidance on any topic. Synapse adapts to your learning pace and fills the gaps traditional resources miss.",
    image: "/feature1.png",
  },
  {
    title: "Smart Notes & Flashcards",
    description:
      "Summarize lectures, extract key concepts, and auto-generate flashcards for rapid revision. Turn hours of note-taking into seconds of structured insight.",
    image: "/feature3.png",
  },
  {
    title: "Quiz Generator",
    description:
      "Automatically generate quizzes from your materials with detailed answers and explanations. Test yourself before exams and track what you need to revisit.",
    image: "/feature4.png",
  },
  {
    title: "Document Analysis",
    description:
      "Upload PDFs, slides, or text documents and get structured outlines, summaries, and answers to your questions — all powered by context-aware AI.",
    image: "/feature5.png",
  },
];

const LandingFeatures: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Section header reveal
      gsap.fromTo(
        ".features-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".features-header",
            start: "top 85%",
          },
        }
      );

      // Each feature card — staggered
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card, i) => {
        const direction = i % 2 === 0 ? -40 : 40;
        gsap.fromTo(
          card,
          { opacity: 0, x: direction },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="landing-section py-20 md:py-32"
    >
      <div className="landing-container">
        {/* Header */}
        <div className="features-header text-center mb-16 md:mb-20" style={{ opacity: 0 }}>
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              color: "var(--l-accent)",
              background: "var(--l-accent-glow)",
              border: "1px solid rgba(66,133,244,0.15)",
            }}
          >
            Features
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4"
            style={{ color: "var(--l-text-heading)" }}
          >
            Everything you need to
            <br className="hidden md:block" />{" "}
            learn faster
          </h2>
        </div>

        {/* Feature Grid — Alternating 2-col layout */}
        <div className="flex flex-col gap-20 md:gap-28">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="feature-card grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              style={{ opacity: 0 }}
            >
              {/* Text */}
              <div className={`${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <div
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg mb-5 text-sm font-bold"
                  style={{
                    background: "var(--l-accent-glow)",
                    color: "var(--l-accent)",
                    border: "1px solid rgba(66,133,244,0.15)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: "var(--l-text-heading)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-base md:text-lg leading-relaxed"
                  style={{ color: "var(--l-muted)" }}
                >
                  {feature.description}
                </p>
              </div>

              {/* Image */}
              <div className={`${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <div
                  className="glass-card overflow-hidden"
                  style={{
                    padding: "3px",
                  }}
                >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-[13px]"
                    style={{
                      background: "var(--l-bg-elevated)",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
