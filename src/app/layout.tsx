
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL('https://yourproxy.me'),
  title: {
    default: "YourProxy | A quieter way to get work done",
    template: "%s | YourProxy",
  },
  description: "YourProxy is an intelligent AI agent that quietly handles your tasks across all your apps without ever demanding your attention or compromising your security.",
  keywords: ["AI agent", "automation", "workflow orchestration", "secure AI", "sandboxed execution", "oauth integration"],
  authors: [{ name: "YourProxy Team" }],
  creator: "YourProxy",
  publisher: "YourProxy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourproxy.me",
    title: "YourProxy | A quieter way to get work done",
    description: "YourProxy is an intelligent AI agent that quietly handles your tasks across all your apps.",
    siteName: "YourProxy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YourProxy Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YourProxy | A quieter way to get work done",
    description: "An intelligent AI agent that silently handles your tasks across 1000+ apps.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YourProxy",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "YourProxy",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "YourProxy is a 24/7 AI assistant with 1000+ tools via OAuth and sandboxed execution. Built to securely orchestrate your workflows.",
  "url": "https://yourproxy.me"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased overflow-x-hidden">
        <Providers>{children}</Providers>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
