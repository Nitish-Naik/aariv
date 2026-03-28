import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CalmPilot - A quieter way to get work done";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          padding: "60px",
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            display: "flex",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 0 60px rgba(99,102,241,0.4)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "white",
              opacity: 0.9,
            }}
          />
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            marginBottom: 20,
            background: "linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.7))",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-2px",
          }}
        >
          CalmPilot
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            fontWeight: 300,
            marginBottom: 40,
          }}
        >
          A quieter way to get work done
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            fontSize: 16,
            color: "#6366f1",
          }}
        >
          <span>Gmail + Calendar + Slack</span>
          <span style={{ color: "#333" }}>•</span>
          <span>AI-Powered</span>
          <span style={{ color: "#333" }}>•</span>
          <span>OAuth Secure</span>
          <span style={{ color: "#333" }}>•</span>
          <span>24/7 Automation</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
