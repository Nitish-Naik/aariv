"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-32 sm:py-40 bg-black text-center relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-500/[0.06] rounded-[100%] blur-[150px] pointer-events-none"
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-[-0.035em] leading-[1.05]"
        >
          Stop switching tabs.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-400 to-indigo-300">
            Start reviewing briefs.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-6 sm:mt-8 text-lg sm:text-xl text-zinc-400 font-light max-w-xl mx-auto leading-relaxed"
        >
          Connect Gmail, Calendar, and Slack. Your AI handles the rest — 24/7.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2.5 h-13 px-8 py-4 rounded-full bg-white text-black font-semibold text-base hover:bg-zinc-100 active:scale-[0.97] transition-all duration-200 shadow-[0_0_80px_rgba(255,255,255,0.12)]"
          >
            Get Started Free
            <ArrowRight
              strokeWidth={2}
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
          >
            View pricing →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
