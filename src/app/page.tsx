import FAQ from "@/components/secure-agent/FAQ";
import FeaturesGrid from "@/components/secure-agent/FeaturesGrid";
import FinalCTA from "@/components/secure-agent/FinalCTA";
import Footer from "@/components/secure-agent/Footer";
import Hero from "@/components/secure-agent/Hero";
import HowItWorks from "@/components/secure-agent/HowItWorks";
import IntegrationsShowcase from "@/components/secure-agent/IntegrationsShowcase";
import Navbar from "@/components/secure-agent/Navbar";
import PricingSection from "@/components/secure-agent/PricingSection";
import SecurityBand from "@/components/secure-agent/SecurityBand";
import SocialProof from "@/components/secure-agent/SocialProof";
import Testimonials from "@/components/secure-agent/Testimonials";
import UseCaseList from "@/components/secure-agent/UseCaseList";
import WhatIsCalmPilot from "@/components/secure-agent/WhatIsCalmPilot";
import { Metadata } from "next";

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
