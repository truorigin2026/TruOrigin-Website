import Image from "next/image";
import { FadeIn } from "@/components/motion";
import bannerImage from "../../public/images/banner.webp";

type BrandHeroProps = {
  image: string | { src: string };
  headline: string;
  subheadline: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
  glassCards?: Array<{
    title: string;
    description: string;
    linkLabel?: string;
    linkHref?: string;
    image?: string | { src: string };
    type?: "feature" | "testimonial";
    author?: string;
    role?: string;
  }>;
};

export function BrandHero({
  image,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  glassCards,
  className,
}: BrandHeroProps) {
  return (
    <section className={['brand-hero-section', className].filter(Boolean).join(' ')}>
      <div className="container-shell">
        <div className="brand-hero-frame">
          <div className="brand-hero-media">
            <Image
              src={bannerImage}
              alt=""
              fill
              priority
              className="brand-hero-bg"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            <div className="brand-hero-gradient" />

            <div className="brand-hero-content">
              <FadeIn>
                <h1 className="brand-hero-headline">{headline}</h1>
                <p className="brand-hero-subheadline">{subheadline}</p>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
