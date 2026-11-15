"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
};

/**
 * Deliberately Canvas 2D, not WebGL -- the gateway page just had its
 * WebGL/Three.js shader removed entirely for being heavy and slow on weak
 * GPUs (reported live). A modest 2D particle drift is a different order
 * of cost: no shader compilation, no 3D scene, just drawing ~45 circles
 * per frame. Still gated the same way as every other heavy-motion piece
 * in this app (prefers-reduced-motion, low core count) and paused when
 * the tab isn't visible, so it can't cost anything when it isn't seen.
 */
const PARTICLE_COUNT = 45;
const PARTICLE_COUNT_REDUCED = 18;

export function GatewayParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lowCoreCount = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
    const count = lowCoreCount ? PARTICLE_COUNT_REDUCED : PARTICLE_COUNT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId: number | null = null;
    let visible = true;

    const particles: Particle[] = [];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1 + Math.random() * 2.2,
          speed: 12 + Math.random() * 28, // px/sec, left to right
          opacity: 0.15 + Math.random() * 0.35,
        });
      }
    }

    resize();
    seed();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    let lastTime = performance.now();

    function frame(now: number) {
      if (!visible) {
        rafId = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.speed * dt;
        if (p.x > width + 4) {
          p.x = -4;
          p.y = Math.random() * height;
        }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200, 245, 66, ${p.opacity})`;
        ctx!.fill();
      }
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="gateway-particles" aria-hidden="true" />;
}
