import { StarIcon } from "./Icons";

const TESTIMONIALS = [
  {
    name: "Amara O.",
    role: "SS3 student, Lagos",
    quote:
      "I uploaded my Chemistry notes the night before a test and the quiz Naija made was almost exactly what came out. I actually passed this time.",
    prompt:
      "Friendly headshot photo of a smiling Nigerian teenage girl in a school uniform, neutral studio background, natural light, square aspect ratio.",
  },
  {
    name: "Mr. Bassey",
    role: "Parent, Uyo",
    quote:
      "My son used to avoid revising until the last minute. Now he opens SabiLearn on his own because of the streaks — and his grades show it.",
    prompt:
      "Friendly headshot photo of a middle-aged Nigerian father smiling, casual shirt, neutral studio background, natural light, square aspect ratio.",
  },
  {
    name: "Chiamaka U.",
    role: "JAMB candidate, Enugu",
    quote:
      "The mock exams felt exactly like the real JAMB CBT. I knew what to expect and where I was weak weeks before the actual exam.",
    prompt:
      "Friendly headshot photo of a smiling Nigerian young woman, casual outfit, neutral studio background, natural light, square aspect ratio.",
  },
];

export function Testimonials() {
  return (
    <section className="container-page py-16 md:py-24" data-reveal="fade">
      <h2 className="mx-auto max-w-xl text-center font-display text-3xl font-bold text-ink md:text-4xl">
        Students, parents and teachers agree.
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col gap-4 rounded-xl border border-line bg-card p-6 shadow-sm"
          >
            <div className="flex gap-1 text-gold-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="h-4 w-4" />
              ))}
            </div>
            <blockquote className="font-body text-[15px] leading-relaxed text-ink-secondary">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 pt-2">
              <span
                role="img"
                aria-label={`${t.name} headshot`}
                title={t.prompt}
                data-ai-prompt={t.prompt}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary-active"
              >
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span className="flex flex-col">
                <span className="font-body text-sm font-bold text-ink">{t.name}</span>
                <span className="font-body text-xs text-ink-muted">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
