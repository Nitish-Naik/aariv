
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
  CreditCard,
  ExternalLink,
  FileText,
  FolderOpen,
  GitPullRequest,
  Inbox,
  Mail,
  MessageSquare,
  Mic,
  Music,
  RefreshCw,
  Search,
  Zap,
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

const APP_COLORS: Record<string, string> = {
  gmail: "#EA4335",
  googlecalendar: "#4285F4",
  slack: "#4A154B",
  github: "#24292e",
  notion: "#FFFFFF",
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

const APP_LABELS: Record<string, string> = {
  gmail: "Gmail",
  googlecalendar: "Calendar",
  slack: "Slack",
  github: "GitHub",
  notion: "Notion",
  linear: "Linear",
  discord: "Discord",
  outlook: "Outlook",
  googledrive: "Google Drive",
  googledocs: "Google Docs",
  stripe: "Stripe",
  jira: "Jira",
  trello: "Trello",
  todoist: "Todoist",
  pipedrive: "Pipedrive",
  salesforce: "Salesforce",
  spotify: "Spotify",
  youtube: "YouTube",
  fireflies: "Fireflies",
  slackbot: "Slackbot",
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
    .toLowerCase()
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
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        setError(null);
      } catch (err: any) {
        console.error("Failed to load feed:", err);
        if (!silent) setError(err.message || "Failed to load feed");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user?.id],
  );

  const syncFromComposio = useCallback(async () => {
    if (!user?.id || syncing) return;
    setSyncing(true);
    try {
      const baseUrl = api.getBaseUrl().replace(/\/api$/, "");
      await fetch(`${baseUrl}/webhook/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      // Wait a moment for events to be processed, then refresh
      await new Promise((r) => setTimeout(r, 2000));
      await loadEvents(true);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }, [user?.id, syncing, loadEvents]);

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
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif text-[var(--text-primary)]">
            Feed
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">
            Everything your triggers captured, in one timeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncFromComposio}
            disabled={syncing}
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.05)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.1)] transition-all disabled:opacity-50"
            title="Pull latest events from Composio"
          >
            <Zap
              size={13}
              className={`text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors ${syncing ? "animate-pulse" : ""}`}
            />
            {syncing ? "Syncing…" : "Sync"}
          </button>
          <button
            onClick={() => loadEvents(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.05)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.1)] transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={`text-[var(--text-muted)] ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Contextual Links ──────────────────────────── */}
      <div className="flex items-center gap-4 mb-8 bg-[var(--bg-surface)] p-2 rounded-2xl border border-[rgba(255,255,255,0.03)] opacity-90 backdrop-blur-sm">
        <Link
          href="/dashboard/review"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--accent)] hover:bg-[currentColor]/5 transition-colors"
        >
          <div className="bg-[currentColor]/10 p-1.5 rounded-lg">
            <CheckSquare size={13} />
          </div>
          Items needing your decision
          <ExternalLink size={10} className="ml-1 opacity-50" />
        </Link>
        <div className="w-px h-6 bg-[var(--border)] opacity-50" />
        <Link
          href="/dashboard/triggers"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
        >
          <div className="bg-[rgba(255,255,255,0.04)] p-1.5 rounded-lg group-hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <Zap size={13} />
          </div>
          Manage triggers
        </Link>
      </div>

      {/* ── Stats Strip ───────────────────────────────── */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Events",
              value: stats.total,
              color: "text-[var(--text-primary)]",
              dot: "bg-white/20",
            },
            {
              label: "Processed",
              value: stats.completed,
              color: "text-[var(--text-primary)]",
              dot: "bg-emerald-400",
            },
            {
              label: "Errors",
              value: stats.failed,
              color:
                stats.failed > 0
                  ? "text-red-400"
                  : "text-[var(--text-primary)]",
              dot:
                stats.failed > 0 ? "bg-red-400 animate-pulse" : "bg-zinc-500",
            },
            {
              label: "Apps",
              value: stats.apps,
              color: "text-[var(--text-primary)]",
              dot: "bg-blue-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.03)] rounded-2xl px-5 py-4 flex flex-col items-center justify-center text-center shadow-sm"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <p className="text-[11px] font-medium text-[var(--text-muted)] tracking-wide">
                  {s.label}
                </p>
              </div>
              <p className={`text-2xl font-serif ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ───────────────────────────────────── */}
      {!loading && events.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* App pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAppFilter("all")}
              className={`px-4 py-1.5 text-[11px] font-medium rounded-full transition-all ${appFilter === "all"
                  ? "bg-[var(--text-primary)] text-[var(--bg-deep)] shadow-md"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[rgba(255,255,255,0.04)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.1)]"
                }`}
            >
              All
            </button>
            {appOptions.map((app) => (
              <button
                key={app}
                onClick={() => setAppFilter(app)}
                className={`group flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium rounded-full transition-all ${appFilter === app
                    ? "bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)] border border-[rgba(255,255,255,0.1)] shadow-sm"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[rgba(255,255,255,0.04)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.1)]"
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all ${appFilter === app ? "scale-110 shadow-[0_0_8px_currentColor]" : "group-hover:scale-110"}`}
                  style={{
                    backgroundColor: APP_COLORS[app] || "var(--text-muted)",
                    color: APP_COLORS[app] || "var(--text-muted)",
                  }}
                />
                {APP_LABELS[app] || app}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed…"
              className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.04)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            />
          </div>
        </div>
      )}

      {/* ── Error Banner ──────────────────────────────── */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-400">
              Failed to load feed
            </p>
            <p className="text-xs text-red-400/70 mt-0.5 truncate">
              {error}
            </p>
          </div>
          <button
            onClick={() => loadEvents()}
            className="text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-full border border-red-400/30 hover:border-red-400/50 transition-all shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading ───────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.03)] rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.02)] animate-pulse" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 w-1/3 rounded bg-[rgba(255,255,255,0.02)] animate-pulse" />
                  <div className="h-3 w-1/4 rounded bg-[rgba(255,255,255,0.02)] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        /* ── Empty State ──────────────────────────────── */
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-6 mt-10">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-10 blur-xl"></div>
            <Activity
              size={32}
              className="text-[var(--text-muted)] relative z-10"
            />
          </div>
          <div className="space-y-3 max-w-sm">
            <h3 className="text-xl font-serif text-[var(--text-primary)]">
              Your feed is quiet
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Once your triggers start capturing events from connected apps,
              they&apos;ll appear here as a timeline.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Link
              href="/dashboard/triggers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:brightness-110 transition-all shadow-md"
            >
              <Zap size={14} />
              Set up triggers
            </Link>
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.05)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.1)] transition-all"
            >
              Connect apps
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* ── No Results ───────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
            <Search size={22} className="text-[var(--text-muted)]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-medium text-[var(--text-primary)]">
              No matches found
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              No events match your current filters or search
            </p>
          </div>
          <button
            onClick={() => {
              setAppFilter("all");
              setSearchQuery("");
            }}
            className="text-xs font-medium text-[var(--accent)] hover:text-white transition-colors mt-2 bg-[var(--accent)]/10 px-4 py-1.5 rounded-full"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* ── Timeline ─────────────────────────────────── */
        <div className="space-y-10 relative">
          <div className="absolute left-[29px] top-6 bottom-0 w-px bg-gradient-to-b from-[var(--border)] via-[var(--border)] to-transparent opacity-50 hidden sm:block pointer-events-none" />
          {grouped.map((group) => (
            <div key={group.label} className="relative">
              {/* Date header */}
              <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[var(--bg-base)]/80 backdrop-blur-md py-2 z-10 transition-colors">
                <span className="text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.03)] tracking-wide shadow-sm">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-transparent" />
                <span className="text-[11px] font-medium text-[var(--text-muted)] tabular-nums px-2">
                  {group.events.length} event
                  {group.events.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {group.events.map((evt) => {
                    const icon = APP_ICONS[evt.app] || <Inbox size={14} />;
                    const color = APP_COLORS[evt.app] || "var(--text-muted)";
                    const appLabel = APP_LABELS[evt.app] || evt.app;
                    const statusMeta =
                      STATUS_META[evt.status] || STATUS_META.received;
                    const eventLabel = formatSlug(evt.triggerSlug);

                    return (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="group relative bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.03)] rounded-2xl px-5 py-4 hover:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.02)] hover:-translate-y-[1px] transition-all shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          {/* App icon */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm relative overflow-hidden"
                            style={{ backgroundColor: color }}
                          >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                              <span className="text-[15px] font-medium text-[var(--text-primary)] tracking-tight">
                                {eventLabel}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">
                                  {appLabel}
                                </span>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-current/10 ${statusMeta.color} bg-current/5`}
                                >
                                  <div className="w-1 h-1 rounded-full bg-current"></div>
                                  {statusMeta.label}
                                </span>
                              </div>
                            </div>

                            {evt.preview && (
                              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 mt-1 max-w-2xl">
                                {evt.preview}
                              </p>
                            )}

                            {evt.error && (
                              <div className="flex items-center gap-1.5 mt-3 text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20 w-fit">
                                <AlertCircle size={12} />
                                <span className="text-[11px] font-medium">
                                  {evt.error}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right: time + processing */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0 pl-4 border-l border-[rgba(255,255,255,0.03)] h-full min-h-[40px] justify-center">
                            <span className="text-[11px] font-medium text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                              {timeAgo(evt.createdAt)}
                            </span>
                            {evt.processingTimeMs != null && (
                              <span className="text-[10px] text-[var(--text-muted)]/50 tabular-nums flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Clock size={10} />
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
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => loadEvents(true, events.length)}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.05)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.1)] transition-all disabled:opacity-50 shadow-sm"
          >
            {loadingMore ? (
              <RefreshCw
                size={14}
                className="animate-spin text-[var(--text-muted)]"
              />
            ) : (
              <Activity size={14} className="text-[var(--text-muted)]" />
            )}
            {loadingMore ? "Loading more..." : "Load more events"}
          </button>
        </div>
      )}
    </div>
  );
}
