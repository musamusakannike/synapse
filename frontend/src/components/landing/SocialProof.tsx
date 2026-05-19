"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SocialProof: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const uniCountRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Fade in the section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
          },
        }
      );

      // Count-up animation for student number
      if (countRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 2000,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = Math.floor(obj.val).toLocaleString() + "+";
            }
          },
        });
      }

      // Count-up for universities
      if (uniCountRef.current) {
        const obj2 = { val: 0 };
        gsap.to(obj2, {
          val: 15,
          duration: 1.5,
          ease: "power2.out",
          delay: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
          onUpdate: () => {
            if (uniCountRef.current) {
              uniCountRef.current.textContent = Math.floor(obj2.val) + "+";
            }
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="landing-section py-16 md:py-20"
      style={{ opacity: 0, borderTop: "1px solid var(--l-border)", borderBottom: "1px solid var(--l-border)" }}
    >
      <div className="landing-container">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
          <div>
            <span
              ref={countRef}
              className="block text-3xl md:text-4xl font-bold mb-1"
              style={{ color: "var(--l-text-heading)" }}
            >
              0+
            </span>
            <span className="text-sm" style={{ color: "var(--l-muted)" }}>
              Students learning
            </span>
          </div>

          {/* Divider */}
          <div
            className="hidden md:block w-[1px] h-12"
            style={{ background: "var(--l-border)" }}
          />

          <div>
            <span
              ref={uniCountRef}
              className="block text-3xl md:text-4xl font-bold mb-1"
              style={{ color: "var(--l-text-heading)" }}
            >
              0+
            </span>
            <span className="text-sm" style={{ color: "var(--l-muted)" }}>
              Nigerian universities
            </span>
          </div>

          {/* Divider */}
          <div
            className="hidden md:block w-[1px] h-12"
            style={{ background: "var(--l-border)" }}
          />

          <div>
            <span
              className="block text-3xl md:text-4xl font-bold mb-1"
              style={{ color: "var(--l-text-heading)" }}
            >
              24/7
            </span>
            <span className="text-sm" style={{ color: "var(--l-muted)" }}>
              AI availability
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
