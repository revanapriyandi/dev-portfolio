import type { MetadataRoute } from "next";
import { personalData } from "@/utils/data/personal-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: personalData.siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${personalData.siteUrl}/resume.pdf`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];
}
