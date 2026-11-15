"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";

/**
 * No page-transition fade wrapper here on purpose. Two different
 * AnimatePresence configurations (mode="popLayout", then mode="wait")
 * both caused real, confirmed-live navigation failures: popLayout left a
 * stuck outgoing layer that padded the scrollable area and pushed new
 * content below the fold; mode="wait" could leave the incoming page
 * never mounting at all (a fully blank page) when its exit-completion
 * tracking didn't resolve across a real client-side route change. Pages
 * now mount directly, with no exit-animation dependency of any kind, so
 * this whole failure class can't happen again. Individual pages/sections
 * (e.g. HeroReveal, FadeIn) still animate in on their own -- only the
 * route-level crossfade was removed.
 */

const chromeHiddenPrefixes = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/account",
  "/admin",
  "/brand",
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAudienceHome = pathname === "/for-brands/home" || pathname === "/for-products/home";
  const hideChrome =
    pathname === "/" ||
    chromeHiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (hideChrome) {
    return (
      <main id="main-content" className="relative z-10">
        {children}
      </main>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-to-content-link">
        Skip to main content
      </a>
      <SmoothScroll />
      <SiteHeader />
      <main
        id="main-content"
        className={`relative z-10 overflow-clip ${isAudienceHome ? "" : "site-content-with-header"}`}
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
