import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/** Fade in from 0→1 between [startFrame, endFrame] */
export function useFadeIn(startFrame = 0, endFrame = 20): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Slide up (translateY) from offset→0 with a spring */
export function useSlideUp(delay = 0, offsetPx = 40): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 80, mass: 0.6 },
  });
  return interpolate(progress, [0, 1], [offsetPx, 0]);
}

/** Interpolate word opacity for a staggered text reveal */
export function wordOpacity(
  wordIndex: number,
  frame: number,
  startAt = 10,
  stagger = 3
): number {
  const start = startAt + wordIndex * stagger;
  return interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}
