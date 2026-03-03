"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity,
    AlertCircle,
    Calendar,
    CheckSquare,
    Clock,
    ExternalLink,
    GitPullRequest,
    Inbox,
    Mail,
    MessageSquare,
    RefreshCw,
    Search,
    Zap
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

/* ─── Types ──────────────────────────────────────────────── */

interface FeedEvent {
  id: string;
  triggerSlug: string;
  app: string;
  status: string;
  preview: string;
  processingTimeMs: number | null;
  error: string | null;
  createdAt: string;
}

type AppFilter = "all" | string;

/* ─── Constants ──────────────────────────────────────────── */

const APP_ICONS: Record<string, React.ReactNode> = {
  gmail: <Mail size={15} />,
  googlecalendar: <Calendar size={15} />,
  slack: <MessageSquare size={15} />,
  github: <GitPullRequest size={15} />,
  notion: <Zap size={15} />,
  linear: <CheckSquare size={15} />,
  discord: <MessageSquare size={15} />,
};

const APP_COLORS: Record<string, string> = {
  gmail: "#EA4335",
  googlecalendar: "#4285F4",
  slack: "#4A154B",
  github: "#24292e",
  notion: "#FFFFFF",
  linear: "#5E6AD2",
  discord: "#5865F2",
};

const APP_LABELS: Record<string, string> = {
  gmail: "Gmail",
  googlecalendar: "Calendar",
  slack: "Slack",
  github: "GitHub",
  notion: "Notion",
  linear: "Linear",
  discord: "Discord",
};

const STATUS_META: Record<string, { color: string; label: string }> = {
  received: { color: "text-blue-400", label: "Received" },
  processing: { color: "text-amber-400", label: "Processing" },
  completed: { color: "text-emerald-400", label: "Summarized" },
  failed: { color: "text-red-400", label: "Failed" },
};

/* ─── Helpers ────────────────────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatSlug(slug: string): string {
  return slug
    .replace(/^[A-Z]+_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupByDate(
  events: FeedEvent[],
): { label: string; events: FeedEvent[] }[] {
  const groups = new Map<string, FeedEvent[]>();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const evt of events) {
    const d = new Date(evt.createdAt);
    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(evt);
  }

  return Array.from(groups.entries()).map(([label, events]) => ({
    label,
    events,
  }));
}

/* ─── Page ───────────────────────────────────────────────── */

export default function FeedPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appFilter, setAppFilter] = useState<AppFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [serverStats, setServerStats] = useState<{
    total: number;
    completed: number;
    failed: number;
    apps: number;
  } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadEvents = useCallback(
    async (silent = false, offset = 0) => {
      if (!user?.id) return;
      if (offset === 0) {
        if (!silent) setLoading(true);
        else setRefreshing(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const data = await api.get(
          `/dashboard/feed?userId=${user.id}&limit=100&offset=${offset}`,
        );
        if (offset === 0) {
          setEvents(data.events || []);
        } else {
          setEvents((prev) => [...prev, ...(data.events || [])]);
        }
        setHasMore(data.hasMore || false);
        if (data.stats) setServerStats(data.stats);
      } catch (err) {
        console.error("Failed to load feed:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => loadEvents(true), 30000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  // Derive unique apps for filter
  const appOptions = useMemo(() => {
    const apps = new Set(events.map((e) => e.app));
    return Array.from(apps).sort();
  }, [events]);

  // Filtered events
  const filtered = useMemo(() => {
    let result = events;
    if (appFilter !== "all") {
      result = result.filter((e) => e.app === appFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.preview.toLowerCase().includes(q) ||
          e.triggerSlug.toLowerCase().includes(q) ||
          e.app.toLowerCase().includes(q),
      );
    }
    return result;
  }, [events, appFilter, searchQuery]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Stats — prefer server stats, fall back to local computation
  const stats = useMemo(
    () =>
      serverStats || {
        total: events.length,
        completed: events.filter((e) => e.status === "completed").length,
        failed: events.filter((e) => e.status === "failed").length,
        apps: new Set(events.map((e) => e.app)).size,
      },
    [events, serverStats],
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[var(--text-primary)]">
            Feed
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Everything your triggers captured, in one timeline
          </p>
        </div>
        <button
          onClick={() => loadEvents(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Contextual Links ──────────────────────────── */}
      <div className="flex items-center gap-3 mt-3 mb-6">
        <Link
          href="/dashboard/review"
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline underline-offset-2"
        >
          <CheckSquare size={12} />
          Items needing your decision
          <ExternalLink size={10} />
        </Link>
        <span className="text-[var(--border)]">·</span>
        <Link
          href="/dashboard/triggers"
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <Zap size={12} />
          Manage triggers
        </Link>
      </div>

      {/* ── Stats Strip ───────────────────────────────── */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Events",
              value: stats.total,
              color: "text-[var(--text-primary)]",
            },
            {
              label: "Processed",
              value: stats.completed,
              color: "text-emerald-400",
            },
            {
              label: "Errors",
              value: stats.failed,
              color: stats.failed > 0 ? "text-red-400" : "text-zinc-500",
            },
            { label: "Apps", value: stats.apps, color: "text-blue-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3"
            >
              <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                {s.label}
              </p>
              <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ───────────────────────────────────── */}
      {!loading && events.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          {/* App pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setAppFilter("all")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                appFilter === "all"
                  ? "bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              All
            </button>
            {appOptions.map((app) => (
              <button
                key={app}
                onClick={() => setAppFilter(app)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  appFilter === app
                    ? "bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: APP_COLORS[app] || "var(--text-muted)",
                  }}
                />
                {APP_LABELS[app] || app}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 sm:ml-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Search size={13} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events…"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      )}

      {/* ── Loading ───────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--border)] animate-pulse" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="h-3 w-48 rounded bg-[var(--border)] animate-pulse" />
                  <div className="h-2.5 w-32 rounded bg-[var(--border)] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        /* ── Empty State ──────────────────────────────── */
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center">
            <Activity size={28} className="text-[var(--text-muted)]" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              No events yet
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Once your triggers start capturing events from connected apps,
              they&apos;ll appear here as a timeline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/triggers"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Zap size={14} />
              Set up triggers
            </Link>
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Connect apps
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* ── No Results ───────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Search size={24} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            No events match your filters
          </p>
          <button
            onClick={() => {
              setAppFilter("all");
              setSearchQuery("");
            }}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* ── Timeline ─────────────────────────────────── */
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                  {group.events.length} event
                  {group.events.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {group.events.map((evt) => {
                    const icon = APP_ICONS[evt.app] || <Inbox size={15} />;
                    const color = APP_COLORS[evt.app] || "var(--text-muted)";
                    const appLabel = APP_LABELS[evt.app] || evt.app;
                    const statusMeta =
                      STATUS_META[evt.status] || STATUS_META.received;
                    const eventLabel = formatSlug(evt.triggerSlug);

                    return (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 hover:border-[var(--border-strong)] transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          {/* App icon */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5"
                            style={{ backgroundColor: color }}
                          >
                            {icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-[var(--text-primary)]">
                                {eventLabel}
                              </span>
                              <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                                {appLabel}
                              </span>
                              <span
                                className={`text-[10px] font-medium ${statusMeta.color}`}
                              >
                                {statusMeta.label}
                              </span>
                            </div>

                            {evt.preview && (
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                                {evt.preview}
                              </p>
                            )}

                            {evt.error && (
                              <div className="flex items-center gap-1.5 mt-1.5 text-red-400">
                                <AlertCircle size={11} />
                                <span className="text-[11px]">{evt.error}</span>
                              </div>
                            )}
                          </div>

                          {/* Right: time + processing */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                              {timeAgo(evt.createdAt)}
                            </span>
                            {evt.processingTimeMs != null && (
                              <span className="text-[10px] text-[var(--text-muted)] tabular-nums flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Clock size={9} />
                                {evt.processingTimeMs}ms
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {!loading && hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => loadEvents(true, events.length)}
            disabled={loadingMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Activity size={14} />
            )}
            {loadingMore ? "Loading…" : "Load more events"}
          </button>
        </div>
      )}
    </div>
  );
}
