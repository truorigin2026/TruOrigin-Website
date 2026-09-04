/** Image paths under /public — upload assets to these locations. */
export const brandAssets = {
  logo: "/images/for-brands/logos/truorigin-logo.svg",
  logoFooter: "/images/for-brands/logos/truorigin-logo.svg",
  heroMockup: "/images/for-brands/hero/hero-mockup-composite.png",
  checkmark: "/images/for-brands/icons/checkmark.svg",
  flowDiagram: "/images/for-brands/what-is/flow-diagram.png",
  footerBannerBg: "/images/for-brands/cta/footer-banner-bg.jpg",
  benefitsChart: "/images/for-brands/benefits/benefits.webp",
} as const;

export const brandHeroNavItems = [
  { href: "#what-is-origincard", label: "What is OriginCard" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#why-choose-us", label: "Why Choose Us" },
  { href: "#industries", label: "Industries" },
  { href: "#benefits-for", label: "Benefits" },
] as const;

export const whyTruOriginPoints = [
  {
    title: "All Your Product Information, In One Place",
    description:
      "Every product gets its own OriginCard bringing together product details, claims, ingredients, certifications, supporting documents, test reports and in one structured place. Brands can manage and update their product information in one place, and customers can explore it all in one clear experience.",
  },
  {
    title: "Structured for Clarity",
    description:
      "TruOrigin brings claims, ingredients, certifications, supporting documents, specifications and product details into a structured OriginCard giving brands one organised place to manage product information and customers a clearer way to explore it. ",
  },
  {
    title: "Easy to Explore",
    description:
      "A single scan is all it takes for a customer to open a product's OriginCard and explore what matters to them, whether that's claims, ingredients, certifications, or test results, through a simple, guided experience. There is no app to download and no digging through packaging, just clear information a tap away.",
  },
  {
    title: "Built to Evolve",
    description:
      "Products don’t stay the same forever. Formulas evolve, certifications are renewed, and new test reports become available. Brands can update a product’s OriginCard whenever its documents, specifications, or details change, ensuring customers always ensuring customers always access the latest information,, not just a snapshot from launch day.",
  },
] as const;

export const quickVerifySteps = [
  {
    title: "Find the OriginCard",
    description:
      "Every product can carry an OriginCard QR on its packaging or label, making its product information easy to access.",
    icon: "qrcode",
    image: "/images/for-brands/how-it-works/verification-step1.webp",
  },
  {
    title: "Scan With Any Phone",
    description:
      "No app to download. Scan the QR code with your phone camera to open the product's OriginCard.",
    icon: "scan",
    image: "/images/for-brands/how-it-works/verification-step2.webp",
  },
  {
    title: "Explore the Product Information",
    description:
      "Access product details, ingredients, certifications, supporting documents, test reports, and other information in one structured place.",
    icon: "check",
    image: "/images/for-brands/how-it-works/verification-step3.webp",
  },
] as const;

export const brandAdvantages = [
  {
    title: "Real Engagement Insights                  ",
    description:
      "See exactly how customers interact with every product across every market you sell in. Track scan volumes, geography, and repeat verifications from one dashboard. Spot which claims get checked most often and where questions still linger. Compare performance across SKUs, batches, and regions over time. Decisions are backed by real behavior, not guesswork.",
    icon: "chart",
  },
  {
    title: "Customers Who Actually Understand",
    description:
      "Every OriginCard presents ingredients, origin, and certifications the same clear way every time. Customers no longer have to dig through packaging or hunt for fine print to find what matters. Complex sourcing and lab data are translated into a simple, guided digital experience. Shoppers walk away understanding exactly what they bought and why it matters. That clarity builds confidence long before the next purchase decision.",
    icon: "eye",
  },
  {
    title: "One Place For Every Record",
    description:
      "Specs, certifications, lab reports, and claims live in a single structured OriginCard instead of scattered files and inboxes. Every document is versioned, dated, and tied directly to the product it belongs to. When formulas change or certifications renew, the record updates instead of multiplying. Your team always knows exactly where the current truth lives. Auditors, partners, and customers all see the same shared source.",
    icon: "database",
  },
  {
    title: "Defend Claims, Decide Faster",
    description:
      "When a claim is challenged, the documentation is already attached, dated, and ready to show. There is no scramble through email threads or shared drives to find the right document. That same structured data reveals patterns across products, batches, and markets. Your team can spot what is working and what needs attention sooner. Faster answers mean faster, more confident decisions.",
    icon: "scale",
  },
] as const;

export const howItWorksSteps = [
  {
    step: 1,
    title: "Create Product",
    description: "Add your product details, ingredients, specifications, documents, and other relevant information to TruOrigin.",
    icon: "/images/for-brands/how-it-works/step-1.svg",
  },
  {
    step: 2,
    title: "Structure & Manage",
    description: "TruOrigin organizes the information into a structured OriginCard that brands can manage and update.",
    icon: "/images/for-brands/how-it-works/step-2.svg",
  },
  {
    step: 3,
    title: "Present Through OriginCard",
    description: "The OriginCard presents the product information in a clear, customer-facing format that can be accessed through the product.",
    icon: "/images/for-brands/how-it-works/step-3.svg",
  },
  {
    step: 4,
    title: "Customer Access",
    description: "Customers access the OriginCard through the product and explore its structured information.",
    icon: "/images/for-brands/how-it-works/step-4.svg",
  },
  {
    step: 5,
    title: "Product Insights",
    description: "Customers see product status, origin, certifications, and full transparency in one view.",
    icon: "/images/for-brands/how-it-works/step-5.svg",
  },
] as const;

export const trustStats = [
  {
    value: "75%",
    label: "Of consumers scan QR codes to get more information",
    icon: "/images/for-brands/stats/icon-counterfeit.svg",
  },
  {
    value: "57%",
    label: "Of consumers have scanned a food QR code to get specific product information",
    icon: "/images/for-brands/stats/icon-transparency.svg",
  },
  {
    value: "71%",
    label: "Of consumers say QR codes are at least somewhat helpful in their daily lives",
    icon: "/images/for-brands/stats/icon-trust.svg",
  },
  {
    value: "2.7x",
    label: "QR scan volume in 2025 compared with the 2018-2019 pre-pandemic average",
    icon: "/images/for-brands/stats/icon-conversion.svg",
  },
] as const;

export const originCardFeatures = [
  {
    title: "Product Identity",
    description: "OriginCard gives each product a structured identity, connecting its SKU and batch details.",
    icon: "/images/for-brands/features/feature-identity.webp",
  },
  {
    title: "QR Access",
    description: "A scannable QR code that opens the product's OriginCard instantly.",
    icon: "/images/for-brands/features/feature-qr.webp",
  },
  {
    title: "Product Information",
    description: "Explore product details, origin, ingredients, and supporting information in one place.",
    icon: "/images/for-brands/features/feature-origin.webp",
  },
  {
    title: "Certifications",
    description: "View certifications and supporting documents linked to the product.",
    icon: "/images/for-brands/features/feature-certifications.webp",
  },
  {
    title: "Lab Reports",
    description: "Attach testing results and quality documentation directly to each product.",
    icon: "/images/for-brands/features/feature-lab-reports.webp",
  },
  {
    title: "Product Updates",
    description: "Keep product details current as formulations, certifications, and documents change.",
    icon: "/images/for-brands/features/feature-batch.webp",
  },
  {
    title: "Brand Story",
    description: "Tell your brand's story and values to build connection with customers.",
    icon: "/images/for-brands/features/feature-story.webp",
  },
  {
    title: "Analytics Dashboard",
    description: "Track scans, engagement, and review trends across your product line.",
    icon: "/images/for-brands/features/feature-analytics.webp",
  },
] as const;

export const servedIndustries = [
  { name: "Skincare", image: "/images/for-brands/industries/skincare.jpg" },
  { name: "Food", image: "/images/for-brands/industries/food.jpg" },
  { name: "Supplements", image: "/images/for-brands/industries/supplements.jpg" },
  { name: "Organic", image: "/images/for-brands/industries/organic.jpg" },
  { name: "Cosmetics", image: "/images/for-brands/industries/cosmetics.jpg" },
  { name: "Luxury", image: "/images/for-brands/industries/luxury.jpg" },
] as const;

export const brandBenefits = [
  "Organize Product Information in One Place",
  "Keep Product Details Clear and Structured",
  "Make Claims and Supporting Documents Easy to Access",
  "Simplify Product Information Management",
  "Understand How Customers Explore Products",
  "Give Every Product a Dedicated OriginCard",
] as const;

export const customerBenefits = [
  "Find Product Information in One Place",
  "Understand Product Claims More Easily",
  "Access Supporting Documents in One Place",
  "Explore Product Details More Easily",
  "Get the Information You Need Before Buying",
  "Explore the Full Story Behind a Product",
] as const;

