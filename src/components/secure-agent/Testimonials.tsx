"use client";

import { motion } from "framer-motion";

const testimonials = [
    {
        quote: "CalmPilot feels less like a software tool and more like an extremely competent chief of staff. It's wildly fast.",
        author: "Elena R.",
        role: "VP of Operations",
    },
    {
        quote: "I connected 12 of my daily apps in minutes. Now I just ask CalmPilot to summarize my day, and it perfectly pulls from everywhere.",
        author: "Marcus T.",
        role: "Senior Engineer",
    },
    {
        quote: "The quietest AI product on the market. It doesn't ping me constantly—it just does the work and waits for me to review it.",
        author: "Sarah J.",
        role: "Founder",
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 lg:py-32 bg-[var(--bg-base)] border-t border-[rgba(255,255,255,0.02)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-serif text-[var(--text-primary)] tracking-tight"
                    >
                        Loved by power users.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-[var(--text-secondary)] text-lg"
                    >
                        Join the professionals who use CalmPilot to reclaim hours of focused work every single week.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.03)] p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            {/* Quote Mark Decoration */}
                            <div className="absolute top-6 left-6 text-6xl text-[var(--text-muted)] opacity-20 font-serif leading-none">"</div>

                            <p className="text-[15px] leading-relaxed text-[var(--text-primary)] relative z-10 mb-8 mt-4">
                                {t.quote}
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[var(--text-muted)] font-serif font-medium">
                                    {t.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-[var(--text-primary)]">{t.author}</div>
                                    <div className="text-xs text-[var(--text-muted)] font-medium">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
