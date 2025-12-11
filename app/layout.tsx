import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://convertmydocuments.com";
const siteName = "ConvertMyDocuments";
const siteDescription = "Free online document converter — 100% private, your files never leave your browser. Convert Word, Excel, PowerPoint, PDF and more. No uploads, no server, no data collection.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Free Office Document Converter | ConvertMyDocuments",
    template: "%s | ConvertMyDocuments",
  },
  description: siteDescription,
  keywords: [
    "document converter",
    "file converter",
    "PDF converter",
    "Word to PDF",
    "Excel to PDF",
    "PowerPoint to PDF",
    "DOCX converter",
    "XLSX converter",
    "PPTX converter",
    "online converter",
    "free converter",
    "private converter",
    "browser converter",
    "no upload converter",
    "LibreOffice",
    "WebAssembly",
    "ODT converter",
    "ODS converter",
    "ODP converter",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  applicationName: siteName,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: "Free Office Document Converter | ConvertMyDocuments",
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ConvertMyDocuments - Free Private Document Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Office Document Converter | ConvertMyDocuments",
    description: siteDescription,
    images: ["/opengraph-image.png"],
    creator: "@convertmydocs",
  },
  icons: {
    icon: [
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/icon-192", sizes: "192x192", type: "image/png" },
      { url: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  category: "technology",
  classification: "Document Converter, Productivity Tool",
  // Verification placeholders - replace with actual values when available
  // verification: {
  //   google: "your-google-site-verification",
  //   yandex: "your-yandex-verification",
  // },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      name: "ConvertMyDocuments",
      url: siteUrl,
      description: siteDescription,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires WebAssembly support.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Convert Word documents (DOCX, DOC, ODT, RTF)",
        "Convert Excel spreadsheets (XLSX, XLS, ODS, CSV)",
        "Convert PowerPoint presentations (PPTX, PPT, ODP)",
        "Convert to and from PDF",
        "100% private - files never leave your browser",
        "No server uploads required",
        "Batch conversion support",
        "WebAssembly powered LibreOffice",
      ],
      screenshot: `${siteUrl}/opengraph-image.png`,
      softwareVersion: "1.0.0",
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "ConvertMyDocuments",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ConvertMyDocuments",
      description: siteDescription,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this document converter really free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, ConvertMyDocuments is completely free to use. There are no hidden fees, subscriptions, or limits on the number of conversions.",
          },
        },
        {
          "@type": "Question",
          name: "Are my files private and secure?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely! Your files never leave your browser. All conversion happens locally on your device using WebAssembly technology. We don't upload, store, or have access to any of your documents.",
          },
        },
        {
          "@type": "Question",
          name: "What file formats are supported?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We support a wide range of formats including Word (DOCX, DOC, ODT, RTF), Excel (XLSX, XLS, ODS, CSV), PowerPoint (PPTX, PPT, ODP), PDF, and various image formats (PNG, SVG, JPG).",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to install any software?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No installation required! ConvertMyDocuments runs entirely in your web browser. Just visit the website and start converting.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${siteUrl}/#howto`,
      name: "How to Convert Documents Online for Free",
      description: "Convert Word, Excel, PowerPoint, and PDF files instantly in your browser with complete privacy.",
      totalTime: "PT1M",
      tool: {
        "@type": "HowToTool",
        name: "Web Browser with WebAssembly support",
      },
      step: [
        {
          "@type": "HowToStep",
          name: "Upload Your Document",
          text: "Click 'Select Files' or drag and drop your document into the converter. Supports Word, Excel, PowerPoint, PDF, and more.",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "Choose Output Format",
          text: "Select your desired output format from the dropdown menu (PDF, DOCX, XLSX, PPTX, etc.).",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "Convert",
          text: "Click 'Convert & Download'. Your file is processed instantly in your browser - nothing is uploaded to any server.",
          position: 3,
        },
        {
          "@type": "HowToStep",
          name: "Download",
          text: "Your converted file downloads automatically. For batch conversions, you'll receive a ZIP archive.",
          position: 4,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="global-footer">
          <p>
            Powered by{" "}
            <a
              href="https://www.libreoffice.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LibreOffice
            </a>{" "}
            compiled to WebAssembly •{" "}
            <a
              href="https://www.npmjs.com/package/@matbee/libreoffice-converter"
              target="_blank"
              rel="noopener noreferrer"
            >
              NPM Package
            </a>
          </p>
          <p className="support-link">
            Love this tool?{" "}
            <a
              href="https://buymeacoffee.com/matbee"
              target="_blank"
              rel="noopener noreferrer"
            >
              ☕ Buy me a coffee
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
