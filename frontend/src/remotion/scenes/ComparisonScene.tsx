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
 * COMPARISON — Two panels slide in from opposite edges for side-by-side contrast.
 * Best for: pros/cons, before/after, A vs B comparisons.
 */
export const ComparisonScene: React.FC<Props> = ({ scene, colors, totalScenes }) => {
  const { frame, fps, durationFrames, opacity, scale, staggerSpring } = useAnimations(
    scene.durationSeconds
  );

  const left = scene.comparisonLeft || { label: "Option A", items: [] };
  const right = scene.comparisonRight || { label: "Option B", items: [] };

  const panelSpring = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 14 } });
  const leftX = interpolate(panelSpring, [0, 1], [-80, 0]);
  const rightX = interpolate(panelSpring, [0, 1], [80, 0]);
  const panelOpacity = interpolate(panelSpring, [0, 1], [0, 1]);

  const vsSpring = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 10 } });
  const vsScale = interpolate(vsSpring, [0, 1], [0, 1]);
  const vsOpacity = interpolate(vsSpring, [0, 1], [0, 1]);

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
          padding: "16px 50px 0",
          gap: "20px",
        }}
      >
        {/* Title */}
        <h2
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            textAlign: "center",
            background: `linear-gradient(130deg, ${colors.text}, ${colors.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {scene.title}
        </h2>

        {/* Two panel layout */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: "20px",
            alignItems: "stretch",
            position: "relative",
          }}
        >
          {/* Left Panel */}
          <div
            style={{
              flex: 1,
              backgroundColor: `${colors.accent}10`,
              border: `1.5px solid ${colors.accent}30`,
              borderRadius: "20px",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              opacity: panelOpacity,
              transform: `translateX(${leftX}px)`,
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: colors.accent,
                paddingBottom: "10px",
                borderBottom: `1px solid ${colors.accent}25`,
              }}
            >
              {left.label}
            </div>
            {(left.items || []).map((item, i) => {
              const sp = staggerSpring(i, 12);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    opacity: interpolate(sp, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(sp, [0, 1], [12, 0])}px)`,
                    fontSize: "15px",
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: colors.accent, fontSize: "18px", flexShrink: 0 }}>◆</span>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>

          {/* VS badge */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${vsScale})`,
              opacity: vsOpacity,
              zIndex: 10,
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              backgroundColor: colors.bg,
              border: `2px solid ${colors.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 900,
              color: colors.accent,
              boxShadow: `0 0 20px ${colors.accent}40`,
            }}
          >
            VS
          </div>

          {/* Right Panel */}
          <div
            style={{
              flex: 1,
              backgroundColor: `${colors.accent}06`,
              border: `1.5px solid ${colors.accent}20`,
              borderRadius: "20px",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              opacity: panelOpacity,
              transform: `translateX(${rightX}px)`,
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: `${colors.accent}90`,
                paddingBottom: "10px",
                borderBottom: `1px solid ${colors.accent}15`,
              }}
            >
              {right.label}
            </div>
            {(right.items || []).map((item, i) => {
              const sp = staggerSpring(i, 12);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    opacity: interpolate(sp, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(sp, [0, 1], [12, 0])}px)`,
                    fontSize: "15px",
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{ color: `${colors.accent}80`, fontSize: "18px", flexShrink: 0 }}
                  >
                    ◇
                  </span>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SceneWrapper>
  );
};
