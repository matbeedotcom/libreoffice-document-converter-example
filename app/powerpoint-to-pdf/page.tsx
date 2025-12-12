import { Metadata } from "next";
import ConversionLandingPage, { ConversionType } from "../components/ConversionLandingPage";

const siteUrl = "https://convertmydocuments.com";

export const metadata: Metadata = {
  title: "Free PowerPoint to PDF Converter Online | No Upload Required",
  description:
    "Convert PowerPoint presentations (PPTX, PPT) to PDF for free. 100% private - your files never leave your browser. Preserves slides and animations.",
  keywords: [
    "powerpoint to pdf",
    "pptx to pdf",
    "ppt to pdf",
    "convert powerpoint to pdf",
    "powerpoint to pdf converter",
    "free powerpoint to pdf",
    "online powerpoint to pdf",
    "presentation to pdf",
    "microsoft powerpoint to pdf",
    "powerpoint to pdf no upload",
  ],
  alternates: {
    canonical: `${siteUrl}/powerpoint-to-pdf`,
  },
  openGraph: {
    title: "Free PowerPoint to PDF Converter Online | No Upload Required",
    description:
      "Convert PowerPoint presentations to PDF for free. 100% private - files never leave your browser.",
    url: `${siteUrl}/powerpoint-to-pdf`,
    type: "website",
  },
};

const conversion: ConversionType = {
  from: "pptx",
  fromLabel: "PowerPoint",
  to: "pdf",
  toLabel: "PDF",
  icon: "📽️",
  description:
    "Convert your Microsoft PowerPoint presentations (PPTX, PPT) to PDF instantly. Your files are processed entirely in your browser — nothing is uploaded to any server.",
  features: [
    "Preserves slide layouts, transitions, and design themes",
    "Maintains embedded images, charts, and SmartArt graphics",
    "Keeps speaker notes and handout formatting",
    "Supports both PPTX and legacy PPT formats",
    "One slide per page or multiple slides per page",
    "Batch convert multiple presentations at once",
  ],
  useCases: [
    "Share presentations that can't be edited",
    "Create print-ready presentation handouts",
    "Archive important presentations",
    "Send pitch decks to clients",
    "Submit presentation assignments",
    "Share slides without PowerPoint required",
  ],
  faq: [
    {
      question: "Is this PowerPoint to PDF converter really free?",
      answer:
        "Yes, completely free with no hidden costs. There are no limits on the number of conversions, file sizes, or features.",
    },
    {
      question: "Are my PowerPoint presentations secure?",
      answer:
        "Absolutely. Your files never leave your browser. All conversion happens locally on your device using WebAssembly technology. We don't upload, store, or have access to any of your documents.",
    },
    {
      question: "Will my slide formatting be preserved?",
      answer:
        "Yes! Our converter preserves slide layouts, themes, fonts, images, charts, and all visual elements in your PDF output.",
    },
    {
      question: "Can I convert presentations with animations?",
      answer:
        "The PDF will capture your slides as static images. Animations and transitions will show their final state in the converted PDF.",
    },
    {
      question: "What PowerPoint formats are supported?",
      answer:
        "We support PPTX (modern PowerPoint format), PPT (legacy PowerPoint format), and ODP (OpenDocument Presentation).",
    },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert PowerPoint to PDF",
  description: "Convert PowerPoint presentations to PDF format online for free",
  step: [
    {
      "@type": "HowToStep",
      name: "Upload PowerPoint Presentation",
      text: "Click 'Choose Files' or drag and drop your PowerPoint file (PPTX, PPT) into the converter",
    },
    {
      "@type": "HowToStep",
      name: "Select PDF Output",
      text: "Choose PDF as the output format from the dropdown menu",
    },
    {
      "@type": "HowToStep",
      name: "Convert",
      text: "Click the Convert button - your file is processed instantly in your browser",
    },
    {
      "@type": "HowToStep",
      name: "Download",
      text: "Download your converted PDF file",
    },
  ],
  tool: {
    "@type": "SoftwareApplication",
    name: "ConvertMyDocuments PowerPoint to PDF Converter",
    applicationCategory: "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
};

export default function PowerPointToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ConversionLandingPage conversion={conversion} />
    </>
  );
}

