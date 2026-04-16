"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Calendar, MessageSquare, Clock, AlertTriangle, Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// ── Sample briefing data (hardcoded to look realistic) ────────────────────────
const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const urgentItems = [
  {
    app: "gmail",
    icon: Mail,
    title: "Client contract expires tomorrow",
    description: "ABC Corp sent a follow-up: \"Contract renewal needs your signature by end of day Thursday. Attached is the updated terms.\"",
    time: "11:42 PM",
  },
  {
    app: "googlecalendar",
    icon: Calendar,
    title: "Q2 Planning meeting in 90 minutes — no prep doc",
    description: "You have a meeting with Sarah, Mike, and the product team at 10:00 AM. No agenda document has been shared yet.",
    time: "8:31 AM",
  },
];

const needsReplyItems = [
  {
    app: "slack",
    icon: MessageSquare,
    title: "Manager asked: \"Can you cover Thursday standup?\"",
    description: "#engineering — Direct message from @lisa.chen, waiting for your response since yesterday.",
    time: "Yesterday",
  },
  {
    app: "gmail",
    icon: Mail,
    title: "Investor follow-up from last week's call",
    description: "David Park from Sequoia: \"Great chat last Tuesday. Would love to schedule a follow-up for next week. Available?\"",
    time: "2 days ago",
  },
  {
    app: "googlecalendar",
    icon: Calendar,
    title: "Calendar conflict: 2 meetings overlap at 3:00 PM",
    description: "\"Design Review\" and \"Sprint Retrospective\" both scheduled 3:00–4:00 PM. You accepted both.",
    time: "Today",
  },
];

const fyiItems = [
  "4 newsletters summarized → TL;DR: React 20 released, Vercel raised Series E, Y Combinator S26 apps open",
  "2 team updates → Marketing shipped the new landing page; Backend deployed v2.4.1",
  "3 Slack channels → #general (team lunch Friday), #random (meme thread), #product (feature flag discussion)",
  "1 promotional email → filtered and archived automatically",
];

const calendarEvents = [
  { time: "9:00 AM", title: "Daily Standup", duration: "15 min", color: "bg-blue-500/20 text-blue-400" },
  { time: "10:00 AM", title: "Q2 Planning", duration: "1 hr", color: "bg-red-500/20 text-red-400" },
  { time: "12:00 PM", title: "Lunch with Alex", duration: "1 hr", color: "bg-green-500/20 text-green-400" },
  { time: "2:00 PM", title: "Focus Time (blocked)", duration: "1 hr", color: "bg-purple-500/20 text-purple-400" },
  { time: "3:00 PM", title: "Design Review ⚠️", duration: "1 hr", color: "bg-yellow-500/20 text-yellow-400" },
];

const stats = [
  { label: "Emails processed", value: "12", icon: Mail },
  { label: "Meetings today", value: "5", icon: Calendar },
  { label: "Focus hours", value: "2.5h", icon: Clock },
  { label: "Time saved", value: "~35 min", icon: CheckCircle2 },
];

// ── Fade-in animation helper ──────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: "easeOut" },
});

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
            ← Back to CalmPilot
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium bg-zinc-900 px-3 py-1 rounded-full border border-white/[0.06]">
            Sample Briefing
          </span>
          <Link
            href="/login"
            className="text-sm font-semibold text-black bg-white px-4 py-1.5 rounded-full hover:bg-zinc-100 transition-colors"
          >
            Get yours free →
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-10">
          <p className="text-zinc-500 text-xs uppercase tracking-[0.15em] font-medium mb-2">
            Your Morning Briefing
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {today}
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            CalmPilot processed 47 notifications overnight. Here&apos;s what matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats bar */}
            <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 flex items-center gap-3"
                >
                  <s.icon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-white leading-tight">{s.value}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* URGENT */}
            <motion.div {...fadeUp(0.2)}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                  Urgent — {urgentItems.length} items
                </h2>
              </div>
              <div className="space-y-3">
                {urgentItems.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4 flex gap-4"
                  >
                    <item.icon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                      <p className="text-[10px] text-zinc-600 mt-2">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* NEEDS REPLY */}
            <motion.div {...fadeUp(0.3)}>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                  Needs reply — {needsReplyItems.length} items
                </h2>
              </div>
              <div className="space-y-3">
                {needsReplyItems.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-yellow-500/10 bg-yellow-500/[0.02] p-4 flex gap-4"
                  >
                    <item.icon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                      <p className="text-[10px] text-zinc-600 mt-2">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* FYI */}
            <motion.div {...fadeUp(0.4)}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                  FYI — handled for you
                </h2>
              </div>
              <div className="rounded-xl border border-green-500/10 bg-green-500/[0.02] p-4 space-y-2">
                {fyiItems.map((item, i) => (
                  <p key={i} className="text-xs text-zinc-400 leading-relaxed flex gap-2">
                    <span className="text-green-500/60">→</span>
                    {item}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* AI Insight */}
            <motion.div {...fadeUp(0.5)}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">AI Insight</p>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  CalmPilot processed 47 notifications overnight. 2 are urgent and need action before 10 AM.
                  3 need a reply but aren&apos;t time-critical. The remaining 42 are informational — summarized above
                  so you don&apos;t have to open each one. Your first meeting is in 90 minutes — no prep doc exists yet.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar — calendar */}
          <motion.div {...fadeUp(0.25)} className="space-y-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">Today&apos;s Schedule</h3>
              <div className="space-y-3">
                {calendarEvents.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-[11px] text-zinc-500 w-16 flex-shrink-0 pt-0.5 font-mono">
                      {event.time}
                    </div>
                    <div className={`flex-1 rounded-lg px-3 py-2 ${event.color} border border-white/[0.04]`}>
                      <p className="text-xs font-medium">{event.title}</p>
                      <p className="text-[10px] opacity-60">{event.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini CTA */}
            <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-5 text-center">
              <p className="text-sm text-zinc-300 font-medium mb-1">This could be YOUR inbox.</p>
              <p className="text-xs text-zinc-500 mb-4">
                Connect Gmail, Slack, or Calendar. Wake up to everything sorted.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-100 transition-colors"
              >
                Start free
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div {...fadeUp(0.6)} className="mt-16 text-center pb-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            Stop triaging. Start working.
          </h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
            CalmPilot reads your Gmail, Slack, and Calendar overnight. By morning, everything is sorted.
            Free to try — no credit card required.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-100 transition-colors"
          >
            Get this for YOUR inbox
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Social proof */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-zinc-500">
            <p>&ldquo;An AI that prioritizes Gmail overnight is slick&rdquo; — <span className="text-zinc-400">@the_hydra_ai</span></p>
            <span className="hidden sm:block">·</span>
            <p>&ldquo;A 2 min briefing instead of 5 apps is the dream&rdquo; — <span className="text-zinc-400">@clawvershipps</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
