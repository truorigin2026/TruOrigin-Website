import Image from "next/image";
import heroImage from "../../../public/images/hero.webp";
import skincareImage from "../../../public/images/for-brands/industries/skincare.jpg";
import foodImage from "../../../public/images/for-brands/industries/food.jpg";
import supplementsImage from "../../../public/images/for-brands/industries/supplements.jpg";
import { BrandHero } from "@/components/brands/brand-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { industries } from "@/lib/data/frontend-data";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";

const industryImages: Record<string, typeof skincareImage> = {
  skincare: skincareImage,
  "food-beverages": foodImage,
  supplements: supplementsImage,
};

export default function IndustriesPage() {
  return (
    <div className="saas-page">
      <BrandHero
        image={heroImage}
        headline="Industries We Serve"
        subheadline="TruOrigin adapts to the unique verification and transparency needs of every product category."
        primaryCta={{ label: "Book Demo", href: "/contact" }}
      />

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Sectors"
            title="Trusted across product categories"
            description="From skincare to electronics, brands use TruOrigin to protect authenticity and build consumer confidence."
            centered
          />

          <div className="industries-page-grid">
            {industries.map((industry, index) => {
              const image = industryImages[industry.slug];
              return (
                <FadeIn key={industry.slug} delay={index * 0.06}>
                  <article className="industry-page-card">
                    <div className="industry-page-card-visual">
                      {image ? (
                        <Image src={image} alt={industry.name} fill className="object-cover" />
                      ) : (
                        <div className={`industry-card-visual bg-gradient-to-br ${industry.gradient} h-full w-full`}>
                          <span className="industry-card-icon">{industry.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="industry-page-card-body">
                      <h3>{industry.name}</h3>
                      <p>{industry.description}</p>
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </div>

          <div className="section-cta-row">
            <PillButton href="/contact" variant="primary" icon={<ArrowIcon />}>
              Discuss Your Industry
            </PillButton>
          </div>
        </div>
      </section>
    </div>
  );
}
