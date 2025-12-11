import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://convertmydocuments.com";
  const lastModified = new Date();

  // Conversion landing pages
  const conversionPages = [
    "word-to-pdf",
    "excel-to-pdf",
    "powerpoint-to-pdf",
    "pdf-to-word",
    "pdf-to-excel",
    "pdf-to-powerpoint",
  ];

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Conversion-specific landing pages for SEO
    ...conversionPages.map((page) => ({
      url: `${siteUrl}/${page}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}

