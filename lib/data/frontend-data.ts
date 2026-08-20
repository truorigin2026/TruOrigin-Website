export type Audience = "brands" | "products";

export const brandNavItems = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/industries", label: "Industries" },
  { href: "/contact", label: "Contact" },
] as const;

export const productNavItems = [
  { href: "/for-products/home", label: "Home" },
  { href: "/for-products/products", label: "Products" },
  { href: "/for-products/support", label: "Support" },
  { href: "/for-products/about-verification", label: "About Product Information" },
] as const;

export const landingNavItems = [
  { href: "/for-brands/home", label: "Home" },
  { href: "/for-brands/how-it-works", label: "How It Works" },
  { href: "/for-brands/industries", label: "Industries" },
  { href: "/for-brands/benefits", label: "Benefits" },
  { href: "/for-brands/resources", label: "Resources" },
  { href: "/for-brands/about", label: "About" },
  { href: "/for-brands/contact", label: "Contact" },
] as const;

export type NavDropdownItem = { href: string; label: string };
export type NavGroup = { label: string; items: readonly NavDropdownItem[] };

export const landingNavGroups: readonly NavGroup[] = [
  {
    label: "Company",
    items: [{ href: "/for-brands/about", label: "About Us" }],
  },
  {
    label: "Solutions",
    items: [
      { href: "/for-brands/how-it-works", label: "How It Works" },
      { href: "/for-brands/benefits", label: "Benefits" },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/for-brands/resources/blog", label: "Blogs" },
      { href: "/for-brands/resources/faq", label: "FAQ" },
      { href: "/for-brands/resources/case-studies", label: "Case Studies" },
    ],
  },
] as const;

export const brandFeatures = [
  {
    title: "QR Review",
    description: "Instant product information access through secure, unique QR codes on every unit.",
    icon: "qr",
  },
  {
    title: "Unique Product Identity",
    description: "Every product receives a distinct digital identity tied to its batch and origin.",
    icon: "identity",
  },
  {
    title: "Evidence Repository",
    description: "Centralized storage for supporting documents, notes, and product files.",
    icon: "evidence",
  },
  {
    title: "Consumer Clarity",
    description: "Build confidence with transparent, structured product information at point of purchase.",
    icon: "trust",
  },
  {
    title: "Information Structure",
    description: "Real-time organization against registered product records and serial numbers.",
    icon: "validate",
  },
  {
    title: "Brand Presentation",
    description: "Showcase sourcing, manufacturing, and claims with a premium brand experience.",
    icon: "transparency",
  },
] as const;

export const brandWorkflowSteps = [
  {
    step: 1,
    title: "Brand Registers Product",
    description: "Upload product details, images, claims, and supporting documents to the TruOrigin platform.",
  },
  {
    step: 2,
    title: "Generate Unique QR Code",
    description: "TruOrigin creates a secure, product-specific QR code linked to the product information page.",
  },
  {
    step: 3,
    title: "Attach QR To Product",
    description: "Print or embed the QR on packaging, labels, or product inserts for customer access.",
  },
  {
    step: 4,
    title: "Consumer Scans QR",
    description: "Shoppers scan with any smartphone camera to instantly access the product page.",
  },
  {
    step: 5,
    title: "Product Page Opens",
    description: "A structured page displays product information, origin, certifications, and evidence.",
  },
] as const;

export const industries = [
  {
    name: "Skincare",
    slug: "skincare",
    description: "Ingredient clarity and product information presentation for beauty brands.",
    gradient: "from-emerald-100 to-teal-50",
  },
  {
    name: "Food & Beverages",
    slug: "food-beverages",
    description: "Nutrition labels, sourcing notes, and allergen clarity for food producers.",
    gradient: "from-amber-100 to-orange-50",
  },
  {
    name: "Organic Products",
    slug: "organic",
    description: "Certification records and organic claim presentation for conscious consumers.",
    gradient: "from-lime-100 to-green-50",
  },
  {
    name: "Supplements",
    slug: "supplements",
    description: "Dosage details and evidence summaries for wellness brands.",
    gradient: "from-violet-100 to-purple-50",
  },
  {
    name: "Cosmetics",
    slug: "cosmetics",
    description: "Formula disclosure and product claim presentation for cosmetic lines.",
    gradient: "from-rose-100 to-pink-50",
  },
  {
    name: "Luxury Goods",
    slug: "luxury",
    description: "Anti-counterfeit protection and provenance records for premium products.",
    gradient: "from-stone-200 to-neutral-100",
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Serial number structure and product record presentation for tech products.",
    gradient: "from-sky-100 to-blue-50",
  },
] as const;

export const productFilterCategories = [
  "All Products",
  "Skincare",
  "Food",
  "Beverages",
  "Supplements",
  "Cosmetics",
  "Organic Products",
  "Electronics",
] as const;

export const supportFaqs = [
  {
    question: "How do I open a product page?",
    answer:
      "Scan the QR code on the product packaging with your smartphone camera, or enter the serial number on the product page. You'll be taken to the product information page with full details.",
  },
  {
    question: "What if my serial number is invalid?",
    answer:
      "An invalid serial number may indicate a data entry error or a product record that has not been published. Contact the brand directly through the support form and report the product details.",
  },
  {
    question: "What does Supporting Evidence Provided mean?",
    answer:
      "It means the product page includes supporting documents or notes supplied by the brand, organized into a clearer presentation for customers.",
  },
  {
    question: "How can I contact the brand?",
    answer:
      "Each product page includes brand contact information. You can also use the support form on this page to reach TruOrigin, who will route your inquiry to the appropriate brand.",
  },
] as const;

export const verificationTopics = [
  {
    title: "What is TruOrigin?",
    description:
      "TruOrigin is a product information platform that connects brands with consumers through structured product pages, QR codes, and supporting documents.",
    icon: "platform",
  },
  {
    title: "How QR product pages work",
    description:
      "Each product receives a unique QR code. When scanned, it opens a product page showing information, origin, certifications, and supporting documents.",
    icon: "qr",
  },
  {
    title: "How serial number lookup works",
    description:
      "Enter the product serial number on TruOrigin to cross-reference it against the brand's registered inventory and open the matching product page.",
    icon: "serial",
  },
  {
    title: "Why transparency matters",
    description:
      "Informed consumers make better decisions. Clear product information reduces confusion, builds brand loyalty, and creates accountability across supply chains.",
    icon: "transparency",
  },
  {
    title: "Benefits for consumers",
    description:
      "Instant access to product information, origin details, certifications, and supporting documents - right at the point of purchase or unboxing.",
    icon: "consumer",
  },
  {
    title: "Benefits for brands",
    description:
      "Protect brand reputation, reduce confusion, and demonstrate commitment to transparency with a premium product information experience.",
    icon: "brand",
  },
] as const;

export function getAudienceFromPath(pathname: string): Audience {
  if (
    pathname.startsWith("/products") ||
    pathname.startsWith("/product/") ||
    pathname === "/product" ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/about-verification") ||
    pathname.startsWith("/for-products")
  ) {
    return "products";
  }
  return "brands";
}

export function isHeroPage(pathname: string): boolean {
  return (
    pathname === "/for-brands/home" ||
    pathname === "/for-products/home"
  );
}

export function isGatewayPage(pathname: string): boolean {
  return pathname === "/";
}

export function isBrandsLandingPage(pathname: string): boolean {
  return pathname === "/for-brands";
}

export function mapCategoryToFilter(category: string, subcategory?: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes("skincare") || normalized.includes("sun care") || normalized.includes("personal care")) return "Skincare";
  if (normalized.includes("food")) return "Food";
  if (normalized.includes("drink") || normalized.includes("beverage")) return "Beverages";
  if (normalized.includes("supplement") || normalized.includes("wellness")) return "Supplements";
  if (normalized.includes("cosmetic")) return "Cosmetics";
  if (normalized.includes("organic")) return "Organic Products";
  if (normalized.includes("electronic")) return "Electronics";
  if (subcategory?.toLowerCase().includes("organic")) return "Organic Products";
  return category;
}
