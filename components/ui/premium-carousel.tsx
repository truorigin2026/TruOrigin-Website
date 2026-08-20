"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PremiumCarouselProps<T> = {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  trackClassName?: string;
  itemClassName?: string;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlayMs?: number;
  ariaLabel?: string;
};

export function PremiumCarousel<T>({
  items,
  renderItem,
  className,
  trackClassName,
  itemClassName,
  showArrows = true,
  showDots = true,
  autoPlayMs,
  ariaLabel = "Carousel",
}: PremiumCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const syncActiveIndex = () => {
      const nextCards = Array.from(track.querySelectorAll<HTMLElement>("[data-carousel-item]"));
      if (!nextCards.length) return;

      const center = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      nextCards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    syncActiveIndex();
    track.addEventListener("scroll", syncActiveIndex, { passive: true });
    return () => track.removeEventListener("scroll", syncActiveIndex);
  }, [items.length]);

  useEffect(() => {
    if (!autoPlayMs || isPaused || items.length < 2) return;

    const timer = window.setInterval(() => {
      scrollToIndex((activeIndex + 1) % items.length);
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [activeIndex, autoPlayMs, isPaused, items.length]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const nextCards = Array.from(track.querySelectorAll<HTMLElement>("[data-carousel-item]"));
    const target = nextCards[index];
    if (!target) return;

    track.scrollTo({
      left: target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const scrollByStep = (direction: -1 | 1) => {
    const nextIndex = (activeIndex + direction + items.length) % items.length;
    scrollToIndex(nextIndex);
  };

  return (
    <div
      className={className}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="premium-carousel-track-wrap">
        {showArrows ? (
          <button
            type="button"
            className="premium-carousel-arrow premium-carousel-arrow-left"
            aria-label={`Previous ${ariaLabel.toLowerCase()} item`}
            onClick={() => scrollByStep(-1)}
          >
            <ChevronLeft size={16} />
          </button>
        ) : null}

        <div ref={trackRef} className={trackClassName}>
          {items.map((item, index) => (
            <div
              key={index}
              className={`${itemClassName ?? ""} ${index === activeIndex ? "is-active" : ""}`.trim()}
              data-carousel-item
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>

        {showArrows ? (
          <button
            type="button"
            className="premium-carousel-arrow premium-carousel-arrow-right"
            aria-label={`Next ${ariaLabel.toLowerCase()} item`}
            onClick={() => scrollByStep(1)}
          >
            <ChevronRight size={16} />
          </button>
        ) : null}
      </div>

      {showDots ? (
        <div className="premium-carousel-dots" aria-label={`${ariaLabel} pagination`}>
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`premium-carousel-dot ${index === activeIndex ? "is-active" : ""}`}
              aria-label={`Go to ${ariaLabel.toLowerCase()} item ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
