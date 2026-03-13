import { INTEGRATIONS, INTEGRATION_SLUGS, getIntegration } from "@/lib/integrations-data";
import Footer from "@/components/secure-agent/Footer";
import Navbar from "@/components/secure-agent/Navbar";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight, Zap } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return INTEGRATION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const integration = getIntegration(params.slug);
  if (!integration) return {};

  const title = `AI Assistant for ${integration.name} — CalmPilot`;
  const description = integration.description;
  const canonical = `https://calmpilot.app/integrations/${integration.slug}`;

  return {
    title,
    description,
    keywords: integration.keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "CalmPilot",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default function IntegrationPage({ params }: Props) {
  const integration = getIntegration(params.slug);
  if (!integration) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `AI Assistant for ${integration.name}`,
    description: integration.description,
    url: `https://calmpilot.app/integrations/${integration.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://calmpilot.app" },
        { "@type": "ListItem", position: 2, name: "Integrations", item: "https://calmpilot.app/integrations" },
        { "@type": "ListItem", position: 3, name: integration.name, item: `https://calmpilot.app/integrations/${integration.slug}` },
      ],
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "CalmPilot",
      applicationCategory: "BusinessApplication",
      description: `CalmPilot AI assistant for ${integration.name}: ${integration.description}`,
      url: "https://calmpilot.app",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: integration.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const otherIntegrations = INTEGRATIONS.filter((i) => i.slug !== integration.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-zinc-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />
          <div className="relative max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-sm text-zinc-500 mb-8">
              <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/integrations" className="hover:text-zinc-300 transition-colors">Integrations</Link>
              <span>/</span>
              <span className="text-zinc-300">{integration.name}</span>
            </nav>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center p-4 shadow-xl">
                <Image
                  src={integration.logo}
                  alt={`${integration.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-5">
              <Zap size={12} />
              {integration.category} Integration
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
              {integration.tagline}
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {integration.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-colors"
              >
                Connect {integration.name} Free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/#waitlist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-zinc-200 font-medium text-sm border border-white/10 hover:bg-zinc-800 transition-colors"
              >
                Join Waitlist
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              What CalmPilot does with {integration.name}
            </h2>
            <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">
              Real automations that save hours every week — no setup required.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {integration.useCases.map((uc) => (
                <div
                  key={uc.title}
                  className="rounded-2xl bg-zinc-900 border border-white/[0.06] p-6 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Zap size={14} className="text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm">{uc.title}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{uc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features list */}
        <section className="py-16 px-4 bg-zinc-900/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Everything CalmPilot can do in {integration.name}
            </h2>
            <p className="text-zinc-500 mb-10">All actions available via chat or automated triggers.</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {integration.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Check size={11} className="text-green-400" strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-12">
              Set up in under 2 minutes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { step: "1", title: `Connect ${integration.name}`, body: `OAuth in one click — no passwords stored, no API keys to manage.` },
                { step: "2", title: "Tell CalmPilot what to do", body: `Describe what you want automated in plain English. CalmPilot handles the rest.` },
                { step: "3", title: "Work runs itself", body: `CalmPilot monitors, acts, and reports back in your daily briefing — 24/7.` },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-white text-sm">{s.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-zinc-900/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {integration.faq.map((item) => (
                <div key={item.question} className="border-b border-white/[0.06] pb-6 last:border-0">
                  <h3 className="font-semibold text-white text-sm mb-2">{item.question}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other integrations */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white text-center mb-8">
              Also works with
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {otherIntegrations.map((other) => (
                <Link
                  key={other.slug}
                  href={`/integrations/${other.slug}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-white/[0.06] hover:border-white/10 transition-colors group"
                >
                  <Image
                    src={other.logo}
                    alt={other.name}
                    width={28}
                    height={28}
                    className="object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors text-center leading-tight">
                    {other.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/integrations"
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
              >
                View all integrations <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to automate {integration.name}?
            </h2>
            <p className="text-zinc-400 mb-8">
              Connect {integration.name} to CalmPilot in one click and let AI handle the work.
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
