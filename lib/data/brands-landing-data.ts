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
      "Products don’t stay the same forever. Formulas evolve, certifications are renewed, and new test reports become available. Brands can update a product’s OriginCard whenever its documents, specifications, or details change, ensuring customers always access the latest information, not just a snapshot from launch day.",
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
    image: "/images/for-brands/how-it-works/verification-step3-updated.webp",
  },
] as const;

export const brandAdvantages = [
  {
    title: "Turn Product Interactions Into Actionable Insights",
    description:
      "Track OriginCard scans, discover which product information gets the most attention, compare engagement across products and markets, and use real customer interaction data to improve how your products are presented.",
    icon: "chart",
  },
  {
    title: "Customers Who Understand Your Product",
    description:
      "OriginCard brings your product claims, ingredients, certifications, and supporting information together in one clear place. Customers can easily access the information they need without searching across packaging, PDFs, websites, and other sources.",
    icon: "eye",
  },
  {
    title: "One Place For Every Record",
    description:
      "Product claims, ingredients, certifications, supporting evidence, and product documents are brought together in one structured place. OriginCard keeps product information organized and accessible, so your team can manage what is presented to customers and keep information up to date as products change.",
    icon: "database",
  },
  {
    title: "Organize Claims, Access Information Faster",
    description:
      "When a claim needs supporting information, OriginCard brings the relevant documentation together in one place. Your team can quickly find the information associated with each product claim, making it easier to review, present, and update product information when needed.",
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
    description: "A scannable QR code that opens the product's OriginCard instantly. ",
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
    title: "Supporting Documents",
    description: "Attach supporting documents directly to each product.",
    icon: "/images/for-brands/features/feature-lab-reports.webp",
  },
  {
    title: "Product Information",
    description: "Keep product information current as product details and documents change.",
    icon: "/images/for-brands/features/feature-batch.webp",
  },
  {
    title: "Product Content",
    description: "Add product details, descriptions, and information for customers.",
    icon: "/images/for-brands/features/feature-story.webp",
  },
  {
    title: "Customer Insights",
    description: "Understand how customers interact with your product information.",
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

