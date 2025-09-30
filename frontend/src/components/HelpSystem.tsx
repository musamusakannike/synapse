"use client";

import React, { useEffect, useState, useRef } from "react";
import { useHelpSystem } from "@/contexts/HelpSystemContext";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

interface Position {
  top: number;
  left: number;
}

export const HelpSystem: React.FC = () => {
  const {
    isHelpActive,
    currentConfig,
    currentStepIndex,
    stopHelp,
    nextStep,
    prevStep,
  } = useHelpSystem();

  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const currentStep = currentConfig?.steps[currentStepIndex];

  useEffect(() => {
    if (!isHelpActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    const calculatePosition = () => {
      if (currentStep.targetSelector) {
        const targetElement = document.querySelector(currentStep.targetSelector);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

          let top = rect.top + scrollTop;
          let left = rect.left + scrollLeft;

          // Apply position logic
          switch (currentStep.position) {
            case "top":
              top = rect.top + scrollTop - 20;
              left = rect.left + scrollLeft + rect.width / 2;
              break;
            case "bottom":
              top = rect.bottom + scrollTop + 20;
              left = rect.left + scrollLeft + rect.width / 2;
              break;
            case "left":
              top = rect.top + scrollTop + rect.height / 2;
              left = rect.left + scrollLeft - 20;
              break;
            case "right":
              top = rect.top + scrollTop + rect.height / 2;
              left = rect.right + scrollLeft + 20;
              break;
            default:
              // Center position
              top = rect.top + scrollTop + rect.height / 2;
              left = rect.right + scrollLeft + 20;
          }

          // Apply custom offset
          if (currentStep.offset) {
            top += currentStep.offset.y;
            left += currentStep.offset.x;
          }

          setPosition({ top, left });
          
          // Scroll target into view
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      } else {
        // Default center position
        setPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 200,
        });
      }
    };

    // Add highlight to target element
    if (currentStep.targetSelector) {
      const targetElement = document.querySelector(currentStep.targetSelector);
      if (targetElement) {
        targetElement.classList.add("help-highlight");
        
        // Remove highlight from previous elements
        document.querySelectorAll(".help-highlight").forEach((el) => {
          if (el !== targetElement) {
            el.classList.remove("help-highlight");
          }
        });
      }
    }

    calculatePosition();
    setIsVisible(true);

    // Recalculate position on window resize
    const handleResize = () => calculatePosition();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isHelpActive, currentStep]);

  // Clean up highlights when help is closed
  useEffect(() => {
    if (!isHelpActive) {
      document.querySelectorAll(".help-highlight").forEach((el) => {
        el.classList.remove("help-highlight");
      });
    }
  }, [isHelpActive]);

  if (!isHelpActive || !currentConfig || !currentStep || !isVisible) {
    return null;
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === currentConfig.steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-30 z-40 pointer-events-none" />
      
      {/* Help Bubble */}
      <div
        ref={bubbleRef}
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 max-w-sm w-80 pointer-events-auto"
        style={{
          top: position.top,
          left: position.left,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{currentStep.title}</h3>
          </div>
          <button
            onClick={stopHelp}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {currentStep.content}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            {currentConfig.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStepIndex
                    ? "bg-blue-600"
                    : index < currentStepIndex
                    ? "bg-blue-300"
                    : "bg-gray-200"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-2">
              {currentStepIndex + 1} of {currentConfig.steps.length}
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={isLastStep ? stopHelp : nextStep}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? "Finish" : "Next"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles for highlighting */}
      <style jsx global>{`
        .help-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default HelpSystem;
