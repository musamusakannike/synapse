"use client";

import React from "react";

interface Logo {
  src: string;
  alt: string;
}

const logos: Logo[] = [
  { src: "/marquee_images/asuu.webp", alt: "ASUU" },
  { src: "/marquee_images/paystack.png", alt: "Paystack" },
  { src: "/marquee_images/school_alhikmah.webp", alt: "Al-Hikmah University" },
  { src: "/marquee_images/school_kwasu.webp", alt: "KWASU" },
  { src: "/marquee_images/school_unilorin.webp", alt: "University of Ilorin" },
];

export function Marquee() {
  // Triple the list of logos to guarantee coverage on extremely wide monitors without gaps
  const marqueeLogos = [...logos, ...logos, ...logos];

  return (
    <section 
      id="partners-marquee"
      className="relative w-full py-12 md:py-16 overflow-hidden border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)]/10 backdrop-blur-[2px]"
    >
      <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
        <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)] font-[family-name:var(--font-display)]">
          Trusted by students & partners from
        </h2>
      </div>

      <div className="relative w-full marquee-mask overflow-hidden py-4">
        <div className="animate-marquee flex gap-12 md:gap-20 items-center">
          {marqueeLogos.map((logo, idx) => (
            <div
              key={`${logo.alt}-${idx}`}
              className="flex-shrink-0 flex items-center justify-center min-w-[120px] md:min-w-[160px]"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-8 md:h-10 w-auto object-contain opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 ease-in-out select-none pointer-events-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
