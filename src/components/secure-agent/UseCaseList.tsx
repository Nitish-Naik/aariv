"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import { Logo } from "./Logo";

export default function UseCaseList() {
    const prompts = [
        "Check Gmail for unread customer emails and quietly draft thoughtful replies.",
        "Summarize the last 24 hours of messages in the #product-feedback channel.",
        "Draft a set of organized release notes in Notion based on closed Jira tickets.",
        "Analyze the Mixpanel 'Trial Drop-off' events table and prepare a brief on friction points.",
        "Draft polite rejections to the candidates in the 'Declined' column in Linear."
    ];

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-indigo-500/10 rounded-[100%] blur-[120px] pointer-events-none opacity-50 z-0" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Command Center</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6 font-sans"
                    >
                        Prepared, never rushed.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed"
                    >
                        Provide a natural language prompt, and the agent quietly orchestrates the workflow across your tools while you focus on deeper work.
                    </motion.p>
                </div>

                <div className="bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-2 md:p-3 shadow-2xl relative overflow-hidden">
                    {/* Inner glowing ring */}
                    <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/5 pointer-events-none" />

                    {/* Simulated Terminal Window */}
                    <div className="bg-[#050505] rounded-[1.5rem] border border-white/5 overflow-hidden flex flex-col h-full relative z-10">
                        {/* Terminal Header */}
                        <div className="h-12 border-b border-white/5 flex items-center px-4 bg-white/[0.02]">
                            <div className="flex gap-2 mr-4">
                                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                <div className="w-3 h-3 rounded-full bg-zinc-800" />
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/5 mx-auto -ml-8">
                                <Logo className="w-4 h-4 opacity-50" />
                                <span className="text-xs text-zinc-400 font-mono">calmpilot_cli</span>
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="p-6 md:p-8 space-y-6">
                            {prompts.map((prompt, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                                    className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors relative"
                                >
                                    {/* Line Indicator */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-500 group-hover:h-1/2 transition-all rounded-r-full" />

                                    <div className="mt-1 w-8 h-8 shrink-0 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Terminal className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-zinc-300 font-mono text-sm md:text-[15px] leading-relaxed group-hover:text-white transition-colors">
                                            <span className="text-indigo-400 font-bold mr-2">❯</span>
                                            "{prompt}"
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                        <ArrowRight className="w-5 h-5 text-zinc-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
