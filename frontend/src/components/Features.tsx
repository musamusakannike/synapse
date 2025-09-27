import React from "react";
import Image from "next/image";

const features = [
  {
    title: "AI Study Tutor",
    description:
      "Personalized explanations, examples, and step-by-step guidance for any topic.",
    image: "https://placehold.co/600x400",
  },
  {
    title: "Context-Aware Chat",
    description:
      "Chat with memory that understands your goals and adapts to your learning pace.",
    image: "https://placehold.co/600x400",
  },
  {
    title: "Smart Notes",
    description:
      "Summarize lectures, extract key points, and generate flashcards instantly.",
    image: "https://placehold.co/600x400",
  },
  {
    title: "Quiz Generator",
    description:
      "Auto-generate quizzes from your materials with answers and explanations.",
    image: "https://placehold.co/600x400",
  },
  {
    title: "Multi-Format Docs",
    description:
      "Upload PDFs, slides, or text and get structured insights and outlines.",
    image: "https://placehold.co/600x400",
  },
  {
    title: "Progress Tracking",
    description:
      "Visualize mastery and focus on the next best concept to learn.",
    image: "https://placehold.co/600x400",
  },
  {
    title: "Privacy First",
    description:
      "Your data stays yours with secure storage and transparent controls.",
    image: "https://placehold.co/600x400",
  },
];

const Features: React.FC = () => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-wider text-gray-500">
            Features
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2">
            Everything you need to learn faster
          </h2>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent" />

          <div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {features.map(({ title, description, image }) => (
              <div
                key={title}
                className="min-w-[260px] md:min-w-[330px] lg:min-w-[500px] snap-start bg-gray-100 border border-gray-200 rounded p-5 transition-shadow"
              >
                <h3 className="text-lg lg:text-xl font-semibold text-blue-800">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
                <div>
                  <Image
                    src={image}
                    alt={title}
                    width={600}
                    height={400}
                    className="w-full h-full mt-2 border border-gray-200 rounded-xs"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
