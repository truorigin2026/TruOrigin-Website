"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Minimal, shared dialog behavior for the two hand-rolled overlay panels on
 * the public site (the mobile nav drawer and the mobile filter sheet) that
 * predate the app's own accessible Sheet/Dialog primitive
 * (components/ui/sheet.tsx) and aren't built on it. Deliberately not a
 * swap to that primitive: both panels have their own framer-motion open/
 * close animation and layout that a primitive swap would have to reproduce
 * or replace wholesale -- a materially bigger change than patching in the
 * missing behavior itself.
 *
 * While `open`: moves focus into the panel, traps Tab/Shift+Tab cycling
 * within its focusable elements, closes on Escape, and restores focus to
 * whatever was focused before the panel opened once it closes.
 *
 * Attach the returned ref to the panel's own root element (it needs
 * `tabIndex={-1}` as a fallback focus target for when the panel happens to
 * render with no focusable child yet).
 */
export function useDialogA11y<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const containerRef = useRef<T | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  // Read through a ref, not the effect's dependency array: `onClose` is
  // commonly a fresh inline arrow function every render in these callers,
  // and depending on it directly would re-run this effect (and so restore
  // focus) on every render while open, not just on an actual open/close
  // transition.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const firstFocusable = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? container)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  return containerRef;
}
