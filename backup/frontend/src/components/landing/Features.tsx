"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BetaBadge } from "@/components/BetaBadge";
import {
  CourseGenIllustration,
  VideosIllustration,
  QuizzesIllustration,
  AskTutorIllustration,
} from "./FeatureIllustrations";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Instant Course Generation",
    description:
      "Type any topic wey you want. Grab structured, multi-module course built as you like am in seconds.",
    illustration: <CourseGenIllustration />,
  },
  {
    title: "AI Explanatory Videos",
    description:
      "Change any hard topic to visual slideshow with sweet narration — standard way to grab everything sharp.",
    illustration: <VideosIllustration />,
  },
  {
    title: "Targeted Practice Quizzes",
    description:
      "Quizzes wey setup based on exactly what you study — multiple choice, true/false, and fill-in-the-blank to test your level.",
    illustration: <QuizzesIllustration />,
  },
  {
    title: "Ask Anything",
    description:
      "Your personal AI tutor wey ready to answer any question. E go break am down to your level as you want.",
    illustration: <AskTutorIllustration />,
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll(".feature-card");
      if (!cards) return;

      gsap.fromTo(
        cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
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
    <section ref={sectionRef} id="features" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to learn faster
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-base max-w-lg mx-auto">
            Four powerful tools that work together to give you a truly personalized education.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card group relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="w-full mb-6">
                {feature.illustration}
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2 flex items-center gap-2">
                  {feature.title}
                  {feature.title === "AI Explanatory Videos" && <BetaBadge />}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
