"use client";

import { useState } from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";

const LEVELS = [
  {
    id: "jss",
    label: "Junior secondary",
    title: "Build a rock-solid foundation.",
    body: "Core Maths, English and Basic Science lessons paced for JSS1–JSS3, with quizzes generated straight from your school notes.",
    prompt:
      "UI mockup of a mobile lesson list screen for junior secondary students: subject cards for Maths, English and Basic Science with friendly icons, green and cream color palette, flat modern UI.",
  },
  {
    id: "ss",
    label: "Senior secondary",
    title: "Aim straight at WAEC and JAMB.",
    body: "Full syllabus coverage for SS1–SS3 with past-question quizzes, timed mock exams and topic-by-topic weak-spot tracking.",
    prompt:
      "UI mockup of a mock exam results screen: circular score gauge showing 78%, a breakdown of strong vs weak topics as horizontal bars, green and gold accents, clean modern UI.",
  },
  {
    id: "college",
    label: "College & beyond",
    title: "Keep the momentum going.",
    body: "Bridge courses and programming tracks that carry your study habit from secondary school straight into university and your first tech skills.",
    prompt:
      "UI mockup of a coding course dashboard for a university-age learner: progress ring, next lesson card, and streak counter, green accent color, clean modern flat UI.",
  },
];

export function LevelsSection() {
  const [active, setActive] = useState(LEVELS[0].id);
  const current = LEVELS.find((l) => l.id === active) ?? LEVELS[0];

  return (
    <section className="bg-sunken py-20 md:py-28" data-reveal="fade">
      <div className="container-page flex flex-col items-center gap-10">
        <div className="max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            From JSS1 to college and beyond.
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-ink-secondary">
            One app that grows with you, whatever stage of school you&apos;re
            in.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Learning stages"
          className="flex flex-wrap justify-center gap-2 rounded-pill bg-card p-1.5 shadow-sm"
        >
          {LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              role="tab"
              aria-selected={active === level.id}
              onClick={() => setActive(level.id)}
              className={`rounded-pill px-5 py-2.5 font-body text-sm font-bold transition-colors ${
                active === level.id
                  ? "bg-primary text-white"
                  : "text-ink-secondary hover:bg-sunken"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

        <div className="grid w-full max-w-4xl items-center gap-8 rounded-xl bg-card p-6 shadow-md md:grid-cols-2 md:p-10">
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-2xl font-bold text-ink">
              {current.title}
            </h3>
            <p className="font-body text-base leading-relaxed text-ink-secondary">
              {current.body}
            </p>
          </div>
          <div className="overflow-hidden rounded-lg">
            <ImagePlaceholder
              label={`${current.label} screenshot`}
              prompt={current.prompt}
              tone="brand"
              aspect="aspect-[4/3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
