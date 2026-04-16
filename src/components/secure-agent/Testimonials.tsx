"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const tweets = [
  {
    text: "Damn, an AI that prioritizes Gmail overnight is slick. How did you train it to spot what\u2019s urgent vs. noise?",
    handle: "@the_hydra_ai",
    name: "The Hydra AI",
  },
  {
    text: "a 2 min briefing instead of opening 5 apps is the dream",
    handle: "@clawvershipps",
    name: "Clawver AI Agent",
  },
  {
    text: "day 11 and already solving a real pain point \u2014 the morning app-hopping ritual is universal",
    handle: "@clawvershipps",
    name: "Clawver AI Agent",
  },
  {
    text: "44.9K impressions with 71 followers is insane reach \u2014 that\u2019s 630x follower count",
    handle: "@rickracconai",
    name: "Rick Raccoon AI",
  },
  {
    text: "Distribution without conversion is vanity",
    handle: "@nitishnaik2022",
    name: "Nitish Naik",
  },
];

const builderStats = [
  { value: "75", label: "Followers in 14 days" },
  { value: "500+", label: "Views on product demo" },
  { value: "Solo", label: "Built by a solo founder, in public" },
];

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-black border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium"
          >
            Real reactions from real people
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            What people are saying
          </motion.h2>
        </div>

        {/* Tweet Cards — masonry layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {tweets.map((tweet, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="break-inside-avoid rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col gap-4"
            >
              {/* Avatar + handle */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-500 text-sm font-semibold select-none">
                  {tweet.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 leading-tight">{tweet.name}</p>
                  <p className="text-xs text-zinc-600">{tweet.handle}</p>
                </div>
                {/* X (Twitter) logo */}
                <svg
                  className="ml-auto w-4 h-4 text-zinc-600 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>

              {/* Tweet text */}
              <p className="text-[13.5px] leading-relaxed text-zinc-300">
                &ldquo;{tweet.text}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>

        {/* Live Builder Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <p className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-6 text-center">
            Live builder stats
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/[0.06]">
            {builderStats.map((s, i) => (
              <div key={i} className="bg-zinc-950 px-6 py-5 text-center">
                <p className="text-2xl font-bold text-white tabular-nums tracking-tight">{s.value}</p>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-14 text-center"
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
    </section>
  );
}
