"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const ConverterApp = dynamic(() => import("./ConverterApp"), { ssr: false });

export interface ConversionType {
  from: string;
  fromLabel: string;
  to: string;
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

export default function ConversionLandingPage({ conversion }: ConversionLandingPageProps) {
  return (
    <div className="conversion-landing">
      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content">
          <div className="conversion-badge">
            <span className="badge-icon">{conversion.icon}</span>
            <span className="badge-arrow">→</span>
            <span className="badge-format">{conversion.toLabel}</span>
          </div>
          <h1>
            Free {conversion.fromLabel} to {conversion.toLabel} Converter
          </h1>
          <p className="hero-description">{conversion.description}</p>
          <div className="hero-features">
            <div className="feature-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              100% Private
            </div>
            <div className="feature-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              Instant Conversion
            </div>
            <div className="feature-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              No Upload Required
            </div>
          </div>
        </div>
      </header>

      {/* Converter Section */}
      <section className="converter-section" id="converter">
        <ConverterApp />
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2>Why Use Our {conversion.fromLabel} to {conversion.toLabel} Converter?</h2>
          <div className="features-grid">
            {conversion.features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-number">{index + 1}</div>
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases-section">
        <div className="section-container">
          <h2>Common Use Cases</h2>
          <div className="use-cases-grid">
            {conversion.useCases.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {conversion.faq.map((item, index) => (
              <details key={index} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Other Conversions */}
      <section className="other-conversions-section">
        <div className="section-container">
          <h2>Other Popular Conversions</h2>
          <div className="conversions-links">
            {[
              { href: "/word-to-pdf", label: "Word to PDF", from: "docx", to: "pdf" },
              { href: "/excel-to-pdf", label: "Excel to PDF", from: "xlsx", to: "pdf" },
              { href: "/powerpoint-to-pdf", label: "PowerPoint to PDF", from: "pptx", to: "pdf" },
              { href: "/pdf-to-word", label: "PDF to Word", from: "pdf", to: "docx" },
              { href: "/pdf-to-excel", label: "PDF to Excel", from: "pdf", to: "xlsx" },
              { href: "/pdf-to-powerpoint", label: "PDF to PowerPoint", from: "pdf", to: "pptx" },
            ]
              .filter((link) => !(link.from === conversion.from && link.to === conversion.to))
              .map((link) => (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2>Ready to Convert Your Files?</h2>
          <p>No sign-up required. Your files stay on your device.</p>
          <a href="#converter" className="cta-button">
            Start Converting Now
          </a>
        </div>
      </section>

      <style jsx>{`
        .conversion-landing {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: #f1f5f9;
        }

        .conversion-landing a {
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

        .conversion-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1.25rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 100px;
          margin-bottom: 1.5rem;
        }

        .badge-icon {
          font-size: 1.25rem;
        }

        .badge-arrow {
          color: #60a5fa;
        }

        .badge-format {
          color: #60a5fa;
          font-weight: 600;
        }

        .landing-hero h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          background: linear-gradient(90deg, #ffffff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 1rem 0;
          line-height: 1.1;
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

        .features-section,
        .use-cases-section,
        .faq-section,
        .other-conversions-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .features-section h2,
        .use-cases-section h2,
        .faq-section h2,
        .other-conversions-section h2,
        .cta-section h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
          color: #f1f5f9;
          text-align: center;
          margin: 0 0 2rem 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .feature-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .feature-card p {
          margin: 0;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .use-case-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          color: #a7f3d0;
        }

        .use-case-card svg {
          flex-shrink: 0;
          color: #10b981;
        }

        .faq-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
        }

        .faq-item summary {
          padding: 1.25rem;
          color: #f1f5f9;
          font-weight: 500;
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .faq-item summary::-webkit-details-marker {
          display: none;
        }

        .faq-item summary::after {
          content: '+';
          font-size: 1.5rem;
          color: #60a5fa;
        }

        .faq-item[open] summary::after {
          content: '−';
        }

        .faq-item p {
          padding: 0 1.25rem 1.25rem;
          margin: 0;
          color: #94a3b8;
          line-height: 1.6;
        }

        .conversions-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }

        .conversions-links a {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #f1f5f9 !important;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .conversions-links a:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.3);
          color: #60a5fa !important;
        }

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
        }
      `}</style>
    </div>
  );
}

