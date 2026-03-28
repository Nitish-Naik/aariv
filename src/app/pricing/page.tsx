"use client";

import Navbar from "@/components/secure-agent/Navbar";
import Footer from "@/components/secure-agent/Footer";
import { useAuth } from "@/context/AuthContext";
import { BillingProvider, useBilling } from "@/context/useBilling";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    period: "forever",
    description: "Try CalmPilot with no commitment.",
    cta: "Get Started Free",
    features: [
      "Gmail, Calendar & Slack",
      "3 active triggers",
      "50 chat messages / month",
      "No daily briefing",
      "Fast AI model (GPT-4.1 Mini)",
    ],
    note: "No credit card required",
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    priceLabel: "$19",
    period: "/ month",
    description: "For professionals who want their morning brief.",
    cta: "Get Started",
    highlight: true,
    badge: "Most popular",
    features: [
      "Gmail, Calendar & Slack",
      "Unlimited triggers",
      "500 chat messages / month",
      "Daily morning briefing",
      "Standard AI model (GPT-4.1)",
    ],
    note: "Cancel anytime",
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceLabel: "$49",
    period: "/ month",
    description: "For power users who want the best AI.",
    cta: "Get Started",
    features: [
      "Everything in Starter",
      "2,000 chat messages / month",
      "Priority daily briefing",
      "Most powerful AI model",
      "Priority support",
    ],
    note: "Cancel anytime",
  },
];

function PricingContent() {
  const { user } = useAuth();
  const { balanceData } = useBilling();
  const router = useRouter();

  const currentTier = balanceData?.subscription_tier ?? "free";

  function handleCta(planId: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (planId === "free") {
      router.push("/dashboard");
      return;
    }
    router.push(`/checkout?plan=${planId}`);
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-28 pb-8 text-center">
        <p className="text-indigo-400 text-sm font-medium tracking-wide mb-4">
          Pricing
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-4">
          Simple pricing. No surprises.
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto font-light">
          Start free. Upgrade when your AI starts doing more work than you do.
        </p>
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentTier === plan.id;
            const isHighlight = plan.highlight;

            return (
              <div
                key={plan.id}
                className={[
                  "relative rounded-2xl border p-6 sm:p-7 flex flex-col transition-all duration-300",
                  isHighlight
                    ? "border-violet-500/30 bg-white/[0.025] shadow-[0_0_40px_-15px_rgba(139,92,246,0.2)]"
                    : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.1]",
                ].join(" ")}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-[11px] font-semibold tracking-wide">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-xs text-zinc-500 uppercase tracking-[0.12em] font-semibold mb-3">
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white tracking-tight">
                      {plan.priceLabel}
                    </span>
                    <span className="text-zinc-500 text-sm mb-1">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <Check
                        size={14}
                        strokeWidth={2}
                        className={`${isHighlight ? "text-violet-400" : "text-emerald-500"} shrink-0 mt-0.5`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCta(plan.id)}
                  disabled={isCurrentPlan}
                  className={[
                    "w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.97]",
                    isCurrentPlan
                      ? "bg-zinc-900 text-zinc-600 cursor-default"
                      : isHighlight
                      ? "bg-violet-600 hover:bg-violet-500 text-white"
                      : "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] text-zinc-300",
                  ].join(" ")}
                >
                  {isCurrentPlan ? "Current plan" : plan.cta}
                </button>

                {plan.note && (
                  <p className="text-[11px] text-zinc-600 text-center mt-2.5">
                    {plan.note}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust */}
        <div className="mt-14 sm:mt-16 text-center text-sm text-zinc-500 space-y-2">
          <p>All plans include a 7-day free trial. Cancel anytime.</p>
          <p>
            Questions?{" "}
            <Link
              href="mailto:support@calmpilot.app"
              className="text-zinc-400 hover:text-white transition-colors duration-200 underline underline-offset-2"
            >
              support@calmpilot.app
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <BillingProvider>
      <PricingContent />
    </BillingProvider>
  );
}
