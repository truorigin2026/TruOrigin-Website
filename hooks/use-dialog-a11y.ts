"use client";

import { useEffect, useRef, type RefObject } from "react";

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
 * While `open`: makes everything outside the panel `inert` (so it's
 * genuinely unreachable, not just visually obscured), moves focus into the
 * panel, traps Tab/Shift+Tab cycling within its focusable elements, closes
 * on Escape, and restores focus to whatever was focused before the panel
 * opened once it closes.
 *
 * The `inert` step isn't redundant with the Tab-trap below -- confirmed
 * directly, with a real keyboard-interaction test (tests/e2e/
 * dialog-keyboard.spec.ts) against real WebKit: a plain keydown-based trap
 * alone was not reliable there. The very first Tab press from the panel's
 * first link jumped straight to a background form input several elements
 * away, skipping every other link in the panel entirely and never
 * triggering the trap's own preventDefault at all. `inert` sidesteps that
 * entirely: with every other focusable thing on the page genuinely inert,
 * there is nothing left for *any* Tab-order algorithm to land on except
 * what's inside the panel.
 *
 * Separately, this hook also force-adds tabindex="0" to every plain <a>
 * inside the panel while open. This is a real, documented macOS/iOS Safari
 * default, not a bug in this app: Safari's native Tab key only cycles
 * through form controls, never plain links, unless the user has "Full
 * Keyboard Access" (macOS) or "Press Tab to highlight each item on a
 * webpage" (Safari's own Advanced preferences) turned on -- confirmed
 * directly, and consistent with long-documented, widely-reported Safari
 * behavior going back years. Both of this hook's panels are built almost
 * entirely out of <Link>s with no native form controls at all, so without
 * this, the trap above has nothing of the panel's own content to receive
 * focus via the Tab key at all on that engine, regardless of `inert`.
 * Explicit tabindex="0" overrides that per-element default on every
 * browser (confirmed directly: the exact same Tab sequence that
 * previously bounced straight to body/the trigger button now correctly
 * cycles through every link and wraps at both ends). A MutationObserver
 * re-applies this to anything added to the panel later -- e.g. the
 * drawer's own expand/collapse submenus reveal new links well after
 * open, and confirmed directly that without this, those specific links
 * were silently unreachable via Tab on WebKit (the one-time pass above
 * only ever sees what exists at the moment the dialog opens).
 *
 * Attach the returned ref to the panel's own root element (it needs
 * `tabIndex={-1}` as a fallback focus target for when the panel happens to
 * render with no focusable child yet).
 *
 * `triggerRef`, if given, is excluded from the inert-ing above. Both of
 * this hook's current callers reuse the SAME element as both the open and
 * close control (one button whose accessible name/behavior flips) -- if
 * that button's own container got marked inert along with everything else
 * outside the panel, the button would become genuinely unclickable while
 * open, breaking the "click it again to close" interaction a mouse/touch
 * user relies on (confirmed directly: this broke an existing, previously-
 * passing regression test before this parameter was added).
 */
export function useDialogA11y<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  triggerRef?: RefObject<HTMLElement | null>,
) {
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

    const container = containerRef.current;
    if (!container) return;

    // Walk up from the panel to <body>, marking every sibling along the
    // way inert -- the standard non-portal technique for scoping
    // interactivity to one subtree. Collected up front so the exact same
    // set gets un-inerted on close, regardless of any later DOM changes.
    const trigger = triggerRef?.current ?? null;
    const madeInert: HTMLElement[] = [];
    let node: HTMLElement | null = container;
    while (node && node !== document.body) {
      const parent: HTMLElement | null = node.parentElement;
      if (parent) {
        for (const sibling of Array.from(parent.children)) {
          if (
            sibling !== node &&
            sibling instanceof HTMLElement &&
            !sibling.hasAttribute("inert") &&
            !(trigger && sibling.contains(trigger))
          ) {
            sibling.setAttribute("inert", "");
            madeInert.push(sibling);
          }
        }
      }
      node = parent;
    }

    // Force plain links into the Tab sequence on engines that exclude
    // them from it by default (see the Safari note above). Only touches
    // <a> elements that don't already have an explicit tabindex, and only
    // ones without an href wouldn't already match FOCUSABLE_SELECTOR
    // anyway, so this can't make something newly focusable that wasn't
    // meant to be.
    const tabIndexedLinks: HTMLAnchorElement[] = [];
    function tabIndexNewLinks(root: ParentNode) {
      for (const link of Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
        if (!link.hasAttribute("tabindex")) {
          link.setAttribute("tabindex", "0");
          tabIndexedLinks.push(link);
        }
      }
    }
    tabIndexNewLinks(container);

    // The drawer has its own expand/collapse submenus (openMobileGroup in
    // site-header.tsx) that reveal new <a> elements well after the dialog
    // already opened -- confirmed directly that links revealed this way
    // never got the pass above and were genuinely unreachable via Tab on
    // WebKit, since nothing re-ran it. A MutationObserver re-applies the
    // same treatment to anything added while the dialog stays open,
    // without the hook needing to know anything about that caller-specific
    // state.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const added of Array.from(mutation.addedNodes)) {
          if (!(added instanceof HTMLElement)) continue;
          // querySelectorAll only matches descendants, not the node
          // itself -- cover both in case a <Link> is ever added directly
          // rather than inside a wrapper.
          if (added.matches("a[href]") && !added.hasAttribute("tabindex")) {
            added.setAttribute("tabindex", "0");
            tabIndexedLinks.push(added as HTMLAnchorElement);
          }
          tabIndexNewLinks(added);
        }
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? container).focus();

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
      observer.disconnect();
      for (const el of madeInert) el.removeAttribute("inert");
      for (const link of tabIndexedLinks) link.removeAttribute("tabindex");
      previouslyFocusedRef.current?.focus();
    };
    // triggerRef itself (the ref object, not its .current) has stable
    // identity across renders for any caller using useRef(), so listing
    // it here doesn't cause extra effect runs -- unlike onCloseRef's
    // function identity, there's no reason to dodge this one via a ref.
  }, [open, triggerRef]);

  return containerRef;
}
