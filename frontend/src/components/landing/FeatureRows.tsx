import { ImagePlaceholder } from "./ImagePlaceholder";
import { Blob } from "./Blob";
import { FileQuestionIcon, BookIcon, CodeIcon } from "./Icons";

const FEATURES = [
  {
    id: "quiz-generator",
    icon: FileQuestionIcon,
    eyebrow: "Quiz generator",
    title: "Every conversation is unique to you.",
    body: "Upload any note, textbook chapter or past PDF — Naija reads it and builds a quiz that targets exactly what you need to practice, then explains every answer.",
    prompt:
      "UI mockup screenshot of a mobile quiz app: a multiple-choice question about photosynthesis with four rounded answer cards, green accent color, one option selected and marked correct with a checkmark, clean flat modern UI design.",
    tone: "brand" as const,
    blobColor: "var(--green-400)",
  },
  {
    id: "courses",
    icon: BookIcon,
    eyebrow: "Ready-made courses",
    title: "Adapts to exactly where you are.",
    body: "Structured WAEC and JAMB courses broken into bite-sized lessons, so you always know what to study next — no more guessing what matters.",
    prompt:
      "UI mockup screenshot of a course roadmap screen for an exam-prep app: vertical path of connected rounded lesson nodes with progress checkmarks and a locked node, green and gold accent colors, clean flat modern UI design.",
    tone: "light" as const,
    blobColor: "var(--gold-300)",
  },
  {
    id: "learn-to-code",
    icon: CodeIcon,
    eyebrow: "Learn to code",
    title: "Hands-on, at your own pace.",
    body: "Python and JavaScript lessons with an in-browser code editor, instant feedback and small real-world projects — built for beginners who've never written a line of code.",
    prompt:
      "UI mockup screenshot of a coding lesson screen: split view with an instructional panel on the left and a code editor with syntax-highlighted Python code and a green 'Run' button on the right, dark editor theme, clean modern UI.",
    tone: "brand" as const,
    blobColor: "var(--green-300)",
  },
];

export function FeatureRows() {
  return (
    <section className="container-page flex flex-col gap-24 py-16 md:py-24">
      {FEATURES.map((feature, i) => {
        const reversed = i % 2 === 1;
        const Icon = feature.icon;
        return (
          <div
            key={feature.id}
            id={feature.id}
            data-reveal={reversed ? "right" : "left"}
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
              reversed ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="flex flex-col gap-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <span className="font-body text-sm font-bold uppercase tracking-wide text-gold-600">
                {feature.eyebrow}
              </span>
              <h3 className="font-display text-2xl font-bold leading-snug text-ink md:text-3xl">
                {feature.title}
              </h3>
              <p className="max-w-md font-body text-base leading-relaxed text-ink-secondary">
                {feature.body}
              </p>
            </div>

            <div className="relative">
              <Blob
                className={`pointer-events-none h-48 w-48 opacity-25 ${
                  reversed ? "-left-8 -bottom-8" : "-right-8 -bottom-8"
                }`}
                color={feature.blobColor}
              />
              <div className="relative overflow-hidden rounded-xl shadow-md">
                <ImagePlaceholder
                  label={`${feature.eyebrow} screenshot`}
                  prompt={feature.prompt}
                  tone={feature.tone}
                  aspect="aspect-[4/3]"
                />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
