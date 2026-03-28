"use client";

import { motion } from "framer-motion";
import { Eye, Key, Shield, Zap } from "lucide-react";

const points = [
    {
        icon: <Key className="w-5 h-5" strokeWidth={1.5} />,
        title: "OAuth-only access",
        body: "No passwords. Ever. Connect through official OAuth — grant permission, revoke it anytime.",
    },
    {
        icon: <Shield className="w-5 h-5" strokeWidth={1.5} />,
        title: "Sandboxed execution",
        body: "Every action runs in isolation. No code touches your machine. Scoped, auditable, contained.",
    },
    {
        icon: <Eye className="w-5 h-5" strokeWidth={1.5} />,
        title: "Human-in-the-loop",
        body: "Mass emails, bulk actions, anything irreversible — it pauses and waits for your approval.",
    },
    {
        icon: <Zap className="w-5 h-5" strokeWidth={1.5} />,
        title: "Zero credential storage",
        body: "Your tokens live with OAuth providers — not us. Revoke access and permissions vanish instantly.",
    },
];

export default function SecurityBand() {
    return (
        <section className="py-24 sm:py-32 bg-zinc-950 relative overflow-hidden">
            <div aria-hidden="true" className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-violet-400 text-sm font-medium tracking-wide mb-4"
                    >
                        Security
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.03em]"
                    >
                        It acts on your behalf.{" "}
                        <span className="text-zinc-500">Not in your name.</span>
                    </motion.h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {points.map((pt, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06, duration: 0.5 }}
                            className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 hover:border-violet-500/20 hover:bg-white/[0.03] transition-all duration-300"
                        >
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-5 group-hover:bg-violet-500/15 transition-colors duration-300">
                                {pt.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-2 tracking-[-0.01em]">{pt.title}</h3>
                            <p className="text-zinc-500 text-[13px] leading-relaxed">{pt.body}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
