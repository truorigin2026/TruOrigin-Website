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
};

export const certificateDocTypeLabels: Record<string, string> = {
  CERTIFICATE: "Certificate",
  LAB_REPORT: "Lab Report",
  INGREDIENT_LIST: "Ingredient List",
  SOURCING_PROOF: "Sourcing Proof",
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

export const sampleProducts: ProductRecord[] = [
  {
    slug: "northstar-barrier-serum",
    scanCode: "TO-NSTAR-SERUM-01",
    imageGallery: [
      "/images/catalog/barrier-serum-1.jpg",
      "/images/catalog/barrier-serum-2.jpg",
      "/images/catalog/barrier-serum-3.jpg",
    ],
    name: "Barrier Repair Serum",
    brand: "Northstar Labs",
    brandSlug: "northstar-labs",
    category: "Skincare",
    subcategory: "Healthcare",
    summary:
      "A compact product claim page that separates confident proof from softer marketing language in a way customers can understand quickly.",
    productNote:
      "Serum product with QR-powered claim visibility for shoppers standing in-store.",
    lastUpdated: "April 9, 2026",
    claims: [
      {
        text: "Dermatologist tested",
        status: "Evidence Available",
        requiredEvidence: "Clinical test summary",
        evidence:
          "A dermatologist-supervised patch test summary was submitted and linked to the production formula.",
      },
      {
        text: "Fragrance free",
        status: "Evidence Available",
        requiredEvidence: "Full ingredient list",
        evidence:
          "The submitted ingredient deck supports the absence of fragrance and parfum additives.",
      },
      {
        text: "Reduces visible redness in 7 days",
        status: "Limited Evidence",
        requiredEvidence: "Product-specific study",
        evidence:
          "A study summary was shared, but the sample size and retail-variant matching details need stronger product-level confirmation.",
      },
    ],
  },
  {
    slug: "northstar-gentle-cleanser",
    scanCode: "TO-NSTAR-CLEAN-02",
    imageGallery: [
      "/images/catalog/gentle-cleanser-1.jpg",
      "/images/catalog/gentle-cleanser-2.jpg",
      "/images/catalog/gentle-cleanser-3.jpg",
    ],
    name: "Gentle Gel Cleanser",
    brand: "Northstar Labs",
    brandSlug: "northstar-labs",
    category: "Skincare",
    subcategory: "Healthcare",
    summary:
      "A clear evidence layout helps the customer see whether the claim language on pack is actually supported by submitted proof.",
    productNote:
      "Product focused on everyday cleansing claims and ingredient-led evidence.",
    lastUpdated: "April 6, 2026",
    claims: [
      {
        text: "Soap free",
        status: "Evidence Available",
        requiredEvidence: "Ingredient list",
        evidence:
          "The reviewed ingredient list does not include traditional soap surfactants used in soap-based formulas.",
      },
      {
        text: "Suitable for sensitive skin",
        status: "Limited Evidence",
        requiredEvidence: "Sensitivity testing",
        evidence:
          "Internal testing notes were provided, but broader third-party sensitivity data was not included.",
      },
      {
        text: "No sulfates",
        status: "Evidence Available",
        requiredEvidence: "Ingredient list",
        evidence:
          "The product ingredient list supports the absence of sulfate-based cleansing agents.",
      },
    ],
  },
  {
    slug: "northstar-daily-spf",
    scanCode: "TO-NSTAR-SPF-03",
    imageGallery: [
      "/images/catalog/daily-spf-1.jpg",
      "/images/catalog/daily-spf-2.jpg",
      "/images/catalog/daily-spf-3.jpg",
    ],
    name: "Daily Mineral SPF 40",
    brand: "Northstar Labs",
    brandSlug: "northstar-labs",
    category: "Sun Care",
    subcategory: "Healthcare",
    summary:
      "Claim-backed product pages create a calmer customer experience by showing the support behind protection and formula claims.",
    productNote:
      "Product centered on sunscreen proof, testing notes, and shopper-facing clarity.",
    lastUpdated: "April 2, 2026",
    claims: [
      {
        text: "Mineral sunscreen",
        status: "Evidence Available",
        requiredEvidence: "Active ingredient listing",
        evidence:
          "The formulation sheet shows zinc oxide as the active UV filter for this product.",
      },
      {
        text: "Broad spectrum SPF 40",
        status: "Evidence Available",
        requiredEvidence: "SPF lab report",
        evidence:
          "An SPF testing summary was submitted showing broad spectrum performance for the retail formula.",
      },
      {
        text: "Reef conscious formula",
        status: "No Evidence Submitted",
        requiredEvidence: "Supporting formulation policy or exclusions",
        evidence:
          "No evidence package was submitted to explain or substantiate the wording of this claim.",
      },
    ],
  },
];

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

export const publicProductCollection: ProductRecord[] = [
  ...sampleProducts,
  {
    slug: "root-ritual-protein-oats",
    scanCode: "TO-RR-OATS-04",
    imageGallery: [
      "/images/catalog/protein-oats-1.jpg",
      "/images/catalog/protein-oats-2.jpg",
    ],
    name: "Protein Oats Mix",
    brand: "Root & Ritual",
    brandSlug: "root-and-ritual",
    category: "Food Products",
    subcategory: "Packaged Products",
    summary:
      "A pantry product page designed to make nutrition, sourcing, and additive explanations faster to understand.",
    productNote:
      "Food product showing ingredient clarity, allergen checks, and packaging-linked evidence.",
    lastUpdated: "April 18, 2026",
    claims: [
      {
        text: "No refined sugar",
        status: "Evidence Available",
        requiredEvidence: "Ingredient deck and nutrition panel",
        evidence:
          "The submitted retail ingredient deck and nutrition label support the absence of refined sugar inputs.",
      },
      {
        text: "High in fiber",
        status: "Limited Evidence",
        requiredEvidence: "Nutrition verification",
        evidence:
          "The product shows a strong fiber number, but the formal nutrition verification file is still pending final upload.",
      },
      {
        text: "Made with whole grain oats",
        status: "Evidence Available",
        requiredEvidence: "Primary ingredient declaration",
        evidence:
          "The main ingredient listing and supplier sheet indicate whole grain oats as the primary base.",
      },
    ],
  },
  {
    slug: "verde-focus-hydration",
    scanCode: "TO-VERDE-DRINK-05",
    imageGallery: [
      "/images/catalog/hydration-drink-1.jpg",
      "/images/catalog/hydration-drink-2.jpg",
    ],
    name: "Focus Hydration Drink",
    brand: "Verde Formulas",
    brandSlug: "verde-formulas",
    category: "Drinks",
    subcategory: "Wellness",
    summary:
      "A beverage claim page that balances benefit-led messaging with ingredient support and formulation context.",
    productNote:
      "Drink product centered on active ingredient transparency and claim wording review.",
    lastUpdated: "April 21, 2026",
    claims: [
      {
        text: "Electrolyte support",
        status: "Evidence Available",
        requiredEvidence: "Formulation sheet",
        evidence:
          "The active blend sheet and product spec list the electrolyte ingredients used in the final formula.",
      },
      {
        text: "No artificial colors",
        status: "Evidence Available",
        requiredEvidence: "Ingredient list",
        evidence:
          "The submitted ingredient deck does not include synthetic color additives for the retail product.",
      },
      {
        text: "Helps improve focus",
        status: "No Evidence Submitted",
        requiredEvidence: "Product-specific support package",
        evidence:
          "No supporting document package has been attached to explain the focus-language used on pack and ads.",
      },
    ],
  },
  {
    slug: "lumera-night-repair-cream",
    scanCode: "TO-LUM-NIGHT-06",
    imageGallery: ["/images/catalog/night-repair-cream-1.jpg", "/images/catalog/night-repair-cream-2.jpg"],
    name: "Night Repair Cream",
    brand: "Lumera Skin",
    brandSlug: "lumera-skin",
    category: "Skincare",
    subcategory: "Personal Care",
    summary: "An overnight cream with a cleaner customer-facing claim structure.",
    productNote: "Night cream page with claims, support notes, and customer clarity.",
    lastUpdated: "May 2, 2026",
    claims: [
      { text: "Barrier support", status: "Evidence Available", requiredEvidence: "Ingredient and study summary", evidence: "Submitted formula notes and supporting study summary indicate barrier-support ingredients in the retail formula." },
      { text: "Suitable for nightly use", status: "Evidence Available", requiredEvidence: "Usage guidance", evidence: "Usage instructions and tolerance notes support nightly-use positioning." },
      { text: "Visible smoother skin", status: "Limited Evidence", requiredEvidence: "Product-specific trial", evidence: "Support exists, but the result summary remains limited in size and specificity." },
    ],
  },
  {
    slug: "lumera-vitamin-c-mist",
    scanCode: "TO-LUM-MIST-07",
    imageGallery: ["/images/catalog/vitamin-c-mist-1.jpg", "/images/catalog/vitamin-c-mist-2.jpg"],
    name: "Vitamin C Face Mist",
    brand: "Lumera Skin",
    brandSlug: "lumera-skin",
    category: "Skincare",
    subcategory: "Personal Care",
    summary: "A brightening mist arranged into a calmer claim and evidence view.",
    productNote: "Face mist with visible status-led claim presentation.",
    lastUpdated: "May 4, 2026",
    claims: [
      { text: "Vitamin C infused", status: "Evidence Available", requiredEvidence: "Ingredient list", evidence: "The ingredient deck supports vitamin C derivative inclusion." },
      { text: "Brightening support", status: "Limited Evidence", requiredEvidence: "Performance support", evidence: "Supporting material was submitted but remains directional rather than product-specific." },
      { text: "No added fragrance", status: "Evidence Available", requiredEvidence: "Ingredient list", evidence: "No fragrance additive is present in the submitted formula list." },
    ],
  },
  {
    slug: "terra-crunch-seed-bars",
    scanCode: "TO-TERRA-BARS-08",
    imageGallery: ["/images/catalog/seed-bars-1.jpg", "/images/catalog/seed-bars-2.jpg"],
    name: "Seed Crunch Bars",
    brand: "Terra Pantry",
    brandSlug: "terra-pantry",
    category: "Food Products",
    subcategory: "Packaged Products",
    summary: "A snack bar page built for clearer ingredient and nutrition visibility.",
    productNote: "Packaged bar with clean overview of ingredient support.",
    lastUpdated: "May 1, 2026",
    claims: [
      { text: "Source of fiber", status: "Evidence Available", requiredEvidence: "Nutrition panel", evidence: "The submitted nutrition panel supports fiber content disclosure." },
      { text: "No artificial preservatives", status: "Evidence Available", requiredEvidence: "Ingredient deck", evidence: "The ingredient list supports the absence of artificial preservatives." },
      { text: "Supports sustained energy", status: "No Evidence Submitted", requiredEvidence: "Claim substantiation", evidence: "No supporting file package was submitted for this benefit claim." },
    ],
  },
  {
    slug: "terra-roasted-granola",
    scanCode: "TO-TERRA-GRAN-09",
    imageGallery: ["/images/catalog/granola-1.jpg", "/images/catalog/granola-2.jpg"],
    name: "Roasted Almond Granola",
    brand: "Terra Pantry",
    brandSlug: "terra-pantry",
    category: "Food Products",
    subcategory: "Packaged Products",
    summary: "A pantry product page focused on clearer food-label interpretation.",
    productNote: "Granola page with sourcing and label clarity.",
    lastUpdated: "April 30, 2026",
    claims: [
      { text: "Whole grain oats", status: "Evidence Available", requiredEvidence: "Ingredient declaration", evidence: "Whole grain oats are listed as a primary ingredient." },
      { text: "No refined sugar", status: "Evidence Available", requiredEvidence: "Ingredient and nutrition panel", evidence: "The current label supports the absence of refined sugar inputs." },
      { text: "Protein-rich breakfast", status: "Limited Evidence", requiredEvidence: "Nutrition positioning support", evidence: "The protein content is visible, but the comparative support is limited." },
    ],
  },
  {
    slug: "elevate-daily-greens",
    scanCode: "TO-ELEV-GREEN-10",
    imageGallery: ["/images/catalog/daily-greens-1.jpg", "/images/catalog/daily-greens-2.jpg"],
    name: "Daily Greens Blend",
    brand: "Elevate Nutrition",
    brandSlug: "elevate-nutrition",
    category: "Supplements",
    subcategory: "Wellness",
    summary: "A supplement listing that separates ingredient presence from stronger efficacy claims.",
    productNote: "Powder supplement with claim-by-claim evidence view.",
    lastUpdated: "May 3, 2026",
    claims: [
      { text: "Contains greens blend", status: "Evidence Available", requiredEvidence: "Ingredient list", evidence: "The ingredient panel confirms the listed greens ingredients." },
      { text: "Daily wellness support", status: "Limited Evidence", requiredEvidence: "Claim support package", evidence: "Support exists at ingredient level, but the product-level package is still incomplete." },
      { text: "No artificial colors", status: "Evidence Available", requiredEvidence: "Ingredient deck", evidence: "The formulation list shows no artificial color additives." },
    ],
  },
  {
    slug: "elevate-protein-vanilla",
    scanCode: "TO-ELEV-PRO-11",
    imageGallery: ["/images/catalog/protein-vanilla-1.jpg", "/images/catalog/protein-vanilla-2.jpg"],
    name: "Vanilla Plant Protein",
    brand: "Elevate Nutrition",
    brandSlug: "elevate-nutrition",
    category: "Supplements",
    subcategory: "Wellness",
    summary: "A protein product page built to make claim language easier to inspect.",
    productNote: "Protein powder with ingredient and support-status visibility.",
    lastUpdated: "May 5, 2026",
    claims: [
      { text: "Plant-based protein", status: "Evidence Available", requiredEvidence: "Ingredient list", evidence: "Plant protein sources are visible in the product ingredient deck." },
      { text: "Helps muscle recovery", status: "No Evidence Submitted", requiredEvidence: "Performance support", evidence: "No product-specific file package has been attached for the recovery claim." },
      { text: "No soy", status: "Evidence Available", requiredEvidence: "Allergen and ingredient list", evidence: "The current ingredient and allergen declaration support this claim." },
    ],
  },
  {
    slug: "botanica-calm-tea",
    scanCode: "TO-BOT-TEA-12",
    imageGallery: ["/images/catalog/calm-tea-1.jpg", "/images/catalog/calm-tea-2.jpg"],
    name: "Calm Herbal Tea",
    brand: "Botanica House",
    brandSlug: "botanica-house",
    category: "Drinks",
    subcategory: "Wellness",
    summary: "A beverage page designed to reduce ambiguity around calming language.",
    productNote: "Tea product with packaging-linked evidence notes.",
    lastUpdated: "April 28, 2026",
    claims: [
      { text: "Caffeine free", status: "Evidence Available", requiredEvidence: "Ingredient and nutrition details", evidence: "Submitted materials support the caffeine-free positioning." },
      { text: "Helps you relax", status: "Limited Evidence", requiredEvidence: "Claim wording support", evidence: "Support exists at ingredient level, but product-specific claim framing remains limited." },
      { text: "Natural ingredients", status: "No Evidence Submitted", requiredEvidence: "Sourcing and formulation detail", evidence: "No detailed support package has been attached for the natural ingredients phrasing." },
    ],
  },
  {
    slug: "botanica-immunity-shot",
    scanCode: "TO-BOT-SHOT-13",
    imageGallery: ["/images/catalog/immunity-shot-1.jpg", "/images/catalog/immunity-shot-2.jpg"],
    name: "Daily Immunity Shot",
    brand: "Botanica House",
    brandSlug: "botanica-house",
    category: "Drinks",
    subcategory: "Wellness",
    summary: "A concentrated beverage listing with clearer claim boundaries.",
    productNote: "Functional drink with visibility-first claims layout.",
    lastUpdated: "May 6, 2026",
    claims: [
      { text: "Contains vitamin C", status: "Evidence Available", requiredEvidence: "Nutrition details", evidence: "The nutrition sheet confirms vitamin C inclusion." },
      { text: "Immune support", status: "Limited Evidence", requiredEvidence: "Claim support package", evidence: "Support materials were submitted but remain partial in product-level framing." },
      { text: "No added colors", status: "Evidence Available", requiredEvidence: "Ingredient deck", evidence: "The ingredient list supports the no added colors statement." },
    ],
  },
  {
    slug: "solace-body-lotion",
    scanCode: "TO-SOL-LOTION-14",
    imageGallery: ["/images/catalog/body-lotion-1.jpg", "/images/catalog/body-lotion-2.jpg"],
    name: "Daily Body Lotion",
    brand: "Solace Care",
    brandSlug: "solace-care",
    category: "Personal Care",
    subcategory: "Skincare",
    summary: "A personal care product page centered on simpler product understanding.",
    productNote: "Body lotion with image-first presentation and evidence statuses.",
    lastUpdated: "May 7, 2026",
    claims: [
      { text: "Fast-absorbing", status: "Limited Evidence", requiredEvidence: "Performance assessment", evidence: "The support package is directional and not yet fully product-specific." },
      { text: "Shea butter formula", status: "Evidence Available", requiredEvidence: "Ingredient list", evidence: "Shea butter is listed in the submitted formula details." },
      { text: "Dermatologist tested", status: "Evidence Available", requiredEvidence: "Testing summary", evidence: "A dermatologist-linked test summary was submitted." },
    ],
  },
  {
    slug: "solace-hand-cream",
    scanCode: "TO-SOL-HAND-15",
    imageGallery: ["/images/catalog/hand-cream-1.jpg", "/images/catalog/hand-cream-2.jpg"],
    name: "Repair Hand Cream",
    brand: "Solace Care",
    brandSlug: "solace-care",
    category: "Personal Care",
    subcategory: "Skincare",
    summary: "A hand care page with clearer support markers and simpler reading flow.",
    productNote: "Hand cream page showing customer-facing claim clarity.",
    lastUpdated: "May 8, 2026",
    claims: [
      { text: "Dry skin support", status: "Evidence Available", requiredEvidence: "Formula and study notes", evidence: "Submitted support indicates moisturising ingredients associated with dry-skin support." },
      { text: "Non-greasy finish", status: "Limited Evidence", requiredEvidence: "Product testing", evidence: "The product has directional support, but broader testing was not included." },
      { text: "Fragrance free", status: "Evidence Available", requiredEvidence: "Ingredient list", evidence: "The ingredient list supports the absence of fragrance additives." },
    ],
  },
  {
    slug: "natura-sun-fluid",
    scanCode: "TO-NAT-SUN-16",
    imageGallery: ["/images/catalog/sun-fluid-1.jpg", "/images/catalog/sun-fluid-2.jpg"],
    name: "Sun Defense Fluid",
    brand: "Natura Shield",
    brandSlug: "natura-shield",
    category: "Sun Care",
    subcategory: "Skincare",
    summary: "A lightweight sun product with more readable proof-focused framing.",
    productNote: "Sun fluid with QR-ready claim visibility.",
    lastUpdated: "May 3, 2026",
    claims: [
      { text: "SPF 30", status: "Evidence Available", requiredEvidence: "SPF report", evidence: "Testing documentation was submitted to support the SPF statement." },
      { text: "Mineral filter system", status: "Evidence Available", requiredEvidence: "Active ingredient listing", evidence: "The formulation summary supports this positioning." },
      { text: "Sensitive skin friendly", status: "Limited Evidence", requiredEvidence: "Sensitivity support", evidence: "Partial tolerance information exists, but stronger support is still needed." },
    ],
  },
  {
    slug: "natura-after-sun-gel",
    scanCode: "TO-NAT-AFTER-17",
    imageGallery: ["/images/catalog/after-sun-1.jpg", "/images/catalog/after-sun-2.jpg"],
    name: "After Sun Cooling Gel",
    brand: "Natura Shield",
    brandSlug: "natura-shield",
    category: "Sun Care",
    subcategory: "Personal Care",
    summary: "A post-sun care page with clearer ingredient and benefit communication.",
    productNote: "Cooling gel with customer-visible evidence summaries.",
    lastUpdated: "May 2, 2026",
    claims: [
      { text: "Aloe-based formula", status: "Evidence Available", requiredEvidence: "Ingredient list", evidence: "Aloe appears in the submitted formula details." },
      { text: "Cooling relief", status: "Limited Evidence", requiredEvidence: "Performance notes", evidence: "Submitted information supports the claim directionally but remains light." },
      { text: "No parabens", status: "Evidence Available", requiredEvidence: "Ingredient deck", evidence: "No parabens are visible in the submitted ingredient list." },
    ],
  },
  {
    slug: "wellnest-sleep-gummies",
    scanCode: "TO-WELL-SLEEP-18",
    imageGallery: ["/images/catalog/sleep-gummies-1.jpg", "/images/catalog/sleep-gummies-2.jpg"],
    name: "Sleep Support Gummies",
    brand: "WellNest",
    brandSlug: "wellnest",
    category: "Wellness",
    subcategory: "Supplements",
    summary: "A gummies page with better distinction between ingredients and stronger benefit claims.",
    productNote: "Supplement gummies arranged into a simple evidence-first layout.",
    lastUpdated: "May 9, 2026",
    claims: [
      { text: "Melatonin blend", status: "Evidence Available", requiredEvidence: "Supplement facts", evidence: "The supplement facts panel supports melatonin inclusion." },
      { text: "Supports restful sleep", status: "Limited Evidence", requiredEvidence: "Product support package", evidence: "Support has been attached but remains limited in product-specific depth." },
      { text: "Berry flavored", status: "Evidence Available", requiredEvidence: "Ingredient list", evidence: "The flavoring details support the berry flavor statement." },
    ],
  },
];

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
