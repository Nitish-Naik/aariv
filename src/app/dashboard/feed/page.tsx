"use client";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useLogo } from "@/context/LogoContext";
import { api } from "@/lib/api";
import {
  formatTriggerSlug,
  getAppColor,
  getAppIcon,
  getAppLabel,
} from "@/lib/appMeta";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  CheckSquare,
  ChevronDown,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

function cleanError(error: string): string {
  if (!error) return "Unknown error";
  const e = error.toLowerCase();
  if (e.includes("insufficient_credits") || e.includes("out of credits"))
    return "Out of credits — add credits to process events";
  if (e.includes("nonetype") || e.includes("attributeerror"))
    return "Processing failed — event data was incomplete";
  if (
    e.includes("connectionerror") ||
    e.includes("connecttimeout") ||
    e.includes("connection refused")
  )
    return "Couldn't reach the app — connection timed out";
  if (e.includes("httperror") || e.includes("status code"))
    return "The app returned an error";
  if (e.includes("jsondecode") || e.includes("json.decoder"))
    return "Couldn't parse the app response";
  if (e.includes("keyerror")) return "Missing expected data in event payload";
  if (
    e.includes("timeouterror") ||
    (e.includes("timeout") && !e.includes("connect"))
  )
    return "Processing timed out";
  if (e.includes("ratelimit") || e.includes("rate limit") || e.includes("429"))
    return "Rate limited — will retry automatically";
  if (
    e.includes("permission") ||
    e.includes("unauthorized") ||
    e.includes("403") ||
    e.includes("token expired") ||
    e.includes("authenticationerror") ||
    e.includes("invalid_grant")
  )
    return "AUTH_ERROR";
  // Strip Python exception class prefix (e.g. "ValueError: ...")
  const colonIdx = error.indexOf(": ");
  if (colonIdx > 0 && colonIdx < 40 && /^[A-Z]/.test(error)) {
    const msg = error.slice(colonIdx + 2).trim();
    if (msg.length > 0 && msg.length < 200)
      return msg.length > 120 ? msg.slice(0, 117) + "…" : msg;
  }
  if (error.length > 120) return error.slice(0, 117) + "…";
  return error;
}

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

/* ─── Logo helpers ───────────────────────────────────────── */

/** Large (40×40) app icon — shows colored fallback, fades in logo on load */
function FeedAppIcon({
  logo,
  label,
  color,
  icon,
}: {
  logo?: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="w-10 h-10 rounded-xl shrink-0 shadow-sm relative overflow-hidden"
      style={{ backgroundColor: color }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {icon}
      </div>
      {logo && (
        <img
          src={logo}
          alt={label}
          className="absolute inset-0 w-full h-full object-contain p-2 bg-[#111319] opacity-0 transition-opacity duration-200"
          onLoad={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

/** Small pill logo — falls back to colored dot on error */
function PillLogo({
  logo,
  alt,
  color,
}: {
  logo?: string;
  alt: string;
  color: string;
}) {
  const [failed, setFailed] = React.useState(false);
  if (!logo || failed)
    return (
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
    );
  return (
    <img
      src={logo}
      alt={alt}
      className="w-3 h-3 object-contain shrink-0 opacity-0 transition-opacity duration-150"
      onLoad={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
      onError={() => setFailed(true)}
    />
  );
}

/* ─── Page ───────────────────────────────────────────────── */

export default function FeedPage() {
  const { user } = useAuth();
  const { getLogo } = useLogo();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncDelta, setSyncDelta] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appFilter, setAppFilter] = useState<AppFilter>("all");
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || "",
  );
  const [serverStats, setServerStats] = useState<{
    total: number;
    completed: number;
    failed: number;
    apps: number;
  } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "failed">("all");

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
        const data = await api.get(`/dashboard/feed?limit=25&offset=${offset}`);
        if (offset === 0) {
          setEvents(data.events || []);
        } else {
          setEvents((prev) => [...prev, ...(data.events || [])]);
        }
        setHasMore(data.hasMore || false);
        if (data.stats) setServerStats(data.stats);
        setError(null);
      } catch (err: unknown) {
        if (!silent)
          setError(err instanceof Error ? err.message : "Failed to load feed");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user?.id],
  );

  const countBeforeSyncRef = useRef<number | null>(null);

  const syncFromComposio = useCallback(async () => {
    if (!user?.id || syncing) return;
    setSyncing(true);
    setSyncDelta(null);
    countBeforeSyncRef.current = events.length;
    try {
      const baseUrl = api.getBaseUrl().replace(/\/api$/, "");
      await fetch(`${baseUrl}/webhook/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      await new Promise((r) => setTimeout(r, 2000));
      await loadEvents(true);
    } catch {
      // Sync failure is non-fatal; user can retry
    } finally {
      setSyncing(false);
    }
  }, [user?.id, syncing, loadEvents, events.length]);

  // Compute delta once syncing finishes and events are updated
  useEffect(() => {
    if (!syncing && countBeforeSyncRef.current !== null) {
      const delta = events.length - countBeforeSyncRef.current;
      countBeforeSyncRef.current = null;
      if (delta >= 0) setSyncDelta(delta);
    }
  }, [syncing, events.length]);

  // Auto-clear delta badge after 8 s
  useEffect(() => {
    if (syncDelta === null) return;
    const t = setTimeout(() => setSyncDelta(null), 8000);
    return () => clearTimeout(t);
  }, [syncDelta]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Auto-refresh every 60 seconds (silent — does not degrade perceived performance)
  useEffect(() => {
    const interval = setInterval(() => loadEvents(true), 60000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  // Intersection Observer: auto-load next page when sentinel scrolls into view
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadEvents(true, events.length);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, events.length, loadEvents]);

  // Derive unique apps for filter + per-app counts
  const appOptions = useMemo(() => {
    const apps = new Set(events.map((e) => e.app));
    return Array.from(apps).sort();
  }, [events]);

  const appCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) counts[e.app] = (counts[e.app] || 0) + 1;
    return counts;
  }, [events]);

  const failedCount = useMemo(
    () => events.filter((e) => e.status === "failed").length,
    [events],
  );

  // Filtered events
  const filtered = useMemo(() => {
    let result = events;
    if (appFilter !== "all") result = result.filter((e) => e.app === appFilter);
    if (statusFilter === "failed")
      result = result.filter((e) => e.status === "failed");
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
  }, [events, appFilter, statusFilter, searchQuery]);

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

  // Today stats + last activity timestamp
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayEvents = events.filter(
      (e) => new Date(e.createdAt).toDateString() === today,
    );
    const lastEvent = events.length > 0 ? events[0] : null; // events are sorted newest first
    return {
      events: todayEvents.length,
      errors: todayEvents.filter((e) => e.status === "failed").length,
      apps: new Set(todayEvents.map((e) => e.app)).size,
      lastActivity: lastEvent ? timeAgo(lastEvent.createdAt) : null,
    };
  }, [events]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-white">Activity</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Everything your triggers captured, in one timeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncFromComposio}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <Zap
              strokeWidth={1.5}
              size={13}
              className={syncing ? "animate-pulse" : ""}
            />
            {syncing ? "Checking…" : "Sync"}
            {!syncing && syncDelta !== null && (
              <span
                className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${syncDelta > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-neutral-500"}`}
              >
                {syncDelta > 0 ? `+${syncDelta}` : "✓"}
              </span>
            )}
          </button>
          <button
            onClick={() => loadEvents(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw
              strokeWidth={1.5}
              size={13}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
        {/* Contextual links */}
        <div className="flex items-center gap-4 mb-6 text-xs text-neutral-500">
          <Link
            href="/dashboard/review"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <CheckSquare strokeWidth={1.5} size={12} />
            Review items
          </Link>
          <span className="text-neutral-800">·</span>
          <Link
            href="/dashboard/triggers"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Zap strokeWidth={1.5} size={12} />
            Manage triggers
          </Link>
        </div>

        {/* ── Today Strip ──────────────────────────────── */}
        {!loading && events.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap mb-4 px-1 text-[12px] text-neutral-500">
            <span className="font-medium text-neutral-400">Today:</span>
            <span>
              {todayStats.events} event{todayStats.events !== 1 ? "s" : ""}
            </span>
            <span className="text-white/10">·</span>
            <span className={todayStats.errors > 0 ? "text-red-400" : ""}>
              {todayStats.errors} error{todayStats.errors !== 1 ? "s" : ""}
            </span>
            <span className="text-white/10">·</span>
            <span>
              {todayStats.apps} app{todayStats.apps !== 1 ? "s" : ""} active
            </span>
            {todayStats.lastActivity && (
              <>
                <span className="text-white/10">·</span>
                <span>Last: {todayStats.lastActivity}</span>
              </>
            )}
          </div>
        )}

        {/* ── Stats strip ───────────────────────────────── */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 border border-white/[0.06] rounded-lg mb-6">
            {[
              { label: "Events", value: stats.total, color: "text-white" },
              {
                label: "Processed",
                value: stats.completed,
                color: "text-emerald-400",
              },
              {
                label: "Errors",
                value: stats.failed,
                color: stats.failed > 0 ? "text-red-400" : "text-white",
              },
              { label: "Apps", value: stats.apps, color: "text-white" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`px-5 py-4 ${i < 3 ? "border-r border-white/[0.06]" : ""}`}
              >
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-1">
                  {s.label}
                </p>
                <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Today Summary Strip ───────────────────────── */}
        {!loading && events.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6 -mt-4 px-1 flex-wrap">
            <span className="font-semibold text-neutral-400 tracking-wide">
              Today
            </span>
            <span className="text-neutral-700">·</span>
            <span>
              {todayStats.events} event{todayStats.events !== 1 ? "s" : ""}
            </span>
            <span className="text-neutral-700">·</span>
            {todayStats.errors > 0 ? (
              <span className="text-red-400 font-medium">
                {todayStats.errors} error{todayStats.errors !== 1 ? "s" : ""}
              </span>
            ) : (
              <span>0 errors</span>
            )}
            {todayStats.lastActivity && (
              <>
                <span className="text-neutral-700">·</span>
                <span>Last: {todayStats.lastActivity}</span>
              </>
            )}
          </div>
        )}

        {/* ── Filters ───────────────────────────────────── */}
        {!loading && events.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            {/* App pills + status pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setAppFilter("all");
                  setStatusFilter("all");
                }}
                className={`shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 border ${
                  appFilter === "all" && statusFilter === "all"
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                All
              </button>
              {failedCount > 0 && (
                <button
                  onClick={() => {
                    setAppFilter("all");
                    setStatusFilter(
                      statusFilter === "failed" ? "all" : "failed",
                    );
                  }}
                  className={`flex items-center gap-1.5 shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 border ${
                    statusFilter === "failed"
                      ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-sm"
                      : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-red-500/30 hover:text-red-400"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full bg-red-400 ${statusFilter === "failed" ? "animate-pulse" : ""}`}
                  />
                  Failed
                  <span className="ml-0.5 opacity-60 tabular-nums">
                    ({failedCount})
                  </span>
                </button>
              )}
              {appOptions.map((app) => (
                <button
                  key={app}
                  onClick={() => {
                    setAppFilter(app);
                    setStatusFilter("all");
                  }}
                  className={`group flex items-center gap-1.5 shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 border ${
                    appFilter === app && statusFilter === "all"
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <PillLogo
                    logo={getLogo(app)}
                    alt={app}
                    color={getAppColor(app)}
                  />
                  {getAppLabel(app) || app}
                  <span
                    className={`ml-0.5 tabular-nums ${appFilter === app && statusFilter === "all" ? "opacity-50" : "opacity-40"}`}
                  >
                    ({appCounts[app] ?? 0})
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  strokeWidth={1.5}
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
          <div
            className={`mb-6 flex items-center gap-3 ${error === "INSUFFICIENT_CREDITS" ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"} border rounded-xl px-5 py-4`}
          >
            <AlertCircle
              strokeWidth={1.5}
              size={18}
              className={`${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-red-400"} shrink-0`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-red-400"}`}
              >
                {error === "INSUFFICIENT_CREDITS"
                  ? "Out of credits"
                  : "Failed to load feed"}
              </p>
              <p
                className={`text-xs mt-0.5 truncate ${error === "INSUFFICIENT_CREDITS" ? "text-amber-400/70" : "text-red-400/70"}`}
              >
                {error === "INSUFFICIENT_CREDITS"
                  ? "Add credits to continue viewing your feed."
                  : error}
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
          <EmptyState
            icon={Activity}
            title="Your feed is quiet"
            description="Once your triggers start capturing events from connected apps, they'll appear here as a timeline."
            primaryAction={{ label: "Set up triggers", href: "/dashboard/triggers" }}
            secondaryAction={{ label: "Connect apps", href: "/dashboard/integrations" }}
          />
        ) : filtered.length === 0 ? (
          /* ── No Results ───────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
              <Search
                strokeWidth={1.5}
                size={22}
                className="text-neutral-500"
              />
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
                setStatusFilter("all");
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
                      const appLogo = getLogo(evt.app);
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
                            <FeedAppIcon
                              logo={appLogo}
                              label={appLabel}
                              color={color}
                              icon={icon}
                            />

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

                              {evt.error &&
                                (() => {
                                  const cleaned = cleanError(evt.error);
                                  const isAuth = cleaned === "AUTH_ERROR";
                                  return (
                                    <div className="flex items-center gap-1.5 mt-3 text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20 w-fit max-w-full">
                                      <AlertCircle
                                        strokeWidth={1.5}
                                        size={12}
                                        className="shrink-0"
                                      />
                                      <span className="text-[11px] font-medium">
                                        {isAuth
                                          ? `Your ${appLabel} connection expired.`
                                          : cleaned}
                                      </span>
                                      {isAuth && (
                                        <Link
                                          href={`/dashboard/integrations?connect=${evt.app}`}
                                          className="text-[11px] font-semibold text-red-300 hover:text-white underline underline-offset-2 ml-1"
                                        >
                                          Reconnect
                                        </Link>
                                      )}
                                    </div>
                                  );
                                })()}

                              {/* Expandable details */}
                              <button
                                onClick={() =>
                                  setExpandedEvent(
                                    expandedEvent === evt.id ? null : evt.id,
                                  )
                                }
                                className="flex items-center gap-1 mt-3 text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors"
                              >
                                <ChevronDown
                                  strokeWidth={1.5}
                                  size={12}
                                  className={`transition-transform duration-200 ${expandedEvent === evt.id ? "rotate-180" : ""}`}
                                />
                                {expandedEvent === evt.id
                                  ? "Hide details"
                                  : "Details"}
                              </button>

                              <AnimatePresence>
                                {expandedEvent === evt.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-2.5">
                                      <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-[11px]">
                                        <span className="text-neutral-600 font-medium">
                                          Event ID
                                        </span>
                                        <span className="text-neutral-400 font-mono break-all">
                                          {evt.id}
                                        </span>
                                        <span className="text-neutral-600 font-medium">
                                          Trigger
                                        </span>
                                        <span className="text-neutral-400 font-mono">
                                          {evt.triggerSlug}
                                        </span>
                                        <span className="text-neutral-600 font-medium">
                                          Status
                                        </span>
                                        <span className="text-neutral-400">
                                          {evt.status}
                                        </span>
                                        {evt.processingTimeMs != null && (
                                          <>
                                            <span className="text-neutral-600 font-medium">
                                              Process time
                                            </span>
                                            <span className="text-neutral-400">
                                              {evt.processingTimeMs}ms
                                            </span>
                                          </>
                                        )}
                                        {evt.error && (
                                          <>
                                            <span className="text-neutral-600 font-medium">
                                              Raw error
                                            </span>
                                            <span className="text-red-400/70 font-mono break-all">
                                              {evt.error.length > 300
                                                ? evt.error.slice(0, 297) + "…"
                                                : evt.error}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <Link
                                        href="/dashboard/review"
                                        className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-white transition-colors"
                                      >
                                        <ExternalLink
                                          strokeWidth={1.5}
                                          size={11}
                                        />
                                        See if this needs your review →
                                      </Link>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
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

        {/* Sentinel for auto infinite scroll — becomes visible when user nears bottom */}
        <div ref={sentinelRef} className="h-1" />
        {/* Spinner shown while auto-loading next page */}
        {loadingMore && (
          <div className="mt-6 flex justify-center">
            <RefreshCw
              strokeWidth={1.5}
              size={16}
              className="animate-spin text-neutral-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
