import ComparisonTable from "@/components/secure-agent/ComparisonTable";
import FeaturesGrid from "@/components/secure-agent/FeaturesGrid";
import FinalCTA from "@/components/secure-agent/FinalCTA";
import Footer from "@/components/secure-agent/Footer";
import Hero from "@/components/secure-agent/Hero";
import Navbar from "@/components/secure-agent/Navbar";
import SecurityBand from "@/components/secure-agent/SecurityBand";
import UseCaseList from "@/components/secure-agent/UseCaseList";
import WhyNotVanilla from "@/components/secure-agent/WhyNotVanilla";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aariv | A quieter way to get work done",
  description: "An intelligent presence that quietly handles your tasks across all your apps without ever demanding your attention or compromising your security.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-zinc-800">
      <Navbar />

      <main>
        <Hero />
        <SecurityBand />
        <FeaturesGrid />
        <WhyNotVanilla />
        <ComparisonTable />
        <UseCaseList />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
