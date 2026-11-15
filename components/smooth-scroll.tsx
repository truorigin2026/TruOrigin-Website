"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    // Lenis runs a requestAnimationFrame loop for as long as it's mounted
    // (i.e. every page, site-wide, via site-chrome.tsx). Two groups get no
    // benefit from it and only pay its cost: touch devices already have
    // smooth native momentum scrolling, so intercepting wheel/touch input
    // here just adds main-thread work; and prefers-reduced-motion is an
    // explicit request not to add motion the browser wouldn't otherwise
    // produce. Skip constructing it entirely for both -- not just lower
    // its intensity -- so there's no RAF loop running at all.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion || isCoarsePointer) return;

    const lenis = new Lenis({
      duration: 1.7,
      wheelMultiplier: 0.7,
      touchMultiplier: 1,
      smoothWheel: true,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
