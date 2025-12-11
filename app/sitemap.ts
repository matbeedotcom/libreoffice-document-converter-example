import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://convertmydocuments.com";
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Add more pages here as the site grows
    // Example for future conversion-specific pages:
    // {
    //   url: `${siteUrl}/convert/word-to-pdf`,
    //   lastModified,
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
  ];
}

