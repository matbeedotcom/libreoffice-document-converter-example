import { Metadata } from "next";
import ConversionLandingPage, { ConversionType } from "../components/ConversionLandingPage";
import VLMProvider from "../context/VLMContext";

const siteUrl = "https://convertmydocuments.com";

export const metadata: Metadata = {
  title: "Free PDF to PowerPoint Converter Online | No Upload Required",
  description:
    "Convert PDF files to editable PowerPoint presentations (PPTX) for free. 100% private - your files never leave your browser. Preserves slides and layouts.",
  keywords: [
    "pdf to powerpoint",
    "pdf to pptx",
    "convert pdf to powerpoint",
    "pdf to powerpoint converter",
    "free pdf to powerpoint",
    "online pdf to powerpoint",
    "pdf to presentation",
    "pdf to ppt",
    "pdf to slides",
    "pdf to powerpoint no upload",
  ],
  alternates: {
    canonical: `${siteUrl}/pdf-to-powerpoint`,
  },
  openGraph: {
    title: "Free PDF to PowerPoint Converter Online | No Upload Required",
    description:
      "Convert PDF files to editable PowerPoint presentations for free. 100% private - files never leave your browser.",
    url: `${siteUrl}/pdf-to-powerpoint`,
    type: "website",
  },
};

const conversion: ConversionType = {
  from: "pdf",
  fromLabel: "PDF",
  to: "pptx",
  toLabel: "PowerPoint",
  icon: "🎯",
  description:
    "Convert your PDF files to editable Microsoft PowerPoint presentations (PPTX) instantly. Your files are processed entirely in your browser — nothing is uploaded to any server.",
  features: [
    "Converts PDF pages to editable PowerPoint slides",
    "Preserves text, images, and basic layouts",
    "Creates fully editable PPTX presentations",
    "Handles multi-page PDF documents",
    "No file size limits — convert large PDFs easily",
    "Batch convert multiple PDF files at once",
  ],
  useCases: [
    "Edit PDF presentations in PowerPoint",
    "Repurpose PDF slides for new presentations",
    "Update old PDF presentation materials",
    "Extract content from PDF pitch decks",
    "Customize PDF slides with new branding",
    "Collaborate on PDF presentations",
  ],
  faq: [
    {
      question: "Is this PDF to PowerPoint converter really free?",
      answer:
        "Yes, completely free with no hidden costs. There are no limits on the number of conversions, file sizes, or features.",
    },
    {
      question: "Are my PDF files secure?",
      answer:
        "Absolutely. Your files never leave your browser. All conversion happens locally on your device using WebAssembly technology. We don't upload, store, or have access to any of your documents.",
    },
    {
      question: "Will slide layouts be preserved?",
      answer:
        "Our converter does its best to preserve text and image positions. Complex layouts may require some adjustment in PowerPoint after conversion.",
    },
    {
      question: "Can I edit the converted PowerPoint file?",
      answer:
        "Yes! The output is a standard PPTX file that you can open and edit in Microsoft PowerPoint, Google Slides, or any other presentation software.",
    },
    {
      question: "How does it handle PDF pages?",
      answer:
        "Each page of your PDF is converted to a separate slide in the PowerPoint presentation, maintaining the original page order.",
    },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert PDF to PowerPoint",
  description: "Convert PDF files to editable PowerPoint presentations online for free",
  step: [
    {
      "@type": "HowToStep",
      name: "Upload PDF File",
      text: "Click 'Choose Files' or drag and drop your PDF file into the converter",
    },
    {
      "@type": "HowToStep",
      name: "Select PowerPoint Output",
      text: "Choose PPTX (PowerPoint) as the output format from the dropdown menu",
    },
    {
      "@type": "HowToStep",
      name: "Convert",
      text: "Click the Convert button - your file is processed instantly in your browser",
    },
    {
      "@type": "HowToStep",
      name: "Download",
      text: "Download your converted PowerPoint presentation",
    },
  ],
  tool: {
    "@type": "SoftwareApplication",
    name: "ConvertMyDocuments PDF to PowerPoint Converter",
    applicationCategory: "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
};

export default function PdfToPowerPointPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VLMProvider>
        <ConversionLandingPage conversion={conversion} />
      </VLMProvider>
    </>
  );
}

