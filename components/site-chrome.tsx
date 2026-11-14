"use client";

import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";

/**
 * Previously used AnimatePresence mode="popLayout", which keeps the
 * outgoing page mounted and overlapping the incoming one until its exit
 * animation finishes. Confirmed live: that exit gets interrupted often
 * enough (rapid navigation, back/forward) that the old page's layer never
 * unmounts — it then blocks clicks on the page underneath and its
 * leftover height pads the document's scrollable area, pushing the real
 * (new) page's content far below the fold until the user scrolls past it.
 * mode="wait" fixes this at the root: the outgoing pane is never rendered
 * at the same time as the incoming one, so there is never a second,
 * possibly-stuck layer to leave behind. useIsPresent is kept as a harmless
 * extra safety net, not the primary fix.
 */
function PageTransitionPane({ children }: { children: React.ReactNode }) {
  const isPresent = useIsPresent();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={{ pointerEvents: isPresent ? "auto" : "none" }}
    >
      {children}
    </motion.div>
  );
}

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
        <AnimatePresence mode="wait" initial={false}>
          <PageTransitionPane key={pathname}>{children}</PageTransitionPane>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </>
  );
}
