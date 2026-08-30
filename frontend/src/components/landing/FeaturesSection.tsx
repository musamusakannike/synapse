import React from 'react';

interface FeatureItem {
  title: string;
  icon: React.ReactNode;
}

const features: FeatureItem[] = [
  {
    title: 'Interactive Lessons',
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-16 transition-transform duration-300 group-hover:scale-110 sm:size-20"
        aria-hidden="true"
      >
        {/* Under-book back cover in teal */}
        <path
          d="M12 59C12 59 22 54 40 54C58 54 68 59 68 59V25C68 25 58 20 40 20C22 20 12 25 12 25V59Z"
          fill="#22D3EE"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Pages in bright gold/yellow */}
        <path
          d="M16 56C16 56 25 51 40 51C55 51 64 56 64 56V22C64 22 55 17 40 17C25 17 16 22 16 22V56Z"
          fill="#F8BE43"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Open white inner pages */}
        <path
          d="M20 53C20 53 28 49 40 49V16C28 16 20 20 20 20V53Z"
          fill="#FFFFFF"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M60 53C60 53 52 49 40 49V16C52 16 60 20 60 20V53Z"
          fill="#FFFFFF"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Center pencil marker */}
        <path
          d="M37 15L40 7L43 15V34H37V15Z"
          fill="#F8BE43"
          stroke="#0E0E1A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polygon points="40,7 37,15 43,15" fill="#0E0E1A" />
        {/* Sparkle rays on pencil */}
        <path d="M40 2V4" stroke="#F8BE43" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 5L33.5 6.5" stroke="#F8BE43" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 5L46.5 6.5" stroke="#F8BE43" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'AI Study Assistant',
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-16 transition-transform duration-300 group-hover:scale-110 sm:size-20"
        aria-hidden="true"
      >
        {/* Ears / Side audio nodes */}
        <rect x="14" y="36" width="8" height="14" rx="4" fill="#8B5CF6" stroke="#0E0E1A" strokeWidth="3.5" />
        <rect x="58" y="36" width="8" height="14" rx="4" fill="#F8BE43" stroke="#0E0E1A" strokeWidth="3.5" />
        {/* Robot head base */}
        <rect
          x="20"
          y="24"
          width="40"
          height="38"
          rx="12"
          fill="#FFFFFF"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Top antenna with gold orb */}
        <path d="M40 24V16" stroke="#0E0E1A" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="40" cy="13" r="4.5" fill="#F8BE43" stroke="#0E0E1A" strokeWidth="3.5" />
        {/* Face visor / screen area */}
        <rect x="26" y="31" width="28" height="16" rx="6" fill="#8B5CF6" stroke="#0E0E1A" strokeWidth="3" />
        {/* Visor glowing eyes */}
        <circle cx="34" cy="39" r="2.5" fill="#FFFFFF" />
        <circle cx="46" cy="39" r="2.5" fill="#FFFFFF" />
        {/* Mouth grill */}
        <path d="M33 52H47" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
        <path d="M36 49V55" stroke="#0E0E1A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M44 49V55" stroke="#0E0E1A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sparkles around */}
        <path d="M68 20L70 24L74 26L70 28L68 32L66 28L62 26L66 24L68 20Z" fill="#F8BE43" />
        <path d="M12 18L13.5 21L16.5 22.5L13.5 24L12 27L10.5 24L7.5 22.5L10.5 21L12 18Z" fill="#8B5CF6" />
      </svg>
    ),
  },
  {
    title: 'Practice Quizzes',
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-16 transition-transform duration-300 group-hover:scale-110 sm:size-20"
        aria-hidden="true"
      >
        {/* Clipboard shadow / back plate */}
        <rect x="18" y="16" width="44" height="52" rx="7" fill="#22D3EE" stroke="#0E0E1A" strokeWidth="3.5" />
        {/* Main white paper sheet */}
        <rect x="23" y="19" width="38" height="46" rx="5" fill="#FFFFFF" stroke="#0E0E1A" strokeWidth="3.5" />
        {/* Top clamp */}
        <rect x="30" y="12" width="20" height="9" rx="3.5" fill="#F8BE43" stroke="#0E0E1A" strokeWidth="3.5" />
        {/* Checkbox item 1 */}
        <rect x="28" y="27" width="8" height="8" rx="2" fill="#10B981" stroke="#0E0E1A" strokeWidth="2.5" />
        <path
          d="M30 31L32 33L35 29"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M40 31H54" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
        {/* Checkbox item 2 */}
        <rect x="28" y="39" width="8" height="8" rx="2" fill="#10B981" stroke="#0E0E1A" strokeWidth="2.5" />
        <path
          d="M30 43L32 45L35 41"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M40 43H52" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
        {/* Checkbox item 3 */}
        <rect x="28" y="51" width="8" height="8" rx="2" fill="#F8BE43" stroke="#0E0E1A" strokeWidth="2.5" />
        <path d="M40 55H48" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Streaks & XP Rewards',
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-16 transition-transform duration-300 group-hover:scale-110 sm:size-20"
        aria-hidden="true"
      >
        {/* Outer flame */}
        <path
          d="M40 10C40 10 58 24 58 44C58 56.15 49.94 66 40 66C30.06 66 22 56.15 22 44C22 28 34 18 40 10Z"
          fill="#F8BE43"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Inner flame */}
        <path
          d="M40 28C40 28 50 38 50 49C50 56 45.5 61 40 61C34.5 61 30 56 30 49C30 38 37 32 40 28Z"
          fill="#F43F5E"
          stroke="#0E0E1A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Core white highlight */}
        <path
          d="M40 44C40 44 44 48 44 53C44 56.5 42 58.5 40 58.5C38 58.5 36 56.5 36 53C36 48 40 44 40 44Z"
          fill="#FFFFFF"
        />
        {/* Motion sparks on sides */}
        <path d="M15 40C13 36 14 31 16 28" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
        <path d="M65 40C67 36 66 31 64 28" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
        <circle cx="13" cy="24" r="2.5" fill="#F8BE43" />
        <circle cx="67" cy="24" r="2.5" fill="#F8BE43" />
      </svg>
    ),
  },
  {
    title: 'Smart AI Summaries',
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-16 transition-transform duration-300 group-hover:scale-110 sm:size-20"
        aria-hidden="true"
      >
        {/* Document sheet */}
        <path
          d="M22 14H46L58 26V64C58 67.31 55.31 70 52 70H22C18.69 70 16 67.31 16 64V20C16 16.69 18.69 14 22 14Z"
          fill="#FFFFFF"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Folded corner */}
        <path
          d="M46 14V26H58"
          fill="#8B5CF6"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Text summary lines */}
        <path d="M24 34H44" stroke="#0E0E1A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M24 44H48" stroke="#F8BE43" strokeWidth="4" strokeLinecap="round" />
        <path d="M24 54H38" stroke="#0E0E1A" strokeWidth="3.5" strokeLinecap="round" />
        {/* Magic Wand */}
        <path d="M66 38L52 52" stroke="#0E0E1A" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M66 38L62 42" stroke="#8B5CF6" strokeWidth="4.5" strokeLinecap="round" />
        <polygon points="68,34 66,38 70,38" fill="#F8BE43" />
        {/* Sparkles around wand */}
        <path
          d="M68 28L69.5 31L72.5 32.5L69.5 34L68 37L66.5 34L63.5 32.5L66.5 31L68 28Z"
          fill="#F8BE43"
        />
        <circle cx="58" cy="32" r="2" fill="#8B5CF6" />
      </svg>
    ),
  },
  {
    title: 'Hands-on Practice',
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-16 transition-transform duration-300 group-hover:scale-110 sm:size-20"
        aria-hidden="true"
      >
        {/* Terminal container */}
        <rect
          x="14"
          y="18"
          width="52"
          height="46"
          rx="8"
          fill="#0E0E1A"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Top title bar plate */}
        <path
          d="M14 26C14 21.58 17.58 18 22 18H58C62.42 18 66 21.58 66 26V28H14V26Z"
          fill="#22D3EE"
        />
        {/* Window buttons */}
        <circle cx="21" cy="23" r="2" fill="#F43F5E" />
        <circle cx="27" cy="23" r="2" fill="#F8BE43" />
        <circle cx="33" cy="23" r="2" fill="#10B981" />
        {/* Code brackets < / > inside screen */}
        <path
          d="M26 38L20 44L26 50"
          stroke="#22D3EE"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M37 52L43 36" stroke="#F8BE43" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M54 38L60 44L54 50"
          stroke="#22D3EE"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Skill Certificates',
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-16 transition-transform duration-300 group-hover:scale-110 sm:size-20"
        aria-hidden="true"
      >
        {/* Left ribbon tail */}
        <path
          d="M32 46L24 68L34 63L40 68V48"
          fill="#8B5CF6"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Right ribbon tail */}
        <path
          d="M48 46L56 68L46 63L40 68V48"
          fill="#7C3AED"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Medal disc */}
        <circle cx="40" cy="34" r="20" fill="#F8BE43" stroke="#0E0E1A" strokeWidth="3.5" />
        {/* Inner ring */}
        <circle cx="40" cy="34" r="14" fill="#FBDDB0" stroke="#0E0E1A" strokeWidth="2.5" />
        {/* Star in center */}
        <path
          d="M40 24L42.5 29.5L48.5 30.5L44 34.5L45.5 40.5L40 37.5L34.5 40.5L36 34.5L31.5 30.5L37.5 29.5L40 24Z"
          fill="#0E0E1A"
        />
      </svg>
    ),
  },
  {
    title: 'Learn on Any Device',
    icon: (
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-16 transition-transform duration-300 group-hover:scale-110 sm:size-20"
        aria-hidden="true"
      >
        {/* Phone body */}
        <rect
          x="23"
          y="16"
          width="34"
          height="52"
          rx="7"
          fill="#FFFFFF"
          stroke="#0E0E1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Screen header banner */}
        <path
          d="M23 23C23 19.13 26.13 16 30 16H50C53.87 16 57 19.13 57 23V28H23V23Z"
          fill="#22D3EE"
        />
        {/* Top speaker notch */}
        <path d="M37 20H43" stroke="#0E0E1A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Graduation cap on screen */}
        <polygon points="40,34 29,40 40,46 51,40" fill="#0E0E1A" />
        <path
          d="M34 43V49C34 51.5 36.5 53 40 53C43.5 53 46 51.5 46 49V43"
          fill="#F8BE43"
          stroke="#0E0E1A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M51 40V47" stroke="#F8BE43" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="51" cy="48" r="1.5" fill="#F8BE43" />
        {/* Home indicator bar at bottom */}
        <path d="M36 62H44" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
        {/* Wi-Fi / broadcast signal waves above phone */}
        <path d="M16 28C14 34 14 42 16 48" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
        <path d="M64 28C66 34 66 42 64 48" stroke="#0E0E1A" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="border-t border-[var(--line)] bg-white px-6 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Header Title & Subtitle */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-[var(--font-display)] font-bold tracking-tight text-[#0E0E1A] sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
            Everything you need to <br className="hidden sm:inline" />
            sabi any skill for life
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#555568] sm:text-lg">
            SabiLearn gives you interactive lessons, AI study tools, practice quizzes, and real-time progress tracking.
            You&apos;ll have everything you need to build real-world mastery.
          </p>
        </div>

        {/* 4x2 Feature Grid */}
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-y-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col items-center text-center transition-all duration-200"
            >
              <div className="flex size-20 items-center justify-center sm:size-24">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-[var(--font-display)] font-bold text-[#0E0E1A] sm:text-xl">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
