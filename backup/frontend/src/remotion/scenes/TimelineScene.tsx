import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneWrapper } from "./SceneWrapper";
import { useAnimations } from "../useAnimations";
import type { Scene, Colors } from "../SceneDispatcher";

interface Props {
  scene: Scene;
  colors: Colors;
  totalScenes: number;
}

/**
 * TIMELINE — Horizontal step-by-step process where each node unlocks sequentially.
 * Best for: sequences, processes, how-to flows.
 */
export const TimelineScene: React.FC<Props> = ({ scene, colors, totalScenes }) => {
  const { frame, fps, durationFrames, opacity, scale } = useAnimations(scene.durationSeconds);

  const steps = scene.timelineSteps || scene.bulletPoints || [];
  const totalSteps = steps.length;

  // Each step unlocks based on timeline progress
  const revealFraction = interpolate(frame, [15, durationFrames * 0.75], [0, totalSteps], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrapper
      colors={colors}
      sceneNumber={scene.sceneNumber}
      totalScenes={totalScenes}
      narration={scene.narration}
      durationSeconds={scene.durationSeconds}
      opacity={opacity}
      scale={scale}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 60px",
          gap: "36px",
        }}
      >
        {/* Title */}
        <h2
          style={{
            margin: 0,
            fontSize: "34px",
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            background: `linear-gradient(130deg, ${colors.text}, ${colors.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {scene.title}
        </h2>

        {/* Timeline track */}
        <div style={{ position: "relative", paddingLeft: "30px" }}>
          {/* Vertical spine line */}
          <div
            style={{
              position: "absolute",
              left: "10px",
              top: "16px",
              width: "2px",
              height: `${interpolate(revealFraction, [0, totalSteps], [0, (totalSteps - 1) * 72], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px`,
              backgroundColor: colors.accent,
              borderRadius: "1px",
              boxShadow: `0 0 8px ${colors.accent}60`,
              transition: "height 0.3s",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {steps.map((step, i) => {
              const isActive = revealFraction > i;
              const itemSpring = spring({
                frame: Math.max(0, frame - i * 12),
                fps,
                config: { damping: 14 },
              });
              const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);
              const itemX = interpolate(itemSpring, [0, 1], [-20, 0]);

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "18px",
                    opacity: itemOpacity,
                    transform: `translateX(${itemX}px)`,
                  }}
                >
                  {/* Node */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: isActive ? colors.accent : `${colors.accent}20`,
                      border: `2px solid ${isActive ? colors.accent : `${colors.accent}40`}`,
                      boxShadow: isActive ? `0 0 12px ${colors.accent}60` : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: isActive ? colors.bg : colors.accent,
                      marginLeft: "-22px",
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Step text card */}
                  <div
                    style={{
                      flex: 1,
                      padding: "12px 18px",
                      borderRadius: "12px",
                      backgroundColor: isActive ? `${colors.accent}14` : `${colors.accent}06`,
                      border: `1px solid ${isActive ? `${colors.accent}40` : `${colors.accent}15`}`,
                      fontSize: "16px",
                      lineHeight: 1.4,
                      color: isActive ? colors.text : `${colors.text}70`,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SceneWrapper>
  );
};
