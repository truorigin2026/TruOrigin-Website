"use client";

import Link from "next/link";
import Image from "next/image";
import { FadeIn, HeroReveal } from "@/components/motion";
import logo from "../../public/images/logos/truorigin-logo.svg";

/**
 * No WebGL/Three.js shader here anymore — it was a real-time render,
 * heavy and slow to first-paint on weaker GPUs (reported live), and its
 * own JS-driven reveal could fail in ways a pure-CSS reveal can't. The
 * background is the same animated gradient everything else on this page
 * already used as the shader's fallback; its corner clip-path reveal
 * (gateway-reveal, in globals.css) runs unconditionally on mount with no
 * JS wait at all, so it can't get stuck, and it works identically on
 * every device/GPU since it's CSS-only. prefers-reduced-motion still
 * shows the full gradient immediately with no wipe (see globals.css).
 */
export function SiteGateway() {
  return (
    <div className="gateway-page">
      <div className="container-shell gateway-inner">
        <HeroReveal>
          <Image src={logo} alt="TruOrigin" className="gateway-logo" priority />
        </HeroReveal>

        <HeroReveal delay={0.1}>
          <h1 className="gateway-subtitle">
            TruOrigin is a product information platform. Brands submit claims, supporting
            documents, and product details, and TruOrigin organizes them into a structured
            product page that people can access and explore.
          </h1>
        </HeroReveal>

        <div className="gateway-choice-grid">
          <FadeIn delay={0.18}>
            <Link href="/for-products" className="gateway-choice-card">
              <p className="gateway-choice-eyebrow">For Consumers</p>
              <h2 className="gateway-choice-title">Explore a Product</h2>
              <p className="gateway-choice-copy">
                Scan a QR code or enter a serial number to see a product&apos;s information,
                claims, supporting documents, and product details, clear, structured, and easy to read.
              </p>
              <span className="gateway-choice-cta">Open product information</span>
            </Link>
          </FadeIn>

          <FadeIn delay={0.26}>
            <Link href="/for-brands" className="gateway-choice-card">
              <p className="gateway-choice-eyebrow">For Brands</p>
              <h2 className="gateway-choice-title">Organize Your Product</h2>
              <p className="gateway-choice-copy">
                Manufacturers and brand teams: submit documents, structure product details, and
                publish a clear OriginCard page your customers can read.
              </p>
              <span className="gateway-choice-cta">Explore the workspace</span>
            </Link>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
