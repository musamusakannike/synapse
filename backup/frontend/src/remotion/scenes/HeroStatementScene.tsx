import React from "react";
import { interpolate } from "remotion";
import { SceneWrapper } from "./SceneWrapper";
import { useAnimations } from "../useAnimations";
import type { Scene, Colors } from "../SceneDispatcher";

interface Props {
  scene: Scene;
  colors: Colors;
  totalScenes: number;
}

/**
 * HERO STATEMENT — One giant, powerful sentence reveals word by word.
 * Best for: opening hooks, single key insight, memorable moments.
 */
export const HeroStatementScene: React.FC<Props> = ({ scene, colors, totalScenes }) => {
  const { frame, durationFrames, opacity, scale, staggerSpring } = useAnimations(
    scene.durationSeconds
  );

  const statement = scene.heroStatement || scene.title;
  const words = statement.split(" ");

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
          gap: "32px",
        }}
      >
        {/* Scene label */}
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: `${colors.accent}90`,
            margin: 0,
          }}
        >
          {scene.title}
        </p>

        {/* Giant word-by-word statement */}
        <div
          style={{
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          {words.map((word, i) => {
            const wordSpring = staggerSpring(i, 10);
            const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1]);
            const wordScale = interpolate(wordSpring, [0, 1], [0.7, 1]);
            const wordBlur = interpolate(wordSpring, [0, 1], [8, 0]);

            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "18px",
                  fontSize: words.length <= 5 ? "72px" : words.length <= 8 ? "58px" : "44px",
                  fontWeight: 900,
                  fontFamily: "'Outfit', sans-serif",
                  opacity: wordOpacity,
                  transform: `scale(${wordScale})`,
                  filter: `blur(${wordBlur}px)`,
                  background: i % 2 === 0
                    ? `linear-gradient(135deg, ${colors.text}, ${colors.accent})`
                    : colors.text,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Animated underline */}
        <div
          style={{
            height: "3px",
            borderRadius: "2px",
            backgroundColor: colors.accent,
            width: `${interpolate(frame, [10, 40], [0, 200], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px`,
            boxShadow: `0 0 20px ${colors.accent}80`,
          }}
        />
      </div>
    </SceneWrapper>
  );
};
