"use client";

import { motion } from "framer-motion";
import { Clock, Lock, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";

const row1 = [
    { src: "/images/google-gmail-svgrepo-com.svg", name: "Gmail" },
    { src: "/images/slack-svgrepo-com.svg", name: "Slack" },
    { src: "/images/notion-svgrepo-com.svg", name: "Notion" },
    { src: "/images/github-142-svgrepo-com.svg", name: "GitHub" },
    { src: "/images/stripe-v2-svgrepo-com.svg", name: "Stripe" },
    { src: "/images/linear-svgrepo-com.svg", name: "Linear" },
    { src: "/images/google-calendar-svgrepo-com.svg", name: "Calendar" },
    { src: "/images/hubspot-svgrepo-com.svg", name: "HubSpot" },
];

const row2 = [
    { src: "/images/airtable-svgrepo-com.svg", name: "Airtable" },
    { src: "/images/asana-svgrepo-com.svg", name: "Asana" },
    { src: "/images/atlassian-svgrepo-com.svg", name: "Jira" },
    { src: "/images/discord-icon-svgrepo-com.svg", name: "Discord" },
    { src: "/images/todoist-svgrepo-com.svg", name: "Todoist" },
    { src: "/images/trello-svgrepo-com.svg", name: "Trello" },
    { src: "/images/google-drive-svgrepo-com.svg", name: "Drive" },
    { src: "/images/notion-svgrepo-com.svg", name: "Notion" },
];

function LogoMarquee() {
    return (
        <div className="mt-6 overflow-hidden relative" style={{
            maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}>
            <style>{`
                @keyframes marquee-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .marquee-left { animation: marquee-left 18s linear infinite; }
                .marquee-right { animation: marquee-right 18s linear infinite; }
                .marquee-left:hover, .marquee-right:hover { animation-play-state: paused; }
            `}</style>

            {/* Row 1 — scrolls left */}
            <div className="flex gap-2 mb-2 marquee-left w-max">
                {[...row1, ...row1].map((app, i) => (
                    <div
                        key={i}
                        title={app.name}
                        className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0"
                    >
                        <Image src={app.src} alt={app.name} width={20} height={20} className="opacity-75" />
                    </div>
                ))}
            </div>

            {/* Row 2 — scrolls right */}
            <div className="flex gap-2 marquee-right w-max">
                {[...row2, ...row2].map((app, i) => (
                    <div
                        key={i}
                        title={app.name}
                        className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0"
                    >
                        <Image src={app.src} alt={app.name} width={20} height={20} className="opacity-75" />
                    </div>
                ))}
            </div>
        </div>
    );
}

const pillars = [
    {
        icon: <Zap className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />,
        eyebrow: "500+ integrations",
        headline: "Connects to everything you already use.",
        body: "Gmail, Slack, Notion, GitHub, Stripe, Linear and 500+ more — all wired through a single OAuth flow. No API keys. No setup sprawl. Just connect and describe what you want done.",
        visual: <LogoMarquee />,
        accent: "from-indigo-500/10 to-transparent",
        border: "hover:border-indigo-500/20",
        span: "lg:col-span-2",
    },
    {
        icon: <Clock className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />,
        eyebrow: "24/7 autonomous",
        headline: "Your 3am colleague.",
        body: "CalmPilot runs on a schedule. Triggers fire when events happen. You wake up to a morning briefing — inbox triaged, Slack summarized, PRs reviewed — all done while you slept.",
        visual: (
            <div className="mt-6 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 space-y-2.5">
                {[
                    "Drafted replies to 7 customer emails",
                    "Summarized #product in Slack (34 msgs)",
                    "Reviewed 2 open PRs · left comments",
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        {item}
                    </div>
                ))}
                <div className="pt-1 text-[11px] text-zinc-600 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Completed overnight · 6:42 AM
                </div>
            </div>
        ),
        accent: "from-emerald-500/10 to-transparent",
        border: "hover:border-emerald-500/20",
        span: "lg:col-span-1",
    },
    {
        icon: <ShieldCheck className="w-5 h-5 text-amber-400" strokeWidth={1.5} />,
        eyebrow: "Human-in-the-loop",
        headline: "AI acts. You approve.",
        body: "Sensitive actions — mass emails, database writes, bulk deletes — pause for your review. CalmPilot surfaces them in a queue. You decide. Then it executes.",
        visual: (
            <div className="mt-6 rounded-xl bg-amber-500/[0.05] border border-amber-500/15 px-4 py-3 space-y-1.5">
                <p className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">Needs your review</p>
                <p className="text-[13px] text-zinc-300">Send follow-up to 84 leads in HubSpot</p>
                <div className="flex gap-2 pt-1.5">
                    <div className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold cursor-default select-none">Approve</div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-zinc-400 text-xs cursor-default select-none">Dismiss</div>
                </div>
            </div>
        ),
        accent: "from-amber-500/10 to-transparent",
        border: "hover:border-amber-500/20",
        span: "lg:col-span-1",
    },
    {
        icon: <Lock className="w-5 h-5 text-violet-400" strokeWidth={1.5} />,
        eyebrow: "Security-first",
        headline: "OAuth only. No passwords. Ever.",
        body: "Your credentials never touch our servers. Grant access with one click, revoke it just as fast. Every action runs in an isolated sandbox — your machine stays completely unbothered.",
        visual: (
            <div className="mt-6 grid grid-cols-2 gap-2">
                {[
                    "OAuth-only auth",
                    "No passwords stored",
                    "Sandboxed execution",
                    "Revoke any time",
                ].map((label) => (
                    <div key={label} className="flex items-center gap-2 text-[12px] text-zinc-400">
                        <div className="w-4 h-4 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-violet-400" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        {label}
                    </div>
                ))}
            </div>
        ),
        accent: "from-violet-500/10 to-transparent",
        border: "hover:border-violet-500/20",
        span: "lg:col-span-2",
    },
];

export default function FeaturesGrid() {
    return (
        <section className="py-28 bg-black relative overflow-hidden">
            <div aria-hidden="true" className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

                <div className="text-center max-w-xl mx-auto mb-20">
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium"
                    >
                        Built different
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-3xl md:text-4xl font-bold text-white tracking-tight"
                    >
                        Stop doing work{" "}
                        <span className="text-zinc-500">that shouldn't need you.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {pillars.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                            className={`${p.span} group relative rounded-2xl bg-zinc-950 border border-white/[0.07] ${p.border} transition-colors duration-300 p-7 overflow-hidden`}
                        >
                            <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${p.accent} pointer-events-none`} />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                                        {p.icon}
                                    </div>
                                    <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-widest">{p.eyebrow}</span>
                                </div>

                                <h3 className="text-xl font-semibold text-white tracking-tight mb-3">
                                    {p.headline}
                                </h3>
                                <p className="text-zinc-400 text-[14px] leading-relaxed">
                                    {p.body}
                                </p>

                                {p.visual}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
