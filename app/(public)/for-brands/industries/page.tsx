import Image from "next/image";
import heroImage from "../../../../public/images/hero.webp";
import skincareImage from "../../../../public/images/for-brands/industries/skincare.jpg";
import foodImage from "../../../../public/images/for-brands/industries/food.jpg";
import supplementsImage from "../../../../public/images/for-brands/industries/supplements.jpg";
import organicImage from "../../../../public/images/for-brands/industries/organic.jpg";
import cosmeticsImage from "../../../../public/images/for-brands/industries/cosmetics.jpg";
import luxuryImage from "../../../../public/images/for-brands/industries/luxury.jpg";
import { BrandHero } from "@/components/brands/brand-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";

const industryDetails = [
  {
    name: "Skincare & Beauty",
    image: skincareImage,
    description:
      "Ingredient sourcing, dermatology testing, and cruelty-free claims are the first things skincare shoppers check before buying.",
    commonClaims: ["Dermatologist Tested", "Cruelty-Free", "Fragrance-Free"],
    evidenceTypes: ["Lab Report", "Certification"],
  },
  {
    name: "Food & Beverage",
    image: foodImage,
    description:
      "Nutrition accuracy, allergen disclosure, and sourcing transparency matter most when customers are deciding what to eat.",
    commonClaims: ["Non-GMO", "Locally Sourced", "Allergen-Free"],
    evidenceTypes: ["Lab Report", "Sourcing Proof"],
  },
  {
    name: "Supplements & Wellness",
    image: supplementsImage,
    description:
      "Potency testing and manufacturing standards are the difference between a trusted supplement brand and a skipped-over one.",
    commonClaims: ["Third-Party Tested", "GMP Certified", "Clinically Studied"],
    evidenceTypes: ["Lab Report", "Certification"],
  },
  {
    name: "Organic Products",
    image: organicImage,
    description:
      "Organic claims carry regulatory weight — customers expect to see the certifying body, not just the word on the label.",
    commonClaims: ["USDA Organic", "EU Organic", "Non-Toxic"],
    evidenceTypes: ["Certification", "Sourcing Proof"],
  },
  {
    name: "Cosmetics",
    image: cosmeticsImage,
    description:
      "Formula disclosure and cruelty-free status are the top trust signals for cosmetics shoppers comparing similar products.",
    commonClaims: ["Vegan Formula", "Cruelty-Free", "Reef-Safe"],
    evidenceTypes: ["Ingredient List", "Certification"],
  },
  {
    name: "Luxury Goods",
    image: luxuryImage,
    description:
      "Provenance and anti-counterfeit protection are what luxury buyers pay a premium for — TruOrigin makes that provable, not just promised.",
    commonClaims: ["Authentic Materials", "Limited Batch", "Handmade"],
    evidenceTypes: ["Certification", "Sourcing Proof"],
  },
];

export default function ForBrandsIndustriesPage() {
  return (
    <div className="saas-page">
      <BrandHero
        image={heroImage}
        headline="Industries We Serve"
        subheadline="TruOrigin adapts to the unique verification and transparency needs of every product category."
        primaryCta={{ label: "Book Demo", href: "/for-brands/contact" }}
      />

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Sectors"
            title="Trusted across product categories"
            description="From skincare to luxury goods, brands use TruOrigin to protect authenticity and build consumer confidence — with evidence types tailored to what each category's customers actually check."
            centered
          />

          <div className="industries-page-grid">
            {industryDetails.map((industry, index) => (
              <FadeIn key={industry.name} delay={index * 0.06}>
                <article className="industry-page-card">
                  <div className="industry-page-card-visual">
                    <Image src={industry.image} alt={`${industry.name} products verified on TruOrigin`} fill className="object-cover" />
                  </div>
                  <div className="industry-page-card-body">
                    <h3>{industry.name}</h3>
                    <p>{industry.description}</p>
                    <div className="industry-tag-row">
                      {industry.commonClaims.map((claim) => (
                        <span key={claim} className="industry-tag">
                          {claim}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">
                      Typical evidence: {industry.evidenceTypes.join(", ")}
                    </p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>

          <div className="section-cta-row">
            <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
              Discuss Your Industry
            </PillButton>
          </div>
        </div>
      </section>
    </div>
  );
}
