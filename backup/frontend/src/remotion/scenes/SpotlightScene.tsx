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
 * SPOTLIGHT — One term zooms in to dominate, definition expands below with a pulsing glow.
 * Best for: defining a single critical concept deeply.
 */
export const SpotlightScene: React.FC<Props> = ({ scene, colors, totalScenes }) => {
  const { frame, fps, durationFrames, opacity, scale, pulseScale } = useAnimations(
    scene.durationSeconds
  );

  const term = scene.spotlightTerm || scene.title;
  const definition = scene.spotlightDefinition || scene.illustrationPrompt;

  const termSpring = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 10, mass: 0.7 } });
  const termScale = interpolate(termSpring, [0, 1], [0.5, 1]);
  const termOpacity = interpolate(termSpring, [0, 1], [0, 1]);

  const defSpring = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 16 } });
  const defY = interpolate(defSpring, [0, 1], [20, 0]);
  const defOpacity = interpolate(defSpring, [0, 1], [0, 1]);

  // Pulsing ring animation
  const ringScale = 1 + Math.sin(frame / 14) * 0.05;
  const ringOpacity = 0.3 + Math.sin(frame / 14) * 0.15;

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
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 80px",
          gap: "0px",
        }}
      >
        {/* Outer pulsing ring */}
        <div
          style={{
            position: "absolute",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            border: `2px solid ${colors.accent}`,
            opacity: ringOpacity,
            transform: `scale(${ringScale})`,
            pointerEvents: "none",
          }}
        />
        {/* Inner glow circle */}
        <div
          style={{
            position: "absolute",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.accent}25 0%, transparent 70%)`,
            transform: `scale(${pulseScale})`,
            pointerEvents: "none",
          }}
        />

        {/* Term */}
        <div
          style={{
            opacity: termOpacity,
            transform: `scale(${termScale})`,
            textAlign: "center",
            marginBottom: "32px",
            zIndex: 2,
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "4px",
              color: `${colors.accent}80`,
            }}
          >
            Definition
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: term.length > 15 ? "52px" : "70px",
              fontWeight: 900,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "-1px",
              background: `linear-gradient(135deg, ${colors.text} 30%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: `0 0 80px ${colors.accent}30`,
            }}
          >
            {term}
          </h2>
        </div>

        {/* Definition */}
        <div
          style={{
            opacity: defOpacity,
            transform: `translateY(${defY}px)`,
            textAlign: "center",
            zIndex: 2,
            maxWidth: "680px",
          }}
        >
          <div
            style={{
              height: "1px",
              backgroundColor: `${colors.accent}40`,
              marginBottom: "20px",
              width: "100px",
              margin: "0 auto 20px",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: "20px",
              lineHeight: 1.6,
              color: colors.text,
              opacity: 0.9,
              fontWeight: 400,
            }}
          >
            {definition}
          </p>
        </div>
      </div>
    </SceneWrapper>
  );
};
