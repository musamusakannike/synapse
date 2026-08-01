import { ImagePlaceholder } from "./ImagePlaceholder";

export function PhotoBand() {
  return (
    <section className="container-page py-16 md:py-24" data-reveal="fade">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded-xl shadow-md">
          <ImagePlaceholder
            label="Family / classroom photo"
            prompt="Warm documentary photo of a Nigerian parent and teenage child sitting together at a home dining table, both looking at a laptop screen and smiling, soft evening light, editorial photography style, 4:3 aspect ratio."
            tone="light"
            aspect="aspect-[4/3]"
          />
        </div>
        <div className="flex flex-col gap-5">
          <span className="font-body text-sm font-bold uppercase tracking-wide text-gold-600">
            A way to help your student thrive
          </span>
          <h3 className="font-display text-2xl font-bold leading-snug text-ink md:text-3xl">
            Parents and teachers see the progress too.
          </h3>
          <p className="max-w-md font-body text-base leading-relaxed text-ink-secondary">
            Weekly progress summaries show exactly which topics your child has
            mastered and where they still need help — no more guesswork
            before exam season.
          </p>
        </div>
      </div>
    </section>
  );
}
