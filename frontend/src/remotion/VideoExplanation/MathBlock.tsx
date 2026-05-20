import React from "react";
import katex from "katex";
import { useFadeIn } from "./animations";

interface MathBlockProps {
  /** LaTeX string (without $$ delimiters) */
  latex: string;
  /** Display mode (block) vs inline */
  displayMode?: boolean;
  delay?: number;
  color?: string;
  fontSize?: number;
}

export const MathBlock: React.FC<MathBlockProps> = ({
  latex,
  displayMode = true,
  delay = 0,
  color = "#e2e8f0",
  fontSize = 28,
}) => {
  const opacity = useFadeIn(delay, delay + 18);

  let html = "";
  try {
    html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: "html",
      trust: false,
    });
  } catch {
    html = `<span style="color:#f87171">Invalid LaTeX: ${latex}</span>`;
  }

  return (
    <div
      style={{
        opacity,
        color,
        fontSize,
        textAlign: "center",
        padding: "16px 32px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        lineHeight: 1.6,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
