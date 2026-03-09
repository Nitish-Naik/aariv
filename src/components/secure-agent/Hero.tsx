"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Copy, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
    const [visibleCount, setVisibleCount] = useState(briefItems.length);
    const [loopKey, setLoopKey] = useState(0);

    // Waitlist state
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [joined, setJoined] = useState(false);
    const [position, setPosition] = useState<number | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [refCode, setRefCode] = useState<string | null>(null);
    const [refCount, setRefCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch waitlist count on mount
    useEffect(() => {
        fetch(`${API_URL}/waitlist/count`)
            .then(r => r.json())
            .then(d => { if (d.count) setTotal(d.count); })
            .catch(() => { });
    }, []);

    // Get ref code from URL
    const [urlRef, setUrlRef] = useState<string | null>(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get("ref");
        if (ref) setUrlRef(ref.toUpperCase());
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCount(0);
            setLoopKey(k => k + 1);
            briefItems.forEach((_, i) => {
                setTimeout(() => setVisibleCount(i + 1), 300 + i * 500);
            });
        }, 12000);
        return () => clearInterval(interval);
    }, []);

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || isSubmitting) return;
        setError(null);
        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/waitlist/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), ref: urlRef }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || "Something went wrong");
                return;
            }

            setJoined(true);
            setPosition(data.position);
            setTotal(data.total);
            setRefCode(data.referral_code);
            setRefCount(data.referral_count || 0);
        } catch {
            setError("Could not connect. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    function copyRefLink() {
        if (!refCode) return;
        const link = `${window.location.origin}?ref=${refCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <section id="waitlist" className="relative overflow-hidden pt-14 pb-16 lg:pt-16 lg:pb-20 bg-black selection:bg-neutral-800">

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

            {/* Ambient top glow - Removed for stark minimalist aesthetic */}
            {/* Right glow behind card - Removed for stark minimalist aesthetic */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

                    {/* ── Left Column ── */}
                    <div className="space-y-8 max-w-xl">

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-medium uppercase tracking-wider"
                        >
                            <Logo className="w-3.5 h-3.5" />
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

                        {/* CTA — Waitlist Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {!joined ? (
                                <>
                                    <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="h-10 sm:max-w-[280px] bg-black border-white/20 text-white placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white transition-all text-sm rounded-md"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="h-10 bg-white text-black hover:bg-neutral-200 font-medium text-sm rounded-md px-6 transition-all group"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-4 h-4 border-2 border-neutral-400 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Join Waitlist
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                                    <div className="flex items-center gap-3 mt-3">
                                        {total !== null && total > 0 && (
                                            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                                <Users className="w-3.5 h-3.5" />
                                                <span><span className="text-zinc-300 font-medium">{total.toLocaleString()}</span> on the waitlist</span>
                                            </div>
                                        )}
                                        <span className="text-sm text-zinc-600">Free early access</span>
                                    </div>
                                </>
                            ) : (
                                /* ── Post-signup: Position + Referral ── */
                                <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Check className="w-5 h-5" />
                                        <span className="font-semibold">You&apos;re on the list!</span>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-3xl font-bold text-white tabular-nums">#{position}</p>
                                            <p className="text-xs text-zinc-500 mt-0.5">Your position</p>
                                        </div>
                                        <div className="w-px h-10 bg-white/[0.08]" />
                                        <div>
                                            <p className="text-3xl font-bold text-zinc-400 tabular-nums">{total?.toLocaleString()}</p>
                                            <p className="text-xs text-zinc-500 mt-0.5">Total joined</p>
                                        </div>
                                    </div>

                                    {/* Skip the line */}
                                    <div className="pt-3 border-t border-white/[0.06]">
                                        <p className="text-sm text-zinc-300 font-medium mb-2">
                                            Skip the line — refer friends to move up
                                        </p>
                                        <p className="text-xs text-zinc-500 mb-3">
                                            Each referral moves you up 10 spots. {refCount > 0 && `You've referred ${refCount} so far.`}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-400 font-mono truncate">
                                                {`${typeof window !== "undefined" ? window.location.origin : "calmpilot.app"}?ref=${refCode}`}
                                            </div>
                                            <Button
                                                variant="default"
                                                onClick={copyRefLink}
                                                className={`flex items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium transition-all shrink-0 ${copied
                                                    ? "bg-neutral-800 text-emerald-400 hover:bg-neutral-800"
                                                    : "bg-white text-black hover:bg-neutral-200"
                                                    }`}
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copied ? "Copied" : "Copy"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full sm:w-[22rem] lg:w-[24rem] bg-black border border-white/10 rounded-xl shadow-sm overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
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
