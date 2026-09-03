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

