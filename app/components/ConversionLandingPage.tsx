"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { OutputFormat } from "@matbee/libreoffice-converter/types";

const ConverterApp = dynamic(() => import("./ConverterApp"), { ssr: false });

export interface ConversionType {
  from: string;
  fromLabel: string;
  to: OutputFormat;
  toLabel: string;
  icon: string;
  description: string;
  features: string[];
  useCases: string[];
  faq: { question: string; answer: string }[];
}

interface ConversionLandingPageProps {
  conversion: ConversionType;
}

const popularConversions = [
  { href: "/word-to-pdf", label: "Word to PDF", icon: "📄" },
  { href: "/excel-to-pdf", label: "Excel to PDF", icon: "📊" },
  { href: "/powerpoint-to-pdf", label: "PowerPoint to PDF", icon: "📽️" },
  { href: "/pdf-to-word", label: "PDF to Word", icon: "📑" },
  { href: "/pdf-to-excel", label: "PDF to Excel", icon: "📈" },
  { href: "/pdf-to-powerpoint", label: "PDF to PowerPoint", icon: "🎯" },
];

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "100% Private",
    description: "Your files never leave your browser. All processing happens locally on your device.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: "Instant Conversion",
    description: "No waiting for server uploads. Convert documents in seconds using WebAssembly.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
    title: "No Upload Required",
    description: "Nothing is sent to any server. Your sensitive documents stay completely private.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
    title: "Multiple Formats",
    description: "Word, Excel, PowerPoint, PDF, images, and more. Convert between any supported format.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    title: "Batch Processing",
    description: "Convert multiple files at once. Upload a folder and convert everything in one go.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Works Offline",
    description: "After the first load, works without internet. Perfect for air-gapped environments.",
  },
];

const supportedFormats = [
  { name: "Word", formats: "DOCX, DOC, ODT, RTF" },
  { name: "Excel", formats: "XLSX, XLS, ODS, CSV" },
  { name: "PowerPoint", formats: "PPTX, PPT, ODP" },
  { name: "PDF", formats: "PDF" },
  { name: "Images", formats: "PNG, SVG, JPG" },
  { name: "Text", formats: "TXT, HTML" },
];

export default function ConversionLandingPage({ conversion }: ConversionLandingPageProps) {
  return (
    <div className="main-landing">
      {/* Skip to main content link */}
      <a href="#converter" className="skip-link">Skip to converter</a>
      
      {/* App Header */}
      <header className="app-header" role="banner">
        <div className="app-header-content">
          <div className="header-title-group">
            <div className="conversion-badge" aria-label={`Convert ${conversion.fromLabel} to ${conversion.toLabel}`}>
              <span className="badge-icon" aria-hidden="true">{conversion.icon}</span>
              <span className="badge-arrow" aria-hidden="true">→</span>
              <span className="badge-format">{conversion.toLabel}</span>
            </div>
            <h1>{conversion.fromLabel} to {conversion.toLabel} Converter</h1>
          </div>
          <div className="header-info">
            <span className="header-blurb">Works offline • Files never leave your browser</span>
            <div className="privacy-badge" role="status" aria-label="Privacy guarantee">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>100% Private</span>
            </div>
          </div>
        </div>
      </header>

      {/* Converter Section */}
      <section className="converter-section" id="converter" aria-label={`${conversion.fromLabel} to ${conversion.toLabel} converter tool`}>
        <ConverterApp defaultOutputFormat={conversion.to} />
      </section>

      {/* Popular Conversions */}
      <section className="popular-section" aria-labelledby="popular-heading">
        <div className="section-container">
          <h2 id="popular-heading">Popular Conversions</h2>
          <nav className="conversions-grid" role="navigation" aria-label="Popular conversion types">
            {popularConversions.map((conv) => (
              <Link 
                key={conv.href} 
                href={conv.href} 
                className="conversion-card"
                aria-label={`${conv.label} converter`}
              >
                <span className="conversion-icon" aria-hidden="true">{conv.icon}</span>
                <span className="conversion-label">{conv.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" aria-labelledby="features-heading">
        <div className="section-container">
          <h2 id="features-heading">Why Choose ConvertMyDocuments?</h2>
          <div className="features-grid" role="list" aria-label="Product features">
            {features.map((feature, index) => (
              <article key={index} className="feature-card" role="listitem">
                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="formats-section" aria-labelledby="formats-heading">
        <div className="section-container">
          <h2 id="formats-heading">Supported File Formats</h2>
          <div className="formats-grid" role="list" aria-label="Supported file formats">
            {supportedFormats.map((format, index) => (
              <div key={index} className="format-card" role="listitem">
                <h3>{format.name}</h3>
                <p>{format.formats}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section" aria-labelledby="howto-heading">
        <div className="section-container">
          <h2 id="howto-heading">How It Works</h2>
          <ol className="steps-grid" role="list" aria-label="Conversion steps">
            <li className="step-card" role="listitem">
              <div className="step-number" aria-hidden="true">1</div>
              <h3>Upload</h3>
              <p>Select your file or drag & drop. Supports single files or entire folders for batch conversion.</p>
            </li>
            <li className="step-card" role="listitem">
              <div className="step-number" aria-hidden="true">2</div>
              <h3>Choose Format</h3>
              <p>Select your desired output format from PDF, Word, Excel, PowerPoint, and more.</p>
            </li>
            <li className="step-card" role="listitem">
              <div className="step-number" aria-hidden="true">3</div>
              <h3>Convert</h3>
              <p>Click convert — your file is processed instantly in your browser using WebAssembly.</p>
            </li>
            <li className="step-card" role="listitem">
              <div className="step-number" aria-hidden="true">4</div>
              <h3>Download</h3>
              <p>Download your converted file. For batch conversions, get a convenient ZIP archive.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="section-container">
          <h2 id="cta-heading">Ready to Convert Your Documents?</h2>
          <p>No sign-up required. No file limits. Your files stay private.</p>
          <a href="#converter" className="cta-button" role="button">
            Start Converting Now
          </a>
        </div>
      </section>

      <style jsx>{`
        .main-landing {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: #f1f5f9;
        }

        .main-landing * {
          color: inherit;
        }

        .main-landing a {
          color: inherit;
          text-decoration: none;
        }

        .app-header {
          padding: 0.75rem 1.5rem;
          background: rgba(15, 23, 42, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
        }

        .app-header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .app-header h1 {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(90deg, #ffffff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .conversion-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 100px;
          font-size: 0.8rem;
        }

        .badge-icon {
          font-size: 1rem;
        }

        .badge-arrow {
          color: #60a5fa;
        }

        .badge-format {
          color: #60a5fa;
          font-weight: 600;
        }

        .privacy-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 100px;
          color: #a7f3d0;
          font-size: 0.75rem;
        }

        .privacy-badge svg {
          color: #10b981;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-blurb {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .converter-section {
          padding: 1rem 1rem 2rem;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .popular-section,
        .features-section,
        .formats-section,
        .how-it-works-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
          color: #f1f5f9;
          text-align: center;
          margin: 0 0 2rem 0;
        }

        /* Popular Conversions */
        .conversions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .conversion-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #f1f5f9 !important;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .conversion-card:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }

        .conversion-card .conversion-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .conversion-card .conversion-label {
          flex: 1;
          font-weight: 500;
          color: #f1f5f9;
        }

        .conversion-card svg {
          color: #60a5fa;
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }

        .conversion-card:hover svg {
          opacity: 1;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          list-style: none;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: #60a5fa;
        }

        .feature-card h3 {
          color: #f1f5f9;
          font-size: 1.125rem;
          margin: 0 0 0.5rem 0;
        }

        .feature-card p {
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        /* Formats Grid */
        .formats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .format-card {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          text-align: center;
          list-style: none;
        }

        .format-card h3 {
          color: #60a5fa;
          font-size: 1rem;
          margin: 0 0 0.5rem 0;
        }

        .format-card p {
          color: #94a3b8;
          margin: 0;
          font-size: 0.85rem;
        }

        /* How It Works */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .step-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          text-align: center;
          list-style: none;
        }

        .step-number {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          color: white;
          margin: 0 auto 1rem;
        }

        .step-card h3 {
          color: #f1f5f9;
          font-size: 1.125rem;
          margin: 0 0 0.5rem 0;
        }

        .step-card p {
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        /* CTA Section */
        .cta-section {
          text-align: center;
          background: linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.1) 100%);
        }

        .cta-section p {
          color: #94a3b8;
          margin: 0 0 2rem 0;
        }

        .cta-button {
          display: inline-block;
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          font-weight: 600;
          text-decoration: none;
          border-radius: 100px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 640px) {
          .app-header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .header-title-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .section-container {
            padding: 3rem 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
