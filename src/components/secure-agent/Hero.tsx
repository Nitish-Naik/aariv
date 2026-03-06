"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const appLogos = [
    { icon: "/images/google-gmail-svgrepo-com.svg", name: "Gmail" },
    { icon: "/images/slack-svgrepo-com.svg", name: "Slack" },
    { icon: "/images/notion-svgrepo-com.svg", name: "Notion" },
    { icon: "/images/github-142-svgrepo-com.svg", name: "GitHub" },
    { icon: "/images/linear-svgrepo-com.svg", name: "Linear" },
    { icon: "/images/google-calendar-svgrepo-com.svg", name: "Calendar" },
    { icon: "/images/stripe-v2-svgrepo-com.svg", name: "Stripe" },
    { icon: "/images/hubspot-svgrepo-com.svg", name: "HubSpot" },
];

const briefItems = [
    { text: "Drafted replies to 7 customer emails in Gmail", done: true },
    { text: "Summarized #product-feedback in Slack (32 messages)", done: true },
    { text: "Reviewed 3 open PRs on GitHub and left comments", done: true },
    { text: "Created release notes in Notion from closed Jira tickets", done: true },
    { text: "Sent weekly digest to your team channel", done: true },
];

export default function Hero() {
    // All items visible immediately — animate in on mount, loop every 12s
    const [visibleCount, setVisibleCount] = useState(briefItems.length);
    const [loopKey, setLoopKey] = useState(0);

    useEffect(() => {
        // After 12s, briefly reset and re-animate to show "live" feel
        const interval = setInterval(() => {
            setVisibleCount(0);
            setLoopKey(k => k + 1);
            briefItems.forEach((_, i) => {
                setTimeout(() => setVisibleCount(i + 1), 300 + i * 500);
            });
        }, 12000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative overflow-hidden pt-14 pb-16 lg:pt-16 lg:pb-20 bg-[#050505] selection:bg-indigo-500/30">

            {/* Background — subtle grid */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                    maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)",
                }}
            />

            {/* Ambient top glow */}
            <div aria-hidden="true" className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-indigo-600/12 rounded-[100%] blur-[120px] pointer-events-none z-0" />
            {/* Right glow behind card */}
            <div aria-hidden="true" className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[360px] h-[460px] bg-violet-600/15 rounded-[100%] blur-[90px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

                    {/* ── Left Column ── */}
                    <div className="space-y-8 max-w-xl">

                        {/* Eyebrow */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-sm font-medium"
                        >
                            <Logo className="w-4 h-4" />
                            <span>AI-powered digital proxy</span>
                        </motion.div>

                        {/* Headline */}
                        <div className="space-y-1">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.0]"
                            >
                                Your AI handles
                                <br />
                                the work.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="text-4xl lg:text-5xl font-serif font-medium italic text-zinc-500 leading-[1.2] pt-1"
                            >
                                You just review.
                            </motion.p>
                        </div>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-lg text-zinc-400 leading-relaxed font-light"
                        >
                            Connect 1000+ apps via OAuth. Describe your workflow in plain English.
                            Wake up to emails drafted, Slack summarized, PRs reviewed — all done while you slept.
                        </motion.p>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                        >
                            <Link
                                href="/login"
                                className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-zinc-900 font-semibold text-base tracking-tight hover:bg-zinc-50 active:scale-95 transition-all duration-200 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden"
                            >
                                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-700 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                                    <div className="relative h-full w-10 bg-black/8" />
                                </div>
                                <span className="relative z-10 flex items-center gap-2">
                                    Start free
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </Link>
                            <p className="text-sm text-zinc-600">No credit card &middot; Live in 60 seconds</p>
                        </motion.div>

                        {/* App logos */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.65 }}
                        >
                            <p className="text-[11px] text-zinc-400 mb-3 uppercase tracking-widest">Works with your stack</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {appLogos.map((app, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.65 + i * 0.05, duration: 0.3 }}
                                        className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center hover:bg-white/[0.14] hover:border-white/20 transition-all duration-200"
                                        title={app.name}
                                    >
                                        <Image src={app.icon} alt={app.name} width={18} height={18} className="opacity-90" />
                                    </motion.div>
                                ))}
                                <span className="text-xs text-zinc-400 ml-1">+1000 more</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Right Column: Morning Brief Card ── */}
                    <div className="relative flex-shrink-0">
                        {/* Glow ring behind card */}
                        <div aria-hidden="true" className="absolute inset-[-20px] bg-indigo-500/10 rounded-[2.5rem] blur-[40px] pointer-events-none" />

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full sm:w-[22rem] lg:w-[24rem] bg-[#0d0d0d] border border-white/[0.08] rounded-[1.75rem] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_48px_100px_-24px_rgba(0,0,0,0.95)] overflow-hidden"
                        >
                            {/* Top gradient line */}
                            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

                            {/* Card Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <Logo className="w-5 h-5" />
                                    <span className="text-white text-sm font-semibold tracking-wide">Morning Brief</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-600 text-xs font-mono tabular-nums">6:42 AM</span>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">Active</span>
                                    </div>
                                </div>
                            </div>

                            {/* Brief Items */}
                            <div className="px-5 pt-4 pb-3 space-y-3">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-3">Completed overnight</p>
                                {briefItems.map((item, i) => (
                                    <motion.div
                                        key={`${loopKey}-${i}`}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={visibleCount > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                                        transition={{ duration: 0.35, ease: "easeOut" }}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-zinc-300 text-[13px] leading-snug">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="mx-5 h-px bg-white/[0.05]" />

                            {/* Alert */}
                            <div className="mx-4 my-3 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/15">
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                <p className="text-amber-300/90 text-[13px] font-medium">2 items need your review</p>
                            </div>

                            {/* Stats Bar */}
                            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                                {[
                                    { label: "Apps", value: "12" },
                                    { label: "Tasks", value: "47" },
                                    { label: "Saved", value: "3.2h" },
                                ].map((stat, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-2 py-2.5 text-center"
                                    >
                                        <div className="text-white text-sm font-semibold tabular-nums">{stat.value}</div>
                                        <div className="text-zinc-600 text-[10px] mt-0.5 font-medium">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
