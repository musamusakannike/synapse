import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface Scene {
  sceneNumber: number;
  title: string;
  bulletPoints: string[];
  illustrationPrompt: string;
  narration: string;
  durationSeconds: number;
}

interface SceneComponentProps {
  scene: Scene;
  colors: { bg: string; accent: string; text: string };
  totalScenes: number;
}

export const SceneComponent: React.FC<SceneComponentProps> = ({
  scene,
  colors,
  totalScenes,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance and exit animations using spring
  const durationFrames = scene.durationSeconds * fps;
  
  // Slide-in spring for the scene title and card
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  // Fade-out/slide-out spring at the end of the scene
  const exitFrame = durationFrames - 15; // Start fade out 15 frames before the end
  const exitSpring = spring({
    frame: Math.max(0, frame - exitFrame),
    fps,
    config: { damping: 15 },
  });

  // Interpolated animation values
  const opacity = interpolate(frame, [0, 10, durationFrames - 10, durationFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleTranslateY = interpolate(entranceSpring, [0, 1], [50, 0]);
  const mainScale = interpolate(entranceSpring, [0, 1], [0.95, 1]) - interpolate(exitSpring, [0, 1], [0, 0.05]);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 80px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        opacity,
        transform: `scale(${mainScale})`,
      }}
    >
      {/* Background ambient light/glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-20%",
          width: "80%",
          height: "80%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}15 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-20%",
          width: "80%",
          height: "80%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}10 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.accent}20`,
          paddingBottom: "15px",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: colors.accent,
          }}
        >
          Sabi Learn AI Explainer
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            opacity: 0.6,
          }}
        >
          Scene {scene.sceneNumber} / {totalScenes}
        </span>
      </div>

      {/* Main Layout: Split Screen */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: "60px",
          marginTop: "30px",
          marginBottom: "30px",
          zIndex: 10,
        }}
      >
        {/* Left Side: Bullet Points */}
        <div
          style={{
            flex: 1.2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transform: `translateY(${titleTranslateY}px)`,
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              marginBottom: "30px",
              lineHeight: 1.2,
              fontFamily: "'Outfit', sans-serif",
              background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {scene.title}
          </h2>

          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {scene.bulletPoints.map((point, index) => {
              // Staggered entry for bullet points
              const pointDelay = 15 + index * 12; // 15 frames initial delay, 12 frames gap
              const pointSpring = spring({
                frame: Math.max(0, frame - pointDelay),
                fps,
                config: { damping: 12 },
              });
              const pointOpacity = interpolate(pointSpring, [0, 1], [0, 1]);
              const pointTranslateX = interpolate(pointSpring, [0, 1], [-20, 0]);

              return (
                <li
                  key={index}
                  style={{
                    fontSize: "18px",
                    lineHeight: 1.5,
                    opacity: pointOpacity,
                    transform: `translateX(${pointTranslateX}px)`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      color: colors.accent,
                      fontSize: "20px",
                      marginTop: "-2px",
                    }}
                  >
                    ✦
                  </span>
                  <span>{point}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Side: Graphic Visual Visualizer */}
        <div
          style={{
            flex: 0.8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          {/* Floating animated visual card representing the illustration */}
          <div
            style={{
              width: "280px",
              height: "280px",
              borderRadius: "24px",
              background: `linear-gradient(135deg, ${colors.accent}20 0%, ${colors.bg} 100%)`,
              border: `2px solid ${colors.accent}40`,
              boxShadow: `0 20px 40px ${colors.accent}15`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
              transform: `translateY(${Math.sin(frame / 15) * 8}px) rotate(${Math.cos(frame / 30) * 1.5}deg)`,
            }}
          >
            {/* Visualizer geometric patterns inside */}
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.accent}30 0%, transparent 70%)`,
                transform: `rotate(${frame}deg)`,
              }}
            />

            <div
              style={{
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: `${colors.accent}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: colors.accent,
                  border: `1px solid ${colors.accent}40`,
                }}
              >
                💡
              </div>

              <div style={{ marginTop: "auto" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: colors.accent,
                    marginBottom: "8px",
                  }}
                >
                  Illustration Concept
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.4,
                    opacity: 0.8,
                    maxHeight: "120px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {scene.illustrationPrompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Subtitles/Captions */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            backgroundColor: `${colors.bg}A0`,
            backdropFilter: "blur(8px)",
            border: `1px solid ${colors.accent}30`,
            borderRadius: "16px",
            padding: "16px 24px",
            maxWidth: "80%",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: 1.5,
              fontWeight: 500,
              color: colors.text,
            }}
          >
            {/* Animate caption words progressively over the scene duration */}
            {(() => {
              const words = scene.narration.split(" ");
              const totalWords = words.length;
              // Spread word rendering across 80% of the scene duration
              const activeWordCount = Math.min(
                totalWords,
                Math.floor((frame / (durationFrames * 0.8)) * totalWords) + 1
              );
              
              return words.map((word, wIdx) => {
                const isSpoken = wIdx < activeWordCount;
                return (
                  <span
                    key={wIdx}
                    style={{
                      opacity: isSpoken ? 1 : 0.35,
                      color: isSpoken ? colors.accent : colors.text,
                      transition: "opacity 0.2s, color 0.2s",
                      marginRight: "6px",
                      display: "inline-block",
                    }}
                  >
                    {word}
                  </span>
                );
              });
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};
