"use client";

import { useEffect, useState } from "react";

/**
 * Bumps by 1 every time this page is restored from the browser's
 * back/forward cache (the `pageshow` event firing with `persisted: true`)
 * — distinct from a tab merely being backgrounded (`visibilitychange`,
 * which some of these components already handle). A WebGL canvas's render
 * loop and GL context don't reliably resume on their own after a bfcache
 * restore (Safari/iOS uses bfcache especially aggressively), so a
 * component with a live canvas should pass this as its `key` to force a
 * clean unmount+remount — a fresh context and render loop — instead of
 * trying to limp along with one that may have gone stale or been lost,
 * which otherwise looks like "the page is broken until I reload" after
 * using the browser's back button.
 */
export function useBfcacheRemountKey(): number {
  const [key, setKey] = useState(0);

  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) setKey((k) => k + 1);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return key;
}
