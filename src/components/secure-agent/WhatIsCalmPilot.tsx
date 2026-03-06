"use client";

import { motion } from "framer-motion";

const capabilities = [
  {
    label: "Daily Briefings",
    desc: "AI-generated summaries of everything important across all your connected apps, every morning.",
  },
  {
    label: "Smart Triggers",
    desc: "Event-driven automation that chains multiple apps together when specific conditions are met.",
  },
  {
    label: "Review Queue",
    desc: "Human-in-the-loop approval for sensitive actions — you always stay in control.",
  },
  {
    label: "AI Chat Assistant",
    desc: "Natural language interface to command your entire app ecosystem in plain English.",
  },
  {
    label: "Integration Management",
    desc: "Connect and manage 1000+ apps from a single secure dashboard via OAuth.",
  },
  {
    label: "24/7 Autonomous Operation",
    desc: "Works while you sleep — scheduled tasks, triggered workflows, handled automatically.",
  },
];

const comparisons = [
  {
    feature: "Works across all your apps",
    calmpilot: true,
    chatgpt: false,
    zapier: true,
  },
  {
    feature: "Natural language commands",
    calmpilot: true,
    chatgpt: true,
    zapier: false,
  },
  {
    feature: "Takes real action (not just text)",
    calmpilot: true,
    chatgpt: false,
    zapier: true,
  },
  {
    feature: "No manual workflow building",
    calmpilot: true,
    chatgpt: true,
    zapier: false,
  },
  {
    feature: "Daily briefings & summaries",
    calmpilot: true,
    chatgpt: false,
    zapier: false,
  },
  {
    feature: "Human-in-the-loop approval",
    calmpilot: true,
    chatgpt: false,
    zapier: false,
  },
  {
    feature: "OAuth-only security",
    calmpilot: true,
    chatgpt: false,
    zapier: true,
  },
];

export default function WhatIsCalmPilot() {
  return (
    <section className="py-24 lg:py-32 bg-zinc-950 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-8 tracking-tight">
            What is CalmPilot?
          </h2>

          <div className="space-y-5 text-zinc-300 leading-relaxed text-lg font-light mb-16">
            <p>
              <strong className="text-white font-medium">CalmPilot</strong> is
              an{" "}
              <strong className="text-white font-medium">
                AI-powered digital proxy
              </strong>{" "}
              — a 24/7 AI agent that connects to your apps through secure OAuth
              integrations and acts on your behalf. Unlike chatbots that just
              generate text, CalmPilot takes real action: it reads your emails,
              creates tasks, updates your CRM, sends daily briefings, and runs
              complex multi-app workflows autonomously.
            </p>
            <p>
              Think of CalmPilot as a tireless chief of staff who never sleeps.
              It handles the repetitive, time-consuming work across all your
              tools so you can focus on the things that actually require your
              judgment. When a task is sensitive or needs your approval,
              CalmPilot pauses and presents it in a review queue — keeping you
              in control without burdening you with constant notifications.
            </p>
          </div>

          {/* Capabilities grid */}
          <h3 className="text-xl font-semibold text-white mb-6">
            Key capabilities
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5"
              >
                <div className="text-sm font-semibold text-white mb-2">
                  {cap.label}
                </div>
                <div className="text-sm text-zinc-400 font-light leading-relaxed">
                  {cap.desc}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Comparison table */}
          <h3 className="text-xl font-semibold text-white mb-6">
            CalmPilot vs the alternatives
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0c0c0c] border-b border-white/5">
                  <th className="text-left px-6 py-4 text-zinc-400 font-medium">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-indigo-400 font-semibold text-center">
                    CalmPilot
                  </th>
                  <th className="px-6 py-4 text-zinc-500 font-medium text-center">
                    ChatGPT
                  </th>
                  <th className="px-6 py-4 text-zinc-500 font-medium text-center">
                    Zapier
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-6 py-4 text-zinc-300">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.calmpilot ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.chatgpt ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.zapier ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
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
