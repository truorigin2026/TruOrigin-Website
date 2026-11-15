"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FadeIn, HeroReveal } from "@/components/motion";
import { ShaderErrorBoundary } from "@/components/gateway/shader-error-boundary";
import { useBfcacheRemountKey } from "@/lib/use-bfcache-remount";
import logo from "../../public/images/logos/truorigin-logo.svg";

const GatewayShaderBackground = dynamic(
  () => import("@/components/gateway/gateway-shader-background").then((mod) => mod.GatewayShaderBackground),
  { ssr: false },
);

/**
 * The shader is a real-time WebGL/Three.js render — on a weak GPU or a
 * reduced-motion preference it's slow to compile/first-paint and keeps
 * costing CPU/GPU for as long as the page is open. `.gateway-page` already
 * has a static CSS gradient behind this layer as its own background, so
 * skipping the shader is a complete, intentional fallback, not a broken
 * state. hardwareConcurrency is a widely-supported, no-permission signal;
 * it's a coarse proxy for device capability, not a precise GPU benchmark,
 * but it's safe to run on every device and errs toward skipping the
 * heavy path rather than risking it.
 */
function useShouldRenderShader() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowCoreCount = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
    setShouldRender(!prefersReducedMotion && !lowCoreCount);
  }, []);

  return shouldRender;
}

export function SiteGateway() {
  const [bgRevealed, setBgRevealed] = useState(false);
  const bfcacheKey = useBfcacheRemountKey();
  const shouldRenderShader = useShouldRenderShader();

  return (
    <div className="gateway-page">
      <div className={`gateway-shader-bg${bgRevealed ? " is-revealed" : ""}`} aria-hidden="true">
        {shouldRenderShader && (
          <ShaderErrorBoundary key={bfcacheKey}>
            <GatewayShaderBackground onReady={() => setBgRevealed(true)} />
          </ShaderErrorBoundary>
        )}
      </div>

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
