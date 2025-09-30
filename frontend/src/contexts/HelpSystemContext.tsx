"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface HelpStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  offset?: { x: number; y: number };
}

export interface HelpConfig {
  pageId: string;
  title: string;
  steps: HelpStep[];
}

interface HelpSystemContextType {
  isHelpActive: boolean;
  currentConfig: HelpConfig | null;
  currentStepIndex: number;
  startHelp: (config: HelpConfig) => void;
  stopHelp: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

const HelpSystemContext = createContext<HelpSystemContextType | undefined>(undefined);

export const useHelpSystem = () => {
  const context = useContext(HelpSystemContext);
  if (!context) {
    throw new Error("useHelpSystem must be used within a HelpSystemProvider");
  }
  return context;
};

interface HelpSystemProviderProps {
  children: ReactNode;
}

export const HelpSystemProvider: React.FC<HelpSystemProviderProps> = ({ children }) => {
  const [isHelpActive, setIsHelpActive] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<HelpConfig | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startHelp = (config: HelpConfig) => {
    setCurrentConfig(config);
    setCurrentStepIndex(0);
    setIsHelpActive(true);
  };

  const stopHelp = () => {
    setIsHelpActive(false);
    setCurrentConfig(null);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentConfig && currentStepIndex < currentConfig.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToStep = (index: number) => {
    if (currentConfig && index >= 0 && index < currentConfig.steps.length) {
      setCurrentStepIndex(index);
    }
  };

  return (
    <HelpSystemContext.Provider
      value={{
        isHelpActive,
        currentConfig,
        currentStepIndex,
        startHelp,
        stopHelp,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </HelpSystemContext.Provider>
  );
};
