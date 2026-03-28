"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// ── Testimonials component ──
// Currently showing "early access" messaging instead of fake testimonials.
// Uncomment the real testimonials section below once you have paying customers.
//
// Original fake testimonials removed because:
// 1. Zero real customers yet — fake quotes destroy trust
// 2. "I connected 12 of my daily apps" was inaccurate (only 3 apps available)
// 3. Honest early-stage messaging converts better than fabricated social proof

export default function Testimonials() {
    return (
        <section className="py-24 lg:py-32 bg-[var(--bg-base)] border-t border-[rgba(255,255,255,0.02)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-serif text-[var(--text-primary)] tracking-tight"
                    >
                        Built for people who are tired of tab-switching.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-[var(--text-secondary)] text-lg mb-8"
                    >
                        CalmPilot is in early access. Be one of the first to try it — connect Gmail, Calendar & Slack and get your first morning brief tomorrow.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            href="/login"
                            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors"
                        >
                            Try Early Access
                            <ArrowRight strokeWidth={1.5} className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}

/* ── Uncomment below when you have real testimonials ──

const testimonials = [
    {
        quote: "REAL QUOTE FROM REAL CUSTOMER",
        author: "Real Name",
        role: "Real Title",
    },
    // Add more as you collect them
];

export default function Testimonials() {
    return (
        <section className="py-24 lg:py-32 bg-[var(--bg-base)] border-t border-[rgba(255,255,255,0.02)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                    <h2 className="text-3xl font-serif text-[var(--text-primary)] tracking-tight">
                        Loved by early users.
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.03)] p-8 rounded-3xl">
                            <p className="text-[15px] leading-relaxed text-[var(--text-primary)] mb-8">{t.quote}</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[var(--text-muted)]">
                                    {t.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-[var(--text-primary)]">{t.author}</div>
                                    <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
*/
