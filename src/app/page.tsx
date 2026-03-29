import dynamic from "next/dynamic";
import Hero from "@/components/secure-agent/Hero";
import Navbar from "@/components/secure-agent/Navbar";
import { Metadata } from "next";

// Lazy-load below-fold sections to reduce initial JS bundle and improve LCP
const SocialProof = dynamic(() => import("@/components/secure-agent/SocialProof"));
const HowItWorks = dynamic(() => import("@/components/secure-agent/HowItWorks"));
const IntegrationsShowcase = dynamic(() => import("@/components/secure-agent/IntegrationsShowcase"));
const FeaturesGrid = dynamic(() => import("@/components/secure-agent/FeaturesGrid"));
const SecurityBand = dynamic(() => import("@/components/secure-agent/SecurityBand"));
const WhatIsCalmPilot = dynamic(() => import("@/components/secure-agent/WhatIsCalmPilot"));
const UseCaseList = dynamic(() => import("@/components/secure-agent/UseCaseList"));
const PricingSection = dynamic(() => import("@/components/secure-agent/PricingSection"));
const FAQ = dynamic(() => import("@/components/secure-agent/FAQ"));
const Testimonials = dynamic(() => import("@/components/secure-agent/Testimonials"));
const FinalCTA = dynamic(() => import("@/components/secure-agent/FinalCTA"));
const Footer = dynamic(() => import("@/components/secure-agent/Footer"));

export const metadata: Metadata = {
  title:
    "CalmPilot | AI-Powered Digital Proxy - A Quieter Way to Get Work Done",
  description:
    "CalmPilot is an AI-powered digital proxy that connects to your Gmail, Calendar & Slack via OAuth and quietly handles your tasks 24/7. Get daily briefings, automate email triage, and let AI manage your work while you focus on what matters.",
  alternates: {
    canonical: "https://calmpilot.app",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-neutral-800">
      <Navbar />

      <main>
        {/* 1. Hero — The first impression */}
        <Hero />

        {/* 2. Social proof — Stats + before/after */}
        <SocialProof />

        {/* 3. How it works — 3 simple steps */}
        <HowItWorks />

        {/* 4. Integrations showcase — Core 3 apps + morning brief preview */}
        <IntegrationsShowcase />

        {/* 5. Features — What it can do */}
        <FeaturesGrid />

        {/* 6. Security — Trust signals */}
        <SecurityBand />

        {/* 7. What is CalmPilot — Detailed explanation */}
        <WhatIsCalmPilot />

        {/* 8. Use cases — Power user prompts */}
        <UseCaseList />

        {/* 9. Pricing — Tiers */}
        <PricingSection />

        {/* 10. FAQ */}
        <FAQ />

        {/* 11. Early access CTA */}
        <Testimonials />

        {/* 12. Final CTA */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
