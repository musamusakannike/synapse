"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { useHelpSystem, HelpConfig } from "@/contexts/HelpSystemContext";

interface HelpButtonProps {
  helpConfig: HelpConfig;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  helpConfig,
  className = "",
  size = "md",
}) => {
  const { startHelp, isHelpActive } = useHelpSystem();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={() => startHelp(helpConfig)}
      disabled={isHelpActive}
      className={`
        fixed bottom-6 right-6 z-30
        ${sizeClasses[size]}
        bg-blue-600 hover:bg-blue-700 
        text-white rounded-full shadow-lg 
        hidden lg:flex items-center justify-center
        transition-all duration-200 
        hover:scale-110 hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        group
        ${className}
      `}
      title="Get help with this page"
    >
      <HelpCircle className={`${iconSizes[size]} group-hover:rotate-12 transition-transform`} />
    </button>
  );
};

export default HelpButton;
