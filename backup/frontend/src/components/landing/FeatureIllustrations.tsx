"use client";

import React from "react";

// Illustration 1: Instant Course Generation (A learning path/tree)
export function CourseGenIllustration() {
  return (
    <div className="w-full h-32 flex items-center justify-center relative overflow-hidden bg-[var(--bg-primary)]/40 rounded-xl border border-[var(--border-subtle)] p-4 group-hover:border-[var(--accent-subtle)] transition-colors duration-300">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-radial from-[var(--accent-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <svg
        className="w-full h-full max-w-[200px] relative z-10"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Branching curves (Cubic Bezier for organic feel) */}
        <path
          d="M 25 60 C 65 60, 65 30, 100 30"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-80"
        />
        <path
          d="M 25 60 C 65 60, 65 90, 100 90"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-80"
        />
        <path
          d="M 25 60 H 100"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-40"
        />
        
        {/* Sub-branches */}
        <path
          d="M 100 30 C 130 30, 130 15, 160 15"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-60"
        />
        <path
          d="M 100 30 C 130 30, 130 45, 160 45"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-60"
        />
        <path
          d="M 100 90 C 130 90, 130 75, 160 75"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-60"
        />
        <path
          d="M 100 90 C 130 90, 130 105, 160 105"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-60"
        />

        {/* Nodes (Circles mimicking the app icon style) */}
        {/* Root Node */}
        <circle
          cx="25"
          cy="60"
          r="6"
          fill="var(--accent)"
          className="animate-pulse"
        />
        <circle cx="25" cy="60" r="10" stroke="var(--accent)" strokeWidth="1" className="opacity-30" />

        {/* Mid Nodes */}
        <circle cx="100" cy="30" r="5" fill="var(--accent)" />
        <circle cx="100" cy="90" r="5" fill="var(--accent)" />

        {/* Leaf Nodes */}
        <circle cx="160" cy="15" r="3.5" fill="var(--text-secondary)" />
        <circle cx="160" cy="45" r="3.5" fill="var(--text-secondary)" />
        <circle cx="160" cy="75" r="3.5" fill="var(--text-secondary)" />
        <circle cx="160" cy="105" r="3.5" fill="var(--text-secondary)" />
      </svg>
    </div>
  );
}

// Illustration 2: AI Explanatory Videos (Slides/Videos with nodes)
export function VideosIllustration() {
  return (
    <div className="w-full h-32 flex items-center justify-center relative overflow-hidden bg-[var(--bg-primary)]/40 rounded-xl border border-[var(--border-subtle)] p-4 group-hover:border-[var(--accent-subtle)] transition-colors duration-300">
      <div className="absolute inset-0 bg-radial from-[var(--accent-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <svg
        className="w-full h-full max-w-[200px] relative z-10"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Winding synapse curve through the video frame */}
        <path
          d="M 30 75 C 60 40, 100 90, 130 50 C 145 30, 160 40, 170 45"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-80"
        />

        {/* Outer player box (dashed/minimalist) */}
        <rect
          x="20"
          y="15"
          width="160"
          height="90"
          rx="12"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="opacity-50"
        />

        {/* Nodes along the winding line */}
        <circle cx="30" cy="75" r="4.5" fill="var(--accent)" />
        <circle cx="80" cy="62" r="4.5" fill="var(--accent)" />
        <circle cx="130" cy="50" r="4.5" fill="var(--accent)" />
        <circle cx="170" cy="45" r="4.5" fill="var(--accent)" />

        {/* Play/Brain symbol in center */}
        <g transform="translate(100, 48)">
          <circle cx="0" cy="0" r="16" fill="var(--bg-secondary)" stroke="var(--accent)" strokeWidth="1.5" />
          <polygon
            points="-3,-5 7,0 -3,5"
            fill="var(--accent)"
          />
        </g>
      </svg>
    </div>
  );
}

// Illustration 3: Targeted Practice Quizzes (Interactive questions connected by synapses)
export function QuizzesIllustration() {
  return (
    <div className="w-full h-32 flex items-center justify-center relative overflow-hidden bg-[var(--bg-primary)]/40 rounded-xl border border-[var(--border-subtle)] p-4 group-hover:border-[var(--accent-subtle)] transition-colors duration-300">
      <div className="absolute inset-0 bg-radial from-[var(--accent-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <svg
        className="w-full h-full max-w-[200px] relative z-10"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Synapse curve winding between quiz items */}
        <path
          d="M 35 30 C 70 30, 50 65, 85 65 C 120 65, 100 100, 135 100"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-60"
        />

        {/* Option 1: Unselected */}
        <circle cx="35" cy="30" r="7" stroke="var(--text-muted)" strokeWidth="1.5" />
        <line x1="55" y1="30" x2="165" y2="30" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" className="opacity-40" />

        {/* Option 2: Active & Correct (Synapse node) */}
        <circle cx="85" cy="65" r="7" stroke="var(--accent)" strokeWidth="1.5" fill="var(--accent-subtle)" />
        <path d="M 82 65 L 84 67 L 89 62" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="105" y1="65" x2="165" y2="65" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />

        {/* Option 3: Unselected */}
        <circle cx="135" cy="100" r="7" stroke="var(--text-muted)" strokeWidth="1.5" />
        <line x1="155" y1="100" x2="175" y2="100" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" className="opacity-40" />
      </svg>
    </div>
  );
}

// Illustration 4: Ask Anything (Tutor conversational dialogue with connected ideas)
export function AskTutorIllustration() {
  return (
    <div className="w-full h-32 flex items-center justify-center relative overflow-hidden bg-[var(--bg-primary)]/40 rounded-xl border border-[var(--border-subtle)] p-4 group-hover:border-[var(--accent-subtle)] transition-colors duration-300">
      <div className="absolute inset-0 bg-radial from-[var(--accent-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <svg
        className="w-full h-full max-w-[200px] relative z-10"
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dialogue path connecting two mental spaces */}
        <path
          d="M 50 40 C 90 20, 110 100, 150 80"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-80"
        />

        {/* Left Bubble: Learner Question */}
        <g transform="translate(25, 20)">
          <rect x="0" y="0" width="55" height="30" rx="8" stroke="var(--text-muted)" strokeWidth="1.5" fill="var(--bg-secondary)" />
          {/* Stylized text lines inside */}
          <line x1="10" y1="10" x2="45" y2="10" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" className="opacity-60" />
          <line x1="10" y1="18" x2="35" y2="18" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" className="opacity-60" />
        </g>
        
        {/* Right Bubble: AI Tutor Answer */}
        <g transform="translate(120, 65)">
          <rect x="0" y="0" width="60" height="35" rx="8" stroke="var(--accent)" strokeWidth="1.5" fill="var(--bg-secondary)" />
          {/* Connected synapse nodes inside tutor response */}
          <circle cx="15" cy="18" r="3" fill="var(--accent)" />
          <circle cx="30" cy="18" r="3" fill="var(--accent)" />
          <circle cx="45" cy="18" r="3" fill="var(--accent)" />
          <line x1="18" y1="18" x2="27" y2="18" stroke="var(--accent)" strokeWidth="1" />
          <line x1="33" y1="18" x2="42" y2="18" stroke="var(--accent)" strokeWidth="1" />
        </g>

        {/* Connection nodes on the path */}
        <circle cx="50" cy="40" r="4.5" fill="var(--accent)" />
        <circle cx="100" cy="60" r="6" fill="var(--accent)" className="animate-pulse" />
        <circle cx="150" cy="80" r="4.5" fill="var(--accent)" />
      </svg>
    </div>
  );
}
