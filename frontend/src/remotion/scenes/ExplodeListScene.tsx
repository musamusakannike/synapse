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

// Deterministic pseudo-random positions for items, based on index
const POSITIONS = [
  { x: 10, y: 20 },
  { x: 55, y: 10 },
  { x: 75, y: 45 },
  { x: 60, y: 72 },
  { x: 20, y: 68 },
  { x: 38, y: 38 },
];

/**
 * EXPLODE LIST — Items appear at scattered positions around the frame, flying in from off-screen.
 * Best for: brainstorms, applications, a web of related concepts.
 */
export const ExplodeListScene: React.FC<Props> = ({ scene, colors, totalScenes }) => {
  const { frame, fps, durationFrames, opacity, scale } = useAnimations(scene.durationSeconds);

  const items = scene.bulletPoints || [];

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
          position: "relative",
        }}
      >
        {/* Center hub */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: "14px 28px",
              borderRadius: "50px",
              backgroundColor: colors.accent,
              boxShadow: `0 0 40px ${colors.accent}60`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                color: colors.bg,
                whiteSpace: "nowrap",
              }}
            >
              {scene.title}
            </p>
          </div>
        </div>

        {/* Scattered items */}
        {items.slice(0, 6).map((item, i) => {
          const pos = POSITIONS[i % POSITIONS.length];
          const delay = 10 + i * 14;

          const sp = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 13 } });
          const itemOpacity = interpolate(sp, [0, 1], [0, 1]);
          const itemScale = interpolate(sp, [0, 1], [0.6, 1]);

          // Calculate connecting line to center (50%, 48%)
          const centerX = 50;
          const centerY = 48;
          const dx = pos.x - centerX;
          const dy = pos.y - centerY;
          const lineLength = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          const lineProgress = interpolate(sp, [0, 1], [0, 1]);

          return (
            <div key={i}>
              {/* Connecting line */}
              <div
                style={{
                  position: "absolute",
                  left: `${centerX}%`,
                  top: `${centerY}%`,
                  width: `${lineLength * lineProgress}%`,
                  height: "1px",
                  backgroundColor: `${colors.accent}30`,
                  transformOrigin: "left center",
                  transform: `rotate(${angle}deg)`,
                  zIndex: 5,
                }}
              />

              {/* Item bubble */}
              <div
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${itemScale})`,
                  opacity: itemOpacity,
                  zIndex: 15,
                  maxWidth: "180px",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "14px",
                    backgroundColor: `${colors.accent}14`,
                    border: `1.5px solid ${colors.accent}35`,
                    backdropFilter: "blur(8px)",
                    boxShadow: `0 8px 24px rgba(0,0,0,0.25)`,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: colors.text,
                    }}
                  >
                    {item}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SceneWrapper>
  );
};
