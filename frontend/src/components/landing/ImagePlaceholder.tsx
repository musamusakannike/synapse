/**
 * Visual placeholder for a not-yet-generated image/video asset.
 * Swap the parent's background for a real <Image>/<video> once assets
 * are generated — the `prompt` prop documents the suggested AI prompt
 * (also collected in frontend/README-assets.md).
 */
export function ImagePlaceholder({
  label,
  prompt,
  className = "",
  tone = "light",
  aspect = "aspect-4/3",
}: {
  label: string;
  prompt: string;
  className?: string;
  tone?: "light" | "dark" | "brand";
  aspect?: string;
}) {
  const toneClasses =
    tone === "dark"
      ? "bg-neutral-800 text-neutral-100 border-neutral-700"
      : tone === "brand"
        ? "bg-primary-soft text-green-800 border-green-200"
        : "bg-sunken text-ink-muted border-line";

  return (
    <div
      role="img"
      aria-label={label}
      title={prompt}
      data-ai-prompt={prompt}
      className={`relative flex ${aspect} w-full flex-col items-center justify-center gap-2 overflow-hidden border border-dashed p-6 text-center ${toneClasses} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8 opacity-50" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 16l-5.5-5.5L7 19" />
      </svg>
      <span className="font-body text-sm font-semibold">{label}</span>
      <span className="max-w-[85%] font-body text-xs leading-snug opacity-70">{prompt}</span>
    </div>
  );
}
