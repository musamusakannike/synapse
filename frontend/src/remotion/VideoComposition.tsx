import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { Scene, SceneComponent } from "./SceneComponent";

interface VideoCompositionProps {
  scenes?: Scene[];
  styleTheme?: string;
}

const themeColors: Record<string, { bg: string; accent: string; text: string }> = {
  emerald: { bg: "#064E3B", accent: "#34D399", text: "#ECFDF5" },
  lime: { bg: "#1A2E05", accent: "#84CC16", text: "#F7FEE7" },
  slate: { bg: "#1E293B", accent: "#38BDF8", text: "#F1F5F9" }, // brightened slate accent for video visibility
  white: { bg: "#FAFAFA", accent: "#4F46E5", text: "#18181B" }, // indigo accent for high contrast white theme
};

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes = [],
  styleTheme = "emerald",
}) => {
  const { fps } = useVideoConfig();
  const colors = themeColors[styleTheme] || themeColors.emerald;

  // Calculate cumulative starts to place each scene sequence correctly
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
        const durationFrames = scene.durationSeconds * fps;
        const fromFrame = currentFrameStart;
        currentFrameStart += durationFrames;

        return (
          <Sequence
            key={scene.sceneNumber}
            from={fromFrame}
            durationInFrames={durationFrames}
          >
            <SceneComponent
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
