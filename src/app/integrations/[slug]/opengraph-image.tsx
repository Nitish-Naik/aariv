import { getIntegration, INTEGRATION_SLUGS } from "@/lib/integrations-data";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CalmPilot Integration";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return INTEGRATION_SLUGS.map((slug) => ({ slug }));
}

export default async function OGImage({ params }: { params: { slug: string } }) {
  const integration = getIntegration(params.slug);
  const name = integration?.name ?? params.slug;
  const tagline = integration?.tagline ?? `AI Assistant for ${name}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#050505",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(99,102,241,0.4)",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: "white",
                opacity: 0.9,
              }}
            />
          </div>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#a1a1aa" }}>
            CalmPilot
          </span>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 16,
            background: "linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.7))",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-1.5px",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "#71717a",
            fontWeight: 300,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          {tagline}
        </div>

        {/* Bottom pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 15,
          }}
        >
          <span
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 999,
              padding: "6px 16px",
              color: "#818cf8",
            }}
          >
            OAuth Secure
          </span>
          <span
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 999,
              padding: "6px 16px",
              color: "#818cf8",
            }}
          >
            24/7 Automation
          </span>
          <span
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 999,
              padding: "6px 16px",
              color: "#818cf8",
            }}
          >
            AI-Powered
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
