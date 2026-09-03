export type Audience = "brands" | "products";

export const brandNavItems = [
  { href: "/", label: "Home" },
] as const;

export const productNavItems = [
  { href: "/for-products/home", label: "Home" },
  { href: "/for-products/products", label: "Products" },
  { href: "/for-products/support", label: "Support" },
  { href: "/for-products/how-it-works", label: "About Product Information" },
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
    ],
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
] as const;

export const supportFaqs = [
  {
    question: "How do I access a product’s OriginCard?",
    answer:
      "Scan the product’s QR code or use the available product link to open its OriginCard and explore the information provided by the brand.",
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
      "Each product receives a unique QR code. When scanned, it opens a product page showing information, claims, certifications, and supporting documents.",
    icon: "qr",
  },
  {
    title: "How serial number lookup works",
    description:
      "Enter the product serial number on TruOrigin to cross-reference it against the brand's registered inventory and open the matching product page.",
    icon: "serial",
  },
  {
    title: "Product information, structured",
    description:
      "TruOrigin brings product details, documents, and supporting information together in one organized OriginCard.",
    icon: "transparency",
  },
  {
    title: "Benefits for consumers",
    description:
      "Instant access to product information, claims, ingredients, certifications, and supporting documents - right at the point of purchase or unboxing.",
    icon: "consumer",
  },
  {
    title: "Benefits for brands",
    description:
      "Manage product information in one place, keep it organized, and make it easier for customers to discover the details that matter.",
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

export function mapCategoryToFilter(category: string, subcategory?: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes("skincare") || normalized.includes("sun care") || normalized.includes("personal care")) return "Skincare";
  if (normalized.includes("food")) return "Food";
  if (normalized.includes("drink") || normalized.includes("beverage")) return "Beverages";
  if (normalized.includes("supplement") || normalized.includes("wellness")) return "Supplements";
  if (normalized.includes("cosmetic")) return "Cosmetics";
  if (normalized.includes("organic")) return "Organic Products";
  if (subcategory?.toLowerCase().includes("organic")) return "Organic Products";
  return category;
}
