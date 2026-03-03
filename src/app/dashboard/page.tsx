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
  Eye,
  GitPullRequest,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
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

interface FeedEvent {
  id: string;
  triggerSlug: string;
  app: string;
  status: string;
  preview: string;
  createdAt: string;
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

const FEED_APP_ICONS: Record<string, React.ReactNode> = {
  gmail: <Mail size={13} />,
  googlecalendar: <Calendar size={13} />,
  slack: <MessageSquare size={13} />,
  github: <GitPullRequest size={13} />,
  notion: <Zap size={13} />,
  linear: <CheckSquare size={13} />,
  discord: <MessageSquare size={13} />,
};

const FEED_APP_LABELS: Record<string, string> = {
  gmail: "Gmail",
  googlecalendar: "Calendar",
  slack: "Slack",
  github: "GitHub",
  notion: "Notion",
  linear: "Linear",
  discord: "Discord",
};

function feedTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatFeedSlug(slug: string): string {
  return slug
    .replace(/^[A-Z]+_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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

/* ─── Calm State ─────────────────────────────────────────── */

function CalmState({
  firstName,
  recentEvents = [],
  reviewCounts = { total: 0, high: 0, medium: 0, low: 0 },
}: {
  firstName: string;
  recentEvents?: FeedEvent[];
  reviewCounts?: ReviewCounts;
}) {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-10">
        {/* Cloud Icon */}
        <div className="mb-6 text-[var(--text-muted)]">
          <Cloud size={48} strokeWidth={1.2} />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)] mb-3">
          Rest easy, {firstName}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed mb-8">
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
            Ask Aariv something
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
      </div>

      {/* Quick Links */}
      <div className="flex items-center gap-3 mb-6">
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

      {/* Recent Activity (if any) */}
      {recentEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
              Recent activity
            </h2>
            <Link
              href="/dashboard/feed"
              className="text-xs font-medium text-[var(--accent)] hover:underline underline-offset-2 flex items-center gap-1"
            >
              View all
              <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentEvents.slice(0, 5).map((evt) => {
              const icon = FEED_APP_ICONS[evt.app] || <Inbox size={13} />;
              const color = APP_COLOR[evt.app] || "var(--text-muted)";
              const label = FEED_APP_LABELS[evt.app] || evt.app;
              return (
                <div
                  key={evt.id}
                  className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 hover:border-[var(--border-strong)] transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[var(--text-primary)] font-medium truncate block">
                      {formatFeedSlug(evt.triggerSlug)}
                    </span>
                    {evt.preview && (
                      <span className="text-xs text-[var(--text-muted)] truncate block">
                        {evt.preview}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap shrink-0">
                    {feedTimeAgo(evt.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
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
  recentEvents,
  reviewCounts,
}: {
  firstName: string;
  briefing: Briefing;
  logoMap: Record<string, string>;
  recentEvents: FeedEvent[];
  reviewCounts: ReviewCounts;
}) {
  const router = useRouter();
  const { counts, proposals, events, insight } = briefing;

  /** Route proposal action to the assistant with pre-filled context */
  const handleProposalAction = (proposal: Proposal, action: string) => {
    const prompt = encodeURIComponent(
      `${action}: ${proposal.title} — ${proposal.description}`
    );
    router.push(`/dashboard/assistant?prompt=${prompt}`);
  };

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

      {/* ── Recent Activity ──────────────────────────── */}
      {recentEvents.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
              Recent activity
            </h2>
            <Link
              href="/dashboard/feed"
              className="text-xs font-medium text-[var(--accent)] hover:underline underline-offset-2 flex items-center gap-1"
            >
              View all
              <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentEvents.slice(0, 5).map((evt) => {
              const icon = FEED_APP_ICONS[evt.app] || <Inbox size={13} />;
              const color = APP_COLOR[evt.app] || "var(--text-muted)";
              const label = FEED_APP_LABELS[evt.app] || evt.app;
              return (
                <div
                  key={evt.id}
                  className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 hover:border-[var(--border-strong)] transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[var(--text-primary)] font-medium truncate block">
                      {formatFeedSlug(evt.triggerSlug)}
                    </span>
                    {evt.preview && (
                      <span className="text-xs text-[var(--text-muted)] truncate block">
                        {evt.preview}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap shrink-0">
                    {feedTimeAgo(evt.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
  const [recentEvents, setRecentEvents] = useState<FeedEvent[]>([]);
  const [reviewCounts, setReviewCounts] = useState<ReviewCounts>({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBriefing = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(false);
    try {
      const [data, intData, feedData, reviewData] = await Promise.all([
        api.get(`/dashboard/briefing?userId=${user.id}`),
        api.get(`/integrations?userId=${user.id}`).catch(() => null),
        api
          .get(`/dashboard/recent-events?userId=${user.id}&limit=5`)
          .catch(() => null),
        api.get(`/review?userId=${user.id}&status=pending`).catch(() => null),
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

      // Recent feed events
      if (feedData?.events) {
        setRecentEvents(feedData.events);
      }

      // Review counts
      if (reviewData?.counts) {
        setReviewCounts(reviewData.counts);
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
    return (
      <CalmState
        firstName={firstName}
        recentEvents={recentEvents}
        reviewCounts={reviewCounts}
      />
    );
  }

  // Calm vs Active
  if (briefing.is_calm) {
    return (
      <CalmState
        firstName={firstName}
        recentEvents={recentEvents}
        reviewCounts={reviewCounts}
      />
    );
  }

  return (
    <ActiveState
      firstName={firstName}
      briefing={briefing}
      logoMap={logoMap}
      recentEvents={recentEvents}
      reviewCounts={reviewCounts}
    />
  );
}
