"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

type Plan = {
  name: string;
  price: string;
  period?: string;
  tagline: string;
  featured?: boolean;
  features: Array<{ label: string; available: boolean; note?: string }>;
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "₦0",
    period: "",
    tagline: "Get started with core tools",
    features: [
      { label: "AI Study Tutor (daily limit)", available: true, note: "Limited" },
      { label: "Context-Aware Chat history", available: true, note: "Limited" },
      { label: "Smart Notes & Summaries", available: true, note: "Limited" },
      { label: "Quiz Generator", available: false },
      { label: "Upload multi-format documents", available: false },
      { label: "Progress tracking dashboard", available: false },
      { label: "Priority support", available: false },
    ],
    cta: "Start for Free",
  },
  {
    name: "Guru",
    price: "₦5,000",
    period: "/month",
    tagline: "Unlock powerful learning",
    featured: true,
    features: [
      { label: "AI Study Tutor (higher limits)", available: true },
      { label: "Context-Aware Chat with memory", available: true },
      { label: "Smart Notes & flashcards", available: true },
      { label: "Quiz Generator", available: true },
      { label: "Upload PDFs, slides & text", available: true },
      { label: "Progress tracking dashboard", available: true },
      { label: "Priority support", available: true },
    ],
    cta: "Go Guru",
  },
  {
    name: "Scholar",
    price: "₦8,000",
    period: "/month",
    tagline: "For serious learners & teams",
    features: [
      { label: "Everything in Guru", available: true },
      { label: "Highest usage limits", available: true },
      { label: "Advanced quiz analytics", available: true },
      { label: "Collaboration (shared spaces)", available: true },
      { label: "Priority+ support", available: true },
    ],
    cta: "Become a Scholar",
  },
];

const LandingPricing: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pricing-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".pricing-header",
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        ".pricing-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".pricing-cards-container",
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="landing-section py-20 md:py-32"
    >
      <div className="landing-container">
        {/* Header */}
        <div className="pricing-header text-center mb-16" style={{ opacity: 0 }}>
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              color: "var(--l-accent)",
              background: "var(--l-accent-glow)",
              border: "1px solid rgba(66,133,244,0.15)",
            }}
          >
            Pricing
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4"
            style={{ color: "var(--l-text-heading)" }}
          >
            Simple, student-friendly pricing
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "var(--l-muted)" }}
          >
            Student discounts apply automatically for verified academic emails.
          </p>
        </div>

        {/* Cards */}
        <div className="pricing-cards-container grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`pricing-card flex flex-col p-6 md:p-8 rounded-2xl ${
                plan.featured ? "glow-accent" : ""
              }`}
              style={{
                opacity: 0,
                background: plan.featured
                  ? "linear-gradient(135deg, rgba(66,133,244,0.08), rgba(26,32,53,0.9))"
                  : "var(--l-surface)",
                border: plan.featured
                  ? "1px solid rgba(66,133,244,0.25)"
                  : "1px solid var(--l-border)",
              }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 },
              }}
            >
              {/* Plan header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--l-text-heading)" }}
                  >
                    {plan.name}
                  </h3>
                  {plan.featured && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--l-accent)",
                        color: "#fff",
                      }}
                    >
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: "var(--l-muted)" }}>
                  {plan.tagline}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-6">
                <span
                  className="text-4xl font-bold"
                  style={{ color: "var(--l-text-heading)" }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className="text-sm mb-1"
                    style={{ color: "var(--l-muted)" }}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features list */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    {f.available ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        className="mt-0.5 flex-shrink-0"
                      >
                        <circle cx="9" cy="9" r="9" fill="rgba(66,133,244,0.15)" />
                        <path
                          d="M5.5 9.5l2 2 5-5"
                          stroke="#4285F4"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        className="mt-0.5 flex-shrink-0"
                      >
                        <circle cx="9" cy="9" r="9" fill="rgba(255,255,255,0.04)" />
                        <path
                          d="M6.5 6.5l5 5M11.5 6.5l-5 5"
                          stroke="rgba(132,148,178,0.4)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    <span
                      className="text-sm"
                      style={{
                        color: f.available ? "var(--l-text)" : "rgba(132,148,178,0.5)",
                      }}
                    >
                      {f.label}
                      {f.note && (
                        <span
                          className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(66,133,244,0.1)",
                            color: "var(--l-accent-bright)",
                            border: "1px solid rgba(66,133,244,0.15)",
                          }}
                        >
                          {f.note}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  plan.featured
                    ? "landing-btn-primary"
                    : ""
                }`}
                style={
                  plan.featured
                    ? { width: "100%", borderRadius: "12px" }
                    : {
                        background: "transparent",
                        color: "var(--l-accent)",
                        border: "1px solid var(--l-border)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!plan.featured) {
                    e.currentTarget.style.borderColor = "var(--l-border-hover)";
                    e.currentTarget.style.background = "var(--l-bg-elevated)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.featured) {
                    e.currentTarget.style.borderColor = "var(--l-border)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <p
          className="text-center text-xs mt-10"
          style={{ color: "var(--l-muted)" }}
        >
          Prices in Nigerian Naira. Student discounts available for verified academic emails.
        </p>
      </div>
    </section>
  );
};

export default LandingPricing;
