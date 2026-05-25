import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface Colors {
  bg: string;
  accent: string;
  text: string;
}

interface SceneWrapperProps {
  colors: Colors;
  sceneNumber: number;
  totalScenes: number;
  narration: string;
  durationSeconds: number;
  children: React.ReactNode;
  opacity: number;
  scale: number;
}

/**
 * Shared wrapper used by every scene template.
 * Provides: ambient glow, top header bar, bottom word-by-word subtitle caption.
 */
export const SceneWrapper: React.FC<SceneWrapperProps> = ({
  colors,
  sceneNumber,
  totalScenes,
  narration,
  durationSeconds,
  children,
  opacity,
  scale,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = durationSeconds * fps;

  const words = narration.split(" ");
  const activeWordCount = Math.min(
    words.length,
    Math.floor((frame / (durationFrames * 0.8)) * words.length) + 1
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Ambient glow top-left */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}18 0%, transparent 70%)`,
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />
      {/* Ambient glow bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}12 0%, transparent 70%)`,
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 60px 18px",
          borderBottom: `1px solid ${colors.accent}20`,
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: colors.accent,
              boxShadow: `0 0 10px ${colors.accent}80`,
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2.5px",
              color: colors.accent,
            }}
          >
            Synapse AI
          </span>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {Array.from({ length: totalScenes }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i + 1 === sceneNumber ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor:
                  i + 1 === sceneNumber ? colors.accent : `${colors.accent}30`,
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content slot */}
      <div style={{ flex: 1, position: "relative", zIndex: 10 }}>{children}</div>

      {/* Bottom subtitle caption bar */}
      <div
        style={{
          flexShrink: 0,
          padding: "14px 60px 20px",
          zIndex: 20,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "80%",
            backgroundColor: `${colors.bg}BB`,
            backdropFilter: "blur(12px)",
            border: `1px solid ${colors.accent}25`,
            borderRadius: "14px",
            padding: "12px 22px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, fontWeight: 500 }}>
            {words.map((word, wIdx) => {
              const isSpoken = wIdx < activeWordCount;
              return (
                <span
                  key={wIdx}
                  style={{
                    opacity: isSpoken ? 1 : 0.3,
                    color: isSpoken ? colors.accent : colors.text,
                    marginRight: "5px",
                    display: "inline-block",
                    fontWeight: isSpoken ? 600 : 400,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
