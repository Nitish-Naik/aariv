import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — CalmPilot",
  description:
    "Simple, transparent pricing for CalmPilot. Start free with 50 messages. Upgrade to Starter or Pro for more AI power and unlimited triggers.",
  alternates: { canonical: "https://calmpilot.app/pricing" },
  openGraph: {
    title: "Pricing — CalmPilot",
    description:
      "Simple, transparent pricing. Start free, upgrade when you need more.",
    url: "https://calmpilot.app/pricing",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
