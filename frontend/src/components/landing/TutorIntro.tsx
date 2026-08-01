import { SparkleIcon } from "./Icons";

export function TutorIntro() {
  return (
    <section className="container-page py-16 text-center md:py-24" data-reveal="fade">
      <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <SparkleIcon className="h-6 w-6" />
      </span>
      <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-ink md:text-4xl">
        Meet Naija, your personal AI tutor.
      </h2>
      <p className="mx-auto mt-4 max-w-xl font-body text-lg leading-relaxed text-ink-secondary">
        Naija doesn&apos;t just mark your answers — it explains the &quot;why&quot;,
        adapts to how you learn, and celebrates every small win along the way.
      </p>
    </section>
  );
}
