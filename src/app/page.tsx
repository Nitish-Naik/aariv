import FeaturesGrid from "@/components/secure-agent/FeaturesGrid";
import FinalCTA from "@/components/secure-agent/FinalCTA";
import Footer from "@/components/secure-agent/Footer";
import Hero from "@/components/secure-agent/Hero";
import Navbar from "@/components/secure-agent/Navbar";
import UseCaseList from "@/components/secure-agent/UseCaseList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "YourProxy | A quieter way to get work done",
  description: "An intelligent presence that quietly handles your tasks across all your apps without ever demanding your attention or compromising your security.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-zinc-800">
      <Navbar />

      <main>
        <Hero />
        <FeaturesGrid />
        <UseCaseList />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
