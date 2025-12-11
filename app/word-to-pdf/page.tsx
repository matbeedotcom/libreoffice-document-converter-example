import { Metadata } from "next";
import ConversionLandingPage, { ConversionType } from "../components/ConversionLandingPage";
import VLMProvider from "../context/VLMContext";

const siteUrl = "https://convertmydocuments.com";

export const metadata: Metadata = {
  title: "Free Word to PDF Converter Online | No Upload Required",
  description:
    "Convert Word documents (DOCX, DOC) to PDF for free. 100% private - your files never leave your browser. No signup, no limits, instant conversion.",
  keywords: [
    "word to pdf",
    "docx to pdf",
    "doc to pdf",
    "convert word to pdf",
    "word to pdf converter",
    "free word to pdf",
    "online word to pdf",
    "word document to pdf",
    "microsoft word to pdf",
    "word to pdf no upload",
  ],
  alternates: {
    canonical: `${siteUrl}/word-to-pdf`,
  },
  openGraph: {
    title: "Free Word to PDF Converter Online | No Upload Required",
    description:
      "Convert Word documents to PDF for free. 100% private - files never leave your browser.",
    url: `${siteUrl}/word-to-pdf`,
    type: "website",
  },
};

const conversion: ConversionType = {
  from: "docx",
  fromLabel: "Word",
  to: "pdf",
  toLabel: "PDF",
  icon: "📄",
  description:
    "Convert your Microsoft Word documents (DOCX, DOC) to PDF instantly. Your files are processed entirely in your browser — nothing is uploaded to any server.",
  features: [
    "Preserves formatting, fonts, images, and layouts exactly as they appear in Word",
    "Converts both DOCX and older DOC files with full compatibility",
    "Creates universally accessible PDF files that look the same on any device",
    "Batch convert multiple Word documents at once",
    "No file size limits — convert large documents with ease",
    "Works offline after the first load — no internet required",
  ],
  useCases: [
    "Share documents that can't be edited",
    "Submit assignments and reports",
    "Create print-ready documents",
    "Archive important Word files",
    "Send contracts and agreements",
    "Prepare documents for digital signatures",
  ],
  faq: [
    {
      question: "Is this Word to PDF converter really free?",
      answer:
        "Yes, completely free with no hidden costs. There are no limits on the number of conversions, file sizes, or features.",
    },
    {
      question: "Are my Word documents secure?",
      answer:
        "Absolutely. Your files never leave your browser. All conversion happens locally on your device using WebAssembly technology. We don't upload, store, or have access to any of your documents.",
    },
    {
      question: "What Word formats are supported?",
      answer:
        "We support DOCX (modern Word format), DOC (legacy Word format), ODT (OpenDocument), and RTF (Rich Text Format).",
    },
    {
      question: "Will my formatting be preserved?",
      answer:
        "Yes! Our converter uses LibreOffice technology to accurately preserve fonts, images, tables, headers, footers, and all formatting in your PDF output.",
    },
    {
      question: "Can I convert multiple Word files at once?",
      answer:
        "Yes! Use our batch conversion feature to convert multiple Word documents to PDF simultaneously. Simply select multiple files or drag a folder.",
    },
  ],
};

// JSON-LD for this specific conversion
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert Word to PDF",
  description: "Convert Word documents to PDF format online for free",
  step: [
    {
      "@type": "HowToStep",
      name: "Upload Word Document",
      text: "Click 'Choose Files' or drag and drop your Word document (DOCX, DOC) into the converter",
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
    name: "ConvertMyDocuments Word to PDF Converter",
    applicationCategory: "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
};

export default function WordToPdfPage() {
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

