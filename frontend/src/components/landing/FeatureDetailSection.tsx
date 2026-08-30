import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export default function FeatureDetailSection() {
  return (
    <section className="overflow-hidden bg-[var(--surface-page)] px-6 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-24 lg:gap-32">
        {/* Feature Detail 1: AI Study Workspace */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Image Graphic */}
          <div className="flex justify-center lg:col-span-6">
            <div className="relative w-full max-w-[540px]">
              <Image
                src="/images/feature-detail1.png"
                alt="SabiLearn AI study workspace interface with AI assistant and practice tools"
                width={540}
                height={400}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px"
                className="h-auto w-full object-contain drop-shadow-sm transition-transform duration-300 select-none hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="flex flex-col items-start lg:col-span-6">
            <h2 className="text-3xl font-[var(--font-display)] font-bold tracking-tight text-[#0E0E1A] sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
              Get a simple interface to help concentrate more on your study
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#555568] sm:text-lg">
              SabiLearn is an all-in-one learning workspace like nothing you&apos;ve seen before. Automate notes,
              generate instant practice questions, and get simple tools to focus on mastering new skills.
            </p>

            <ul className="mt-8 flex flex-col gap-3.5">
              <li className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F8BE43]/20">
                  <Check className="size-4 stroke-[3] text-[#0E0E1A]" />
                </div>
                <span className="font-medium text-[#0E0E1A]">Instant AI answers for complex study questions</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F8BE43]/20">
                  <Check className="size-4 stroke-[3] text-[#0E0E1A]" />
                </div>
                <span className="font-medium text-[#0E0E1A]">One-click topic summaries and revision cards</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F8BE43]/20">
                  <Check className="size-4 stroke-[3] text-[#0E0E1A]" />
                </div>
                <span className="font-medium text-[#0E0E1A]">Distraction-free flow built for daily consistency</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Detail 2: Course Modules & Practice */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Text Content (Order 2 on mobile, Order 1 on Desktop) */}
          <div className="order-2 flex flex-col items-start lg:order-1 lg:col-span-6">
            <h2 className="text-3xl font-[var(--font-display)] font-bold tracking-tight text-[#0E0E1A] sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
              Structured course modules with hands-on practice
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#555568] sm:text-lg">
              SabiLearn gives you the power to learn step-by-step with practical video lessons, reading notes, and
              interactive exercises designed for deep retention.
            </p>

            <ul className="mt-8 flex flex-col gap-3.5">
              <li className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#22D3EE]/20">
                  <Check className="size-4 stroke-[3] text-[#0E0E1A]" />
                </div>
                <span className="font-medium text-[#0E0E1A]">No complicated setup — start learning in seconds</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#22D3EE]/20">
                  <Check className="size-4 stroke-[3] text-[#0E0E1A]" />
                </div>
                <span className="font-medium text-[#0E0E1A]">Bite-sized topics with built-in checkpoint quizzes</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#22D3EE]/20">
                  <Check className="size-4 stroke-[3] text-[#0E0E1A]" />
                </div>
                <span className="font-medium text-[#0E0E1A]">Crystal clear lessons optimized for any screen</span>
              </li>
            </ul>
          </div>

          {/* Right: Image Graphic (Order 1 on mobile, Order 2 on Desktop) */}
          <div className="order-1 flex justify-center lg:order-2 lg:col-span-6">
            <div className="relative w-full max-w-[540px]">
              <Image
                src="/images/feature-detail2.png"
                alt="SabiLearn course modules and interactive learning materials"
                width={540}
                height={400}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px"
                className="h-auto w-full object-contain drop-shadow-sm transition-transform duration-300 select-none hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
