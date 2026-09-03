import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} | Product Information Platform`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#1a7a44",
    icons: [
      {
        src: "/favicon.png",
        sizes: "457x457",
        type: "image/png",
      },
    ],
  };
}
