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
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "CalmPilot | AI-Powered Digital Proxy - A Quieter Way to Get Work Done",
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

        <section className="py-14 border-y border-white/[0.06] bg-gradient-to-b from-zinc-950 to-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-8 md:px-10 md:py-9 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-[0.18em] font-semibold">
                  Second chance
                </p>
                <h3 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-white">
                  Ready to save 3+ hours a day?
                </h3>
                <p className="mt-2 text-zinc-400 text-sm md:text-base">
                  Join the waitlist and get early access pricing before public
                  launch.
                </p>
              </div>

              <Link
                href="#waitlist"
                className="inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                Join Waitlist
              </Link>
            </div>
          </div>
        </section>

        <FeaturesGrid />
        <SecurityBand />
        <WhatIsCalmPilot />
        <FAQ />
        <UseCaseList />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
