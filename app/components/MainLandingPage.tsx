"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const ConverterApp = dynamic(() => import("./ConverterApp"), { ssr: false });

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

export default function MainLandingPage() {
  return (
    <div className="main-landing">
      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>100% Private — Files Never Leave Your Browser</span>
          </div>
          <h1>Free Office Document Converter</h1>
          <p className="hero-description">
            Convert Word, Excel, PowerPoint, PDF and more — completely free, with no uploads. 
            Powered by LibreOffice WebAssembly technology running entirely in your browser.
          </p>
          <div className="hero-features">
            <div className="feature-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              No Sign-up
            </div>
            <div className="feature-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              No Limits
            </div>
            <div className="feature-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              No Ads
            </div>
          </div>
        </div>
      </header>

      {/* Converter Section */}
      <section className="converter-section" id="converter">
        <ConverterApp />
      </section>

      {/* Popular Conversions */}
      <section className="popular-section">
        <div className="section-container">
          <h2>Popular Conversions</h2>
          <div className="conversions-grid">
            {popularConversions.map((conv) => (
              <Link key={conv.href} href={conv.href} className="conversion-card">
                <span className="conversion-icon">{conv.icon}</span>
                <span className="conversion-label">{conv.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2>Why Choose ConvertMyDocuments?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="formats-section">
        <div className="section-container">
          <h2>Supported File Formats</h2>
          <div className="formats-grid">
            {supportedFormats.map((format, index) => (
              <div key={index} className="format-card">
                <h3>{format.name}</h3>
                <p>{format.formats}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="section-container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Upload</h3>
              <p>Select your file or drag & drop. Supports single files or entire folders for batch conversion.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Choose Format</h3>
              <p>Select your desired output format from PDF, Word, Excel, PowerPoint, and more.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Convert</h3>
              <p>Click convert — your file is processed instantly in your browser using WebAssembly.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Download</h3>
              <p>Download your converted file. For batch conversions, get a convenient ZIP archive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2>Ready to Convert Your Documents?</h2>
          <p>No sign-up required. No file limits. Your files stay private.</p>
          <a href="#converter" className="cta-button">
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

        .landing-hero {
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 100px;
          margin-bottom: 1.5rem;
          color: #a7f3d0;
          font-size: 0.9rem;
        }

        .hero-badge svg {
          color: #10b981;
        }

        .landing-hero h1 {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          background: linear-gradient(90deg, #ffffff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 1rem 0;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .hero-description {
          font-size: 1.25rem;
          color: #94a3b8;
          margin: 0 0 2rem 0;
          line-height: 1.6;
        }

        .hero-features {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }

        .feature-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          color: #e2e8f0;
          font-size: 0.9rem;
        }

        .feature-pill svg {
          color: #10b981;
        }

        .converter-section {
          padding: 0 1rem 4rem;
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
        }

        .feature-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
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
        }

        .format-card {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          text-align: center;
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
        }

        .step-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          text-align: center;
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
          .landing-hero {
            padding: 2rem 1rem;
          }

          .section-container {
            padding: 3rem 1rem;
          }

          .hero-features {
            flex-direction: column;
            align-items: center;
          }

          .feature-pill {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

