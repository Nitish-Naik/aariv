import FAQ from "@/components/secure-agent/FAQ";
import FeaturesGrid from "@/components/secure-agent/FeaturesGrid";
import FinalCTA from "@/components/secure-agent/FinalCTA";
import Footer from "@/components/secure-agent/Footer";
import Hero from "@/components/secure-agent/Hero";
import HowItWorks from "@/components/secure-agent/HowItWorks";
import Navbar from "@/components/secure-agent/Navbar";
import SecurityBand from "@/components/secure-agent/SecurityBand";
import SocialProof from "@/components/secure-agent/SocialProof";
import UseCaseList from "@/components/secure-agent/UseCaseList";
import WhatIsCalmPilot from "@/components/secure-agent/WhatIsCalmPilot";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CalmPilot | AI-Powered Digital Proxy - A Quieter Way to Get Work Done",
  description:
    "CalmPilot is an AI-powered digital proxy that connects to 500+ apps via OAuth and quietly handles your tasks 24/7. Automate workflows, get daily briefings, and let AI manage your work while you focus on what matters.",
  alternates: {
    canonical: "https://calmpilot.app",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-neutral-800">
      <Navbar />

      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <FeaturesGrid />
        <SecurityBand />
        <UseCaseList />
        <WhatIsCalmPilot />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
