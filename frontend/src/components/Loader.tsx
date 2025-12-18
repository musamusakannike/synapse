"use client";

import React from "react";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: string;
}

const sizeMap = {
  xs: "w-4 h-4 border-2",
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
};

export default function Loader({ size = "md", color }: LoaderProps) {
  const sizeClass = sizeMap[size];
  const borderColor = color || "var(--color-primary)";

  return (
    <div
      className={`${sizeClass} rounded-full border-solid animate-spin`}
      style={{
        borderColor: `${borderColor}40`,
        borderTopColor: borderColor,
      }}
      role="status"
      aria-label="Loading"
    />
  );
}