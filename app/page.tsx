import type { Metadata } from "next";
import { SiteGateway } from "@/components/gateway/site-gateway";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "TruOrigin | Product Information Platform",
  description:
    "TruOrigin is a product information platform. Brands submit claims, supporting documents, and product details, and TruOrigin organizes them into a structured product page that people can read quickly.",
  path: "/",
});

export default function Home() {
  return <SiteGateway />;
}
