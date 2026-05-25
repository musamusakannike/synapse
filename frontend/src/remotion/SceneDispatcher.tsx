import React from "react";
import { HeroStatementScene } from "./scenes/HeroStatementScene";
import { SplitBulletsScene } from "./scenes/SplitBulletsScene";
import { TimelineScene } from "./scenes/TimelineScene";
import { ComparisonScene } from "./scenes/ComparisonScene";
import { SpotlightScene } from "./scenes/SpotlightScene";
import { DataVisualScene } from "./scenes/DataVisualScene";
import { CinematicQuoteScene } from "./scenes/CinematicQuoteScene";
import { ExplodeListScene } from "./scenes/ExplodeListScene";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Colors {
  bg: string;
  accent: string;
  text: string;
}

export interface Scene {
  sceneNumber: number;
  title: string;
  /** Layout type chosen by the AI for this specific scene */
  layoutType?:
    | "hero-statement"
    | "split-bullets"
    | "timeline"
    | "comparison"
    | "spotlight"
    | "data-visual"
    | "cinematic-quote"
    | "explode-list";
  /** Animation style chosen by the AI for this specific scene */
  animationStyle?:
    | "slide-from-left"
    | "slide-from-right"
    | "scale-in"
    | "fade-up"
    | "typewriter"
    | "reveal-left-to-right";

  // Common fields
  illustrationPrompt: string;
  narration: string;
  durationSeconds: number;

  // hero-statement
  heroStatement?: string;

  // split-bullets / explode-list
  bulletPoints?: string[];

  // timeline
  timelineSteps?: string[];

  // comparison
  comparisonLeft?: { label: string; items: string[] };
  comparisonRight?: { label: string; items: string[] };

  // spotlight
  spotlightTerm?: string;
  spotlightDefinition?: string;

  // data-visual
  statCallouts?: { value: string; label: string }[];

  // cinematic-quote
  quoteText?: string;
  quoteAuthor?: string;
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

interface SceneDispatcherProps {
  scene: Scene;
  colors: Colors;
  totalScenes: number;
}

/**
 * Routes each scene to the correct layout template component based on
 * the AI-chosen `layoutType`. Falls back to `split-bullets` for legacy scenes.
 */
export const SceneDispatcher: React.FC<SceneDispatcherProps> = ({
  scene,
  colors,
  totalScenes,
}) => {
  const props = { scene, colors, totalScenes };

  switch (scene.layoutType) {
    case "hero-statement":
      return <HeroStatementScene {...props} />;
    case "timeline":
      return <TimelineScene {...props} />;
    case "comparison":
      return <ComparisonScene {...props} />;
    case "spotlight":
      return <SpotlightScene {...props} />;
    case "data-visual":
      return <DataVisualScene {...props} />;
    case "cinematic-quote":
      return <CinematicQuoteScene {...props} />;
    case "explode-list":
      return <ExplodeListScene {...props} />;
    case "split-bullets":
    default:
      // Also handles legacy saved videos (no layoutType field)
      return <SplitBulletsScene {...props} />;
  }
};
