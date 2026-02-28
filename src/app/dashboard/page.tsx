"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowRight, CheckCircle, X } from "lucide-react";
import { useCallback, useState } from "react";

const INITIAL_PROPOSALS = [
  {
    id: "1",
    source: "Email from Sarah",
    time: "2h ago",
    message:
      "Sarah asked about the Q4 timeline. Should I let her know we're targeting mid-November?",
    primary: "Yes, do it",
  },
  {
    id: "2",
    source: "Calendar",
    time: "Tomorrow",
    message:
      "You have back-to-back meetings from 9-12. Want me to add a 15-min buffer between them?",
    primary: "Yes, do it",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getSubMessage = () => {
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 6)
    return "Enjoy your evening. I'll let you know if anything comes up.";
  if (hour < 12) return "A fresh start. I'll handle the rest.";
  return "Everything's under control.";
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);

  const handleDismiss = useCallback((id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleApprove = useCallback((id: string) => {
    // TODO: Call backend to execute action
    setProposals((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Greeting */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)] mb-2">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-base text-[var(--text-secondary)]">
          {getSubMessage()}
        </p>
      </div>

      {/* Status pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] mb-6 sm:mb-10">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-sm text-[var(--text-secondary)]">
          All systems running
        </span>
      </div>

      {/* Proposals */}
      {proposals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Needs your attention
          </h2>
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {proposal.source}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {proposal.time}
                </span>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {proposal.message}
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleApprove(proposal.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium whitespace-nowrap hover:opacity-90 transition-opacity"
                >
                  <CheckCircle size={14} className="shrink-0" />
                  {proposal.primary}
                </button>
                <button
                  onClick={() => handleDismiss(proposal.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-soft)] text-[var(--text-secondary)] text-sm font-medium whitespace-nowrap hover:bg-[var(--border)] transition-colors"
                >
                  <X size={14} className="shrink-0" />
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {proposals.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <p className="text-4xl">🌙</p>
          <p className="text-base text-[var(--text-secondary)]">
            All clear. Nothing needs your attention.
          </p>
          <a
            href="/dashboard/assistant"
            className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
          >
            Talk to Aariv <ArrowRight size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
