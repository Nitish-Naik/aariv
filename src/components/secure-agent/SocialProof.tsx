"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, BriefcaseBusiness, Code2 } from "lucide-react";

const staticStats = [
  { value: "500+", label: "apps connected" },
  { value: "3h+", label: "saved per day" },
  { value: "24/7", label: "always running" },
  { value: "100%", label: "OAuth — no passwords" },
];

const useCases = [
  {
    persona: "Founder",
    before:
      "45 min every morning triaging email, Slack, and Linear before any real work started.",
    after:
      "Morning brief delivered at 6:47am. 4 replies drafted, 3 tickets updated, Slack digest ready. Day starts in 5 minutes.",
    app: "Gmail · Slack · Linear",
  },
  {
    persona: "Sales rep",
    before:
      "Manually logging every call and email into HubSpot at end of day. Always a day behind.",
    after:
      "CalmPilot logs each call and email to the right contact automatically. CRM is live, not lagging.",
    app: "Gmail · HubSpot · Calendar",
  },
  {
    persona: "Engineer",
    before:
      "Copying GitHub issue context into Slack and Notion every sprint. Same information, three places.",
    after:
      "New GitHub issues auto-post to the team channel and create Notion entries with full context attached.",
    app: "GitHub · Slack · Notion",
  },
];

export default function SocialProof() {
  const stats = staticStats;

  return (
    <section className="bg-background border-y border-border py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-muted/40 rounded-2xl overflow-hidden border border-border"
        >
          {stats.map((s, i) => (
            <div key={i} className="bg-background px-6 py-6 text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Before / After use cases */}
        <div className="mt-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-6 text-center"
          >
            What actually changes
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {useCases.map((uc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl bg-card border border-border p-5 sm:p-6 flex flex-col gap-5"
              >
                {/* Persona tag */}
                <span className="self-start inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-2.5 py-1 rounded-md bg-muted/40 border border-border">
                  {uc.persona === "Founder" && (
                    <BriefcaseBusiness size={12} className="text-muted-foreground" />
                  )}
                  {uc.persona === "Sales rep" && (
                    <BarChart3 size={12} className="text-muted-foreground" />
                  )}
                  {uc.persona === "Engineer" && (
                    <Code2 size={12} className="text-muted-foreground" />
                  )}
                  {uc.persona}
                </span>

                {/* Before */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
                    Before
                  </p>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">
                    {uc.before}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-px bg-muted/60" />
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                    <ArrowRight
                      size={14}
                      className="text-emerald-400 shrink-0"
                    />
                  </span>
                  <div className="flex-1 h-px bg-muted/60" />
                </div>

                {/* After */}
                <div>
                  <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold mb-1.5">
                    After
                  </p>
                  <p className="text-foreground/80 text-[13px] leading-relaxed">
                    {uc.after}
                  </p>
                </div>

                {/* Apps used */}
                <p className="text-[11px] text-muted-foreground font-mono mt-auto pt-2 border-t border-border">
                  {uc.app}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
