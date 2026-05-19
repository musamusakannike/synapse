"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGSAP(callback: (ctx: gsap.Context) => void, deps: React.DependencyList = []) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      callback(ctx!);
    }, scopeRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}

// Utility to create standard scroll-reveal animations
export function createScrollReveal(
  selector: string,
  options?: {
    y?: number;
    x?: number;
    scale?: number;
    duration?: number;
    stagger?: number;
    start?: string;
  }
) {
  const {
    y = 40,
    x = 0,
    scale = 1,
    duration = 0.8,
    stagger = 0.1,
    start = "top 85%",
  } = options || {};

  gsap.fromTo(
    selector,
    { opacity: 0, y, x, scale },
    {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: selector,
        start,
        toggleActions: "play none none none",
      },
    }
  );
}
