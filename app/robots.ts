import type { MetadataRoute } from "next";
import { personalData } from "@/utils/data/personal-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] },
    sitemap: `${personalData.siteUrl}/sitemap.xml`,
    host: personalData.siteUrl,
  };
}
