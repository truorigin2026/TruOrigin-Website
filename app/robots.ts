import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/brand",
        "/account",
        "/api/",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/product/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
