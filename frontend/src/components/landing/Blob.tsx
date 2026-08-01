/**
 * Decorative organic "blob" shape used as an accent behind imagery,
 * echoing the wordmark's blob motif. Purely CSS/SVG, no image asset needed.
 */
export function Blob({
  className,
  color = "var(--green-400)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", zIndex: 0 }}
    >
      <path
        fill={color}
        d="M45.3,-58.5C58.6,-49.6,69.2,-35.4,73.6,-19.5C78,-3.6,76.2,14,68.7,28.6C61.2,43.2,48,54.8,32.9,62.8C17.8,70.8,0.7,75.2,-16.6,73.4C-33.9,71.6,-51.4,63.6,-62.6,50.1C-73.8,36.6,-78.7,17.6,-77.1,-0.4C-75.5,-18.4,-67.4,-35.4,-54.6,-44.6C-41.8,-53.8,-24.3,-55.2,-7.4,-53.4C9.5,-51.6,32,-67.4,45.3,-58.5Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}
