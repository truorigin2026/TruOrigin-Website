import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://truorigin.in").replace(/\/$/, "");
export const SITE_NAME = "TruOrigin";
export const SITE_DESCRIPTION =
  "TruOrigin is a product information platform. Brands submit claims and supporting documents, organized into a structured page customers can read quickly.";
export const ORGANIZATION_EMAIL = "info@truorigin.in";
export const ORGANIZATION_LOGO_PATH = "/images/TruOrigin logo.png";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Standard per-page metadata: title/description/canonical plus the
 * matching Open Graph + Twitter blocks, so shared links show the page's
 * own title/description instead of falling back to the root layout's.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
  const defaultImage = absoluteUrl("/opengraph-image");
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [defaultImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultImage],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(ORGANIZATION_LOGO_PATH),
    description: SITE_DESCRIPTION,
    email: ORGANIZATION_EMAIL,
    sameAs: [
      "https://x.com/truoriginco",
      "https://www.linkedin.com/company/truorigin/",
      "https://www.instagram.com/truoriginco",
      "https://www.facebook.com/share/185ueh1f52/",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type FaqItem = { question: string; answer: string };

export function faqPageJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  slug: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  const image = post.image ? (post.image.startsWith("/") ? absoluteUrl(post.image) : post.image) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || undefined,
    image: image ? [image] : undefined,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      "@type": "Organization",
      name: post.authorName || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(ORGANIZATION_LOGO_PATH),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/for-brands/resources/blog/${post.slug}`),
    },
    url: absoluteUrl(`/for-brands/resources/blog/${post.slug}`),
  };
}

export function productJsonLd(product: {
  name: string;
  code: string;
  brand: string;
  summary: string;
  image?: string;
  serialNumber?: string;
}) {
  const image = product.image ? (product.image.startsWith("/") ? absoluteUrl(product.image) : product.image) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary || undefined,
    image: image ? [image] : undefined,
    sku: product.serialNumber || undefined,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    url: absoluteUrl(`/p/${product.code}`),
  };
}
