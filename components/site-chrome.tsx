"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/common/site-footer";
import { SiteHeader } from "@/components/common/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";

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
  const hideChrome = chromeHiddenPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (hideChrome) {
    return <main className="relative z-10">{children}</main>;
  }

  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main className={`relative z-10 ${isAudienceHome ? "" : "site-content-with-header"}`}>{children}</main>
      <SiteFooter />
    </>
  );
}
