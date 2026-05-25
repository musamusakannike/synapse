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
 * SPLIT BULLETS — Left: animated staggered bullet list. Right: floating 3D concept card.
 * Best for: key facts, properties, named concepts.
 */
export const SplitBulletsScene: React.FC<Props> = ({ scene, colors, totalScenes }) => {
  const { frame, fps, durationFrames, opacity, scale, staggerSpring, pulseScale } =
    useAnimations(scene.durationSeconds);

  const bulletPoints = scene.bulletPoints || [];

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
          alignItems: "center",
          padding: "10px 60px 0px",
          gap: "50px",
        }}
      >
        {/* LEFT: Title + Bullets */}
        <div style={{ flex: 1.3, display: "flex", flexDirection: "column", gap: "28px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "38px",
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.2,
              background: `linear-gradient(130deg, ${colors.text} 0%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {scene.title}
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "18px" }}>
            {bulletPoints.map((point, i) => {
              const sp = staggerSpring(i, 14);
              return (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    opacity: interpolate(sp, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(sp, [0, 1], [-30, 0])}px)`,
                    fontSize: "19px",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      backgroundColor: `${colors.accent}20`,
                      border: `1.5px solid ${colors.accent}50`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: colors.accent,
                      marginTop: "2px",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: colors.text }}>{point}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* RIGHT: Floating concept card */}
        <div
          style={{
            flex: 0.75,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "260px",
              height: "260px",
              borderRadius: "28px",
              background: `linear-gradient(145deg, ${colors.accent}18 0%, ${colors.bg}00 100%)`,
              border: `2px solid ${colors.accent}35`,
              boxShadow: `0 0 60px ${colors.accent}20, 0 20px 40px rgba(0,0,0,0.3)`,
              padding: "28px",
              position: "relative",
              overflow: "hidden",
              transform: `translateY(${Math.sin(frame / 18) * 7}px) rotate(${Math.cos(frame / 28) * 1.2}deg) scale(${pulseScale})`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Rotating orb inside card */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${colors.accent}25 0%, transparent 70%)`,
                transform: `rotate(${frame * 0.8}deg)`,
              }}
            />
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: `${colors.accent}20`,
                border: `1px solid ${colors.accent}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              ✦
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: colors.accent,
                }}
              >
                Key Insight
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  lineHeight: 1.5,
                  opacity: 0.8,
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {scene.illustrationPrompt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SceneWrapper>
  );
};
