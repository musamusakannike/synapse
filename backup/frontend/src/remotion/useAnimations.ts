import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Shared animation primitives used across all scene templates.
 */
export function useAnimations(durationSeconds: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = durationSeconds * fps;

  // Entrance spring — 0→1 at scene start
  const entranceSpring = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });

  // Exit spring — 0→1 near scene end
  const exitStartFrame = durationFrames - 14;
  const exitSpring = spring({
    frame: Math.max(0, frame - exitStartFrame),
    fps,
    config: { damping: 14 },
  });

  // Global scene opacity with fade in/out
  const opacity = interpolate(
    frame,
    [0, 8, durationFrames - 8, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scale: grow in, shrink out
  const scale =
    interpolate(entranceSpring, [0, 1], [0.94, 1]) -
    interpolate(exitSpring, [0, 1], [0, 0.04]);

  // Translate Y entrance (up from below)
  const translateY = interpolate(entranceSpring, [0, 1], [40, 0]);

  // Translate X entrance from left
  const translateXLeft = interpolate(entranceSpring, [0, 1], [-60, 0]);

  // Translate X entrance from right
  const translateXRight = interpolate(entranceSpring, [0, 1], [60, 0]);

  // Ambient pulse (smooth sin wave)
  const pulseScale = 1 + Math.sin(frame / 18) * 0.03;

  // Staggered spring for a given item index
  const staggerSpring = (index: number, delayFrames = 12) =>
    spring({
      frame: Math.max(0, frame - index * delayFrames),
      fps,
      config: { damping: 12, mass: 0.9 },
    });

  // Word-by-word caption progress
  const wordProgress = (totalWords: number, coverFraction = 0.8) =>
    Math.min(
      totalWords,
      Math.floor((frame / (durationFrames * coverFraction)) * totalWords) + 1
    );

  // Reveal wipe (0 → 1 over first 60% of scene)
  const revealProgress = interpolate(
    frame,
    [0, durationFrames * 0.6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return {
    frame,
    fps,
    durationFrames,
    opacity,
    scale,
    translateY,
    translateXLeft,
    translateXRight,
    pulseScale,
    staggerSpring,
    wordProgress,
    revealProgress,
    entranceSpring,
  };
}
