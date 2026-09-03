import type { Metadata } from "next";
import { SiteGateway } from "@/components/gateway/site-gateway";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "TruOrigin | Product Information Platform",
  description:
    "TruOrigin is a product information platform. Brands submit claims and supporting documents, organized into a structured page customers can read quickly.",
  path: "/",
});

export default function Home() {
  return <SiteGateway />;
}
