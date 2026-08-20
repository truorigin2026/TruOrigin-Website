import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ScanLine, Building2, ArrowUpRight } from "lucide-react";
import { FadeIn, HeroReveal } from "@/components/motion";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import logo from "../../public/images/TruOrigin logo.png";

export function SiteGateway() {
  return (
    <div className="gateway-page">
      <section className="gateway-hero">
        <div className="container-shell gateway-hero-inner">
          <HeroReveal>
            <Image src={logo} alt="TruOrigin" className="gateway-hero-logo" priority />
          </HeroReveal>

          <HeroReveal delay={0.05}>
            <VerifiedBadge className="gateway-hero-badge" />
          </HeroReveal>

          <HeroReveal delay={0.1}>
            <h1 className="gateway-hero-title">
              Don&apos;t trust noise.
              <br />
              Trust organized product information.
            </h1>
          </HeroReveal>

          <HeroReveal delay={0.18}>
            <p className="gateway-hero-subtitle">
              TruOrigin is a product information platform. Brands submit claims, supporting
              documents, and product details, and TruOrigin organizes them into a structured
              product page that people can read quickly.
            </p>
          </HeroReveal>
        </div>
      </section>

      <section className="gateway-choice-section">
        <div className="container-shell gateway-choice-grid">
          <FadeIn>
            <Link href="/for-products" className="gateway-choice-card gateway-choice-consumer">
              <div className="gateway-choice-icon">
                <ScanLine size={26} strokeWidth={1.75} />
              </div>
              <p className="gateway-choice-eyebrow">For Consumers</p>
              <h2 className="gateway-choice-title">Review a Product</h2>
              <p className="gateway-choice-copy">
                Scan a QR code or enter a serial number to see a product&apos;s information,
                claims, supporting documents, and origin - clear, structured, and easy to read.
              </p>
              <span className="gateway-choice-cta">
                Open product information
                <ArrowUpRight size={16} strokeWidth={2} />
              </span>
            </Link>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Link href="/for-brands" className="gateway-choice-card gateway-choice-brand">
              <div className="gateway-choice-icon">
                <Building2 size={26} strokeWidth={1.75} />
              </div>
              <p className="gateway-choice-eyebrow">For Brands</p>
              <h2 className="gateway-choice-title">Organize Your Product</h2>
              <p className="gateway-choice-copy">
                Manufacturers and brand teams: submit documents, structure product details, and
                publish a clean OriginCard page your customers can read.
              </p>
              <span className="gateway-choice-cta">
                Explore the workspace
                <ArrowUpRight size={16} strokeWidth={2} />
              </span>
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="gateway-trust-strip">
        <div className="container-shell gateway-trust-inner">
          <div className="gateway-trust-item">
            <ShieldCheck size={20} strokeWidth={1.75} />
            <span>Every claim organized before publication</span>
          </div>
          <div className="gateway-trust-item">
            <ScanLine size={20} strokeWidth={1.75} />
            <span>One scan away from product information, documents &amp; origin</span>
          </div>
        </div>
      </section>
    </div>
  );
}
