"use client";

import { motion } from "framer-motion";

const capabilities = [
  {
    label: "Daily Briefings",
    desc: "AI-generated summary of everything important across Gmail, Calendar & Slack, every morning.",
  },
  {
    label: "Smart Triggers",
    desc: "Event-driven automation — new email arrives, calendar conflict detected, Slack DM received — your AI handles it.",
  },
  {
    label: "Review Queue",
    desc: "Sensitive actions pause for your approval. You stay in control without being overwhelmed.",
  },
  {
    label: "AI Chat",
    desc: "Tell your AI what to do in plain English. It reads, drafts, sends, schedules — across all your apps.",
  },
  {
    label: "OAuth Integrations",
    desc: "Gmail, Calendar & Slack connected in one click. No passwords. More integrations coming soon.",
  },
  {
    label: "24/7 Operation",
    desc: "Works while you sleep. Scheduled tasks, triggered workflows, morning brief — all automatic.",
  },
];

const comparisons = [
  { feature: "Runs 24/7 without you asking", calmpilot: true, chatgpt: false, zapier: false },
  { feature: "Daily morning briefing", calmpilot: true, chatgpt: false, zapier: false },
  { feature: "Natural language commands", calmpilot: true, chatgpt: true, zapier: false },
  { feature: "Takes real action (sends emails, creates events)", calmpilot: true, chatgpt: false, zapier: true },
  { feature: "No manual workflow building", calmpilot: true, chatgpt: true, zapier: false },
  { feature: "Human-in-the-loop approval", calmpilot: true, chatgpt: false, zapier: false },
  { feature: "OAuth-only (no passwords)", calmpilot: true, chatgpt: false, zapier: true },
];

export default function WhatIsCalmPilot() {
  return (
    <section className="py-24 sm:py-32 bg-zinc-950 relative">
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-indigo-400 text-sm font-medium tracking-wide mb-4">About</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.03em] mb-8">
            What is CalmPilot?
          </h2>

          <div className="space-y-5 text-zinc-400 leading-relaxed text-lg font-light mb-16">
            <p>
              <strong className="text-white font-medium">CalmPilot</strong> is an{" "}
              <strong className="text-white font-medium">always-on AI agent</strong>{" "}
              that connects to your Gmail, Calendar & Slack through secure OAuth and works on your behalf — 24/7. Unlike chatbots that wait for you to ask, CalmPilot monitors your apps, triages your inbox, resolves calendar conflicts, and sends you one morning brief with everything that needs attention.
            </p>
            <p>
              Think of it as a chief of staff who never sleeps. It handles the repetitive work so you can focus on what actually requires your judgment. Sensitive actions always pause for your approval.
            </p>
          </div>

          {/* Capabilities */}
          <h3 className="text-lg font-semibold text-white mb-6 tracking-[-0.01em]">Key capabilities</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-16">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white/[0.015] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors duration-300"
              >
                <div className="text-sm font-semibold text-white mb-1.5">{cap.label}</div>
                <div className="text-[13px] text-zinc-500 leading-relaxed">{cap.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* Comparison */}
          <h3 className="text-lg font-semibold text-white mb-6 tracking-[-0.01em]">CalmPilot vs the alternatives</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3.5 text-zinc-500 font-medium text-[13px]">Feature</th>
                  <th className="px-5 py-3.5 text-indigo-400 font-semibold text-center text-[13px]">CalmPilot</th>
                  <th className="px-5 py-3.5 text-zinc-500 font-medium text-center text-[13px]">ChatGPT</th>
                  <th className="px-5 py-3.5 text-zinc-500 font-medium text-center text-[13px]">Zapier</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-5 py-3 text-zinc-400 text-[13px]">{row.feature}</td>
                    <td className="px-5 py-3 text-center">
                      {row.calmpilot ? <span className="text-emerald-400">✓</span> : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.chatgpt ? <span className="text-emerald-400">✓</span> : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.zapier ? <span className="text-emerald-400">✓</span> : <span className="text-zinc-700">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
