"use client";

import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";

/**
 * popLayout keeps the outgoing page mounted and absolutely-positioned on
 * top of the incoming one until its exit animation finishes. If that exit
 * is ever interrupted (confirmed live: happens very often on browser
 * back/forward navigation) the old page's layer never unmounts — it then
 * silently blocks every click on the real page underneath, and its
 * leftover height pads the document's scrollable area past the real
 * footer. useIsPresent flips pointer-events off the instant the exit
 * starts, so a stuck layer can never intercept a click no matter why the
 * exit failed to complete.
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
    return <main className="relative z-10">{children}</main>;
  }

  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main
        className={`relative z-10 overflow-clip ${isAudienceHome ? "" : "site-content-with-header"}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <PageTransitionPane key={pathname}>{children}</PageTransitionPane>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </>
  );
}
