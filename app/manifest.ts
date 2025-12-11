import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ConvertMyDocuments - Free Office Document Converter",
    short_name: "ConvertMyDocs",
    description:
      "Free online document converter — 100% private, your files never leave your browser. Convert Word, Excel, PowerPoint, PDF and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "apple touch icon",
      },
    ],
    screenshots: [
      {
        src: "/opengraph-image",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "ConvertMyDocuments Home Screen",
      },
    ],
    shortcuts: [
      {
        name: "Convert Document",
        short_name: "Convert",
        description: "Start converting documents",
        url: "/",
        icons: [{ src: "/icon-192", sizes: "192x192" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}

