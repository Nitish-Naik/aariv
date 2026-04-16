"use client";

import { motion } from "framer-motion";
import { Link2, MessageSquare, Moon } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            number: "01",
            icon: <Link2 strokeWidth={1.5} className="w-6 h-6" />,
            title: "Connect your apps",
            description: "Gmail, Calendar, and Slack. One click each. Pure OAuth — no passwords, no API keys.",
            accent: "from-indigo-500 to-blue-500",
            glow: "bg-indigo-500/10",
        },
        {
            number: "02",
            icon: <MessageSquare strokeWidth={1.5} className="w-6 h-6" />,
            title: "Tell it what matters",
            description: "Describe your workflow in plain English. CalmPilot figures out the rest.",
            accent: "from-violet-500 to-purple-500",
            glow: "bg-violet-500/10",
        },
        {
            number: "03",
            icon: <Moon strokeWidth={1.5} className="w-6 h-6" />,
            title: "Wake up to work done",
            description: "Your morning brief is ready. Review in 2 minutes. Approve what matters.",
            accent: "from-emerald-500 to-teal-500",
            glow: "bg-emerald-500/10",
        },
    ];

    return (
        <section className="py-28 sm:py-36 bg-black relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                <div className="text-center mb-16 sm:mb-20">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-indigo-400 text-sm font-medium tracking-wide mb-4"
                    >
                        How it works
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-[-0.03em]"
                    >
                        Three steps. Then it runs forever.
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 sm:p-8 hover:border-white/[0.1] transition-all duration-500"
                        >
                            {/* Hover glow */}
                            <div className={`absolute inset-0 ${step.glow} opacity-0 group-hover:opacity-100 rounded-2xl blur-2xl transition-opacity duration-500 pointer-events-none`} />

                            <div className="relative z-10">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accent} text-white mb-6`}>
                                    {step.icon}
                                </div>

                                <p className="text-zinc-600 text-xs font-mono mb-3">{step.number}</p>
                                <h3 className="text-lg font-semibold text-white mb-2 tracking-[-0.01em]">{step.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
