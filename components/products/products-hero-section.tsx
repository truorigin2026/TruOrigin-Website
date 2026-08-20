"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const sideImages = [
  {
    id: "hero-left",
    src: "/images/for-products/for-products-hero-left.webp",
    alt: "Hero product illustration left",
    position: "left",
  },
  {
    id: "hero-right",
    src: "/images/for-products/for-products-hero-right.webp",
    alt: "Hero product illustration right",
    position: "right",
  },
];

const glassCircles = [
  { id: "circle-1", size: 180, left: "12%", top: "14%", opacity: 0.12 },
  { id: "circle-2", size: 120, left: "72%", top: "8%", opacity: 0.1 },
  { id: "circle-3", size: 250, left: "50%", top: "44%", opacity: 0.08 },
  { id: "circle-4", size: 80, left: "18%", top: "72%", opacity: 0.14 },
  { id: "circle-5", size: 140, left: "82%", top: "72%", opacity: 0.09 },
  { id: "circle-6", size: 200, left: "42%", top: "16%", opacity: 0.08 },
];

export function ProductsHeroSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [particleCount, setParticleCount] = useState(60);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const requestRef = useRef<number | null>(null);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, index) => {
      const size = 2 + Math.round(Math.random() * 6);
      const speed = 25 + Math.random() * 40;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const tint = Math.random() < 0.5 ? "#ffffff" : Math.random() < 0.5 ? "#e3f9e8" : "#c8f7d7";
      const opacity = 0.15 + Math.random() * 0.25;
      const duration = 18 + Math.random() * 20;
      return { id: `particle-${index}`, size, speed, left, top, tint, opacity, duration };
    });
  }, [particleCount]);

  const searchPlaceholder = "Search product claims, brands, categories";

  useEffect(() => {
    setMounted(true);
    const updateParticleCount = () => {
      if (window.innerWidth < 640) {
        setParticleCount(20);
      } else if (window.innerWidth < 1024) {
        setParticleCount(36);
      } else {
        setParticleCount(60);
      }
    };

    updateParticleCount();
    window.addEventListener("resize", updateParticleCount, { passive: true });
    return () => window.removeEventListener("resize", updateParticleCount);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    pointerRef.current = {
      x: bounds.width / 2,
      y: bounds.height / 2,
      tx: bounds.width / 2,
      ty: bounds.height / 2,
    };

    const handlePointer = (event: PointerEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      pointerRef.current.tx = event.clientX - rect.left;
      pointerRef.current.ty = event.clientY - rect.top;
    };

    const handleLeave = () => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.tx = rect.width / 2;
      pointerRef.current.ty = rect.height / 2;
    };

    container.addEventListener("pointermove", handlePointer);
    container.addEventListener("pointerleave", handleLeave);

    const animate = () => {
      const state = pointerRef.current;
      state.x += (state.tx - state.x) * 0.08;
      state.y += (state.ty - state.y) * 0.08;
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const offsetX = (state.x - centerX) / centerX;
      const offsetY = (state.y - centerY) / centerY;

      circleRefs.current.forEach((el, index) => {
        if (!el) return;
        const amount = index % 2 === 0 ? 10 : 14;
        const tx = offsetX * amount * 0.35;
        const ty = offsetY * amount * 0.35;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });

      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = `${state.x}px`;
        cursorGlowRef.current.style.top = `${state.y}px`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      container.removeEventListener("pointermove", handlePointer);
      container.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  const createHref = (search: string) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  };

  const navigateToProducts = (search: string) => {
    const href = createHref(search);
    router.push(href);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateToProducts(searchValue);
  };

  return (
    <section className="premium-hero-section relative overflow-hidden">
      <div className="absolute inset-0 premium-hero-gradient" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="premium-hero-wave premium-hero-wave-1" />
        <div className="premium-hero-wave premium-hero-wave-2" />

        <div className="absolute inset-0">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="premium-hero-particle"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                backgroundColor: particle.tint,
                opacity: particle.opacity,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        {glassCircles.map((circle, index) => (
          <span
            key={circle.id}
            ref={(el) => {
              circleRefs.current[index] = el;
            }}
            className="premium-hero-glass-circle"
            style={{
              width: circle.size,
              height: circle.size,
              left: circle.left,
              top: circle.top,
              opacity: circle.opacity,
            }}
          />
        ))}

        <div ref={cursorGlowRef} className="premium-hero-cursor-glow" />
      </div>

      <div ref={containerRef} className="relative mx-auto flex min-h-[780px] max-w-[1480px] items-center justify-center px-6 py-24 sm:px-8 lg:px-12">
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-full bg-white/10 px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.3em] text-white/85 shadow-sm shadow-emerald-950/20 backdrop-blur-lg"
          >
            Claim Intelligence
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-3xl text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl"
          >
            Structured Product Information
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg"
          >
Turn product claims and supporting evidence into structured, accessible product information.          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="premium-hero-search w-full max-w-3xl"
          >
            <label htmlFor="premium-search" className="sr-only">
              Search product claims
            </label>
            <div className="premium-hero-search-box group">
              <Search size={20} className="text-emerald-300" aria-hidden="true" />
              <input
                id="premium-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="premium-hero-search-input"
              />
              <button type="submit" className="premium-hero-search-button">
                Explore claims
              </button>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-white/70">
              <span className="premium-hero-pill">Product insights</span>
              <span className="premium-hero-pill">Regulatory aligned</span>
              <span className="premium-hero-pill">Claim Information</span>
            </div>
          </motion.form>
        </div>

        {mounted && (
          <div className="premium-hero-side-media pointer-events-none hidden w-full lg:block">
            {sideImages.map((image) => (
              <div key={image.id} className={`premium-hero-side-image premium-hero-side-image-${image.position}`}>
                <div className="premium-hero-side-image-frame">
                  <Image src={image.src} alt={image.alt} width={360} height={520} className="object-cover" priority />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
