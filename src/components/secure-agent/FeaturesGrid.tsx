"use client";

import { motion } from "framer-motion";
import { Clock, Lock, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";

function AppBadges() {
  const apps = [
    { src: "/images/google-gmail-svgrepo-com.svg", name: "Gmail" },
    { src: "/images/google-calendar-svgrepo-com.svg", name: "Calendar" },
    { src: "/images/slack-svgrepo-com.svg", name: "Slack" },
  ];

  return (
    <div className="mt-6 flex items-center gap-3">
      {apps.map((app, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
          <Image src={app.src} alt={app.name} width={18} height={18} className="w-[18px] h-[18px]" />
          <span className="text-xs text-zinc-300 font-medium">{app.name}</span>
        </div>
      ))}
      <span className="text-[11px] text-zinc-600 font-medium">+ more soon</span>
    </div>
  );
}

const pillars = [
  {
    icon: <Zap className="w-5 h-5" strokeWidth={1.5} />,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    eyebrow: "Core integrations",
    headline: "The apps that matter most.",
    body: "Gmail, Google Calendar & Slack — connected through a single OAuth flow. No API keys. No config files. Just click and your AI starts working.",
    visual: <AppBadges />,
    accent: "from-indigo-500/[0.06] to-transparent",
    span: "lg:col-span-2",
  },
  {
    icon: <Clock className="w-5 h-5" strokeWidth={1.5} />,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    eyebrow: "24/7 autonomous",
    headline: "Your 3am colleague.",
    body: "Triggers fire when events happen. You wake up to a morning briefing — inbox triaged, Slack summarized, calendar conflicts resolved.",
    visual: (
      <div className="mt-6 rounded-xl bg-white/[0.03] border border-white/[0.05] px-4 py-3 space-y-2.5">
        {[
          "Drafted replies to 7 customer emails",
          "Summarized #product in Slack (34 msgs)",
          "Resolved calendar conflict at 2pm",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-[13px] text-zinc-300">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            {item}
          </div>
        ))}
        <div className="pt-1 text-[11px] text-zinc-600 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Completed overnight · 6:42 AM
        </div>
      </div>
    ),
    accent: "from-emerald-500/[0.06] to-transparent",
    span: "lg:col-span-1",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    eyebrow: "Human-in-the-loop",
    headline: "AI acts. You approve.",
    body: "Sensitive actions pause for your review. You decide. Then it executes.",
    visual: (
      <div className="mt-6 rounded-xl bg-amber-500/[0.04] border border-amber-500/10 px-4 py-3 space-y-1.5">
        <p className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
          Needs your review
        </p>
        <p className="text-[13px] text-zinc-300">
          Send follow-up email to 12 investor contacts
        </p>
        <div className="flex gap-2 pt-1.5">
          <div className="px-3 py-1.5 rounded-full bg-white text-zinc-950 text-xs font-semibold cursor-default select-none">
            Approve
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.06] text-zinc-400 text-xs cursor-default select-none">
            Dismiss
          </div>
        </div>
      </div>
    ),
    accent: "from-amber-500/[0.06] to-transparent",
    span: "lg:col-span-1",
  },
  {
    icon: <Lock className="w-5 h-5" strokeWidth={1.5} />,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    eyebrow: "Security-first",
    headline: "OAuth only. No passwords. Ever.",
    body: "Your credentials never touch our servers. Every action runs in an isolated sandbox. Revoke access anytime with one click.",
    visual: (
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {["OAuth-only auth", "No passwords stored", "Sandboxed execution", "Revoke any time"].map(
          (label) => (
            <div key={label} className="flex items-center gap-2 text-[12px] text-zinc-400">
              <div className="w-4 h-4 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5 text-violet-400" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {label}
            </div>
          )
        )}
      </div>
    ),
    accent: "from-violet-500/[0.06] to-transparent",
    span: "lg:col-span-2",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-black relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16 sm:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-indigo-400 text-sm font-medium tracking-wide mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.03em]"
          >
            Stop doing work{" "}
            <span className="text-zinc-500">that shouldn't need you.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`${p.span} group relative rounded-2xl bg-white/[0.015] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 p-7 overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${p.accent} pointer-events-none`} />

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className={`w-9 h-9 rounded-xl ${p.iconBg} flex items-center justify-center ${p.iconColor}`}>
                    {p.icon}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em]">
                    {p.eyebrow}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white tracking-[-0.01em] mb-2.5">
                  {p.headline}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{p.body}</p>

                {p.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
