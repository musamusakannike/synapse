import { ImagePlaceholder } from "./ImagePlaceholder";

export function CommunityReach() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24" data-reveal="fade">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <ImagePlaceholder
            label="Aerial city / community photo"
            prompt="Aerial drone photo of a vibrant Nigerian city neighborhood at golden hour, rooftops and streets visible, warm cinematic color grade, wide 16:9 aspect ratio."
            tone="dark"
            aspect="aspect-[16/7]"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-neutral-900/80 via-neutral-900/10 to-transparent p-8 md:p-12">
            <p className="font-display text-2xl font-bold text-white md:text-3xl">
              Built for every classroom, in every state.
            </p>
            <p className="mt-2 max-w-lg font-body text-sm text-neutral-100/90 md:text-base">
              From Lagos to Kano to Port Harcourt — students are turning
              their notes into exam wins.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
