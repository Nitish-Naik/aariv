"use client";

import { useAuth } from "@/context/AuthContext";
import { useLogo } from "@/context/LogoContext";
import { api } from "@/lib/api";
import { getAppColor } from "@/lib/appMeta";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  Clock,
  Cloud,
  GitPullRequest,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Square,
  Trash2,
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

// ─── Logo helper ────────────────────────────────────────────────────────

/** Small app dot — shows logo when loaded, colored dot as fallback */
function AppDot({ logo, alt, color }: { logo?: string; alt: string; color: string }) {
  const [failed, setFailed] = useState(false);
  if (!logo || failed) return <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />;
  return (
    <img
      src={logo}
      alt={alt}
      className="w-3.5 h-3.5 rounded-sm object-contain shrink-0 opacity-0 transition-opacity duration-150"
      onLoad={(e) => { e.currentTarget.style.opacity = "1"; }}
      onError={() => setFailed(true)}
    />
  );
}

// ─── Constants ──────────────────────────────────────────────────────────

const SNOOZE_OPTIONS = [
  { label: "15 min", minutes: 15 },
  { label: "1 hour", minutes: 60 },
  { label: "4 hours", minutes: 240 },
  { label: "Tomorrow", minutes: 1440 },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  email: <Mail strokeWidth={1.5} size={14} />,
  calendar: <Calendar strokeWidth={1.5} size={14} />,
  code: <GitPullRequest strokeWidth={1.5} size={14} />,
  message: <MessageSquare strokeWidth={1.5} size={14} />,
  task: <CheckSquare strokeWidth={1.5} size={14} />,
  general: <Inbox strokeWidth={1.5} size={14} />,
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

// ─── Helpers ────────────────────────────────────────────────────────────

interface EventPayload {
  event_type?: string;
  created_at?: string;
  data?: Record<string, unknown>;
}

function EventPayloadPanel({ payload }: { payload: EventPayload }) {
  const data = payload.data || {};
  const type = payload.event_type || "";

  if (type.includes("GMAIL") || data.subject || data.from) {
    return (
      <div className="mt-3 rounded-xl bg-black/40 border border-white/[0.04] overflow-hidden">
        {!!data.from && (
          <div className="flex gap-3 px-4 py-2.5 text-[11px] border-b border-white/[0.03]">
            <span className="text-neutral-500 font-medium shrink-0 w-[72px]">From</span>
            <span className="text-neutral-300 break-all">{String(data.from)}</span>
          </div>
        )}
        {!!data.subject && (
          <div className="flex gap-3 px-4 py-2.5 text-[11px] border-b border-white/[0.03]">
            <span className="text-neutral-500 font-medium shrink-0 w-[72px]">Subject</span>
            <span className="text-neutral-300 font-medium break-all">{String(data.subject)}</span>
          </div>
        )}
        {!!(data.snippet || data.body) && (
          <div className="px-4 py-3 text-[11px]">
            <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap">
              {String(data.snippet || data.body).slice(0, 600)}
              {String(data.snippet || data.body).length > 600 ? "…" : ""}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (type.includes("SLACK") || data.channel_name || data.text) {
    return (
      <div className="mt-3 rounded-xl bg-black/40 border border-white/[0.04] overflow-hidden">
        {!!data.channel_name && (
          <div className="flex gap-3 px-4 py-2.5 text-[11px] border-b border-white/[0.03]">
            <span className="text-neutral-500 font-medium shrink-0 w-[72px]">Channel</span>
            <span className="text-neutral-300">#{String(data.channel_name)}</span>
          </div>
        )}
        {!!data.text && (
          <div className="px-4 py-3 text-[11px]">
            <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap">
              {String(data.text).slice(0, 600)}
              {String(data.text).length > 600 ? "…" : ""}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Generic fallback
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (entries.length === 0) return null;
  const formatKey = (k: string) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const fmtVal = (v: unknown): string => {
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (Array.isArray(v)) return v.join(", ");
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  };
  return (
    <div className="mt-3 rounded-xl bg-black/40 border border-white/[0.04] divide-y divide-white/[0.03] overflow-hidden">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 px-4 py-2.5 text-[11px]">
          <span className="text-neutral-500 font-medium shrink-0 w-[130px] truncate">{formatKey(key)}</span>
          <span className="text-neutral-400 break-all">
            {fmtVal(value).length > 200 ? fmtVal(value).slice(0, 197) + "…" : fmtVal(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ContextPanel({ ctx }: { ctx: Record<string, unknown> }) {
  const entries = Object.entries(ctx).filter(
    ([k, v]) => v !== null && v !== undefined && v !== "" && k !== "source",
  );
  if (entries.length === 0) return null;

  const formatKey = (k: string) =>
    k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatValue = (v: unknown): string => {
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (Array.isArray(v)) return v.join(", ");
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  };

  return (
    <div className="mt-2 rounded-xl bg-black/20 border border-white/[0.03] divide-y divide-white/[0.02] overflow-hidden">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 px-4 py-2 text-[11px]">
          <span className="text-neutral-600 font-medium shrink-0 w-[130px] truncate">
            {formatKey(key)}
          </span>
          <span className="text-neutral-500 break-all">
            {formatValue(value).length > 200
              ? formatValue(value).slice(0, 197) + "…"
              : formatValue(value)}
          </span>
        </div>
      ))}
    </div>
  );
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

// ─── Component ──────────────────────────────────────────────────────────

export default function ReviewPage() {
  const { user } = useAuth();
  const { getLogo } = useLogo();
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
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [eventPayloads, setEventPayloads] = useState<Record<string, EventPayload>>({});
  const [loadingPayload, setLoadingPayload] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDismissing, setBatchDismissing] = useState(false);

  // ── Fetch review items ──────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const data = await api.get(
        `/review?status=${viewFilter}`,
      );
      setItems(data.items || []);
      setCounts(data.counts || { total: 0, high: 0, medium: 0, low: 0 });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load review items");
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
      await api.post(`/review/dismiss-all`, {});
      setItems([]);
      setCounts({ total: 0, high: 0, medium: 0, low: 0 });
    } catch (err: any) {
      setError(err.message || "Failed to dismiss all");
    } finally {
      setDismissingAll(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleExpand = async (itemId: string) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
      return;
    }
    setExpandedItem(itemId);
    if (!eventPayloads[itemId]) {
      setLoadingPayload(itemId);
      try {
        const data = await api.get(`/review/${itemId}/context`);
        setEventPayloads((prev) => ({ ...prev, [itemId]: data }));
      } catch {
        // non-fatal — context panel degrades gracefully
      } finally {
        setLoadingPayload(null);
      }
    }
  };

  const handleBatchDismiss = async (ids: string[]) => {
    if (!user?.id || ids.length === 0) return;
    setBatchDismissing(true);
    try {
      await Promise.all(
        ids.map((id) => api.post("/review/act", { userId: user.id, itemId: id, action: "dismiss" }))
      );
      setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      setCounts((prev) => ({ ...prev, total: Math.max(0, prev.total - ids.length) }));
      setSelectedIds(new Set());
    } catch (err: any) {
      setError(err.message || "Batch dismiss failed");
    } finally {
      setBatchDismissing(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div className="h-3.5 w-12 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-2.5 w-32 rounded bg-white/[0.04] animate-pulse mt-1.5" />
        </div>
        <div className="px-6 border-b border-white/[0.06] flex items-center gap-1 h-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2.5 w-14 rounded bg-white/[0.04] animate-pulse mx-1" />
          ))}
        </div>
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/[0.06] animate-pulse" />
                <div className="h-2.5 w-14 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-2.5 w-10 rounded bg-white/[0.03] animate-pulse" />
              </div>
              <div className="h-3.5 w-2/5 rounded bg-white/[0.06] animate-pulse mb-1.5" />
              <div className="h-2.5 w-3/5 rounded bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-white">Inbox</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {viewFilter === "pending"
              ? counts.total === 0
                ? "Nothing needs your judgment"
                : `${counts.total} ${counts.total === 1 ? "item needs" : "items need"} your judgment`
              : viewFilter === "resolved"
                ? "Previously resolved items"
                : "All review items"}
          </p>
        </div>
        {counts.total > 0 && viewFilter === "pending" && (
          <div className="flex items-center gap-2">
            {counts.low > 0 && (
              <button
                onClick={() => handleBatchDismiss(items.filter((i) => i.priority === "low" && i.status === "pending").map((i) => i.id))}
                disabled={batchDismissing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/[0.03] rounded-md transition-colors"
              >
                {batchDismissing ? <Loader2 strokeWidth={1.5} size={12} className="animate-spin" /> : <Trash2 strokeWidth={1.5} size={12} />}
                Dismiss low
              </button>
            )}
            <button
              onClick={handleDismissAll}
              disabled={dismissingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/[0.03] rounded-md transition-colors"
            >
              {dismissingAll ? <Loader2 strokeWidth={1.5} size={12} className="animate-spin" /> : <XCircle strokeWidth={1.5} size={12} />}
              Dismiss all
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="px-6 border-b border-white/[0.06] flex items-center gap-1">
        {(["pending", "resolved", "all"] as ViewFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => { setViewFilter(filter); setSelectedIds(new Set()); }}
            className={`px-3 py-3 text-xs font-medium transition-colors capitalize border-b-2 -mb-px ${
              viewFilter === filter
                ? "text-white border-white"
                : "text-neutral-500 hover:text-neutral-300 border-transparent"
            }`}
          >
            {filter}
          </button>
        ))}
        <Link
          href="/dashboard/feed"
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-white transition-colors py-3"
        >
          <Activity strokeWidth={1.5} size={12} />
          Feed
        </Link>
      </div>

      <div className="flex-1 px-6 py-4">

        {/* Error */}
        {error && (
          <div className={`w-full mb-6 p-4 ${error === "INSUFFICIENT_CREDITS" ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"} border rounded-xl flex items-center gap-3`}>
            <AlertTriangle strokeWidth={1.5} size={16} className={`${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-red-500"} shrink-0`} />
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center w-full mt-20 text-center"
          >
            <Cloud strokeWidth={1.5} size={28} className="text-neutral-700 mb-4" />
            <p className="text-sm font-semibold text-white mb-1">
              {viewFilter === "pending"
                ? "All clear"
                : viewFilter === "resolved"
                  ? "No resolved items"
                  : "No items"}
            </p>
            <p className="text-xs text-neutral-600">
              {viewFilter === "pending"
                ? "Nothing needs your attention right now."
                : "Items will appear here as triggers fire."}
            </p>
          </motion.div>
        ) : (
          /* Items list */
          <div className="w-full -mx-6" style={{ width: "calc(100% + 3rem)" }}>
            {/* Batch action bar */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-between px-6 py-2.5 border-b border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="text-neutral-600 hover:text-white transition-colors"
                    >
                      <X strokeWidth={1.5} size={13} />
                    </button>
                    <span className="text-xs font-medium text-neutral-400">
                      {selectedIds.size} selected
                    </span>
                  </div>
                  <button
                    onClick={() => handleBatchDismiss(Array.from(selectedIds))}
                    disabled={batchDismissing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/[0.04] rounded-md transition-colors disabled:opacity-50"
                  >
                    {batchDismissing ? (
                      <Loader2 strokeWidth={1.5} size={12} className="animate-spin" />
                    ) : (
                      <Trash2 strokeWidth={1.5} size={12} />
                    )}
                    Dismiss selected
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const isActing = actingOn === item.id;
                const result =
                  actionResult?.id === item.id ? actionResult : null;
                const appColor = getAppColor(item.source_app);
                const appLogo = getLogo(item.source_app);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      x: -40,
                      transition: { duration: 0.2 },
                    }}
                    className="border-b border-white/[0.06] px-6 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Top row: source + time + urgent tag */}
                    <div className="flex items-center gap-2.5 mb-2">
                      {item.status === "pending" && (
                        <button
                          onClick={() => toggleSelect(item.id)}
                          className="shrink-0 text-neutral-700 hover:text-neutral-400 transition-colors"
                          aria-label={selectedIds.has(item.id) ? "Deselect" : "Select"}
                        >
                          {selectedIds.has(item.id)
                            ? <CheckSquare strokeWidth={1.5} size={13} className="text-white" />
                            : <Square strokeWidth={1.5} size={13} />
                          }
                        </button>
                      )}
                      <AppDot logo={appLogo} alt={item.source_app} color={appColor} />
                      <span className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                        {item.source_app}
                      </span>
                      {item.category && CATEGORY_ICONS[item.category] && (
                        <span className="text-neutral-700">
                          {CATEGORY_ICONS[item.category]}
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-600">
                        {timeAgo(item.created_at)}
                      </span>
                      {item.priority === "high" && (
                        <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Title + description */}
                    <h3 className="text-sm font-semibold text-white mb-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Expandable context details */}
                    <div className="mt-2.5 mb-3">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="flex items-center gap-1.5 text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors"
                      >
                        {loadingPayload === item.id ? (
                          <Loader2 strokeWidth={1.5} size={11} className="animate-spin" />
                        ) : (
                          <ChevronDown
                            strokeWidth={1.5}
                            size={11}
                            className={`transition-transform duration-200 ${expandedItem === item.id ? "rotate-180" : ""}`}
                          />
                        )}
                        {expandedItem === item.id ? "Hide details" : "View details"}
                      </button>
                      <AnimatePresence>
                        {expandedItem === item.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {eventPayloads[item.id]?.data && Object.keys(eventPayloads[item.id].data!).length > 0 ? (
                              <EventPayloadPanel payload={eventPayloads[item.id]} />
                            ) : (
                              item.action_context && Object.keys(item.action_context).length > 0 && (
                                <ContextPanel ctx={item.action_context} />
                              )
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* AI confidence — inline text, no pill */}
                    {item.ai_confidence !== null && item.ai_confidence !== undefined && (() => {
                      const pct = Math.round(item.ai_confidence * 100);
                      const color = pct >= 80 ? "text-neutral-500" : pct >= 50 ? "text-amber-500/60" : "text-red-500/60";
                      return (
                        <p className={`text-[11px] mb-3 ${color}`}>
                          {pct}% confidence
                        </p>
                      );
                    })()}

                    {/* Post-approve result */}
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-md border text-xs ${result.error
                          ? "bg-red-500/5 border-red-500/20 text-red-400"
                          : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {result.error
                            ? <AlertTriangle strokeWidth={1.5} size={13} className="shrink-0 mt-px" />
                            : <Check strokeWidth={2} size={13} className="shrink-0 mt-px" />
                          }
                          <p className="leading-relaxed text-neutral-300">{result.message}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Action buttons */}
                    {item.status === "pending" && (
                      <div className="flex items-center gap-1.5 mt-3">
                        <button
                          onClick={() => handleAction(item.id, "approve")}
                          disabled={isActing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-50"
                        >
                          {isActing ? (
                            <Loader2 strokeWidth={1.5} size={12} className="animate-spin" />
                          ) : (
                            <Check strokeWidth={2} size={12} />
                          )}
                          Yes, do it
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "dismiss")}
                          disabled={isActing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                        >
                          <X strokeWidth={1.5} size={12} />
                          Dismiss
                        </button>

                        {/* Snooze toggle */}
                        <div className="relative">
                          <button
                            onClick={() => setSnoozeOpen(snoozeOpen === item.id ? null : item.id)}
                            disabled={isActing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50"
                          >
                            <Clock strokeWidth={1.5} size={12} />
                            Snooze
                          </button>
                          {snoozeOpen === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute bottom-full left-0 mb-1.5 bg-[#0c0c0c] border border-white/[0.08] rounded-lg shadow-xl overflow-hidden z-10"
                            >
                              {SNOOZE_OPTIONS.map((opt) => (
                                <button
                                  key={opt.minutes}
                                  onClick={() => handleAction(item.id, "snooze", opt.minutes)}
                                  className="block w-full text-left px-4 py-2 text-xs text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-colors whitespace-nowrap"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Resolved status */}
                    {(item.status === "approved" || item.status === "dismissed") && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[11px] font-medium ${item.status === "approved" ? "text-emerald-500" : "text-neutral-600"}`}>
                          {item.status === "approved" ? "Approved" : "Dismissed"}
                        </span>
                        {item.resolved_at && (
                          <span className="text-[11px] text-neutral-700">· {timeAgo(item.resolved_at)}</span>
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
