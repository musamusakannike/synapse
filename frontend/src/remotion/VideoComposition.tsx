import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { SceneDispatcher } from "./SceneDispatcher";
import type { Scene } from "./SceneDispatcher";

interface VideoCompositionProps {
  scenes?: Scene[];
  styleTheme?: string;
}

const themeColors: Record<string, { bg: string; accent: string; text: string }> = {
  emerald: { bg: "#052E1C", accent: "#34D399", text: "#ECFDF5" },
  lime: { bg: "#0F1A02", accent: "#A3E635", text: "#F7FEE7" },
  slate: { bg: "#0F172A", accent: "#38BDF8", text: "#E2E8F0" },
  white: { bg: "#F8FAFC", accent: "#6366F1", text: "#1E293B" },
};

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes = [],
  styleTheme = "emerald",
}) => {
  const { fps } = useVideoConfig();
  const colors = themeColors[styleTheme] || themeColors.emerald;

  let currentFrameStart = 0;

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      {scenes.map((scene) => {
        const durationFrames = (scene.durationSeconds || 12) * fps;
        const fromFrame = currentFrameStart;
        currentFrameStart += durationFrames;

        return (
          <Sequence
            key={scene.sceneNumber}
            from={fromFrame}
            durationInFrames={durationFrames}
          >
            <SceneDispatcher
              scene={scene}
              colors={colors}
              totalScenes={scenes.length}
            />
          </Sequence>
        );
      })}
    </div>
  );
};
