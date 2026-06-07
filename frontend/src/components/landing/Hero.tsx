"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { BetaBadge } from "@/components/BetaBadge";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        orbRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2 }
      )
        .fromTo(
          headingRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          subRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.3"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background orb glow */}
      <div
        ref={orbRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(232,168,56,0.12) 0%, rgba(232,168,56,0.02) 50%, transparent 70%)",
        }}
      />

      {/* Grid lines bg */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--text-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--text-secondary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
       

        <h1
          ref={headingRef}
          className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] opacity-0"
        >
          Learn anything with
          <br />
          <span className="gradient-text">AI-powered courses</span>
        </h1>

        <p
          ref={subRef}
          className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed opacity-0"
        >
          Type any topic and get a full course, <span className="inline-flex items-center gap-1.5">AI videos <BetaBadge /></span>, and practice quizzes in seconds.
          Upload your documents, ask an AI tutor, and learn at your own pace.
        </p>

        <div ref={ctaRef} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0">
          <Link
            href="/register"
            className="group relative px-8 py-3.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] font-semibold text-sm overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(232,168,56,0.3)]"
          >
            <span className="relative z-10">Start to learn free</span>
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            See how e dey work
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[
            { value: "5min", label: "to sabi your first course" },
            { value: "100%", label: "personal as you like am" },
            { value: "Free", label: "to start" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--text-primary)]">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
