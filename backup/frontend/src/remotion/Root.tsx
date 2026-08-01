import React from "react";
import { Composition } from "remotion";
import { VideoComposition } from "./VideoComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ExplainerVideo"
        component={VideoComposition}
        durationInFrames={1200} // Default duration, will be dynamically computed at runtime in the Player
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          scenes: [
            {
              sceneNumber: 1,
              title: "Introduction to the Topic",
              bulletPoints: [
                "This is a preview scene",
                "Dynamic properties are loaded at runtime",
                "Highly engaging visual slides",
              ],
              illustrationPrompt: "A sleek dashboard overview with abstract floating modules",
              narration: "Welcome! Today we are looking at our new video generation capabilities. Let's explore.",
              durationSeconds: 10,
            },
          ],
          styleTheme: "emerald",
        }}
      />
    </>
  );
};
