import { Metadata } from "next";
import ConversionLandingPage, { ConversionType } from "../components/ConversionLandingPage";
import VLMProvider from "../context/VLMContext";

const siteUrl = "https://convertmydocuments.com";

export const metadata: Metadata = {
  title: "Free PDF to Word Converter Online | No Upload Required",
  description:
    "Convert PDF files to editable Word documents (DOCX) for free. 100% private - your files never leave your browser. Preserves text and formatting.",
  keywords: [
    "pdf to word",
    "pdf to docx",
    "convert pdf to word",
    "pdf to word converter",
    "free pdf to word",
    "online pdf to word",
    "pdf to editable word",
    "pdf to microsoft word",
    "pdf to word no upload",
    "edit pdf in word",
  ],
  alternates: {
    canonical: `${siteUrl}/pdf-to-word`,
  },
  openGraph: {
    title: "Free PDF to Word Converter Online | No Upload Required",
    description:
      "Convert PDF files to editable Word documents for free. 100% private - files never leave your browser.",
    url: `${siteUrl}/pdf-to-word`,
    type: "website",
  },
};

const conversion: ConversionType = {
  from: "pdf",
  fromLabel: "PDF",
  to: "docx",
  toLabel: "Word",
  icon: "📑",
  description:
    "Convert your PDF files to editable Microsoft Word documents (DOCX) instantly. Your files are processed entirely in your browser — nothing is uploaded to any server.",
  features: [
    "Extracts text and preserves formatting from PDF documents",
    "Creates fully editable Word documents",
    "Maintains images and basic layouts",
    "Supports multi-page PDF documents",
    "No file size limits — convert large PDFs easily",
    "Batch convert multiple PDF files at once",
  ],
  useCases: [
    "Edit text in PDF documents",
    "Update old PDF contracts and documents",
    "Repurpose PDF content for new documents",
    "Extract text from scanned documents",
    "Modify PDF forms and templates",
    "Collaborate on PDF content in Word",
  ],
  faq: [
    {
      question: "Is this PDF to Word converter really free?",
      answer:
        "Yes, completely free with no hidden costs. There are no limits on the number of conversions, file sizes, or features.",
    },
    {
      question: "Are my PDF files secure?",
      answer:
        "Absolutely. Your files never leave your browser. All conversion happens locally on your device using WebAssembly technology. We don't upload, store, or have access to any of your documents.",
    },
    {
      question: "Will all my PDF formatting be preserved?",
      answer:
        "Our converter does its best to preserve text, fonts, and layouts. Complex layouts may require some manual adjustment after conversion.",
    },
    {
      question: "Can I edit the converted Word document?",
      answer:
        "Yes! The output is a standard DOCX file that you can open and edit in Microsoft Word, Google Docs, or any other word processor.",
    },
    {
      question: "Does it work with scanned PDFs?",
      answer:
        "Our converter works best with text-based PDFs. Scanned PDFs (images of text) will be converted, but the text may not be editable without OCR processing.",
    },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert PDF to Word",
  description: "Convert PDF files to editable Word documents online for free",
  step: [
    {
      "@type": "HowToStep",
      name: "Upload PDF File",
      text: "Click 'Choose Files' or drag and drop your PDF file into the converter",
    },
    {
      "@type": "HowToStep",
      name: "Select Word Output",
      text: "Choose DOCX (Word) as the output format from the dropdown menu",
    },
    {
      "@type": "HowToStep",
      name: "Convert",
      text: "Click the Convert button - your file is processed instantly in your browser",
    },
    {
      "@type": "HowToStep",
      name: "Download",
      text: "Download your converted Word document",
    },
  ],
  tool: {
    "@type": "SoftwareApplication",
    name: "ConvertMyDocuments PDF to Word Converter",
    applicationCategory: "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
};

export default function PdfToWordPage() {
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

