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
 * CINEMATIC QUOTE — Full-bleed radial gradient background with large pull-quote reveal.
 * Best for: closing principles, key takeaways, memorable quotes.
 */
export const CinematicQuoteScene: React.FC<Props> = ({ scene, colors, totalScenes }) => {
  const { frame, fps, durationFrames, opacity, scale } = useAnimations(scene.durationSeconds);

  const quoteText = scene.quoteText || scene.title;
  const quoteAuthor = scene.quoteAuthor;

  const quoteSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, mass: 0.9 } });
  const quoteOpacity = interpolate(quoteSpring, [0, 1], [0, 1]);
  const quoteY = interpolate(quoteSpring, [0, 1], [30, 0]);

  const authorSpring = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 16 } });
  const authorOpacity = interpolate(authorSpring, [0, 1], [0, 1]);
  const authorX = interpolate(authorSpring, [0, 1], [20, 0]);

  // Decorative quote marks animation
  const markSpring = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 12 } });
  const markOpacity = interpolate(markSpring, [0, 1], [0, 0.12]);
  const markScale = interpolate(markSpring, [0, 1], [1.4, 1]);

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
      {/* Extra full-bleed gradient for cinematic feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${colors.accent}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 100px",
          position: "relative",
        }}
      >
        {/* Giant decorative quote mark */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "60px",
            fontSize: "220px",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            color: colors.accent,
            opacity: markOpacity,
            transform: `scale(${markScale})`,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          "
        </div>

        {/* Accent line above */}
        <div
          style={{
            width: `${interpolate(frame, [5, 30], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
            height: "3px",
            backgroundColor: colors.accent,
            borderRadius: "2px",
            marginBottom: "28px",
            boxShadow: `0 0 16px ${colors.accent}60`,
          }}
        />

        {/* Quote text */}
        <div
          style={{
            opacity: quoteOpacity,
            transform: `translateY(${quoteY}px)`,
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: quoteText.length > 80 ? "24px" : quoteText.length > 50 ? "30px" : "38px",
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.4,
              color: colors.text,
              fontStyle: "italic",
            }}
          >
            {quoteText}
          </p>
        </div>

        {/* Author attribution */}
        {quoteAuthor && (
          <div
            style={{
              opacity: authorOpacity,
              transform: `translateX(${authorX}px)`,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "1px",
                backgroundColor: `${colors.accent}60`,
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: 600,
                color: colors.accent,
                letterSpacing: "1px",
              }}
            >
              — {quoteAuthor}
            </p>
          </div>
        )}

        {/* Accent line below */}
        <div
          style={{
            width: `${interpolate(frame, [20, 50], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
            height: "1px",
            backgroundColor: `${colors.accent}50`,
            borderRadius: "1px",
            marginTop: "28px",
          }}
        />
      </div>
    </SceneWrapper>
  );
};
