import { ImagePlaceholder } from "./ImagePlaceholder";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28" data-reveal="fade">
      <div className="absolute inset-0">
        <ImagePlaceholder
          label="Full-bleed CTA background photo"
          prompt="Photo of a determined Nigerian teenage student studying at night by phone/laptop light, moody warm lighting, cinematic editorial style, wide 21:9 aspect ratio, dark overall tone suitable for white text overlay."
          tone="dark"
          aspect="aspect-auto"
          className="h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/70 to-neutral-900/40" />
      </div>

      <div className="container-page relative flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-xl font-display text-3xl font-bold text-white md:text-4xl">
          The best time for you to become smarter is right now.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="#get-started"
            className="rounded-pill bg-primary px-8 py-3.5 font-body text-base font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            Get started for free
          </a>
        </div>
      </div>
    </section>
  );
}
