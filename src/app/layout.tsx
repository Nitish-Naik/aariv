import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://calmpilot.app"),
  title: {
    default: "CalmPilot | AI-Powered Digital Proxy for Work Automation",
    template: "%s | CalmPilot",
  },
  description:
    "CalmPilot is an AI-powered digital proxy that connects to your Gmail, Calendar & Slack via OAuth and quietly handles your work 24/7. Get daily briefings, automate email triage, and let AI handle repetitive tasks while you focus on what matters.",
  keywords: [
    "AI agent",
    "AI automation",
    "workflow automation",
    "AI assistant",
    "task automation",
    "digital proxy",
    "AI workflow orchestration",
    "OAuth integration",
    "sandboxed execution",
    "productivity AI",
    "AI-powered automation",
    "no-code automation",
    "intelligent automation",
    "CalmPilot",
    "AI work assistant",
    "automated workflows",
    "Gmail automation",
    "Slack automation",
    "Notion automation",
    "AI task management",
    "smart triggers",
    "daily briefings AI",
    "AI productivity tool",
    "work automation tool",
  ],
  authors: [{ name: "CalmPilot Team", url: "https://calmpilot.app" }],
  creator: "CalmPilot",
  publisher: "CalmPilot",
  alternates: {
    canonical: "https://calmpilot.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://calmpilot.app",
    title: "CalmPilot | AI-Powered Digital Proxy for Work Automation",
    description:
      "CalmPilot connects to your Gmail, Calendar & Slack via OAuth and quietly handles your work 24/7. Automate emails, manage meetings, get daily briefings — all without lifting a finger.",
    siteName: "CalmPilot",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CalmPilot - A quieter way to get work done",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CalmPilot | A quieter way to get work done",
    description:
      "An AI-powered digital proxy that connects to your Gmail, Calendar & Slack and quietly handles your work 24/7. Daily briefings, smart triggers, automated workflows.",
    images: ["/opengraph-image"],
    creator: "@calmpilot",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CalmPilot",
  },
  icons: {
    icon: [
      { url: "/icons/icon-256.png", type: "image/png", sizes: "256x256" },
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/icon-256.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "CalmPilot",
      operatingSystem: "Web",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Productivity",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "CalmPilot is a 24/7 AI-powered digital proxy that connects to your Gmail, Calendar & Slack via OAuth and quietly handles your work. Features include daily briefings, smart triggers, automated workflows, review queue, and AI chat assistant.",
      url: "https://calmpilot.app",
      featureList: [
        "Gmail, Calendar & Slack integrations via OAuth",
        "Daily AI-powered briefings",
        "Smart triggers and automation",
        "Review queue with human-in-the-loop approval",
        "AI chat assistant",
        "Sandboxed execution environment",
        "24/7 autonomous operation",
      ],
      screenshot: "https://calmpilot.app/og-image.png",
    },
    {
      "@type": "Organization",
      name: "CalmPilot",
      url: "https://calmpilot.app",
      logo: "https://calmpilot.app/icons/icon-192.svg",
    },
    {
      "@type": "WebSite",
      name: "CalmPilot",
      url: "https://calmpilot.app",
      potentialAction: {
        "@type": "SearchAction",
        target:
          "https://calmpilot.app/dashboard/assistant?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CalmPilot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CalmPilot is an AI-powered digital proxy that connects to your Gmail, Calendar & Slack through secure OAuth and quietly handles your work 24/7. It automates email triage, sends daily briefings, manages smart triggers, and provides an AI chat assistant — all while keeping you in control with human-in-the-loop approval for sensitive actions.",
      },
    },
    {
      "@type": "Question",
      name: "How does CalmPilot differ from Zapier or Make?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Unlike Zapier or Make which require you to build workflows manually, CalmPilot uses natural language AI to understand what you need and orchestrate complex multi-step workflows automatically across your connected apps with sandboxed execution.",
      },
    },
    {
      "@type": "Question",
      name: "What apps does CalmPilot integrate with?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CalmPilot integrates with Gmail, Google Calendar, and Slack via OAuth — with more integrations coming soon. All connections are secure, password-free, and revocable at any time.",
      },
    },
    {
      "@type": "Question",
      name: "Is CalmPilot secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. CalmPilot uses OAuth-only authentication (no passwords stored), sandboxed execution environments, and human-in-the-loop approval for any sensitive or destructive actions. You maintain full control.",
      },
    },
    {
      "@type": "Question",
      name: "How is CalmPilot different from ChatGPT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "While ChatGPT generates text responses, CalmPilot is an AI agent that actually takes action on your behalf — connecting directly to your apps via OAuth to send emails, create tasks, update databases, and run complex workflows autonomously.",
      },
    },
  ],
};

const simpleAnalyticsEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_ENABLED === "true";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", inter.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="antialiased overflow-x-hidden">
        <Providers>{children}</Providers>

        {simpleAnalyticsEnabled && (
          <>
            <Script
              src="https://scripts.simpleanalyticscdn.com/latest.js"
              strategy="lazyOnload"
              data-collect-dnt="true"
            />
            <noscript>
              <img
                src="https://queue.simpleanalyticscdn.com/noscript.gif?collect-dnt=true"
                alt=""
                referrerPolicy="no-referrer-when-downgrade"
              />
            </noscript>
          </>
        )}
        <Analytics />
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
