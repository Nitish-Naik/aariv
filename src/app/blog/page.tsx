import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — CalmPilot",
  description:
    "Product updates and automation playbooks. Deep dives on workflows, integrations, and AI agent best practices.",
  alternates: { canonical: "https://calmpilot.app/blog" },
  openGraph: {
    title: "Blog — CalmPilot",
    description:
      "Product updates and automation playbooks from the CalmPilot team.",
    url: "https://calmpilot.app/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-200">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
          CalmPilot Blog
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
          Product updates and automation playbooks.
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-8">
          We are preparing our first posts. Check back soon for deep dives on
          workflows, integrations, and AI agent best practices.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 rounded-md border border-white/15 px-4 text-sm font-medium hover:bg-white/5 transition-colors"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
