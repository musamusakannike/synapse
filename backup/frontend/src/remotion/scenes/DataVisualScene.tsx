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
 * DATA VISUAL — Animated bar chart with stat callout counters flying in from below.
 * Best for: statistics, percentages, measurable comparisons.
 */
export const DataVisualScene: React.FC<Props> = ({ scene, colors, totalScenes }) => {
  const { frame, fps, durationFrames, opacity, scale, staggerSpring } = useAnimations(
    scene.durationSeconds
  );

  const stats = scene.statCallouts || [];

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
          padding: "16px 60px 0",
          gap: "24px",
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

        {/* Stats grid */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {stats.map((stat, i) => {
            const sp = staggerSpring(i, 16);
            const barHeight = interpolate(sp, [0, 1], [0, 100 - i * 15]);
            const statOpacity = interpolate(sp, [0, 1], [0, 1]);
            const statY = interpolate(sp, [0, 1], [40, 0]);

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  opacity: statOpacity,
                  transform: `translateY(${statY}px)`,
                }}
              >
                {/* Value badge */}
                <div
                  style={{
                    padding: "16px 24px",
                    borderRadius: "18px",
                    backgroundColor: `${colors.accent}18`,
                    border: `2px solid ${colors.accent}40`,
                    boxShadow: `0 0 30px ${colors.accent}20`,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "52px",
                      fontWeight: 900,
                      fontFamily: "'Outfit', sans-serif",
                      background: `linear-gradient(135deg, ${colors.text}, ${colors.accent})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </p>
                </div>

                {/* Animated bar */}
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: `${colors.accent}15`,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barHeight}%`,
                      backgroundColor: colors.accent,
                      borderRadius: "4px",
                      boxShadow: `0 0 12px ${colors.accent}60`,
                    }}
                  />
                </div>

                {/* Label */}
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: 1.4,
                    textAlign: "center",
                    color: colors.text,
                    opacity: 0.8,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SceneWrapper>
  );
};
