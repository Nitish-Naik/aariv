"use client";

import { motion } from "framer-motion";
import { Eye, Key, Shield, Zap } from "lucide-react";

const points = [
    {
        icon: <Key className="w-5 h-5 text-violet-400" strokeWidth={1.5} />,
        title: "OAuth-only access",
        body: "We never ask for passwords. Every app connects through the official OAuth flow — you grant permission, you revoke it. That's it.",
    },
    {
        icon: <Shield className="w-5 h-5 text-violet-400" strokeWidth={1.5} />,
        title: "Sandboxed execution",
        body: "Every action runs in an isolated environment. No code touches your machine. No cross-user data leakage. Execution is scoped, auditable, and contained.",
    },
    {
        icon: <Eye className="w-5 h-5 text-violet-400" strokeWidth={1.5} />,
        title: "Human-in-the-loop",
        body: "Sensitive operations — mass sends, bulk deletes, financial actions — never auto-execute. They surface in your review queue and wait for explicit approval.",
    },
    {
        icon: <Zap className="w-5 h-5 text-violet-400" strokeWidth={1.5} />,
        title: "Zero credential storage",
        body: "Your tokens live with the OAuth providers — not us. CalmPilot acts as a trusted delegate. Revoke access at any time and it immediately loses all permissions.",
    },
];

export default function SecurityBand() {
    return (
        <section className="py-24 bg-card border-t border-border relative overflow-hidden">
            {/* Subtle background glow */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.06), transparent)",
                }}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-5"
                    >
                        <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                        Security
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4"
                    >
                        It acts on your behalf.{" "}
                        <span className="text-muted-foreground">Not in your name.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-[15px] leading-relaxed"
                    >
                        CalmPilot never stores passwords, never touches your machine, and pauses before anything irreversible. You stay in control — even when you&apos;re not watching.
                    </motion.p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {points.map((pt, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            className="rounded-2xl bg-background border border-border hover:border-violet-500/20 transition-colors duration-300 p-6"
                        >
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center mb-5">
                                {pt.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">{pt.title}</h3>
                            <p className="text-muted-foreground text-[13px] leading-relaxed">{pt.body}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
