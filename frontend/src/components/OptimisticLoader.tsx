"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface OptimisticLoaderProps {
  messages?: string[];
  interval?: number;
}

const defaultMessages = [
  "Crafting your content with care...",
  "Gathering insights from our AI...",
  "Processing your request...",
  "Almost there, hang tight...",
  "Building something amazing...",
  "Analyzing and generating...",
  "Working on it...",
  "Just a moment while we prepare this...",
  "Putting the pieces together...",
  "Creating your personalized content...",
  "AI is thinking hard...",
  "Generating high-quality results...",
  "Fine-tuning the details...",
  "Making sure everything is perfect...",
  "Your content is on its way...",
];

export default function OptimisticLoader({ messages = defaultMessages, interval = 3000 }: OptimisticLoaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"fade-in" | "visible" | "fade-out">("fade-in");

  useEffect(() => {
    // Initial fade-in
    const fadeInTimer = setTimeout(() => {
      setFadeState("visible");
    }, 100);

    return () => clearTimeout(fadeInTimer);
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;

    const cycleInterval = setInterval(() => {
      // Start fade-out
      setFadeState("fade-out");

      // After fade-out, change message and fade-in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setFadeState("fade-in");

        setTimeout(() => {
          setFadeState("visible");
        }, 100);
      }, 400);
    }, interval);

    return () => clearInterval(cycleInterval);
  }, [messages.length, interval]);

  const opacityClass = {
    "fade-in": "opacity-0 animate-fadeIn",
    visible: "opacity-100",
    "fade-out": "opacity-100 animate-fadeOut",
  }[fadeState];

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
      {/* Animated icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="relative bg-linear-to-br from-blue-500 to-purple-600 p-4 rounded-full animate-bounce-slow">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p
          className={`text-lg font-medium text-gray-700 transition-opacity duration-400 ${opacityClass}`}
        >
          {messages[currentIndex]}
        </p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-progress"></div>
      </div>
    </div>
  );
}
