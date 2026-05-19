"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { useAuthModal } from "@/contexts/AuthModalContext";

gsap.registerPlugin(ScrollTrigger);

const LandingCTA: React.FC = () => {
  const { openModal } = useAuthModal();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-content",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-content",
            start: "top 85%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="landing-section py-20 md:py-32"
      style={{ background: "var(--l-bg-elevated)" }}
    >
      <div className="landing-container">
        <div
          className="cta-content relative overflow-hidden rounded-2xl p-10 md:p-16 text-center"
          style={{
            opacity: 0,
            background: "var(--l-bg)",
            border: "1px solid var(--l-border)",
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(66,133,244,0.1) 0%, transparent 70%)",
            }}
          />

          {/* Subtle accent orbs */}
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(66,133,244,0.06) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(66,133,244,0.04) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
              style={{ color: "var(--l-text-heading)" }}
            >
              Ready to learn smarter?
            </h2>
            <p
              className="text-base md:text-lg mb-8 max-w-lg mx-auto"
              style={{ color: "var(--l-muted)" }}
            >
              Join students already using Synapse to study smarter. Start free, upgrade anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={openModal}
                className="landing-btn-primary text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start for Free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.33 8h9.34M8.67 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
              <a
                href="#pricing"
                className="landing-btn-secondary text-base"
              >
                See Pricing
              </a>
            </div>

            <p
              className="mt-6 text-xs"
              style={{ color: "var(--l-muted)" }}
            >
              No credit card required · Cancel anytime · Free tier always available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
