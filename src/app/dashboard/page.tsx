"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Cloud,
  CreditCard,
  Eye,
  FileText,
  FolderOpen,
  Loader2,
  Mail,
  MessageSquare,
  Mic,
  Music,
  Plug,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
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

interface ReviewCounts {
  total: number;
  high: number;
  medium: number;
  low: number;
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
  outlook: <Mail size={15} />,
  googledrive: <FolderOpen size={15} />,
  googledocs: <FileText size={15} />,
  stripe: <CreditCard size={15} />,
  jira: <CheckSquare size={15} />,
  trello: <CheckSquare size={15} />,
  todoist: <CheckSquare size={15} />,
  pipedrive: <Activity size={15} />,
  salesforce: <Activity size={15} />,
  spotify: <Music size={15} />,
  youtube: <Music size={15} />,
  fireflies: <Mic size={15} />,
  slackbot: <MessageSquare size={15} />,
};

const APP_COLOR: Record<string, string> = {
  gmail: "#EA4335",
  googlecalendar: "#4285F4",
  slack: "#4A154B",
  github: "#333",
  notion: "#000",
  linear: "#5E6AD2",
  discord: "#5865F2",
  outlook: "#0078D4",
  googledrive: "#0F9D58",
  googledocs: "#4285F4",
  stripe: "#635BFF",
  jira: "#0052CC",
  trello: "#0079BF",
  todoist: "#E44332",
  pipedrive: "#1BAA6B",
  salesforce: "#00A1E0",
  spotify: "#1DB954",
  youtube: "#FF0000",
  fireflies: "#6C2BD9",
  slackbot: "#4A154B",
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
  onAction,
}: {
  proposal: Proposal;
  logoUrl?: string;
  onAction?: (proposal: Proposal, action: string) => void;
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
              onClick={() => onAction?.(proposal, action)}
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

/* ─── Onboarding State (first-time users, no apps connected) ─ */

const RECOMMENDED_APPS = [
  {
    slug: "gmail",
    name: "Gmail",
    description: "Read, draft, and manage your emails automatically.",
    color: "#EA4335",
    icon: <Mail size={20} />,
    free: true,
  },
  {
    slug: "googlecalendar",
    name: "Google Calendar",
    description:
      "Track meetings, schedule events, and stay on top of your day.",
    color: "#4285F4",
    icon: <Calendar size={20} />,
    free: true,
  },
  {
    slug: "slack",
    name: "Slack",
    description:
      "Monitor channels, respond to messages, and manage notifications.",
    color: "#E01E5A",
    icon: <MessageSquare size={20} />,
    free: false,
  },
];

function OnboardingState({ firstName }: { firstName: string }) {
  const router = useRouter();

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-12 max-w-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-deep)] border border-[var(--border)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Sparkles className="text-[var(--text-primary)]" size={28} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4 leading-tight">
          Welcome, {firstName}!
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
          Connect your first app so CalmPilot can start managing your day —
          reading emails, checking your calendar, and surfacing what needs your
          attention.
        </p>
      </div>

      {/* Recommended Apps */}
      <div className="mb-8 max-w-xl w-full">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4">
          Get started with
        </h2>
        <div className="space-y-3">
          {RECOMMENDED_APPS.map((app) => (
            <button
              key={app.slug}
              onClick={() =>
                router.push(`/dashboard/integrations?connect=${app.slug}`)
              }
              className="w-full flex items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-4 hover:border-[var(--accent)] transition-colors text-left group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: app.color }}
              >
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {app.name}
                  </span>
                  {app.free && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                      Free
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  {app.description}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Browse All + Skip */}
      <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl w-full">
        <button
          onClick={() => router.push("/dashboard/integrations")}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plug size={15} />
          Browse all apps
        </button>
        <button
          onClick={() => router.push("/dashboard/assistant")}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
        >
          <Sparkles size={15} className="text-[var(--accent)]" />
          Skip — chat with Aariv
        </button>
      </div>

      {/* How it works */}
      <div className="mt-10 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 max-w-xl w-full">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4">
          How it works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "Connect apps",
              desc: "Link Gmail, Calendar, Slack, or any other tool you use.",
            },
            {
              step: "2",
              title: "CalmPilot watches",
              desc: "It monitors your apps and organizes what matters.",
            },
            {
              step: "3",
              title: "You decide",
              desc: "Review proposals and let CalmPilot act — or handle it yourself.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold mb-2">
                {item.step}
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Calm State ─────────────────────────────────────────── */

function CalmState({
  firstName,
  briefing,
  reviewCounts = { total: 0, high: 0, medium: 0, low: 0 },
  onRefresh,
  refreshing,
}: {
  firstName: string;
  briefing?: Briefing | null;
  reviewCounts?: ReviewCounts;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const router = useRouter();
  const subtitle =
    briefing?.subtitle ||
    "Nothing needs your attention right now. Your day is unfolding exactly as it should.";
  const calendarEvents = briefing?.events ?? [];
  const insight = briefing?.insight;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="mb-6 text-[var(--text-muted)]">
          <Cloud size={48} strokeWidth={1.2} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <button
            onClick={() => router.push("/dashboard/assistant")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
          >
            <Sparkles size={15} className="text-[var(--accent)]" />
            Ask Aariv something
          </button>
          <button
            onClick={() => router.push("/dashboard/triggers")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
          >
            <Eye size={15} className="text-[var(--accent)]" />
            Manage triggers
          </button>
          <button
            onClick={() => router.push("/dashboard/review")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
          >
            <CheckCircle2 size={15} className="text-[var(--accent)]" />
            Review items
          </button>
        </div>
      </div>

      {/* Calendar events — calm day can still have meetings */}
      {calendarEvents.length > 0 && (
        <div className="mb-6 max-w-xl w-full">
          <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-3">
            What&apos;s ahead today
          </h2>
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
            {calendarEvents.map((event, i) => (
              <TimelineEvent
                key={event.id || i}
                event={event}
                isLast={i === calendarEvents.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="flex items-center gap-3 mb-6 flex-wrap max-w-xl w-full">
        {reviewCounts.total > 0 && (
          <Link
            href="/dashboard/review"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
          >
            <CheckCircle2 size={15} className="text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {reviewCounts.total} item{reviewCounts.total !== 1 ? "s" : ""} to
              review
            </span>
            {reviewCounts.high > 0 && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                {reviewCounts.high} urgent
              </span>
            )}
            <ArrowRight
              size={13}
              className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors"
            />
          </Link>
        )}
        <Link
          href="/dashboard/feed"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors group"
        >
          <Activity size={15} className="text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            View feed
          </span>
        </Link>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-40 ml-auto"
            title="Refresh briefing"
          >
            <Loader2 size={13} className={refreshing ? "animate-spin" : ""} />
            <span className="text-xs">Refresh</span>
          </button>
        )}
      </div>

      {/* Aariv insight */}
      {insight && (
        <div className="mt-8 flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 max-w-xl w-full">
          <Sparkles size={16} className="text-[var(--accent)] shrink-0" />
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {insight}
          </p>
        </div>
      )}

      {/* Date/time footer */}
      <p className="mt-10 text-xs text-[var(--text-muted)] text-center">
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
  reviewCounts,
  onRefresh,
  refreshing,
}: {
  firstName: string;
  briefing: Briefing;
  logoMap: Record<string, string>;
  reviewCounts: ReviewCounts;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const router = useRouter();
  const { counts, proposals, events, insight } = briefing;

  /** Route proposal action to the assistant with pre-filled context */
  const handleProposalAction = (proposal: Proposal, action: string) => {
    const prompt = encodeURIComponent(
      `${action}: ${proposal.title} — ${proposal.description}`,
    );
    router.push(`/dashboard/assistant?prompt=${prompt}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          {getGreeting()}, {firstName}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-[var(--text-muted)] hidden sm:block">
            {formatDate()}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-40 text-xs"
              title="Refresh briefing"
            >
              <Loader2 size={12} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
        </div>
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
            Aariv&apos;s proposals
          </h2>
          {proposals.length > 0 ? (
            <div className="space-y-3">
              {proposals.map((p, i) => (
                <ProposalCard
                  key={i}
                  proposal={p}
                  logoUrl={logoMap[p.app?.toLowerCase()]}
                  onAction={handleProposalAction}
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

      {/* ── Quick Links Bar ──────────────────────────── */}
      <div className="mt-8 flex items-center gap-3">
        {reviewCounts.total > 0 && (
          <Link
            href="/dashboard/review"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
          >
            <CheckCircle2 size={15} className="text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {reviewCounts.total} item{reviewCounts.total !== 1 ? "s" : ""} to
              review
            </span>
            {reviewCounts.high > 0 && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                {reviewCounts.high} urgent
              </span>
            )}
            <ArrowRight
              size={13}
              className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors"
            />
          </Link>
        )}
        <Link
          href="/dashboard/feed"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors group"
        >
          <Activity size={15} className="text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            View feed
          </span>
        </Link>
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
  const [reviewCounts, setReviewCounts] = useState<ReviewCounts>({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConnections, setHasConnections] = useState<boolean | null>(null);

  const fetchBriefing = useCallback(
    async (silent = false) => {
      if (!user?.id) return;
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        // 1. Check connected apps
        const intData = await api
          .get(`/integrations?userId=${user.id}`)
          .catch(() => null);

        const connectedApps: string[] = [];
        if (intData?.integrations) {
          const map: Record<string, string> = {};
          for (const int of intData.integrations) {
            if (int.logo && int.appName)
              map[int.appName.toLowerCase()] = int.logo;
            if (int.status === "connected" && int.canDisconnect !== false)
              connectedApps.push(int.appName);
          }
          setLogoMap(map);
        }

        if (connectedApps.length === 0) {
          setHasConnections(false);
          return;
        }
        setHasConnections(true);

        // 2. Fetch briefing + review in parallel
        const [data, reviewData] = await Promise.all([
          api.get(`/dashboard/briefing?userId=${user.id}`),
          api.get(`/review?userId=${user.id}&status=pending`).catch(() => null),
        ]);
        setBriefing(data);
        if (reviewData?.counts) setReviewCounts(reviewData.counts);
      } catch (err: any) {
        console.error("Failed to fetch briefing:", err);
        setError(err.message || "Couldn't load your briefing.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Preparing your day…
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-5"
            >
              <div className="h-3 w-16 rounded bg-[var(--overlay)] animate-pulse mb-3" />
              <div className="h-6 w-10 rounded bg-[var(--overlay)] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--overlay)] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-4 w-2/5 rounded bg-[var(--overlay)] animate-pulse" />
                  <div className="h-3 w-3/5 rounded bg-[var(--overlay)] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hasConnections === false) {
    return <OnboardingState firstName={firstName} />;
  }

  // Explicit error state — don't silently hide it
  if (error && !briefing) {
    const isCredits = error === "INSUFFICIENT_CREDITS";
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col items-center justify-center min-h-[80vh]">
        {isCredits ? (
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] max-w-md w-full">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <CreditCard size={22} className="text-amber-400" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Out of credits</h3>
              <p className="text-sm text-[var(--text-muted)]">Add credits to continue using Aariv.</p>
            </div>
            <a
              href="/dashboard/settings"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <CreditCard size={14} />
              Add Credits
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-[var(--text-secondary)]">{error}</p>
            <button
              onClick={() => fetchBriefing()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Loader2 size={14} />
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!briefing || briefing.is_calm) {
    return (
      <CalmState
        firstName={firstName}
        briefing={briefing}
        reviewCounts={reviewCounts}
        onRefresh={() => fetchBriefing(true)}
        refreshing={refreshing}
      />
    );
  }

  return (
    <ActiveState
      firstName={firstName}
      briefing={briefing}
      logoMap={logoMap}
      reviewCounts={reviewCounts}
      onRefresh={() => fetchBriefing(true)}
      refreshing={refreshing}
    />
  );
}
