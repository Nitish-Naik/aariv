"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const stats = [
  { value: "3", label: "Core apps" },
  { value: "3h+", label: "Saved per day" },
  { value: "24/7", label: "Always running" },
  { value: "100%", label: "OAuth secure" },
];

const useCases = [
  {
    persona: "Founder",
    before: "45 minutes every morning scanning email and Slack before real work starts.",
    after: "Morning brief at 6:47am. Replies drafted, conflicts resolved, Slack digested. Day starts in 2 minutes.",
    apps: "Gmail · Slack · Calendar",
  },
  {
    persona: "Sales Rep",
    before: "Losing leads because follow-up emails slip through the cracks.",
    after: "CalmPilot flags urgent replies, drafts follow-ups, and alerts you to calendar conflicts.",
    apps: "Gmail · Calendar",
  },
  {
    persona: "Engineer",
    before: "Context-switching between email, Slack, and calendar 30+ times a day.",
    after: "One brief covers everything. Slack summaries, meeting prep, urgent emails — 2 minutes.",
    apps: "Gmail · Slack · Calendar",
  },
];

export default function SocialProof() {
  return (
    <section className="bg-black relative py-16 sm:py-20">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.06]"
        >
          {stats.map((s, i) => (
            <div key={i} className="bg-zinc-950 px-6 py-5 text-center">
              <p className="text-2xl font-bold text-white tabular-nums tracking-tight">{s.value}</p>
              <p className="text-[11px] text-zinc-500 mt-1 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Use Cases */}
        <div className="mt-14 sm:mt-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-6 text-center"
          >
            What actually changes
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 flex flex-col gap-4"
              >
                <span className="self-start text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.12em] px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  {uc.persona}
                </span>

                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">Before</p>
                  <p className="text-zinc-500 text-[13px] leading-relaxed">{uc.before}</p>
                </div>

                <div className="flex justify-center">
                  <div className="w-6 h-6 rounded-full border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center">
                    <ArrowDown size={12} className="text-emerald-400" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold mb-1.5">After</p>
                  <p className="text-zinc-300 text-[13px] leading-relaxed">{uc.after}</p>
                </div>

                <p className="text-[11px] text-zinc-600 font-mono mt-auto pt-3 border-t border-white/[0.05]">
                  {uc.apps}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
