"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Cloud,
  GitPullRequest,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────

interface ReviewItem {
  id: string;
  user_id: string;
  source_app: string;
  trigger_slug: string | null;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  status: string;
  actions: { id: string; label: string }[];
  action_context: Record<string, unknown>;
  ai_confidence: number | null;
  snoozed_until: string | null;
  resolved_at: string | null;
  resolved_action: string | null;
  created_at: string;
}

interface ReviewCounts {
  total: number;
  high: number;
  medium: number;
  low: number;
}

type ViewFilter = "pending" | "all" | "resolved";

// ─── Constants ──────────────────────────────────────────────────────────

const SNOOZE_OPTIONS = [
  { label: "15 min", minutes: 15 },
  { label: "1 hour", minutes: 60 },
  { label: "4 hours", minutes: 240 },
  { label: "Tomorrow", minutes: 1440 },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  email: <Mail size={14} />,
  calendar: <Calendar size={14} />,
  code: <GitPullRequest size={14} />,
  message: <MessageSquare size={14} />,
  task: <CheckSquare size={14} />,
  general: <Inbox size={14} />,
};

const PRIORITY_STYLES: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  high: {
    bg: "bg-amber-100 dark:bg-[#2C2114]",
    border: "border-amber-200 dark:border-[#4B371E]",
    text: "text-amber-800 dark:text-[#D8934A]",
    label: "Needs attention",
  },
  medium: {
    bg: "bg-blue-100 dark:bg-[#1A2332]",
    border: "border-blue-200 dark:border-[#2A3A4F]",
    text: "text-blue-800 dark:text-[#6B9FD4]",
    label: "Review",
  },
  low: {
    bg: "bg-emerald-100 dark:bg-[#1A231A]",
    border: "border-emerald-200 dark:border-[#2A3F2A]",
    text: "text-emerald-800 dark:text-[#6BD46B]",
    label: "Low priority",
  },
};

const APP_COLORS: Record<string, string> = {
  gmail: "#EA4335",
  github: "#24292e",
  slack: "#E01E5A",
  googlecalendar: "#4285F4",
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

// ─── Helpers ────────────────────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────────────

export default function ReviewPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [counts, setCounts] = useState<ReviewCounts>({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("pending");
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [snoozeOpen, setSnoozeOpen] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{
    id: string;
    message: string;
    error?: boolean;
  } | null>(null);
  const [dismissingAll, setDismissingAll] = useState(false);

  // ── Fetch review items ──────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const data = await api.get(
        `/review?userId=${user.id}&status=${viewFilter}`,
      );
      setItems(data.items || []);
      setCounts(data.counts || { total: 0, high: 0, medium: 0, low: 0 });
    } catch (err: any) {
      setError(err.message || "Failed to load review items");
    } finally {
      setLoading(false);
    }
  }, [user?.id, viewFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Auto-refresh every 30 seconds for pending items
  useEffect(() => {
    if (viewFilter !== "pending") return;
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, [fetchItems, viewFilter]);

  // ── Actions ─────────────────────────────────────────────────────────

  const handleAction = async (
    itemId: string,
    action: string,
    snoozeDuration?: number,
  ) => {
    if (!user?.id) return;
    setActingOn(itemId);
    setSnoozeOpen(null);
    setActionResult(null);

    try {
      const result = await api.post("/review/act", {
        userId: user.id,
        itemId,
        action,
        snoozeDuration,
      });

      // Optimistic removal for dismiss/snooze
      if (action === "dismiss" || action === "snooze") {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setCounts((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      }

      // For approve, show the result then remove
      if (action === "approve") {
        setActionResult({
          id: itemId,
          message:
            result.result?.message || result.message || "Action executed",
          error: result.result?.error,
        });
        // Remove after a brief delay to let user read the result
        setTimeout(() => {
          setItems((prev) => prev.filter((i) => i.id !== itemId));
          setCounts((prev) => ({
            ...prev,
            total: Math.max(0, prev.total - 1),
          }));
          setActionResult(null);
        }, 4000);
      }
    } catch (err: any) {
      setActionResult({
        id: itemId,
        message: err.message || "Action failed",
        error: true,
      });
      setTimeout(() => setActionResult(null), 4000);
    } finally {
      setActingOn(null);
    }
  };

  const handleDismissAll = async () => {
    if (!user?.id || dismissingAll) return;
    setDismissingAll(true);
    try {
      await api.post(`/review/dismiss-all?userId=${user.id}`, {});
      setItems([]);
      setCounts({ total: 0, high: 0, medium: 0, low: 0 });
    } catch (err: any) {
      setError(err.message || "Failed to dismiss all");
    } finally {
      setDismissingAll(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-[var(--bg-deep)] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-start min-h-full">
          {/* Static header always visible */}
          <header className="mb-8 w-full">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
              Inbox
            </h1>
            <p className="text-[15px] font-medium text-[var(--text-muted)]">
              Loading review items…
            </p>

            {/* Filter tabs */}
            <div className="inline-flex p-1 space-x-1 rounded-xl bg-[var(--tab-bg)] backdrop-blur-sm border border-[var(--border)] shadow-sm mt-5">
              {(["pending", "resolved", "all"] as ViewFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setViewFilter(filter)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none capitalize ${viewFilter === filter
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  {viewFilter === filter && (
                    <motion.div
                      layoutId="reviewTabIndicator"
                      className="absolute inset-0 rounded-lg shadow-sm bg-[var(--tab-active)]"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  {filter}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <Link
                href="/dashboard/feed"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Activity size={12} />
                View all events in feed &rarr;
              </Link>
            </div>
          </header>

          {/* Skeleton cards for dynamic content */}
          <div className="space-y-4 w-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.06)] animate-pulse" />
                    <div className="h-3 w-16 rounded bg-[rgba(255,255,255,0.04)] animate-pulse" />
                  </div>
                  <div className="h-5 w-20 rounded-full bg-[rgba(255,255,255,0.04)] animate-pulse" />
                </div>
                <div className="h-4 w-3/5 rounded bg-[rgba(255,255,255,0.04)] animate-pulse mb-2" />
                <div className="h-3 w-4/5 rounded bg-[rgba(255,255,255,0.03)] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-deep)] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-start min-h-full">
        {/* Header */}
        <header className="mb-8 w-full">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Inbox
            </h1>
            {counts.total > 0 && viewFilter === "pending" && (
              <button
                onClick={handleDismissAll}
                disabled={dismissingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)] rounded-lg transition-colors"
              >
                {dismissingAll ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <XCircle size={12} />
                )}
                Dismiss all
              </button>
            )}
          </div>
          <p className="text-[15px] font-medium text-[var(--text-muted)]">
            {viewFilter === "pending"
              ? counts.total === 0
                ? "Nothing needs your judgment"
                : `${counts.total} ${counts.total === 1 ? "item needs" : "items need"} your judgment`
              : viewFilter === "resolved"
                ? "Previously resolved items"
                : "All review items"}
          </p>

          {/* Priority badges */}
          {viewFilter === "pending" && counts.total > 0 && (
            <div className="flex items-center gap-3 mt-4">
              {counts.high > 0 && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full ${PRIORITY_STYLES.high.bg} border ${PRIORITY_STYLES.high.border} ${PRIORITY_STYLES.high.text}`}
                >
                  <AlertTriangle size={10} />
                  {counts.high} urgent
                </span>
              )}
              {counts.medium > 0 && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full ${PRIORITY_STYLES.medium.bg} border ${PRIORITY_STYLES.medium.border} ${PRIORITY_STYLES.medium.text}`}
                >
                  {counts.medium} to review
                </span>
              )}
              {counts.low > 0 && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-full ${PRIORITY_STYLES.low.bg} border ${PRIORITY_STYLES.low.border} ${PRIORITY_STYLES.low.text}`}
                >
                  {counts.low} low
                </span>
              )}
            </div>
          )}

          {/* Filter tabs */}
          <div className="inline-flex p-1 space-x-1 rounded-xl bg-[var(--tab-bg)] backdrop-blur-sm border border-[var(--border)] shadow-sm mt-5">
            {(["pending", "resolved", "all"] as ViewFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setViewFilter(filter)}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none capitalize ${viewFilter === filter
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
              >
                {viewFilter === filter && (
                  <motion.div
                    layoutId="reviewTabIndicator"
                    className="absolute inset-0 rounded-lg shadow-sm bg-[var(--tab-active)]"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                {filter}
              </button>
            ))}
          </div>

          {/* Contextual link to Feed */}
          <div className="mt-4">
            <Link
              href="/dashboard/feed"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Activity size={12} />
              View all events in feed &rarr;
            </Link>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className={`w-full mb-6 p-4 ${error === "INSUFFICIENT_CREDITS" ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"} border rounded-xl flex items-center gap-3`}>
            <AlertTriangle size={16} className={`${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-red-500"} shrink-0`} />
            <p className={`text-sm flex-1 ${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-red-500"}`}>
              {error === "INSUFFICIENT_CREDITS" ? "You're out of credits. Add credits to continue." : error}
            </p>
            {error === "INSUFFICIENT_CREDITS" && (
              <a href="/dashboard/settings" className="text-xs font-medium text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-full border border-amber-400/30 hover:border-amber-400/50 transition-all shrink-0">
                Add Credits →
              </a>
            )}
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && !error ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center w-full mt-24 text-center"
          >
            <Cloud size={48} className="text-[var(--text-muted)] mb-6 stroke-[1.5]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
              {viewFilter === "pending"
                ? "Nothing needs your judgment"
                : viewFilter === "resolved"
                  ? "No resolved items yet"
                  : "No review items"}
            </h2>
            <p className="text-[15px] font-medium text-[var(--text-muted)]">
              {viewFilter === "pending"
                ? "I've processed everything. You're clear."
                : "Items will appear here as triggers fire."}
            </p>
          </motion.div>
        ) : (
          /* Items list */
          <div className="space-y-4 w-full">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const priorityStyle =
                  PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium;
                const isActing = actingOn === item.id;
                const result =
                  actionResult?.id === item.id ? actionResult : null;
                const appColor = APP_COLORS[item.source_app] || "#888";

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      x: -60,
                      transition: { duration: 0.25 },
                    }}
                    className="bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.02)] rounded-2xl p-6 shadow-sm transition-all hover:bg-[rgba(255,255,255,0.03)] w-full"
                  >
                    {/* Top row: source + time + priority */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: appColor }}
                        />
                        <span className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                          {item.source_app}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] opacity-50">
                          {timeAgo(item.created_at)}
                        </span>
                        {item.category && CATEGORY_ICONS[item.category] && (
                          <span className="text-[var(--text-muted)] opacity-40">
                            {CATEGORY_ICONS[item.category]}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 ${priorityStyle.bg} border ${priorityStyle.border} ${priorityStyle.text} text-[11px] font-semibold tracking-wide rounded-full shadow-sm`}
                      >
                        {priorityStyle.label}
                      </span>
                    </div>

                    {/* Title + description */}
                    <h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-1.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
                      {item.description}
                    </p>

                    {/* AI confidence indicator */}
                    {item.ai_confidence !== null &&
                      item.ai_confidence !== undefined && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-1 w-16 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[rgba(255,255,255,0.2)]"
                              style={{
                                width: `${Math.round(item.ai_confidence * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] opacity-50">
                            {Math.round(item.ai_confidence * 100)}% confidence
                          </span>
                        </div>
                      )}

                    {/* Action result toast */}
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className={`mb-4 p-3 rounded-xl text-sm ${result.error
                          ? "bg-red-50 border border-red-200 text-red-700 dark:bg-[#2C1A1A] dark:border-[#4B2020] dark:text-[#D84A4A]"
                          : "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-[#1A2C1A] dark:border-[#2A4B2A] dark:text-[#6BD46B]"
                          }`}
                      >
                        {result.message}
                      </motion.div>
                    )}

                    {/* Action buttons (only for pending items) */}
                    {item.status === "pending" && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAction(item.id, "approve")}
                          disabled={isActing}
                          className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.05)] text-[var(--text-primary)] text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isActing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Yes, do it
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "dismiss")}
                          disabled={isActing}
                          className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                          <X size={14} />
                          Dismiss
                        </button>

                        {/* Snooze toggle */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setSnoozeOpen(
                                snoozeOpen === item.id ? null : item.id,
                              )
                            }
                            disabled={isActing}
                            className="flex items-center gap-1.5 px-3 py-2 bg-transparent hover:bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                          >
                            <Clock size={14} />
                            Snooze
                          </button>
                          {snoozeOpen === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute bottom-full left-0 mb-2 bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg overflow-hidden z-10"
                            >
                              {SNOOZE_OPTIONS.map((opt) => (
                                <button
                                  key={opt.minutes}
                                  onClick={() =>
                                    handleAction(item.id, "snooze", opt.minutes)
                                  }
                                  className="block w-full text-left px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)] transition-colors whitespace-nowrap"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Resolved status badge */}
                    {(item.status === "approved" ||
                      item.status === "dismissed") && (
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${item.status === "approved"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-[#1A2C1A] dark:text-[#6BD46B]"
                              : "bg-[var(--overlay)] text-[var(--text-muted)]"
                              }`}
                          >
                            {item.status === "approved"
                              ? "Approved"
                              : "Dismissed"}
                          </span>
                          {item.resolved_at && (
                            <span className="text-[11px] text-[var(--text-muted)] opacity-50">
                              {timeAgo(item.resolved_at)}
                            </span>
                          )}
                        </div>
                      )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
