/** Image paths under /public — upload assets to these locations. */
export const brandAssets = {
  logo: "/images/for-brands/logos/truorigin-logo.svg",
  logoFooter: "/images/for-brands/logos/truorigin-logo.svg",
  heroBackground: "/images/for-brands/hero/hero-bg.png",
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

export const whatIsFeatures = [
  {
    icon: "layers",
    title: "One OriginCard Per Product",
    description:
      "Each product gets a dedicated OriginCard containing its relevant information in one place.",
  },
  {
    icon: "qr-code",
    title: "Every Unit, Individually Verified",
    description:
      "Each unit carries its own secure QR code, so authenticity is confirmed down to the individual item, not just the product line.",
  },
  {
    icon: "smartphone",
    title: "Made for Customers",
    description:
      "Customers can scan a QR code to explore the product's information through a simple digital experience.",
  },
] as const;

export const whyTruOriginPoints = [
  {
    title: "All Your Product Information, In One Place",
    description:
      "Every product gets its own OriginCard, a structured record bringing together details, documents, certifications, test reports, ingredients, and sourcing information. Instead of proof being scattered across PDFs, emails, and disconnected pages, brands maintain one authoritative record, giving everyone a clear, complete, and up-to-date view of the product.",
  },
  {
    title: "Structured for Clarity",
    description:
      "Raw product information rarely tells a clear story on its own. TruOrigin turns it into a consistent, organized format, so certifications, claims, ingredients, and specifications are presented the same way every time, for every product. Whatever the category, customers and brand teams both know exactly where to look and what they are looking at.",
  },
  {
    title: "Easy to Explore",
    description:
      "A single scan is all it takes for a customer to open a product's OriginCard and explore what matters to them, whether that's origin, ingredients, certifications, or test results, through a simple, guided digital experience. There is no app to download and no digging through packaging, just clear information a tap away.",
  },
  {
    title: "Built to Evolve",
    description:
      "Products don’t stay the same forever. Formulas evolve, certifications are renewed, and new test reports become available. Brands can update a product’s OriginCard whenever its documents, specifications, or details change, ensuring customers always see the most current information, not just a snapshot from launch day.",
  },
] as const;

export const quickVerifySteps = [
  {
    title: "Spot The OriginCard",
    description:
      "Every verified product carries a small OriginCard QR on its packaging or label, easy to find before you buy.",
    icon: "qrcode",
    image: "/images/for-brands/how-it-works/verification-step1.webp",
  },
  {
    title: "Scan With Any Phone",
    description:
      "No app to download. Point a camera at the code and the product's verification page opens instantly.",
    icon: "scan",
    image: "/images/for-brands/how-it-works/verification-step2.webp",
  },
  {
    title: "See Every Claim, Verified",
    description:
      "Origin, certifications, and test results appear clearly labeled, so you know exactly what's backed by evidence.",
    icon: "check",
    image: "/images/for-brands/how-it-works/verification-step3.webp",
  },
] as const;

export const brandAdvantages = [
  {
    title: "Real Engagement Insights                  ",
    description:
      "See exactly how customers interact with every product across every market you sell in. Track scan volumes, geography, and repeat verifications from one dashboard. Spot which claims get checked most often and where trust questions still linger. Compare performance across SKUs, batches, and regions over time. Decisions are backed by real behavior, not guesswork.",
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
      "Specs, certifications, lab reports, and claims live in a single structured OriginCard instead of scattered files and inboxes. Every document is versioned, dated, and tied directly to the product it belongs to. When formulas change or certifications renew, the record updates instead of multiplying. Your team always knows exactly where the current truth lives. Auditors, partners, and customers all see the same trusted source.",
    icon: "database",
  },
  {
    title: "Defend Claims, Decide Faster",
    description:
      "When a claim is challenged, the proof is already attached, dated, and ready to show. There is no scramble through email threads or shared drives to find the right document. That same structured data reveals patterns across products, batches, and markets. Your team can spot what is working and what needs attention sooner. Faster answers mean faster, more confident decisions.",
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
    description: "Customers see authenticity status, origin, certifications, and full transparency in one view.",
    icon: "/images/for-brands/how-it-works/step-5.svg",
  },
] as const;

export const trustStats = [
  {
    value: "$1.8 Trillion",
    label: "Lost annually to counterfeit goods globally",
    icon: "/images/for-brands/stats/icon-counterfeit.svg",
  },
  {
    value: "85%",
    label: "Of consumers want product transparency before purchase",
    icon: "/images/for-brands/stats/icon-transparency.svg",
  },
  {
    value: "70%",
    label: "Higher trust when brands provide verifiable proof",
    icon: "/images/for-brands/stats/icon-trust.svg",
  },
  {
    value: "2.5x",
    label: "Increase in repeat purchases with verified products",
    icon: "/images/for-brands/stats/icon-conversion.svg",
  },
] as const;

export const originCardFeatures = [
  {
    title: "Product Identity",
    description: "A unique digital fingerprint for every SKU, batch, and unit you ship.",
    icon: "/images/for-brands/features/feature-identity.webp",
  },
  {
    title: "QR Authentication",
    description: "Secure, tamper resistant codes that open a verified product page instantly.",
    icon: "/images/for-brands/features/feature-qr.webp",
  },
  {
    title: "Origin Tracking",
    description: "Show customers exactly where and how your product was made.",
    icon: "/images/for-brands/features/feature-origin.webp",
  },
  {
    title: "Certifications",
    description: "Display organic, cruelty free, and regulatory certifications with proof.",
    icon: "/images/for-brands/features/feature-certifications.webp",
  },
  {
    title: "Lab Reports",
    description: "Attach testing results and quality documentation directly to each product.",
    icon: "/images/for-brands/features/feature-lab-reports.webp",
  },
  {
    title: "Batch History",
    description: "Full traceability of every batch, from production to distribution, for complete transparency.",
    icon: "/images/for-brands/features/feature-batch.webp",
  },
  {
    title: "Brand Story",
    description: "Tell your brand's story and values to build trust and connection with customers.",
    icon: "/images/for-brands/features/feature-story.webp",
  },
  {
    title: "Analytics Dashboard",
    description: "Track scans, engagement, and verification trends across your product line.",
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

export const coreValues = [
  {
    title: "Enterprise Security",
    description: "Bank grade encryption and tamper proof QR technology protect every product record.",
    icon: "/images/for-brands/values/security.svg",
  },
  {
    title: "Easy Integration",
    description: "Connect with your existing ERP, packaging, and e-commerce workflows in days.",
    icon: "/images/for-brands/values/integration.svg",
  },
  {
    title: "Global Reach",
    description: "Verify the claims of products across 40+ countries with localized verification pages.",
    icon: "/images/for-brands/values/global.svg",
  },
  {
    title: "Real-time Analytics",
    description: "Monitor scan volumes, geographic trends, and customer engagement live from your dashboard.",
    icon: "/images/for-brands/values/analytics.svg",
  },
  {
    title: "Dedicated Support",
    description: "A specialist team helps you onboard, launch, and scale your verification program.",
    icon: "/images/for-brands/values/support.svg",
  },
] as const;

export const testimonials = [
  {
    quote:
      "OriginCard transformed how our customers interact with our products. Scan rates doubled within the first month.",
    name: "Wasim",
    role: "CEO, Xllon",
    avatar: "public/images/for-brands/testimonials/person-1.jpeg",
  },
  {
    quote:
      "We finally have a way to prove our organic certifications at the point of purchase. Counterfeit concerns dropped significantly.",
    name: "Marcus Rivera",
    role: "Founder, Terra Foods",
    avatar: "",
  },
  {
    quote:
      "The analytics alone paid for the platform. We now know exactly which products customers verify most.",
    name: "Priya Sharma",
    role: "Head of Brand, Elevate Wellness",
    avatar: "",
  },
  {
    quote:
      "Our QR verification campaign boosted shopper confidence and repeat purchase by 38% in the first quarter.",
    name: "Aaliyah Mendoza",
    role: "CMO, Verdant Labs",
    avatar: "",
  },
  {
    quote:
      "OriginCard made our supply chain story visible across retail shelves and online, and customers love the transparency.",
    name: "Ethan Wells",
    role: "Operations Director, PureLeaf Naturals",
    avatar: "",
  },
  {
    quote:
      "The simple verification experience turned curious buyers into loyal customers with a stronger brand connection.",
    name: "Nia Patel",
    role: "Founder, Bloom Botanica",
    avatar: "",
  },
] as const;

