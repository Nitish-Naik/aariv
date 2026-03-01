"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  ArrowRight,
  Bell,
  Clock,
  Github,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────── */

interface TriggerEvent {
  id: string;
  triggerSlug: string;
  app: string;
  status: "received" | "processing" | "completed" | "failed";
  preview: string;
  processingTimeMs?: number;
  error?: string;
  createdAt: string;
  // Live SSE events carry content instead of preview
  content?: string;
  isLive?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────── */

const APP_META: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  gmail: { icon: <Mail size={16} />, label: "Email", color: "#EA4335" },
  github: { icon: <Github size={16} />, label: "GitHub", color: "#333" },
  slack: {
    icon: <MessageSquare size={16} />,
    label: "Slack",
    color: "#4A154B",
  },
  googlecalendar: {
    icon: <Clock size={16} />,
    label: "Calendar",
    color: "#4285F4",
  },
  notion: { icon: <Zap size={16} />, label: "Notion", color: "#000" },
  linear: { icon: <Zap size={16} />, label: "Linear", color: "#5E6AD2" },
  discord: {
    icon: <MessageSquare size={16} />,
    label: "Discord",
    color: "#5865F2",
  },
};

const TRIGGER_EVENT_TYPES = new Set([
  "proactive_summary",
  "email_summary",
  "github_update",
  "slack_summary",
  "calendar_alert",
  "notion_update",
  "linear_update",
  "discord_summary",
]);

const getAppMeta = (app: string) =>
  APP_META[app] || {
    icon: <Bell size={16} />,
    label: app || "Update",
    color: "var(--accent)",
  };

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getSubMessage = () => {
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 6)
    return "Enjoy your evening. I'll let you know if anything comes up.";
  if (hour < 12) return "A fresh start. I'll handle the rest.";
  return "Everything's under control.";
};

/* ─── Status Badge ───────────────────────────────────────── */

function StatusBadge({ status }: { status: TriggerEvent["status"] }) {
  const cfg = {
    received: {
      bg: "rgba(99,102,241,0.15)",
      text: "#a5b4fc",
      label: "Received",
    },
    processing: {
      bg: "rgba(234,179,8,0.15)",
      text: "#fbbf24",
      label: "Processing",
    },
    completed: { bg: "rgba(34,197,94,0.15)", text: "#4ade80", label: "Done" },
    failed: { bg: "rgba(239,68,68,0.15)", text: "#f87171", label: "Failed" },
  }[status] || {
    bg: "var(--bg-surface)",
    text: "var(--text-muted)",
    label: status,
  };

  return (
    <span
      style={{ background: cfg.bg, color: cfg.text }}
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
    >
      {cfg.label}
    </span>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function DashboardHome() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TriggerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const liveIdSet = useRef(new Set<string>());

  // Fetch recent events from DB
  const fetchEvents = useCallback(
    async (showSpinner = true) => {
      if (!user?.id) return;
      if (showSpinner) setLoading(true);
      else setRefreshing(true);
      try {
        const data = await api.get(
          `/dashboard/recent-events?userId=${user.id}&limit=20`,
        );
        setEvents((prev) => {
          // Merge: keep live SSE events on top, replace DB events
          const liveEvents = prev.filter((e) => e.isLive);
          const dbIds = new Set(
            (data.events || []).map((e: TriggerEvent) => e.id),
          );
          const uniqueLive = liveEvents.filter((e) => !dbIds.has(e.id));
          return [...uniqueLive, ...(data.events || [])];
        });
      } catch (err) {
        console.error("Failed to fetch recent events:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Live SSE stream
  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();

    const startStream = async () => {
      try {
        const response = await fetch(
          `${api.getBaseUrl()}/notifications/${user.id}`,
          { signal: controller.signal },
        );
        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });
          const parts = accumulated.split("\n\n");
          accumulated = parts.pop() || "";

          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;
            try {
              const evt = JSON.parse(part.substring(6));
              if (!TRIGGER_EVENT_TYPES.has(evt.type)) continue;

              const evtData = evt.data || {};
              const liveId = evtData.id || `live_${Date.now()}`;
              if (liveIdSet.current.has(liveId)) continue;
              liveIdSet.current.add(liveId);

              const newEvent: TriggerEvent = {
                id: liveId,
                triggerSlug: evtData.trigger_slug || "",
                app: evtData.app || "unknown",
                status: "completed",
                preview: "",
                content: evtData.content || "",
                createdAt: evtData.timestamp || new Date().toISOString(),
                processingTimeMs: evtData.processing_time_ms,
                isLive: true,
              };

              setEvents((prev) => [newEvent, ...prev]);
            } catch {
              /* ignore parse errors */
            }
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("SSE stream error:", e);
          setTimeout(startStream, 5000);
        }
      }
    };

    startStream();
    return () => controller.abort();
  }, [user?.id]);

  const firstName = user?.name?.split(" ")[0] || "there";
  const hasEvents = events.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)] mb-2">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-base text-[var(--text-secondary)]">
          {getSubMessage()}
        </p>
      </div>

      {/* Activity Feed Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
          Recent Activity
        </h2>
        <button
          onClick={() => fetchEvents(false)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2
            size={24}
            className="animate-spin text-[var(--text-muted)]"
          />
        </div>
      )}

      {/* Event Cards */}
      {!loading && hasEvents && (
        <div className="space-y-3">
          {events.map((event) => {
            const meta = getAppMeta(event.app);
            const displayText = event.content || event.preview;

            return (
              <div
                key={event.id}
                className={`bg-[var(--bg-surface)] border rounded-xl p-4 space-y-2 transition-all ${
                  event.isLive
                    ? "border-[var(--accent)] shadow-sm"
                    : "border-[var(--border)]"
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex items-center justify-center w-6 h-6 rounded-md text-white"
                      style={{ background: meta.color }}
                    >
                      {meta.icon}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {meta.label}
                    </span>
                    {event.isLive && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white">
                        NEW
                      </span>
                    )}
                    <StatusBadge status={event.status} />
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {timeAgo(event.createdAt)}
                  </span>
                </div>

                {/* Content */}
                {displayText && (
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line font-medium">
                    {displayText}
                  </p>
                )}

                {/* Trigger slug */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono opacity-70">
                    {event.triggerSlug}
                  </span>
                  {event.processingTimeMs != null && (
                    <span className="text-[10px] text-[var(--text-secondary)] opacity-70">
                      · {event.processingTimeMs}ms
                    </span>
                  )}
                </div>

                {/* Error */}
                {event.error && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-1.5">
                    {event.error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasEvents && (
        <div className="text-center py-16 space-y-4">
          <p className="text-4xl">🌙</p>
          <p className="text-base text-[var(--text-secondary)]">
            No trigger activity yet. Set up triggers to see events here.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/dashboard/triggers"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
            >
              Set up triggers <ArrowRight size={14} />
            </a>
            <a
              href="/dashboard/assistant"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:underline"
            >
              Talk to Aariv <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
