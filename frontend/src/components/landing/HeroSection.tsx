import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-8 pb-16 sm:px-8 lg:pt-14 lg:pb-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Heading & CTA */}
        <div className="flex flex-col items-start lg:col-span-6 xl:col-span-5">
          <h1 className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.03em] text-[#0E0E1A] leading-[1.08] sm:text-5xl lg:text-[62px]">
            Tools to make your learning journey amazing now.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-[#555568] sm:text-lg">
            SabiLearn is a comprehensive learning platform that teaches practical skills, tests your knowledge with interactive quizzes, and accelerates study with AI in a simple click.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2.5 rounded-lg border-2 border-[#0E0E1A] bg-[#F8BE43] px-7 py-3.5 font-[var(--font-display)] text-base font-bold text-[#0E0E1A] shadow-sm transition-all duration-200 hover:bg-[#f2b330] hover:shadow active:translate-y-0.5"
            >
              <span>Start Learning</span>
              <ArrowRight className="size-5 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Graphic */}
        <div className="relative flex items-center justify-center lg:col-span-6 xl:col-span-7">
          <div className="relative w-full max-w-[680px]">
            <Image
              src="/images/hero.webp"
              alt="SabiLearn dashboard with courses, student learning badge and progress tracking"
              width={780}
              height={580}
              priority
              fetchPriority="high"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 680px"
              className="h-auto w-full object-contain drop-shadow-sm select-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
