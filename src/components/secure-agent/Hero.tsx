"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const briefItems = [
  { text: "Drafted replies to 7 customer emails", done: true },
  { text: "Summarized #product-feedback in Slack", done: true },
  { text: "Detected calendar conflict at 2pm", done: true },
  { text: "Flagged 3 urgent investor emails", done: true },
  { text: "Sent weekly digest to Slack", done: true },
];

export default function Hero() {
  const [visibleCount, setVisibleCount] = useState(briefItems.length);
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount(0);
      setLoopKey((k) => k + 1);
      briefItems.forEach((_, i) => {
        setTimeout(() => setVisibleCount(i + 1), 400 + i * 450);
      });
    }, 14000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-black selection:bg-neutral-800">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/[0.07] rounded-[100%] blur-[120px] pointer-events-none"
      />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 pt-24 sm:pt-32 lg:pt-40 pb-20 sm:pb-28">
        {/* ── Center-aligned headline block ── */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold tracking-[-0.035em] text-white leading-[1.05] sm:leading-[1]">
              Your AI works overnight.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-400">
                You just review.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 sm:mt-8 text-lg sm:text-xl text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto"
          >
            CalmPilot connects to your Gmail, Calendar, and Slack — then handles email triage,
            meeting conflicts, and message summaries while you sleep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 h-12 px-7 rounded-full bg-white text-black font-semibold text-[15px] hover:bg-zinc-100 active:scale-[0.97] transition-all duration-200 shadow-[0_0_80px_rgba(255,255,255,0.1)]"
            >
              Get Started Free
              <ArrowRight
                strokeWidth={2}
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </Link>
            <span className="text-sm text-zinc-500">
              No credit card required
            </span>
          </motion.div>
        </div>

        {/* ── Product card: Morning Brief ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="max-w-lg mx-auto"
        >
          <div className="relative rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_32px_64px_-16px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Logo className="w-4.5 h-4.5" />
                <span className="text-white text-sm font-medium tracking-[-0.01em]">
                  Morning Brief
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-xs font-mono tabular-nums">
                  6:42 AM
                </span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>
            </div>

            {/* Brief Items */}
            <div className="px-5 pt-4 pb-3 space-y-2.5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-semibold mb-3">
                Completed overnight
              </p>
              {briefItems.map((item, i) => (
                <motion.div
                  key={`${loopKey}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={
                    visibleCount > i
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -8 }
                  }
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex items-start gap-2.5"
                >
                  <CheckCircle2
                    strokeWidth={1.5}
                    className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                  />
                  <span className="text-zinc-300 text-[13px] leading-snug">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-white/[0.05]" />

            {/* Alert */}
            <div className="mx-4 my-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/10">
              <AlertCircle
                strokeWidth={1.5}
                className="w-4 h-4 text-amber-400 shrink-0"
              />
              <p className="text-amber-300/80 text-[13px] font-medium">
                2 items need your review
              </p>
            </div>

            {/* Stats Bar */}
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {[
                { label: "Apps", value: "3" },
                { label: "Tasks", value: "47" },
                { label: "Saved", value: "3.2h" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-2 py-2 text-center"
                >
                  <div className="text-white text-sm font-semibold tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-zinc-500 text-[10px] mt-0.5 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
