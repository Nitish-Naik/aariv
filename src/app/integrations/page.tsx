import { INTEGRATIONS } from "@/lib/integrations-data";
import Footer from "@/components/secure-agent/Footer";
import Navbar from "@/components/secure-agent/Navbar";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Assistant Integrations — CalmPilot",
  description:
    "CalmPilot connects to 500+ apps via OAuth. Browse AI automation integrations for Gmail, Slack, Notion, GitHub, Google Calendar, HubSpot, Linear, Airtable, and more.",
  keywords: [
    "AI assistant integrations",
    "AI automation apps",
    "Gmail AI assistant",
    "Slack AI assistant",
    "Notion AI assistant",
    "GitHub AI assistant",
    "workflow automation integrations",
    "AI productivity integrations",
    "CalmPilot integrations",
  ],
  alternates: {
    canonical: "https://calmpilot.app/integrations",
  },
  openGraph: {
    title: "AI Assistant Integrations — CalmPilot",
    description: "Browse 500+ AI automation integrations. Connect your apps and let CalmPilot handle the work.",
    url: "https://calmpilot.app/integrations",
    type: "website",
    siteName: "CalmPilot",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CalmPilot Integrations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Assistant Integrations — CalmPilot",
    description: "Browse 500+ AI automation integrations. Connect your apps and let CalmPilot handle the work.",
    images: ["/opengraph-image"],
  },
};

const CATEGORIES = Array.from(new Set(INTEGRATIONS.map((i) => i.category)));

export default function IntegrationsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CalmPilot Integrations",
    description: "AI automation integrations for 500+ apps including Gmail, Slack, Notion, GitHub, and more.",
    url: "https://calmpilot.app/integrations",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://calmpilot.app" },
        { "@type": "ListItem", position: 2, name: "Integrations", item: "https://calmpilot.app/integrations" },
      ],
    },
    hasPart: INTEGRATIONS.map((i) => ({
      "@type": "WebPage",
      name: `AI Assistant for ${i.name}`,
      url: `https://calmpilot.app/integrations/${i.slug}`,
      description: i.description,
    })),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-zinc-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />
          <div className="relative max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-sm text-zinc-500 mb-8">
              <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-zinc-300">Integrations</span>
            </nav>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
              AI Assistant for Every App You Use
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
              CalmPilot connects to 500+ apps via OAuth and automates your work — no passwords, no setup, no manual entry.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-colors"
            >
              Connect Your Apps Free <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Integration grid by category */}
        {CATEGORIES.map((category) => {
          const items = INTEGRATIONS.filter((i) => i.category === category);
          return (
            <section key={category} className="py-10 px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-6">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((integration) => (
                    <Link
                      key={integration.slug}
                      href={`/integrations/${integration.slug}`}
                      className="group flex items-start gap-4 p-5 rounded-2xl bg-zinc-900 border border-white/[0.06] hover:border-white/10 transition-all hover:bg-zinc-900/80"
                    >
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-zinc-800 border border-white/[0.06] flex items-center justify-center p-2.5">
                        <Image
                          src={integration.logo}
                          alt={integration.name}
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-violet-300 transition-colors">
                          AI for {integration.name}
                        </h3>
                        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                          {integration.useCases[0].description}
                        </p>
                      </div>
                      <ArrowRight
                        size={14}
                        className="flex-shrink-0 mt-0.5 text-zinc-600 group-hover:text-violet-400 transition-colors"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* More coming */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl bg-zinc-900/60 border border-white/[0.06] p-8 text-center">
              <p className="text-3xl font-bold text-white mb-2">500+</p>
              <p className="text-zinc-400 text-sm mb-1">apps available via CalmPilot</p>
              <p className="text-zinc-600 text-xs">
                Including Salesforce, Jira, Confluence, Zoom, Calendly, Shopify, and hundreds more.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              One AI assistant. All your apps.
            </h2>
            <p className="text-zinc-400 mb-8">
              Connect any app in one click and let CalmPilot handle the work — 24/7.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-colors"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
