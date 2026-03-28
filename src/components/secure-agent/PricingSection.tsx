"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try CalmPilot with no commitment.",
    cta: "Get Started",
    href: "/login",
    features: [
      "Gmail, Calendar & Slack",
      "3 active triggers",
      "50 chat messages / month",
      "No daily briefing",
    ],
    note: "No credit card required",
  },
  {
    name: "Starter",
    price: "$19",
    period: "/ month",
    description: "For professionals who want their morning brief.",
    cta: "Get Started",
    href: "/login",
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
    name: "Pro",
    price: "$49",
    period: "/ month",
    description: "For power users who want the best AI.",
    cta: "Get Started",
    href: "/login",
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

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-black">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-indigo-400 text-sm font-medium tracking-wide mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.03em] mb-4"
          >
            Simple pricing. No surprises.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-base max-w-md mx-auto"
          >
            Start free. Upgrade when your AI starts doing more work than you do.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className={[
                "relative rounded-2xl p-6 sm:p-7 flex flex-col border transition-all duration-300",
                plan.highlight
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
                    {plan.price}
                  </span>
                  <span className="text-zinc-500 text-sm mb-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check
                      size={14}
                      strokeWidth={2}
                      className={`${plan.highlight ? "text-violet-400" : "text-emerald-500"} shrink-0 mt-0.5`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={[
                  "w-full py-2.5 rounded-full text-sm font-semibold text-center transition-all duration-200 block active:scale-[0.97]",
                  plan.highlight
                    ? "bg-violet-600 hover:bg-violet-500 text-white"
                    : "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] text-zinc-300",
                ].join(" ")}
              >
                {plan.cta}
              </Link>

              {plan.note && (
                <p className="text-[11px] text-zinc-600 text-center mt-2.5">
                  {plan.note}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-8">
          Cancel anytime · No hidden fees · Secure payments
        </p>
      </div>
    </section>
  );
}
