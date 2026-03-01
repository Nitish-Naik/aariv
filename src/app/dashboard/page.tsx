"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Cloud,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/* ─── Types ──────────────────────────────────────────────── */

interface Proposal {
  app: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actions: string[];
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
}

interface Briefing {
  subtitle: string;
  is_calm: boolean;
  counts: {
    meetings: number;
    emails: number;
    focus_hours: number;
    needs_judgment: number;
  };
  proposals: Proposal[];
  events: CalendarEvent[];
  insight: string;
}

/* ─── Helpers ────────────────────────────────────────────── */

const APP_ICON: Record<string, React.ReactNode> = {
  gmail: <Mail size={15} />,
  googlecalendar: <Calendar size={15} />,
  slack: <MessageSquare size={15} />,
  github: <Target size={15} />,
  notion: <Zap size={15} />,
  linear: <Zap size={15} />,
  discord: <MessageSquare size={15} />,
};

const APP_COLOR: Record<string, string> = {
  gmail: "#EA4335",
  googlecalendar: "#4285F4",
  slack: "#4A154B",
  github: "#333",
  notion: "#000",
  linear: "#5E6AD2",
  discord: "#5865F2",
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Rest easy";
};

const formatDate = () => {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

const formatFullDateTime = () => {
  const d = new Date();
  const date = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} · ${time}`;
};

/* ─── Stat Card ──────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <span className="text-xl font-semibold text-[var(--text-primary)]">
        {value}
      </span>
    </div>
  );
}

/* ─── Proposal Card ──────────────────────────────────────── */

function ProposalCard({
  proposal,
  logoUrl,
}: {
  proposal: Proposal;
  logoUrl?: string;
}) {
  const icon = APP_ICON[proposal.app] || <Zap size={15} />;
  const color = APP_COLOR[proposal.app] || "var(--accent)";
  const isHigh = proposal.priority === "high";

  return (
    <div
      className={`bg-[var(--bg-surface)] border rounded-xl p-4 space-y-3 ${
        isHigh ? "border-amber-500/30" : "border-[var(--border)]"
      }`}
    >
      {/* Tag */}
      {isHigh && (
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
          Needs Attention
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={proposal.app}
            className="w-7 h-7 rounded-lg object-contain shrink-0 mt-0.5"
          />
        ) : (
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white shrink-0 mt-0.5"
            style={{ background: color }}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
            {proposal.title}
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
            {proposal.description}
          </p>
        </div>
      </div>

      {/* Actions */}
      {proposal.actions.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          {proposal.actions.map((action, i) => (
            <button
              key={i}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                i === 0
                  ? "bg-[var(--accent)] text-white hover:opacity-90"
                  : "bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-80"
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Timeline Event ─────────────────────────────────────── */

function TimelineEvent({
  event,
  isLast,
}: {
  event: CalendarEvent;
  isLast: boolean;
}) {
  const time = formatTime(event.startTime);
  const isPast = new Date(event.startTime) < new Date();

  return (
    <div className="flex gap-3 relative">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
            isPast ? "bg-[var(--text-muted)]" : "bg-[var(--accent)]"
          }`}
        />
        {!isLast && <div className="w-px flex-1 bg-[var(--border)] mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-4 min-w-0 ${isPast ? "opacity-50" : ""}`}>
        <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
          {time}
        </span>
        <p className="text-sm text-[var(--text-primary)] font-medium mt-0.5 leading-snug">
          {event.title}
        </p>
      </div>
    </div>
  );
}

/* ─── Calm State ─────────────────────────────────────────── */

function CalmState({ firstName }: { firstName: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* Cloud Icon */}
      <div className="mb-6 text-[var(--text-muted)]">
        <Cloud size={48} strokeWidth={1.2} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)] mb-3">
        Rest easy, {firstName}
      </h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed mb-10">
        Nothing needs your attention right now. Your day is unfolding exactly as
        it should.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={() => router.push("/dashboard/assistant")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
        >
          <Sparkles size={15} className="text-[var(--accent)]" />
          Ask Alias something
        </button>
        <button
          onClick={() => router.push("/dashboard/triggers")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
        >
          <Eye size={15} className="text-[var(--accent)]" />
          Check my horizon
        </button>
        <button
          onClick={() => router.push("/dashboard/review")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
        >
          <CheckCircle2 size={15} className="text-[var(--accent)]" />
          Review items
        </button>
      </div>

      {/* Date/time footer */}
      <p className="mt-12 text-xs text-[var(--text-muted)]">
        {formatFullDateTime()}
      </p>
    </div>
  );
}

/* ─── Active State ───────────────────────────────────────── */

function ActiveState({
  firstName,
  briefing,
  logoMap,
}: {
  firstName: string;
  briefing: Briefing;
  logoMap: Record<string, string>;
}) {
  const { counts, proposals, events, insight } = briefing;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)]">
          {getGreeting()}, {firstName}
        </h1>
        <span className="text-sm text-[var(--text-muted)] mt-1 hidden sm:block">
          {formatDate()}
        </span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-8">
        {briefing.subtitle}
      </p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Meetings"
          value={counts.meetings}
          icon={<Calendar size={13} />}
        />
        <StatCard
          label="Focus Hours"
          value={`${counts.focus_hours}h`}
          icon={<Clock size={13} />}
        />
        <StatCard
          label="Emails to Review"
          value={counts.emails}
          icon={<Mail size={13} />}
        />
        <StatCard
          label="Needs Judgment"
          value={counts.needs_judgment}
          icon={<Target size={13} />}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Proposals */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-1">
            Alias&apos;s proposals
          </h2>
          {proposals.length > 0 ? (
            <div className="space-y-3">
              {proposals.map((p, i) => (
                <ProposalCard
                  key={i}
                  proposal={p}
                  logoUrl={logoMap[p.app?.toLowerCase()]}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                No proposals right now. You&apos;re all caught up.
              </p>
            </div>
          )}
        </div>

        {/* Right: Calendar Timeline */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-3">
            What&apos;s ahead
          </h2>
          {events.length > 0 ? (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
              {events.map((event, i) => (
                <TimelineEvent
                  key={event.id || i}
                  event={event}
                  isLast={i === events.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                No events scheduled
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Insight Bar */}
      {insight && (
        <div className="mt-8 flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3">
          <Sparkles size={16} className="text-[var(--accent)] shrink-0" />
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {insight}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function DashboardHome() {
  const { user } = useAuth();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [logoMap, setLogoMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBriefing = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(false);
    try {
      const [data, intData] = await Promise.all([
        api.get(`/dashboard/briefing?userId=${user.id}`),
        api.get(`/integrations?userId=${user.id}`).catch(() => null),
      ]);
      setBriefing(data);

      // Build app → logo map from integrations
      if (intData?.integrations) {
        const map: Record<string, string> = {};
        for (const int of intData.integrations) {
          if (int.logo && int.appName) {
            map[int.appName.toLowerCase()] = int.logo;
          }
        }
        setLogoMap(map);
      }
    } catch (err) {
      console.error("Failed to fetch briefing:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  const firstName = user?.name?.split(" ")[0] || "there";

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">Preparing your day…</p>
      </div>
    );
  }

  // Error fallback → show calm state
  if (error || !briefing) {
    return <CalmState firstName={firstName} />;
  }

  // Calm vs Active
  if (briefing.is_calm) {
    return <CalmState firstName={firstName} />;
  }

  return (
    <ActiveState firstName={firstName} briefing={briefing} logoMap={logoMap} />
  );
}
