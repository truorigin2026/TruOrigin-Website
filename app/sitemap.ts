import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getProducts } from "@/lib/data/repository";
import { getBlogPosts } from "@/lib/data/blog-data";

type StaticRoute = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

const staticRoutes: StaticRoute[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/for-brands/home", changeFrequency: "weekly", priority: 0.9 },
  { path: "/for-brands/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/for-brands/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { path: "/for-brands/benefits", changeFrequency: "monthly", priority: 0.7 },
  { path: "/for-brands/industries", changeFrequency: "monthly", priority: 0.6 },
  { path: "/for-brands/resources", changeFrequency: "weekly", priority: 0.6 },
  { path: "/for-brands/resources/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/for-brands/resources/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/for-brands/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/for-products/home", changeFrequency: "weekly", priority: 0.9 },
  { path: "/for-products/products", changeFrequency: "weekly", priority: 0.8 },
  { path: "/for-products/support", changeFrequency: "monthly", priority: 0.5 },
  { path: "/for-products/about-verification", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.2 },
];

function parseLastModified(value: string | undefined): Date {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/p/${product.scanCode}`,
    lastModified: parseLastModified(product.lastUpdated),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    url: `${SITE_URL}/for-brands/resources/blog/${post.slug}`,
    lastModified: parseLastModified(post.isoDate),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...blogEntries];
}
