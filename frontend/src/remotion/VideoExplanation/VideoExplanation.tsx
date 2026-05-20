import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Scene } from "./Scene";

export interface VideoScene {
  sectionTitle?: string;
  title: string;
  body: string;
  durationSeconds: number;
  math?: string;
  code?: string;
  language?: string;
  /** Set to true on the final slide */
  isFinal?: boolean;
}

interface VideoExplanationProps {
  scenes: VideoScene[];
  fps: number;
}

export const VideoExplanation: React.FC<VideoExplanationProps> = ({ scenes, fps }) => {
  return (
    <AbsoluteFill>
      <Series>
        {scenes.map((scene, idx) => {
          const durationInFrames = Math.max(Math.round(scene.durationSeconds * fps), 30);
          return (
            <Series.Sequence
              key={idx}
              durationInFrames={durationInFrames}
              name={scene.title}
            >
              <Scene
                sectionTitle={scene.sectionTitle}
                title={scene.title}
                body={scene.body}
                math={scene.math}
                code={scene.code}
                language={scene.language}
                index={idx}
                total={scenes.length}
                isFinal={scene.isFinal ?? idx === scenes.length - 1}
              />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
