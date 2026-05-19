"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

// Lazy-load the 3D sphere for performance
const NeuralSphere = dynamic(
  () => import("@/components/landing/NeuralSphere"),
  { ssr: false, loading: () => <div style={{ minHeight: "320px" }} /> }
);

const LandingHero: React.FC = () => {
  const { openModal } = useAuthModal();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Headline reveal
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
      );

      // Sub text
      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 }
      );

      // CTA
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.8 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="landing-section relative min-h-screen flex items-center"
      style={{ paddingTop: "80px" }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(66,133,244,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="landing-container relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem] font-bold leading-[1.08] mb-6"
              style={{ opacity: 0, color: "var(--l-text-heading)" }}
            >
              The AI tutor that
              <br />
              lives in your{" "}
              <span
                style={{
                  color: "var(--l-accent)",
                  display: "inline-block",
                }}
              >
                mind
              </span>
              .
            </h1>

            <p
              ref={subRef}
              className="text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ opacity: 0, color: "var(--l-muted)", lineHeight: 1.7 }}
            >
              Accelerate your learning with AI that adapts to your thinking.
              No context switching, no cognitive overload — just focused growth.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" style={{ opacity: 0 }}>
              <motion.button
                onClick={openModal}
                className="landing-btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start learning for free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>

              <a
                href="#features"
                className="landing-btn-secondary"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* 3D Sphere */}
          <div className="order-1 lg:order-2 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="w-full max-w-[420px] lg:max-w-[480px] aspect-square"
            >
              <NeuralSphere />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "var(--l-muted)" }}>
          Scroll
        </span>
        <motion.div
          className="w-[1px] h-6"
          style={{ background: "var(--l-border-hover)" }}
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
};

export default LandingHero;
