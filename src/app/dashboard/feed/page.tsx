"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatTriggerSlug, getAppColor, getAppIcon, getAppLabel } from "@/lib/appMeta";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  CheckSquare,
  Clock,
  ExternalLink,
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
    <div className="bg-black min-h-screen">
      <div className="max-w-[1048px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Feed
            </h1>
            <p className="text-sm text-neutral-500 mt-1.5">
              Everything your triggers captured, in one timeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={syncFromComposio}
              disabled={syncing}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black border border-white/5 text-xs font-medium text-neutral-400 hover:text-white hover:border-white/10 transition-all disabled:opacity-50"
              title="Pull latest events from Composio"
            >
              <Zap strokeWidth={1.5}
                size={13}
                className={`text-neutral-500 group-hover:text-white transition-colors ${syncing ? "animate-pulse" : ""}`}
              />
              {syncing ? "Syncing…" : "Sync"}
            </button>
            <button
              onClick={() => loadEvents(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black border border-white/5 text-xs font-medium text-neutral-400 hover:text-white hover:border-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCw strokeWidth={1.5}
                size={13}
                className={`text-neutral-500 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Contextual Links ──────────────────────────── */}
        <div className="flex items-center gap-4 mb-8 bg-black p-2 rounded-xl border border-white/[0.03] opacity-90 backdrop-blur-sm">
          <Link
            href="/dashboard/review"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-white hover:bg-current/5 transition-colors"
          >
            <div className="bg-current/10 p-1.5 rounded-lg">
              <CheckSquare strokeWidth={1.5} size={13} />
            </div>
            Items needing your decision
            <ExternalLink strokeWidth={1.5} size={10} className="ml-1 opacity-50" />
          </Link>
          <div className="w-px h-6 bg-white/10 opacity-50" />
          <Link
            href="/dashboard/triggers"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <div className="bg-white/[0.04] p-1.5 rounded-lg group-hover:bg-white/10 transition-colors">
              <Zap strokeWidth={1.5} size={13} />
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
                color: "text-white",
                dot: "bg-white/20",
              },
              {
                label: "Processed",
                value: stats.completed,
                color: "text-white",
                dot: "bg-emerald-400",
              },
              {
                label: "Errors",
                value: stats.failed,
                color:
                  stats.failed > 0
                    ? "text-red-400"
                    : "text-white",
                dot:
                  stats.failed > 0 ? "bg-red-400 animate-pulse" : "bg-zinc-500",
              },
              {
                label: "Apps",
                value: stats.apps,
                color: "text-white",
                dot: "bg-blue-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-neutral-900 border border-white/[0.03] rounded-xl px-5 py-4 flex flex-col items-center justify-center text-center shadow-sm"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <p className="text-[11px] font-medium text-neutral-500 tracking-wide">
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
                className={`shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 border ${appFilter === "all"
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/20 hover:text-white"
                  }`}
              >
                All
              </button>
              {appOptions.map((app) => (
                <button
                  key={app}
                  onClick={() => setAppFilter(app)}
                  className={`group flex items-center gap-1.5 shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 border ${appFilter === app
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/20 hover:text-white"
                    }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all ${appFilter === app ? "scale-110 shadow-[0_0_8px_currentColor]" : "group-hover:scale-110"}`}
                    style={{
                      backgroundColor: getAppColor(app),
                      color: getAppColor(app),
                    }}
                  />
                  {getAppLabel(app) || app}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search strokeWidth={1.5}
                  size={16}
                  className="transition-colors text-neutral-500 group-focus-within:text-neutral-400"
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feed…"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-all duration-200 bg-black border border-white/10 text-white placeholder-neutral-600 focus:border-white/20 focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>
        )}

        {/* ── Error Banner ──────────────────────────────── */}
        {error && !loading && (
          <div className={`mb-6 flex items-center gap-3 ${error === "INSUFFICIENT_CREDITS" ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"} border rounded-xl px-5 py-4`}>
            <AlertCircle strokeWidth={1.5} size={18} className={`${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-red-400"} shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-red-400"}`}>
                {error === "INSUFFICIENT_CREDITS" ? "Out of credits" : "Failed to load feed"}
              </p>
              <p className={`text-xs mt-0.5 truncate ${error === "INSUFFICIENT_CREDITS" ? "text-amber-400/70" : "text-red-400/70"}`}>
                {error === "INSUFFICIENT_CREDITS" ? "Add credits to continue viewing your feed." : error}
              </p>
            </div>
            {error === "INSUFFICIENT_CREDITS" ? (
              <a
                href="/dashboard/settings"
                className="text-xs font-medium text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-full border border-amber-400/30 hover:border-amber-400/50 transition-all shrink-0"
              >
                Add Credits →
              </a>
            ) : (
              <button
                onClick={() => loadEvents()}
                className="text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-full border border-red-400/30 hover:border-red-400/50 transition-all shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* ── Loading ───────────────────────────────────── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-neutral-900 border border-white/[0.03] rounded-xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] animate-pulse" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-4 w-1/3 rounded bg-white/[0.02] animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-white/[0.02] animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          /* ── Empty State ──────────────────────────────── */
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-6 mt-10">
            <div className="w-20 h-20 rounded-full bg-black border border-white/5 flex items-center justify-center shadow-lg relative">
              <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-xl"></div>
              <Activity strokeWidth={1.5}
                size={32}
                className="text-neutral-500 relative z-10"
              />
            </div>
            <div className="space-y-3 max-w-sm">
              <h3 className="text-xl font-serif text-white">
                Your feed is quiet
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Once your triggers start capturing events from connected apps,
                they&apos;ll appear here as a timeline.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Link
                href="/dashboard/triggers"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-white text-sm font-medium hover:brightness-110 transition-all shadow-md"
              >
                <Zap strokeWidth={1.5} size={14} />
                Set up triggers
              </Link>
              <Link
                href="/dashboard/integrations"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black border border-white/5 text-sm font-medium text-neutral-400 hover:text-white hover:border-white/10 transition-all"
              >
                Connect apps
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* ── No Results ───────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <Search strokeWidth={1.5} size={22} className="text-neutral-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-white">
                No matches found
              </h3>
              <p className="text-sm text-neutral-500">
                No events match your current filters or search
              </p>
            </div>
            <button
              onClick={() => {
                setAppFilter("all");
                setSearchQuery("");
              }}
              className="text-xs font-medium text-white hover:text-white transition-colors mt-2 bg-white/10 px-4 py-1.5 rounded-full"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* ── Timeline ─────────────────────────────────── */
          <div className="space-y-10 relative">
            <div className="absolute left-[29px] top-6 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/10 to-transparent opacity-50 hidden sm:block pointer-events-none" />
            {grouped.map((group) => (
              <div key={group.label} className="relative">
                {/* Date header */}
                <div className="flex items-center gap-4 mb-6 sticky top-0 bg-black/80 backdrop-blur-md py-2 z-10 transition-colors">
                  <span className="text-xs font-semibold text-white bg-black px-3 py-1 rounded-full border border-white/[0.03] tracking-wide shadow-sm">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-transparent" />
                  <span className="text-[11px] font-medium text-neutral-500 tabular-nums px-2">
                    {group.events.length} event
                    {group.events.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {group.events.map((evt) => {
                      const icon = getAppIcon(evt.app);
                      const color = getAppColor(evt.app);
                      const appLabel = getAppLabel(evt.app) || evt.app;
                      const statusMeta =
                        STATUS_META[evt.status] || STATUS_META.received;
                      const eventLabel = formatTriggerSlug(evt.triggerSlug);

                      return (
                        <motion.div
                          key={evt.id}
                          initial={{ opacity: 0, scale: 0.98, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="group relative bg-neutral-900 border border-white/[0.03] rounded-xl px-5 py-4 hover:border-white/[0.08] hover:bg-white/[0.02] hover:-translate-y-[1px] transition-all shadow-sm"
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
                                <span className="text-[15px] font-medium text-white tracking-tight">
                                  {eventLabel}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-medium text-neutral-500 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-full">
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
                                <p className="text-[13px] text-neutral-400 leading-relaxed line-clamp-2 mt-1 max-w-2xl">
                                  {evt.preview}
                                </p>
                              )}

                              {evt.error && (
                                <div className="flex items-center gap-1.5 mt-3 text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20 w-fit">
                                  <AlertCircle strokeWidth={1.5} size={12} />
                                  <span className="text-[11px] font-medium">
                                    {evt.error}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Right: time + processing */}
                            <div className="flex flex-col items-end gap-1.5 shrink-0 pl-4 border-l border-white/[0.03] h-full min-h-[40px] justify-center">
                              <span className="text-[11px] font-medium text-neutral-500 tabular-nums whitespace-nowrap">
                                {timeAgo(evt.createdAt)}
                              </span>
                              {evt.processingTimeMs != null && (
                                <span className="text-[10px] text-neutral-500/50 tabular-nums flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Clock strokeWidth={1.5} size={10} />
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black border border-white/5 text-sm font-medium text-neutral-400 hover:text-white hover:border-white/10 transition-all disabled:opacity-50 shadow-sm"
            >
              {loadingMore ? (
                <RefreshCw strokeWidth={1.5}
                  size={14}
                  className="animate-spin text-neutral-500"
                />
              ) : (
                <Activity strokeWidth={1.5} size={14} className="text-neutral-500" />
              )}
              {loadingMore ? "Loading more..." : "Load more events"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
