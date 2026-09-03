export const statusConfig = {
  "Evidence Available": {
    background: "rgba(34, 104, 73, 0.14)",
    text: "#163e2b",
    dot: "#226849",
    description:
      "The supporting material provided is relevant and clear enough to understand why the claim appears supported.",
  },
  "Limited Evidence": {
    background: "rgba(191, 134, 35, 0.16)",
    text: "#78511a",
    dot: "#bf8623",
    description:
      "Some proof is present, but it still leaves gaps in specificity, recency, or direct product-level relevance.",
  },
  "No Evidence Submitted": {
    background: "rgba(172, 80, 63, 0.14)",
    text: "#82382b",
    dot: "#ac503f",
    description:
      "No supporting material has been submitted for review, so the customer sees the claim without any backing information.",
  },
} as const;

export type StatusLabel = keyof typeof statusConfig;

export type ProductClaim = {
  id?: string;
  text: string;
  status: StatusLabel;
  requiredEvidence: string;
  evidence: string;
};

export type ProductCertificate = {
  id: string;
  title: string;
  issuer: string | null;
  fileUrl: string;
  docType: string;
  verified: boolean;
  reviewNote: string | null;
};

export const certificateDocTypeLabels: Record<string, string> = {
  CERTIFICATE: "Certificate",
  LAB_REPORT: "Lab Report",
  INGREDIENT_LIST: "Ingredient List",
  SOURCING_PROOF: "Sourcing Documentation",
  OTHER: "Document",
};

export type ProductIngredient = {
  id: string;
  name: string;
  note: string | null;
};

export type ProductOriginCard = {
  id: string;
  template: string;
  title: string | null;
  status: string;
  pdfUrl: string | null;
  pngUrl: string | null;
  publishedAt: string | null;
};

export type ProductRecord = {
  id?: string;
  slug: string;
  scanCode: string;
  imageGallery: string[];
  name: string;
  brand: string;
  brandSlug: string;
  brandLogoUrl?: string | null;
  category: string;
  subcategory: string;
  summary: string;
  productNote: string;
  lastUpdated: string;
  claims: ProductClaim[];
  certificates?: ProductCertificate[];
  ingredients?: ProductIngredient[];
  originCard?: ProductOriginCard | null;
};

export type BrandRecord = {
  slug: string;
  name: string;
  label: string;
  summary: string;
  productCount: number;
  products: string[];
};

export const sampleProducts: ProductRecord[] = [];

export const sampleBrand: BrandRecord = {
  slug: "northstar-labs",
  name: "Northstar Labs",
  label: "Featured Brand",
  summary:
    "Northstar Labs is a sample skincare brand used to show how TruOrigin groups multiple products under one transparent, evidence-led brand experience.",
  productCount: sampleProducts.length,
  products: sampleProducts.map((product) => product.slug),
};

export const workflowSteps = [
  {
    title: "Claim capture",
    text: "The brand submits core claims, product basics, and supporting files in one structured intake.",
  },
  {
    title: "Evidence review",
    text: "TruOrigin maps each claim to the evidence type that would make it understandable to a shopper.",
  },
  {
    title: "Clarity status",
    text: "Each claim receives a visibility status so the customer can see what is supported and what still lacks proof.",
  },
  {
    title: "QR delivery",
    text: "A simple scan opens the product page instantly at the point of purchase or in paid media.",
  },
];

export const productCategories = [
  "All Categories",
  "Healthcare",
  "Men's Wear",
  "Unisex Wear",
  "Women's Wear",
  "Food Products",
  "Drinks",
  "Packaged Products",
  "Supplements",
  "Skincare",
  "Sun Care",
  "Wellness",
  "Personal Care",
];

export const publicProductCollection: ProductRecord[] = [];

export const useCaseArticles = [
  {
    slug: "skincare-claims-that-need-clarity",
    title: "Skincare claims that need context, not louder marketing",
    summary:
      "Ingredient-led categories move fast, but shoppers still struggle to connect the front-of-pack promise with real supporting context.",
    accent: "#d5f2df",
    accentStrong: "#4f9d71",
    category: "Skincare",
    alt:
      "Alt text placeholder: editorial card showing skincare bottles beside a claim review layout and supporting tags.",
    bullets: ["INCI decoding", "Sensitive skin wording", "Fragrance-free proof"],
  },
  {
    slug: "food-labels-customers-actually-read",
    title: "Food labels customers actually stop to read",
    summary:
      "For food and packaged goods, clarity matters most when nutrition, additive language, and sourcing claims all compete for space.",
    accent: "#ffe6c8",
    accentStrong: "#cb7c2d",
    category: "Food Products",
    alt:
      "Alt text placeholder: editorial card with pantry products, label details, and a structured review panel for ingredient claims.",
    bullets: ["Nutrition proof", "Ingredient sourcing", "Additive visibility"],
  },
  {
    slug: "supplement-pages-built-for-skeptical-buyers",
    title: "Supplement pages built for skeptical buyers",
    summary:
      "The strongest supplement experiences do not oversell. They show dosage logic, evidence types, and what still needs more support.",
    accent: "#efe3ff",
    accentStrong: "#7b5db6",
    category: "Supplements",
    alt:
      "Alt text placeholder: editorial card with supplement packaging, dosage notes, and status markers for claim support.",
    bullets: ["Dosage context", "Benefit wording", "Evidence strength"],
  },
  {
    slug: "cosmetic-claims-with-less-noise",
    title: "Cosmetic claims with less noise and better explanation",
    summary:
      "Cosmetic pages win trust when marketing language is translated into a calmer, more structured reading experience.",
    accent: "#ffd8df",
    accentStrong: "#c16274",
    category: "Personal Care",
    alt:
      "Alt text placeholder: editorial card with cosmetic packshots, shade elements, and claim cards arranged like a blog feature.",
    bullets: ["Usage clarity", "Performance claims", "Document-led updates"],
  },
];

export const brandOnboardingChecklist = [
  "Brand legal name and operating contact details",
  "Unique username and verified work email",
  "Strong password with live strength indicator",
  "Phone number for recovery and security alerts",
  "Product basics, product images, and claim statements",
  "Supporting evidence files routed to admin review",
];

export const brandWorkflowTimeline = [
  {
    title: "Brand signup and verification",
    text: "The brand creates an account, verifies the email, and confirms recovery details before entering the workspace.",
  },
  {
    title: "Product and document submission",
    text: "Products, product images, claims, and supporting documents are uploaded into a structured intake flow.",
  },
  {
    title: "Admin review and evidence mapping",
    text: "TruOrigin reviewers assess completeness, assign visibility status, and refine customer-facing evidence summaries.",
  },
  {
    title: "Approval, QR generation, and publishing",
    text: "Approved products receive a public page, a generated QR reference, and placement in the product catalog.",
  },
];

export const clarityPoints = [
  {
    title: "Product clarity is our priority",
    text: "We turn scattered ingredient sheets, test summaries, and certification documents into a calmer customer-facing explanation.",
  },
  {
    title: "Neutral, not noisy",
    text: "The interface avoids overclaiming. It separates what is backed, what is partial, and what is still missing.",
  },
  {
    title: "Fast at shelf level",
    text: "The strongest experience happens in seconds, not after opening five tabs or reading legal footnotes.",
  },
];

export const chooseReasons = [
  {
    title: "Built for trust",
    text: "The product page feels editorial and deliberate instead of promotional, which helps customers believe the presentation.",
    tone: "forest",
  },
  {
    title: "Designed for real shoppers",
    text: "Important phrases, statuses, and next actions are easier to spot, which reduces friction during a buying decision.",
    tone: "sand",
  },
  {
    title: "Ready for QR moments",
    text: "From packaging to paid ads, the same product page can become a reusable evidence layer wherever the claim appears.",
    tone: "clay",
  },
  {
    title: "Flexible for brands",
    text: "One brand can manage multiple products while keeping each claim page consistent, current, and easy to update.",
    tone: "mist",
  },
];

export function findProductBySlug(slug: string) {
  return sampleProducts.find((product) => product.slug === slug);
}

export function findProductByScanCode(scanCode: string) {
  return sampleProducts.find((product) => product.scanCode === scanCode);
}
