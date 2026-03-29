"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import Image from "next/image";

export default function IntegrationsShowcase() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Card: Core Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background rounded-xl p-8 lg:p-12 premium-surface hover:bg-muted transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-card premium-surface-soft flex items-center justify-center mb-8">
                <Layers
                  strokeWidth={1.5}
                  className="text-muted-foreground w-5 h-5"
                />
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                Core Integrations
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                The three apps that matter most for your daily work — connected in one click.
              </p>
            </div>

            {/* Core 3 Integration Cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card premium-surface-soft">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center p-2">
                  <Image src="/images/google-gmail-svgrepo-com.svg" width={24} height={24} alt="Gmail" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Gmail</p>
                  <p className="text-xs text-muted-foreground">Email triage, drafts, follow-ups</p>
                </div>
                <span className="ml-auto text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Free</span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-card premium-surface-soft">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center p-2">
                  <Image src="/images/google-calendar-svgrepo-com.svg" width={24} height={24} alt="Calendar" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Google Calendar</p>
                  <p className="text-xs text-muted-foreground">Schedule, conflicts, focus time</p>
                </div>
                <span className="ml-auto text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Free</span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-card premium-surface-soft">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center p-2">
                  <Image src="/images/slack-svgrepo-com.svg" width={24} height={24} alt="Slack" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Slack</p>
                  <p className="text-xs text-muted-foreground">Messages, DMs, channel summaries</p>
                </div>
                <span className="ml-auto text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Free</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
                More integrations coming based on user demand
              </span>
            </div>
          </motion.div>

          {/* Right Card: What Your AI Handles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-background rounded-xl p-8 lg:p-12 premium-surface hover:bg-muted transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-card premium-surface-soft flex items-center justify-center mb-8">
              <span className="text-lg">☀️</span>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-3">
              Your Morning Brief
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
              Wake up to everything handled. One summary. Review in 2 minutes.
            </p>

            <div className="space-y-3">
              <div className="bg-card premium-surface-soft rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">📧 Email</p>
                <p className="text-sm text-foreground">3 urgent — 2 from investors, 1 customer escalation</p>
              </div>
              <div className="bg-card premium-surface-soft rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">📅 Calendar</p>
                <p className="text-sm text-foreground">4 meetings today. Conflict at 2pm — reschedule proposed</p>
              </div>
              <div className="bg-card premium-surface-soft rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">💬 Slack</p>
                <p className="text-sm text-foreground">CTO asked about release timeline. 2 DMs waiting.</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <p className="text-xs text-indigo-400 mb-1">🤖 AI Proposals</p>
                <p className="text-sm text-foreground">Draft investor reply • Reschedule 2pm • Reply to CTO</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
