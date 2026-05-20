import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { useFadeIn, useSlideUp, wordOpacity } from "./animations";
import { MathBlock } from "./MathBlock";
import { CodeBlock } from "./CodeBlock";

export interface SceneProps {
  /** Section / chapter label shown as badge */
  sectionTitle?: string;
  /** Slide heading */
  title: string;
  /** Main body text */
  body: string;
  /** LaTeX expression (no delimiters) */
  math?: string;
  /** Code snippet */
  code?: string;
  /** Programming language */
  language?: string;
  /** Slide index (0-based) */
  index: number;
  /** Total slides */
  total: number;
  /** Whether this is the concluding slide */
  isFinal?: boolean;
}

const ACCENT = "#818cf8";
const ACCENT_SOFT = "#a5b4fc";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_SECONDARY = "#94a3b8";

export const Scene: React.FC<SceneProps> = ({
  sectionTitle,
  title,
  body,
  math,
  code,
  language = "javascript",
  index,
  total,
  isFinal = false,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const sectionOpacity = useFadeIn(0, 10);
  const titleY = useSlideUp(5, 50);
  const titleOpacity = useFadeIn(5, 22);
  const dividerScale = interpolate(frame, [18, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const words = body.split(" ");
  const bodyStartFrame = code || math ? 25 : 30;

  const progressFraction = (index / total) + (frame / durationInFrames) * (1 / total);
  const progressPercent = Math.min(progressFraction * 100, 100);

  // For the final slide, compute fade-in opacity at the call-site
  const finalOpacity = useFadeIn(20, 40);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* Ambient glow — top right */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          top: -200,
          right: -100,
          pointerEvents: "none",
        }}
      />
      {/* Ambient glow — bottom left */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
          bottom: -150,
          left: -100,
          pointerEvents: "none",
        }}
      />

      {/* Main layout */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            opacity: sectionOpacity,
          }}
        >
          {sectionTitle ? (
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: ACCENT,
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                padding: "6px 16px",
                borderRadius: 100,
              }}
            >
              {sectionTitle}
            </div>
          ) : (
            <div />
          )}
          <div style={{ fontSize: 13, color: TEXT_SECONDARY, fontWeight: 600, letterSpacing: "0.05em" }}>
            {index + 1} / {total}
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: code || math ? 42 : 52,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 20,
          }}
        >
          {title}
        </h1>

        {/* Accent divider */}
        <div
          style={{
            height: 3,
            width: `${dividerScale * 80}px`,
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})`,
            borderRadius: 100,
            marginBottom: 32,
          }}
        />

        {/* Body text — staggered word reveal */}
        {!isFinal && (
          <p
            style={{
              fontSize: code || math ? 18 : 24,
              color: TEXT_SECONDARY,
              lineHeight: 1.7,
              margin: 0,
              marginBottom: math || code ? 24 : 0,
              flex: code || math ? "0 0 auto" : 1,
            }}
          >
            {words.map((word, i) => (
              <span
                key={i}
                style={{
                  opacity: wordOpacity(i, frame, bodyStartFrame, 2),
                  display: "inline",
                }}
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        )}

        {/* Math block */}
        {math && (
          <div style={{ marginTop: 8 }}>
            <MathBlock latex={math} displayMode delay={bodyStartFrame + 10} />
          </div>
        )}

        {/* Code block */}
        {code && (
          <div style={{ marginTop: 8, flex: 1, overflow: "hidden" }}>
            <CodeBlock code={code} language={language} delay={bodyStartFrame + 8} />
          </div>
        )}

        {/* Final / outro slide */}
        {isFinal && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              opacity: finalOpacity,
            }}
          >
            <div style={{ fontSize: 80, lineHeight: 1 }}>🎓</div>
            <p
              style={{
                fontSize: 22,
                color: TEXT_SECONDARY,
                textAlign: "center",
                maxWidth: 600,
                lineHeight: 1.7,
              }}
            >
              {body}
            </p>
            <div
              style={{
                fontSize: 14,
                color: ACCENT,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginTop: 8,
              }}
            >
              Powered by Synapse AI
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
