import React from 'react';

interface Testimonial {
  quote: string;
  rating: string;
  reviewsCount: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      '“Using SabiLearn was one of the best decisions I made when starting my learning journey. The interactive exercises and AI tutor made complex topics so easy to understand!”',
    rating: 'Rated 4.9/5',
    reviewsCount: 'from over 300 reviews',
  },
  {
    quote:
      '“It is a pure joy to study on SabiLearn. The bite-sized lessons, quiz checkpoints, and daily streaks keep me motivated every single day without feeling overwhelmed.”',
    rating: 'Rated 5.0/5',
    reviewsCount: 'from over 250 reviews',
  },
  {
    quote:
      '“The AI summary and quiz tools saved me countless hours of study time. Having practical hands-on exercises directly in my browser is an absolute game changer.”',
    rating: 'Rated 4.9/5',
    reviewsCount: 'from over 200 reviews',
  },
];

function StarRating() {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-label="5 out of 5 stars">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="size-6 fill-[#10B981] text-[#10B981]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-t border-[var(--line)] bg-[var(--surface-page)] px-6 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        {/* Centered Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-[var(--font-display)] font-bold tracking-tight text-[#0E0E1A] sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
            Learners who use <br />
            SabiLearn leave positive <br />
            comments
          </h2>
        </div>

        {/* 3-Column Testimonial Grid */}
        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
          {testimonials.map((t, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <StarRating />

              <blockquote className="mt-6 flex-1 text-base leading-relaxed text-[#1E293B] sm:text-lg">
                {t.quote}
              </blockquote>

              <p className="mt-6 text-sm text-[#555568]">
                <strong className="font-bold text-[#0E0E1A]">{t.rating}</strong> - {t.reviewsCount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
