"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useLogo } from "@/context/LogoContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { getAppColor } from "@/lib/appMeta";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownAZ,
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
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  SlidersHorizontal,
  Square,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SortMode = "newest" | "oldest" | "confidence-high" | "confidence-low";
type CategoryFilter = "all" | string;

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

function AppDot({
  logo,
  alt,
  color,
}: {
  logo?: string;
  alt: string;
  color: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!logo || failed)
    return (
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
    );
  return (
    <img
      src={logo}
      alt={alt}
      className="w-3.5 h-3.5 rounded-sm object-contain shrink-0"
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
      <div className="mt-3 rounded-xl bg-muted/35 ring-1 ring-inset ring-border/20 overflow-hidden">
        {!!data.from && (
          <div className="flex gap-3 px-4 py-2.5 text-[11px] border-b border-white/[0.03]">
            <span className="text-muted-foreground font-medium shrink-0 w-[72px]">
              From
            </span>
            <span className="text-foreground/80 break-all">
              {String(data.from)}
            </span>
          </div>
        )}
        {!!data.subject && (
          <div className="flex gap-3 px-4 py-2.5 text-[11px] border-b border-white/[0.03]">
            <span className="text-muted-foreground font-medium shrink-0 w-[72px]">
              Subject
            </span>
            <span className="text-foreground/80 font-medium break-all">
              {String(data.subject)}
            </span>
          </div>
        )}
        {!!(data.snippet || data.body) && (
          <div className="px-4 py-3 text-[11px]">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
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
      <div className="mt-3 rounded-xl bg-muted/35 ring-1 ring-inset ring-border/20 overflow-hidden">
        {!!data.channel_name && (
          <div className="flex gap-3 px-4 py-2.5 text-[11px] border-b border-white/[0.03]">
            <span className="text-muted-foreground font-medium shrink-0 w-[72px]">
              Channel
            </span>
            <span className="text-foreground/80">
              #{String(data.channel_name)}
            </span>
          </div>
        )}
        {!!data.text && (
          <div className="px-4 py-3 text-[11px]">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {String(data.text).slice(0, 600)}
              {String(data.text).length > 600 ? "…" : ""}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Generic fallback
  const entries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  if (entries.length === 0) return null;
  const formatKey = (k: string) =>
    k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const fmtVal = (v: unknown): string => {
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (Array.isArray(v)) return v.join(", ");
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  };
  return (
    <div className="mt-3 rounded-xl bg-muted/35 ring-1 ring-inset ring-white/[0.03] divide-y divide-white/[0.03] overflow-hidden">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 px-4 py-2.5 text-[11px]">
          <span className="text-muted-foreground font-medium shrink-0 w-[130px] truncate">
            {formatKey(key)}
          </span>
          <span className="text-muted-foreground break-all">
            {fmtVal(value).length > 200
              ? fmtVal(value).slice(0, 197) + "…"
              : fmtVal(value)}
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
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  };

  return (
    <div className="mt-2 rounded-xl bg-muted/25 ring-1 ring-inset ring-white/[0.03] divide-y divide-white/[0.03] overflow-hidden">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 px-4 py-2 text-[11px]">
          <span className="text-muted-foreground font-medium shrink-0 w-[130px] truncate">
            {formatKey(key)}
          </span>
          <span className="text-muted-foreground break-all">
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

// ─── Expandable Text ────────────────────────────────────────────────────

function ExpandableText({
  text,
  maxLength,
}: {
  text: string;
  maxLength: number;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {expanded ? text : text.slice(0, maxLength) + "…"}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 text-[11px] font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

// ─── Confidence Badge ───────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const level = pct >= 80 ? "high" : pct >= 60 ? "medium" : "low";
  const config = {
    high: {
      label: "High confidence",
      icon: ShieldCheck,
      variant: "default" as const,
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      tooltip: `AI is ${pct}% confident this action is correct. Safe to approve.`,
      helperText: "Safe to approve.",
    },
    medium: {
      label: "Medium confidence",
      icon: ShieldQuestion,
      variant: "outline" as const,
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      tooltip: `AI is ${pct}% confident. Review the details before approving.`,
      helperText: "Review before approving.",
    },
    low: {
      label: "Low confidence",
      icon: ShieldAlert,
      variant: "destructive" as const,
      className: "bg-red-500/10 text-red-400 border-red-500/20",
      tooltip: `AI is only ${pct}% confident. Carefully review before taking action.`,
      helperText: "Inspect carefully.",
    },
  }[level];
  const Icon = config.icon;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant="outline"
        className={config.className}
        title={config.tooltip}
      >
        <Icon strokeWidth={1.5} size={12} />
        {config.label}
        <span className="opacity-50 ml-0.5 tabular-nums">{pct}%</span>
      </Badge>
      <span className="text-[11px] leading-relaxed text-muted-foreground/80">
        {config.helperText}
      </span>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────

export default function ReviewPage() {
  const { user } = useAuth();
  const { getLogo } = useLogo();
  const { success: toastSuccess, error: toastError } = useToast();
  const searchParams = useSearchParams();
  const highlightRef = useRef<HTMLDivElement>(null);
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
  const [actionResult, setActionResult] = useState<{
    id: string;
    message: string;
    error?: boolean;
  } | null>(null);
  const [dismissingAll, setDismissingAll] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [eventPayloads, setEventPayloads] = useState<
    Record<string, EventPayload>
  >({});
  const [loadingPayload, setLoadingPayload] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDismissing, setBatchDismissing] = useState(false);
  const [batchApproving, setBatchApproving] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || "",
  );
  const [highlightItemId, setHighlightItemId] = useState<string | null>(() =>
    searchParams.get("item"),
  );
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  // ── Fetch review items ──────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    if (!user?.id) return;
    try {
      setError(null);
      const data = await api.get(`/review?status=${viewFilter}`);
      setItems(data.items || []);
      setCounts(data.counts || { total: 0, high: 0, medium: 0, low: 0 });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load review items",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, viewFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (viewFilter !== "pending") return;
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, [fetchItems, viewFilter]);

  // Auto-scroll to highlighted item from URL ?item=
  useEffect(() => {
    if (!highlightItemId || loading || items.length === 0) return;
    const found = items.find((i) => i.id === highlightItemId);
    if (found) {
      setExpandedItem(highlightItemId);
      // Scroll after a brief render delay
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
      // Clear highlight after 3s
      setTimeout(() => setHighlightItemId(null), 3000);
    }
  }, [highlightItemId, loading, items]);

  // ── Actions ─────────────────────────────────────────────────────────

  const handleAction = async (
    itemId: string,
    action: string,
    snoozeDuration?: number,
  ) => {
    if (!user?.id) return;
    setActingOn(itemId);
    setActionResult(null);

    try {
      const result = await api.post("/review/act", {
        userId: user.id,
        itemId,
        action,
        snoozeDuration,
      });

      if (action === "dismiss" || action === "snooze") {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setCounts((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }

      if (action === "approve") {
        setActionResult({
          id: itemId,
          message:
            result.result?.message || result.message || "Action executed",
          error: result.result?.error,
        });
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
      toastSuccess("All items dismissed");
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
        // non-fatal
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
        ids.map((id) =>
          api.post("/review/act", {
            userId: user.id,
            itemId: id,
            action: "dismiss",
          }),
        ),
      );
      setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      setCounts((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - ids.length),
      }));
      setSelectedIds(new Set());
      toastSuccess(`${ids.length} item${ids.length > 1 ? "s" : ""} dismissed`);
    } catch (err: any) {
      toastError(err.message || "Batch dismiss failed");
    } finally {
      setBatchDismissing(false);
    }
  };

  const handleBatchApprove = async (ids: string[]) => {
    if (!user?.id || ids.length === 0) return;
    setBatchApproving(true);
    try {
      await Promise.all(
        ids.map((id) =>
          api.post("/review/act", {
            userId: user.id,
            itemId: id,
            action: "approve",
          }),
        ),
      );
      setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      setCounts((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - ids.length),
      }));
      setSelectedIds(new Set());
      toastSuccess(`${ids.length} item${ids.length > 1 ? "s" : ""} approved`);
    } catch (err: any) {
      toastError(err.message || "Batch approve failed");
    } finally {
      setBatchApproving(false);
    }
  };

  // ── Derived: categories, filtered & sorted items ────────────────────

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((i) => i.category === categoryFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.source_app.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q),
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortMode) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "confidence-high":
          return (b.ai_confidence ?? 0) - (a.ai_confidence ?? 0);
        case "confidence-low":
          return (a.ai_confidence ?? 0) - (b.ai_confidence ?? 0);
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return result;
  }, [items, categoryFilter, searchQuery, sortMode]);

  // ── Render ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="px-6 py-4 border-b border-white/[0.02] shrink-0 space-y-1.5">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-2.5 w-32" />
        </div>
        <div className="px-6 border-b border-white/[0.02] flex items-center gap-3 h-10">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-2.5 w-14" />
          ))}
        </div>
        <div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-b border-white/[0.02] px-6 py-4 space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-1.5 h-1.5 rounded-full" />
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-2.5 w-10" />
              </div>
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-2.5 w-3/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header */}
      <div className="px-4 sm:px-6 py-4 border-b border-white/[0.02] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Inbox</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleBatchDismiss(
                    items
                      .filter(
                        (i) => i.priority === "low" && i.status === "pending",
                      )
                      .map((i) => i.id),
                  )
                }
                disabled={batchDismissing}
              >
                {batchDismissing ? (
                  <Loader2
                    strokeWidth={1.5}
                    size={12}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 strokeWidth={1.5} size={12} />
                )}
                Dismiss low
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAll}
              disabled={dismissingAll}
            >
              {dismissingAll ? (
                <Loader2 strokeWidth={1.5} size={12} className="animate-spin" />
              ) : (
                <XCircle strokeWidth={1.5} size={12} />
              )}
              Dismiss all
            </Button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="px-4 sm:px-6 border-b border-white/[0.02] flex items-center gap-1">
        {(["pending", "resolved", "all"] as ViewFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setViewFilter(filter);
              setSelectedIds(new Set());
            }}
            className={`px-3 py-3 text-xs font-medium transition-colors capitalize border-b-2 -mb-px ${
              viewFilter === filter
                ? "text-foreground border-foreground"
                : "text-muted-foreground hover:text-foreground/80 border-transparent"
            }`}
          >
            {filter}
          </button>
        ))}
        <Link
          href="/dashboard/feed"
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-3"
        >
          <Activity strokeWidth={1.5} size={12} />
          Feed
        </Link>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-4">
        {/* Search + Sort/Filter bar */}
        {!loading && items.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  strokeWidth={1.5}
                  size={14}
                  className="text-muted-foreground"
                />
              </div>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inbox..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Category filter */}
              {categories.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="outline" size="xs" />}
                  >
                    <SlidersHorizontal strokeWidth={1.5} size={12} />
                    {categoryFilter === "all"
                      ? "All categories"
                      : categoryFilter}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                      All categories
                    </DropdownMenuItem>
                    {categories.map((cat) => (
                      <DropdownMenuItem
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {cat}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="xs" />}
                >
                  <ArrowDownAZ strokeWidth={1.5} size={12} />
                  {sortMode === "newest"
                    ? "Newest"
                    : sortMode === "oldest"
                      ? "Oldest"
                      : sortMode === "confidence-high"
                        ? "High confidence"
                        : "Low confidence"}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortMode("newest")}>
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortMode("oldest")}>
                    Oldest first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortMode("confidence-high")}
                  >
                    Confidence: high → low
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortMode("confidence-low")}
                  >
                    Confidence: low → high
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className={`w-full mb-6 p-4 ${error === "INSUFFICIENT_CREDITS" ? "bg-amber-500/10 border-amber-500/20" : "bg-destructive/10 border-destructive/20"} border rounded-xl flex items-center gap-3`}
          >
            <AlertTriangle
              strokeWidth={1.5}
              size={16}
              className={`${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-destructive"} shrink-0`}
            />
            <p
              className={`text-sm flex-1 ${error === "INSUFFICIENT_CREDITS" ? "text-amber-400" : "text-destructive"}`}
            >
              {error === "INSUFFICIENT_CREDITS"
                ? "You're out of credits. Add credits to continue."
                : error}
            </p>
            {error === "INSUFFICIENT_CREDITS" && (
              <Button
                variant="outline"
                size="sm"
                render={<a href="/dashboard/settings" />}
              >
                Add Credits
              </Button>
            )}
          </div>
        )}

        {/* Empty state */}
        {filteredItems.length === 0 && !error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center w-full mt-20 text-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-muted border border-border/55 flex items-center justify-center">
              <Cloud
                strokeWidth={1.5}
                size={20}
                className="text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">
                {searchQuery || categoryFilter !== "all"
                  ? "No matches"
                  : viewFilter === "pending"
                    ? "All clear"
                    : viewFilter === "resolved"
                      ? "No resolved items"
                      : "No items"}
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : viewFilter === "pending"
                    ? "Nothing needs your attention right now."
                    : "Items will appear here as triggers fire."}
              </p>
              {(searchQuery || categoryFilter !== "all") && (
                <Button
                  variant="secondary"
                  size="xs"
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
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
                  className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/[0.02] bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setSelectedIds(new Set())}
                    >
                      <X strokeWidth={1.5} size={13} />
                    </Button>
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedIds.size} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleBatchApprove(Array.from(selectedIds))
                      }
                      disabled={batchApproving || batchDismissing}
                    >
                      {batchApproving ? (
                        <Loader2
                          strokeWidth={1.5}
                          size={12}
                          className="animate-spin"
                        />
                      ) : (
                        <Check strokeWidth={2} size={12} />
                      )}
                      Approve selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleBatchDismiss(Array.from(selectedIds))
                      }
                      disabled={batchDismissing || batchApproving}
                    >
                      {batchDismissing ? (
                        <Loader2
                          strokeWidth={1.5}
                          size={12}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 strokeWidth={1.5} size={12} />
                      )}
                      Dismiss selected
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const isActing = actingOn === item.id;
                const result =
                  actionResult?.id === item.id ? actionResult : null;
                const appColor = getAppColor(item.source_app);
                const appLogo = getLogo(item.source_app);

                return (
                  <motion.div
                    key={item.id}
                    ref={item.id === highlightItemId ? highlightRef : undefined}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                    className={`border-b border-white/[0.02] px-4 sm:px-6 py-4 hover:bg-white/[0.02] transition-all ${item.id === highlightItemId ? "ring-2 ring-inset ring-primary/30 bg-primary/[0.04]" : ""}`}
                  >
                    {/* Top row */}
                    <div className="flex items-center gap-2.5 mb-2">
                      {item.status === "pending" && (
                        <button
                          onClick={() => toggleSelect(item.id)}
                          className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                          aria-label={
                            selectedIds.has(item.id) ? "Deselect" : "Select"
                          }
                        >
                          {selectedIds.has(item.id) ? (
                            <CheckSquare
                              strokeWidth={1.5}
                              size={13}
                              className="text-foreground"
                            />
                          ) : (
                            <Square strokeWidth={1.5} size={13} />
                          )}
                        </button>
                      )}
                      <AppDot
                        logo={appLogo}
                        alt={item.source_app}
                        color={appColor}
                      />
                      <span className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                        {item.source_app}
                      </span>
                      {item.category && CATEGORY_ICONS[item.category] && (
                        <span className="text-muted-foreground/40">
                          {CATEGORY_ICONS[item.category]}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground/60">
                        {timeAgo(item.created_at)}
                      </span>
                      {item.priority === "high" && (
                        <Badge
                          variant="outline"
                          className="ml-auto bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                        >
                          Urgent
                        </Badge>
                      )}
                    </div>

                    {/* Title + description (truncated with expand) */}
                    <h3 className="text-sm font-semibold text-foreground mb-1 leading-snug">
                      {item.title}
                    </h3>
                    {item.description &&
                      (item.description.length > 180 ? (
                        <ExpandableText
                          text={item.description}
                          maxLength={180}
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      ))}

                    {/* Expandable context */}
                    <div className="mt-2.5 mb-3">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      >
                        {loadingPayload === item.id ? (
                          <Loader2
                            strokeWidth={1.5}
                            size={11}
                            className="animate-spin"
                          />
                        ) : (
                          <ChevronDown
                            strokeWidth={1.5}
                            size={11}
                            className={`transition-transform duration-200 ${expandedItem === item.id ? "rotate-180" : ""}`}
                          />
                        )}
                        {expandedItem === item.id
                          ? "Hide details"
                          : "View details"}
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
                            {eventPayloads[item.id]?.data &&
                            Object.keys(eventPayloads[item.id].data!).length >
                              0 ? (
                              <EventPayloadPanel
                                payload={eventPayloads[item.id]}
                              />
                            ) : (
                              item.action_context &&
                              Object.keys(item.action_context).length > 0 && (
                                <ContextPanel ctx={item.action_context} />
                              )
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* AI confidence badge — shadcn Tooltip */}
                    {item.ai_confidence !== null &&
                      item.ai_confidence !== undefined && (
                        <div className="mt-1 mb-3">
                          <ConfidenceBadge confidence={item.ai_confidence} />
                        </div>
                      )}

                    {/* Post-approve result */}
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mb-3"
                      >
                        <div
                          className={`flex items-start gap-2.5 px-3 py-2.5 rounded-md border text-xs ${
                            result.error
                              ? "bg-destructive/5 border-destructive/20 text-destructive"
                              : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {result.error ? (
                            <AlertTriangle
                              strokeWidth={1.5}
                              size={13}
                              className="shrink-0 mt-px"
                            />
                          ) : (
                            <Check
                              strokeWidth={2}
                              size={13}
                              className="shrink-0 mt-px"
                            />
                          )}
                          <p className="leading-relaxed text-foreground/70">
                            {result.message}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Action buttons — shadcn Button + DropdownMenu */}
                    {item.status === "pending" && (
                      <div className="flex items-center gap-1.5 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleAction(item.id, "approve")}
                          disabled={isActing}
                        >
                          {isActing ? (
                            <Loader2
                              strokeWidth={1.5}
                              size={12}
                              className="animate-spin"
                            />
                          ) : (
                            <Check strokeWidth={2} size={12} />
                          )}
                          Yes, do it
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction(item.id, "dismiss")}
                          disabled={isActing}
                        >
                          <X strokeWidth={1.5} size={12} />
                          Dismiss
                        </Button>

                        {/* Snooze — shadcn DropdownMenu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={isActing}
                            render={<Button variant="ghost" size="sm" />}
                          >
                            <Clock strokeWidth={1.5} size={12} />
                            Snooze
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="top" align="start">
                            {SNOOZE_OPTIONS.map((opt) => (
                              <DropdownMenuItem
                                key={opt.minutes}
                                onClick={() =>
                                  handleAction(item.id, "snooze", opt.minutes)
                                }
                              >
                                {opt.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {/* Resolved status */}
                    {(item.status === "approved" ||
                      item.status === "dismissed") && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            item.status === "approved" ? "default" : "secondary"
                          }
                          className="text-[11px]"
                        >
                          {item.status === "approved"
                            ? "Approved"
                            : "Dismissed"}
                        </Badge>
                        {item.resolved_at && (
                          <span className="text-[11px] text-muted-foreground/50">
                            · {timeAgo(item.resolved_at)}
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
