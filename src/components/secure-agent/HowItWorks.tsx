"use client";

import { motion } from "framer-motion";
import { Link2, MessageSquare, Moon } from "lucide-react";

const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
};

export default function HowItWorks() {
    const steps = [
        {
            number: "01",
            icon: <Link2 className="w-6 h-6 text-indigo-400" />,
            title: "Connect your apps",
            description: "Link Gmail, Slack, Notion, GitHub and 1000+ more in one click. Pure OAuth — no passwords, no API keys, no config files.",
            color: "indigo",
        },
        {
            number: "02",
            icon: <MessageSquare className="w-6 h-6 text-violet-400" />,
            title: "Tell it what matters",
            description: 'Describe your workflow in plain English. "Draft replies to customer emails every morning." CalmPilot figures out the rest.',
            color: "violet",
        },
        {
            number: "03",
            icon: <Moon className="w-6 h-6 text-emerald-400" />,
            title: "Wake up to work done",
            description: "Your agent runs while you sleep — silently handling tasks, drafting content, and preparing your morning brief. You review, it executes.",
            color: "emerald",
        },
    ];

    return (
        <section className="py-32 bg-black relative overflow-hidden">
            <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-indigo-500/5 rounded-[100%] blur-[120px] pointer-events-none z-0" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm font-medium mb-6"
                    >
                        <span>How it works</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-5 font-sans"
                    >
                        Up and running in minutes.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-zinc-400 font-light max-w-xl mx-auto leading-relaxed"
                    >
                        No engineers needed. No configuration rabbit holes. Three steps and your AI is working for you.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 relative">
                    {/* Connector lines between steps */}
                    <div aria-hidden="true" className="hidden md:block absolute top-12 left-[33%] right-[33%] h-px bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-transparent pointer-events-none" />
                    <div aria-hidden="true" className="hidden md:block absolute top-12 left-[66%] right-0 h-px bg-gradient-to-r from-violet-500/20 via-emerald-500/20 to-transparent pointer-events-none" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="relative bg-black border border-white/10 rounded-xl p-8 hover:bg-neutral-900 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg ${colorMap[step.color]}`}>
                                    {step.icon}
                                </div>
                                <span className="text-4xl font-bold text-white/5 font-mono">{step.number}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">{step.title}</h3>
                            <p className="text-zinc-400 font-light leading-relaxed text-sm">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
