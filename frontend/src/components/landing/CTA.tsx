"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade and slide in content when it scrolls into view
      gsap.fromTo(
        textRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        illustrationRef.current,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6 relative overflow-hidden">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-[var(--accent)] opacity-[0.03] blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.05] blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-8 md:p-16 relative overflow-hidden">
        {/* Subtle grid pattern overlay for premium feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Text Content */}
          <div ref={textRef} className="lg:col-span-7 text-left space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-subtle)]">
              Make we start
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              You ready to levels up how you dey learn?
            </h2>
            <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Unlock standard education wey set structure around your target. Make you generate custom courses, watch visual explanations, and solve interactive practice tests sharp-sharp.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent)]/10 text-sm md:text-base"
              >
                Get Started for Free
              </Link>
              <Link
                href="#pricing"
                className="px-6 py-3.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-sm md:text-base"
              >
                View Plans
              </Link>
            </div>
          </div>

          {/* Premium Illustration */}
          <div ref={illustrationRef} className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[340px] md:max-w-[400px] aspect-square rounded-2xl bg-[var(--bg-primary)]/40 border border-[var(--border-subtle)] p-6 flex items-center justify-center relative group hover:border-[var(--accent-subtle)] transition-colors duration-500 overflow-hidden animate-float">
              {/* Radial gradient hover glow */}
              <div className="absolute inset-0 bg-radial from-[var(--accent-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <svg
                className="w-full h-full relative z-10"
                viewBox="0 0 300 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background grid dots */}
                <circle cx="50" cy="50" r="1" fill="var(--text-muted)" className="opacity-20" />
                <circle cx="150" cy="50" r="1" fill="var(--text-muted)" className="opacity-20" />
                <circle cx="250" cy="50" r="1" fill="var(--text-muted)" className="opacity-20" />
                <circle cx="50" cy="150" r="1" fill="var(--text-muted)" className="opacity-20" />
                <circle cx="250" cy="150" r="1" fill="var(--text-muted)" className="opacity-20" />
                <circle cx="50" cy="250" r="1" fill="var(--text-muted)" className="opacity-20" />
                <circle cx="150" cy="250" r="1" fill="var(--text-muted)" className="opacity-20" />
                <circle cx="250" cy="250" r="1" fill="var(--text-muted)" className="opacity-20" />

                {/* Branching secondary connections */}
                <path
                  d="M 60 210 C 60 150, 110 110, 150 150"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="opacity-40"
                />
                <path
                  d="M 150 150 C 180 120, 200 80, 240 90"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="opacity-40"
                />

                {/* Central Winding Pathway (mimics the Synapse logo style but longer/larger) */}
                <path
                  d="M 60 210 C 60 120, 240 180, 240 90"
                  stroke="var(--accent)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(232,168,56,0.3)]"
                />

                {/* Sub-branches for custom learning goals */}
                <path
                  d="M 150 150 C 130 150, 100 130, 90 90"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="opacity-30"
                />
                
                {/* Winding path node points */}
                {/* Start node */}
                <circle cx="60" cy="210" r="8" fill="var(--accent)" />
                <circle cx="60" cy="210" r="14" stroke="var(--accent)" strokeWidth="1" className="opacity-25 animate-ping" />
                
                {/* Mid path node */}
                <circle cx="150" cy="150" r="7" fill="var(--accent)" />
                <circle cx="150" cy="150" r="11" stroke="var(--accent)" strokeWidth="1" className="opacity-20" />

                {/* Secondary branch nodes */}
                <circle cx="90" cy="90" r="4.5" fill="var(--text-secondary)" />
                
                {/* End node (Mastery Star / Glowing node) */}
                <circle cx="240" cy="90" r="9" fill="var(--accent)" />
                <circle cx="240" cy="90" r="18" stroke="var(--accent)" strokeWidth="1" className="opacity-30" />
                <circle cx="240" cy="90" r="26" stroke="var(--accent)" strokeWidth="0.5" className="opacity-10" />

                {/* Star visual inside/around end node */}
                <path
                  d="M 240 82 L 242 88 L 248 90 L 242 92 L 240 98 L 238 92 L 232 90 L 238 88 Z"
                  fill="var(--bg-primary)"
                  className="scale-[0.8] origin-[240px_90px]"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
