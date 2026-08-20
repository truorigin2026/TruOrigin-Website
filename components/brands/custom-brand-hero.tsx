import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion";
import heroBg from "../../public/images/hero.webp";
import serumImage from "@/public/assets/catalog/barrier-serum-1.jpg";
import drinkImage from "@/public/assets/catalog/hydration-drink-1.jpg";

export function CustomBrandHero() {
  return (
    <section className="brand-hero-custom-section">
      <div className="container-shell">
        <div className="brand-hero-custom-frame">
          <Image
            src={heroBg}
            alt="TruOrigin premium hero background"
            fill
            priority
            className="brand-hero-custom-bg"
            sizes="100vw"
          />
          <div className="brand-hero-custom-overlay" />

          <div className="brand-hero-custom-container">
            <div className="brand-hero-custom-grid">
              <div className="hero-left-content">
                <FadeIn>
                  <p className="hero-mini-label">Product clarity platform</p>
                  <h1 className="hero-custom-headline">
                    Make every product claim feel <span className="highlight-text-green">clear</span>.
                  </h1>
                  <p className="hero-custom-subheadline">
                    TruOrigin takes scattered product claims, labels, and proof documents and turns
                    them into a clean experience customers can actually understand.
                  </p>
                  <div className="hero-custom-ctas">
                    <Link href="/login" className="hero-btn-primary">
                      Get Started
                    </Link>
                    <Link href="/for-products" className="hero-btn-secondary">
                      Explore Product View
                    </Link>
                  </div>
                </FadeIn>
              </div>

              <div className="hero-right-content">
                <FadeIn delay={0.15}>
                  <div className="hero-rating-card">
                    <div className="hero-rating-number">4.9</div>
                    <div className="hero-rating-label">Trusted for cleaner claim presentation</div>
                    <div className="hero-avatar-stack">
                      <div className="hero-avatar-fallback bg-emerald-700">A</div>
                      <div className="hero-avatar-fallback bg-amber-600">R</div>
                      <div className="hero-avatar-fallback bg-indigo-600">T</div>
                    </div>
                    <div className="hero-rating-badge-icon">
                      <span className="shield-icon">✦</span>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>

            <div className="hero-bottom-section">
              <FadeIn delay={0.25}>
                <div className="hero-bottom-card card-left">
                  <div className="hero-card-img-wrap">
                    <Image
                      src={serumImage}
                      alt="Barrier Repair Serum"
                      width={120}
                      height={120}
                      className="hero-card-image"
                    />
                  </div>
                  <div className="hero-card-info">
                    <span className="hero-card-category">Skincare</span>
                    <h3 className="hero-card-title">Barrier Repair Serum</h3>
                    <p className="hero-card-text">Claims, evidence cues, and support status in one calm layout.</p>
                    <Link href="/product/northstar-barrier-serum" className="hero-card-link-btn">
                      View details
                    </Link>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="hero-bottom-connective-arrow">
                  <Link href="/for-products" className="hero-connective-circle" aria-label="Explore products">
                    <span className="connective-arrow">↗</span>
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.35}>
                <div className="hero-bottom-card card-right">
                  <div className="hero-card-info">
                    <span className="hero-card-category">Drinks</span>
                    <h3 className="hero-card-title">Focus Hydration Drink</h3>
                    <p className="hero-card-text">Product information arranged so customers can read it faster.</p>
                    <Link href="/product/verde-focus-hydration" className="hero-card-explore-btn">
                      Explore More
                    </Link>
                  </div>
                  <div className="hero-card-img-wrap">
                    <Image
                      src={drinkImage}
                      alt="Focus Hydration Drink"
                      width={120}
                      height={120}
                      className="hero-card-image"
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
