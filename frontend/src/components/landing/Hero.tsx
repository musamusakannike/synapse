import { ImagePlaceholder } from "./ImagePlaceholder";
import { PlayIcon } from "./Icons";
import { Blob } from "./Blob";

const STATS = [
  { value: "230,000+", label: "Learners across Nigeria" },
  { value: "4.9 / 5", label: "Average rating" },
  { value: "36 states", label: "Reached, and counting" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-14 pb-20 md:pt-20 md:pb-28">
      <Blob
        className="pointer-events-none -left-24 -top-24 h-[420px] w-[420px] opacity-[0.07]"
        color="var(--green-500)"
      />
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div data-reveal="left" className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-gold-50 px-4 py-1.5 font-body text-[13px] font-bold text-gold-600">
            For Nigerian students, everywhere
          </span>
          <h1 className="max-w-xl font-display text-4xl font-extrabold leading-[1.05] text-ink md:text-5xl lg:text-[3.4rem]">
            A world-class tutor for every exam.
          </h1>
          <p className="max-w-md font-body text-lg leading-relaxed text-ink-secondary">
            Turn your notes into quizzes, follow ready-made courses for WAEC
            and JAMB, and learn to code — all guided by an AI tutor that
            actually explains things, in one clean app.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#get-started"
              className="rounded-pill bg-primary px-7 py-3.5 font-body text-base font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Start learning free
            </a>
            <a
              href="#how-it-works"
              className="rounded-pill border border-line-strong px-7 py-3.5 font-body text-base font-bold text-ink transition-colors hover:bg-sunken"
            >
              See how it works
            </a>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="font-display text-xl font-extrabold text-ink md:text-2xl">
                  {stat.value}
                </dt>
                <dd className="font-body text-xs leading-snug text-ink-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-reveal="right" className="relative">
          <Blob
            className="pointer-events-none -right-10 -top-10 h-56 w-56 opacity-20"
            color="var(--gold-300)"
          />
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            {/*
              Hero video prompt:
              "Vertical-to-landscape hand-held video of a focused Nigerian
              secondary school student studying at a wooden desk by a
              sunlit window, flipping through a notebook, then smiling
              while looking at a laptop showing a colorful quiz screen;
              warm natural light, shallow depth of field, documentary
              style, 8-12 seconds, loopable."
              Fallback hero photo prompt:
              "Photo of a smiling Nigerian teenage student sitting at a
              desk with an open notebook and laptop, warm natural window
              light, shallow depth of field, candid documentary style,
              editorial photography, 4:5 aspect ratio."
            */}
            <ImagePlaceholder
              label="Hero video / photo"
              prompt="Nigerian student studying at a sunlit desk, laptop open to a quiz — warm, candid, documentary style"
              tone="brand"
              aspect="aspect-[4/5]"
            />
            <button
              type="button"
              aria-label="Play intro video"
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform hover:scale-105"
            >
              <PlayIcon className="ml-1 h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
