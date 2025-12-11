import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ConvertMyDocuments - Free Private Document Converter";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Decorative gradient orbs */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            opacity: 0.2,
            filter: "blur(80px)",
            top: "-100px",
            right: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
            opacity: 0.15,
            filter: "blur(60px)",
            bottom: "-50px",
            left: "-50px",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              marginBottom: "32px",
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 18v-6M9 15l3 3 3-3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              background: "linear-gradient(90deg, #ffffff 0%, #94a3b8 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              letterSpacing: "-2px",
              textAlign: "center",
            }}
          >
            ConvertMyDocuments
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: "28px",
              color: "#94a3b8",
              margin: "16px 0 0 0",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            Free Office Document Converter
          </p>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "40px",
            }}
          >
            {["100% Private", "No Uploads", "Browser-Based"].map((feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,255,255,0.1)",
                  padding: "12px 24px",
                  borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ color: "#e2e8f0", fontSize: "18px" }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* URL at bottom */}
        <p
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "20px",
            color: "#64748b",
            margin: 0,
          }}
        >
          convertmydocuments.com
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}

