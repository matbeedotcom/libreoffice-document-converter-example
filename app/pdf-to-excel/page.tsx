import { Metadata } from "next";
import ConversionLandingPage, { ConversionType } from "../components/ConversionLandingPage";

const siteUrl = "https://convertmydocuments.com";

export const metadata: Metadata = {
  title: "Free PDF to Excel Converter Online | No Upload Required",
  description:
    "Convert PDF files to editable Excel spreadsheets (XLSX) for free. 100% private - your files never leave your browser. Extract tables and data.",
  keywords: [
    "pdf to excel",
    "pdf to xlsx",
    "convert pdf to excel",
    "pdf to excel converter",
    "free pdf to excel",
    "online pdf to excel",
    "pdf to spreadsheet",
    "pdf table to excel",
    "extract data from pdf",
    "pdf to excel no upload",
  ],
  alternates: {
    canonical: `${siteUrl}/pdf-to-excel`,
  },
  openGraph: {
    title: "Free PDF to Excel Converter Online | No Upload Required",
    description:
      "Convert PDF files to editable Excel spreadsheets for free. 100% private - files never leave your browser.",
    url: `${siteUrl}/pdf-to-excel`,
    type: "website",
  },
};

const conversion: ConversionType = {
  from: "pdf",
  fromLabel: "PDF",
  to: "xlsx",
  toLabel: "Excel",
  icon: "📈",
  description:
    "Convert your PDF files to editable Microsoft Excel spreadsheets (XLSX) instantly. Your files are processed entirely in your browser — nothing is uploaded to any server.",
  features: [
    "Extracts tables and data from PDF documents",
    "Creates fully editable Excel spreadsheets",
    "Preserves cell structure and formatting",
    "Handles multi-page PDF tables",
    "No file size limits — convert large PDFs easily",
    "Batch convert multiple PDF files at once",
  ],
  useCases: [
    "Extract financial data from PDF reports",
    "Convert PDF invoices to spreadsheets",
    "Analyze PDF table data in Excel",
    "Import PDF data into accounting software",
    "Update old PDF spreadsheets",
    "Create editable copies of PDF tables",
  ],
  faq: [
    {
      question: "Is this PDF to Excel converter really free?",
      answer:
        "Yes, completely free with no hidden costs. There are no limits on the number of conversions, file sizes, or features.",
    },
    {
      question: "Are my PDF files secure?",
      answer:
        "Absolutely. Your files never leave your browser. All conversion happens locally on your device using WebAssembly technology. We don't upload, store, or have access to any of your documents.",
    },
    {
      question: "Will tables be properly extracted?",
      answer:
        "Our converter does its best to detect and extract tables from your PDF. Well-structured tables convert best; complex layouts may require some manual adjustment.",
    },
    {
      question: "Can I edit the converted Excel file?",
      answer:
        "Yes! The output is a standard XLSX file that you can open and edit in Microsoft Excel, Google Sheets, or any other spreadsheet application.",
    },
    {
      question: "Does it work with scanned PDFs?",
      answer:
        "Our converter works best with text-based PDFs containing actual table data. Scanned PDFs (images) may not extract data accurately without OCR processing.",
    },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert PDF to Excel",
  description: "Convert PDF files to editable Excel spreadsheets online for free",
  step: [
    {
      "@type": "HowToStep",
      name: "Upload PDF File",
      text: "Click 'Choose Files' or drag and drop your PDF file into the converter",
    },
    {
      "@type": "HowToStep",
      name: "Select Excel Output",
      text: "Choose XLSX (Excel) as the output format from the dropdown menu",
    },
    {
      "@type": "HowToStep",
      name: "Convert",
      text: "Click the Convert button - your file is processed instantly in your browser",
    },
    {
      "@type": "HowToStep",
      name: "Download",
      text: "Download your converted Excel spreadsheet",
    },
  ],
  tool: {
    "@type": "SoftwareApplication",
    name: "ConvertMyDocuments PDF to Excel Converter",
    applicationCategory: "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
};

export default function PdfToExcelPage() {
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

