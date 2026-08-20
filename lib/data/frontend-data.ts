export type Audience = "brands" | "products";

export const brandNavItems = [
  { href: "/", label: "Home" },
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
  if (pathname.startsWith("/p/") || pathname.startsWith("/for-products")) {
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
