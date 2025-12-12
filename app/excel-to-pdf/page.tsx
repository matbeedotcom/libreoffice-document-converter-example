import { Metadata } from "next";
import ConversionLandingPage, { ConversionType } from "../components/ConversionLandingPage";

const siteUrl = "https://convertmydocuments.com";

export const metadata: Metadata = {
  title: "Free Excel to PDF Converter Online | No Upload Required",
  description:
    "Convert Excel spreadsheets (XLSX, XLS) to PDF for free. 100% private - your files never leave your browser. Preserves formatting and formulas.",
  keywords: [
    "excel to pdf",
    "xlsx to pdf",
    "xls to pdf",
    "convert excel to pdf",
    "excel to pdf converter",
    "free excel to pdf",
    "online excel to pdf",
    "spreadsheet to pdf",
    "microsoft excel to pdf",
    "excel to pdf no upload",
  ],
  alternates: {
    canonical: `${siteUrl}/excel-to-pdf`,
  },
  openGraph: {
    title: "Free Excel to PDF Converter Online | No Upload Required",
    description:
      "Convert Excel spreadsheets to PDF for free. 100% private - files never leave your browser.",
    url: `${siteUrl}/excel-to-pdf`,
    type: "website",
  },
};

const conversion: ConversionType = {
  from: "xlsx",
  fromLabel: "Excel",
  to: "pdf",
  toLabel: "PDF",
  icon: "📊",
  description:
    "Convert your Microsoft Excel spreadsheets (XLSX, XLS) to PDF instantly. Your files are processed entirely in your browser — nothing is uploaded to any server.",
  features: [
    "Preserves cell formatting, colors, borders, and styles perfectly",
    "Maintains charts, graphs, and embedded images",
    "Handles multiple worksheets in a single conversion",
    "Supports both XLSX and legacy XLS formats",
    "No file size limits — convert large spreadsheets easily",
    "Batch convert multiple Excel files at once",
  ],
  useCases: [
    "Share financial reports that can't be edited",
    "Create print-ready spreadsheets",
    "Archive important Excel data",
    "Send invoices and quotes",
    "Submit budget reports",
    "Share data analysis results",
  ],
  faq: [
    {
      question: "Is this Excel to PDF converter really free?",
      answer:
        "Yes, completely free with no hidden costs. There are no limits on the number of conversions, file sizes, or features.",
    },
    {
      question: "Are my Excel spreadsheets secure?",
      answer:
        "Absolutely. Your files never leave your browser. All conversion happens locally on your device using WebAssembly technology. We don't upload, store, or have access to any of your documents.",
    },
    {
      question: "Will my charts and formatting be preserved?",
      answer:
        "Yes! Our converter preserves cell formatting, charts, graphs, colors, borders, and all visual elements in your PDF output.",
    },
    {
      question: "Can I convert Excel files with multiple sheets?",
      answer:
        "Yes! All worksheets in your Excel file will be included in the converted PDF document.",
    },
    {
      question: "What Excel formats are supported?",
      answer:
        "We support XLSX (modern Excel format), XLS (legacy Excel format), ODS (OpenDocument Spreadsheet), and CSV files.",
    },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert Excel to PDF",
  description: "Convert Excel spreadsheets to PDF format online for free",
  step: [
    {
      "@type": "HowToStep",
      name: "Upload Excel Spreadsheet",
      text: "Click 'Choose Files' or drag and drop your Excel file (XLSX, XLS) into the converter",
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
    name: "ConvertMyDocuments Excel to PDF Converter",
    applicationCategory: "UtilitiesApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
};

export default function ExcelToPdfPage() {
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

