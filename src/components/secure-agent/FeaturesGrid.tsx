"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

function SpotlightCard({
    children,
    className = "",
    variants
}: {
    children: React.ReactNode,
    className?: string,
    variants?: any
}) {
    const divRef = useRef<HTMLElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!divRef.current || isFocused) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <motion.article
            ref={divRef as any}
            variants={variants}
            onMouseMove={handleMouseMove}
            onFocus={() => { setIsFocused(true); setOpacity(1); }}
            onBlur={() => { setIsFocused(false); setOpacity(0); }}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={`relative overflow-hidden rounded-3xl bg-[#0c0c0c] border border-white/5 p-8 transition-colors hover:bg-white/[0.02] ${className}`}
        >
            {/* Hover Spotlight */}
            <div
                className="pointer-events-none absolute -inset-px transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.1), transparent 40%)`,
                }}
            />
            {/* Top Border Glow */}
            <div
                className="pointer-events-none absolute top-0 left-0 right-0 h-px transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(300px circle at ${position.x}px 0px, rgba(99, 102, 241, 0.4), transparent 100%)`,
                }}
            />

            <div className="relative z-10 flex flex-col h-full">
                {children}
            </div>
        </motion.article>
    );
}

export default function FeaturesGrid() {
    const features = [
        {
            title: "Every app you already use.",
            description: "Gmail, Slack, GitHub, Notion, Linear, Figma, Jira and 1000+ more — all connected through a single secure OAuth flow. No setup sprawl.",
            className: "md:col-span-2",
            icon: (
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            title: "No passwords. Ever.",
            description: "Pure OAuth — grant access in one click, revoke it just as fast. Your credentials never touch our servers.",
            className: "md:col-span-1",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            title: "Your 3am teammate.",
            description: "Tasks run on a schedule. Wake up to a triaged inbox, summarized Slack threads, and reviewed PRs — handled while you slept.",
            className: "md:col-span-1",
            icon: (
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Always your call.",
            description: "CalmPilot pauses before anything irreversible — mass emails, dropped tables, bulk deletes. You approve, it acts. You're always the final checkpoint.",
            className: "md:col-span-2",
            icon: (
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 9a9 9 0 100-18 9 9 0 000 18z M12 6v2 M12 16v2 M6 12H4 M20 12h-2" />
                </svg>
            )
        },
        {
            title: "Runs in the cloud.",
            description: "Execution happens in isolated, sandboxed environments. Your machine stays unbothered. No installs, no local processes, no resource drain.",
            className: "md:col-span-2",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        {
            title: "Ready in 60 seconds.",
            description: "No API keys. No config files. No cloning repos. Sign in, connect your apps, describe your workflow — done.",
            className: "md:col-span-1",
            icon: (
                <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">
            {/* Background elements to blend with hero */}
            <div aria-hidden="true" className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-semibold tracking-tight text-white font-sans"
                    >
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">quiet competence.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 text-lg font-light leading-relaxed"
                    >
                        CalmPilot combines bleeding-edge AI execution with absolute user control.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {features.map((feature, idx) => (
                        <SpotlightCard
                            key={idx}
                            variants={itemVariants}
                            className={feature.className}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3 tracking-tight font-sans">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-400 font-light leading-relaxed mt-auto">
                                {feature.description}
                            </p>
                        </SpotlightCard>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
