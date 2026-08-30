import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#F8BE43] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
      {/* Decorative Blue Scalloped Element in Top Right */}
      <div className="pointer-events-none absolute -top-12 -right-12 z-0 w-[260px] select-none sm:-top-16 sm:-right-16 sm:w-[380px] md:w-[480px] lg:-top-20 lg:-right-20 lg:w-[580px]">
        <Image
          src="/images/element.png"
          alt=""
          width={580}
          height={480}
          className="h-auto w-full object-contain"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-2xl">
          {/* Main Heading */}
          <h2 className="text-3xl font-[var(--font-display)] font-bold tracking-tight text-[#0E0E1A] sm:text-4xl lg:text-[46px] lg:leading-[1.12]">
            Start learning today and <br className="hidden sm:inline" />
            sabi any skill for life.
          </h2>

          {/* Subtitle / Description */}
          <p className="mt-5 max-w-lg text-base leading-relaxed font-medium text-[#35354A] sm:text-lg">
            Trusted by thousands of learners across Nigeria. SabiLearn is the easiest way to master practical skills,
            pass interactive quizzes, and study faster with AI.
          </p>

          {/* Action CTA */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2.5 rounded-lg border-2 border-[#0E0E1A] bg-[#0E0E1A] px-7 py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-[#202030] hover:shadow-lg active:translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="size-5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
