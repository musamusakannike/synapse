/**
 * Remotion entry point — registers all compositions.
 *
 * This file is the bundler entry for @remotion/bundler (called from the server).
 * It is NOT imported by Next.js pages — it lives outside the Next.js routing tree.
 *
 * The server calls:
 *   bundle({ entryPoint: '<frontend>/src/remotion/index.tsx' })
 * then renders the "VideoExplanation" composition with renderMedia().
 */
import React from "react";
import { Composition } from "remotion";
import { VideoExplanation } from "./VideoExplanation/VideoExplanation";
import type { VideoScene } from "./VideoExplanation/VideoExplanation";

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

interface VideoExplanationProps {
  scenes: VideoScene[];
  fps: number;
}

function totalFrames(scenes: VideoScene[], fps: number): number {
  return scenes.reduce(
    (acc, s) => acc + Math.max(Math.round(s.durationSeconds * fps), 30),
    0
  );
}

const DEFAULT_SCENES: VideoScene[] = [
  {
    title: "Welcome to the Course",
    body: "This video explanation was generated automatically by Synapse AI from your course content.",
    durationSeconds: 5,
    sectionTitle: "Introduction",
  },
  {
    title: "Key Formula",
    body: "Here is an example of a mathematical equation rendered in your video.",
    math: "E = mc^2",
    durationSeconds: 8,
    sectionTitle: "Concepts",
  },
  {
    title: "Course Complete!",
    body: "Great work! Keep learning and exploring with Synapse.",
    durationSeconds: 5,
    isFinal: true,
  },
];

export const RemotionRoot: React.FC = () => {
  // Note: Remotion 4 Composition takes <Schema, Props>.
  // We have no Zod schema, so we use `any` to avoid the 2-arg constraint.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TypedComposition = Composition as any;
  return (
    <TypedComposition
      id="VideoExplanation"
      component={VideoExplanation}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={totalFrames(DEFAULT_SCENES, FPS)}
      defaultProps={{ scenes: DEFAULT_SCENES, fps: FPS }}
      calculateMetadata={({ props }: { props: VideoExplanationProps }) => {
        const scenes = props.scenes ?? DEFAULT_SCENES;
        return {
          durationInFrames: totalFrames(scenes, FPS),
          fps: FPS,
          width: WIDTH,
          height: HEIGHT,
        };
      }}
    />
  );
};
