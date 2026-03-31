"use client";

import { useUpgradeDialog } from "@/components/UpgradeDialog";
import { WeeklyStats } from "@/components/dashboard/WeeklyStats";
import { Logo } from "@/components/secure-agent/Logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useLogo } from "@/context/LogoContext";
import { useBilling } from "@/context/useBilling";
import { trackEvent } from "@/lib/analytics";
import { api } from "@/lib/api";
import { getAppColor, getAppIcon } from "@/lib/appMeta";
import { usePromptStore } from "@/lib/prompt-store";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Mail,
  MessageSquare,
  Plug,
  RefreshCw,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

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
  location?: string;
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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatDate = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

function countRemainingMeetings(events: CalendarEvent[]): number {
  const now = new Date();
  return events.filter((e) => new Date(e.endTime || e.startTime) > now).length;
}

function findNextEventIndex(events: CalendarEvent[]): number {
  const now = new Date();
  return events.findIndex((e) => new Date(e.endTime || e.startTime) >= now);
}

/* ─── App Logo ────────────────────────────────────────────── */

function DashboardAppLogo({
  logoUrl,
  alt,
  color,
  icon,
  className,
}: {
  logoUrl?: string;
  alt: string;
  color: string;
  icon: React.ReactNode;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !logoUrl || failed;

  return (
    <div
      className={`${className} relative overflow-hidden flex items-center justify-center`}
      style={showFallback ? { backgroundColor: color } : undefined}
    >
      {showFallback ? (
        <span className="text-foreground">{icon}</span>
      ) : (
        <img
          src={logoUrl}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain p-1.5 bg-card"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/* ─── Metric ──────────────────────────────────────────────── */

const METRIC_DOT: Record<string, string> = {
  meetings: "bg-violet-400",
  review: "bg-amber-400",
  emails: "bg-sky-400",
};

function Metric({
  label,
  value,
  dotColor,
  href,
}: {
  label: string;
  value: string | number;
  dotColor?: string;
  href?: string;
}) {
  const inner = (
    <div className={`group ${href ? "cursor-pointer" : ""}`}>
      <p className="text-4xl sm:text-5xl font-extralight text-foreground tabular-nums tracking-tight leading-none">
        {value}
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        {dotColor && (
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        )}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {href && (
          <ArrowRight
            size={10}
            className="text-muted-foreground group-hover:text-foreground transition-colors ml-0.5"
          />
        )}
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

/* ─── Proposal Item ──────────────────────────────────────── */

const PRIORITY_TEXT: Record<string, { color: string; label: string }> = {
  high: { color: "text-red-400", label: "Urgent" },
  medium: { color: "text-amber-400", label: "Medium" },
  low: { color: "text-emerald-400", label: "Low" },
};

function ProposalItem({
  proposal,
  logoUrl,
  onAction,
}: {
  proposal: Proposal;
  logoUrl?: string;
  onAction?: (proposal: Proposal, action: string) => void;
}) {
  const icon = getAppIcon(proposal.app);
  const color = getAppColor(proposal.app);
  const p = PRIORITY_TEXT[proposal.priority] ?? PRIORITY_TEXT.low;
  const reviewLink = `/dashboard/review?q=${encodeURIComponent(proposal.title)}`;

  return (
    <div className="flex items-start gap-3.5 py-3.5 group hover:bg-white/[0.015] -mx-2 px-2 rounded-xl transition-colors duration-200">
      <DashboardAppLogo
        logoUrl={logoUrl}
        alt={proposal.app}
        color={color}
        icon={icon}
        className="w-8 h-8 rounded-lg shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Link
            href={reviewLink}
            className="text-[13px] font-medium text-foreground leading-snug truncate hover:underline underline-offset-2 decoration-foreground/20"
          >
            {proposal.title}
          </Link>
          <span className={`text-[11px] font-medium ${p.color} shrink-0`}>
            {p.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
          {proposal.description}
        </p>
      </div>

      {proposal.actions.length > 0 && (
        <button
          onClick={() => onAction?.(proposal, proposal.actions[0])}
          className="shrink-0 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-all duration-200 mt-1"
        >
          {proposal.actions[0]}
        </button>
      )}
    </div>
  );
}

/* ─── Calendar Event Row ─────────────────────────────────── */

const EVENT_ACCENT_COLORS = [
  "#818cf8",
  "#38bdf8",
  "#34d399",
  "#fb923c",
  "#f472b6",
  "#a78bfa",
];

function getEventColor(eventId: string, overrideColor?: string | null): string {
  if (overrideColor) return overrideColor;
  let hash = 0;
  for (let i = 0; i < (eventId?.length ?? 0); i++)
    hash = eventId.charCodeAt(i) + ((hash << 5) - hash);
  return EVENT_ACCENT_COLORS[Math.abs(hash) % EVENT_ACCENT_COLORS.length];
}

/* ─── Timeline View (Horizon-style) ───────────────────── */

const HOUR_HEIGHT = 56; // px per hour

function getMinutesFromMidnight(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** Assign overlap columns to events so concurrent ones sit side-by-side. */
function assignColumns(
  events: { startMin: number; endMin: number; index: number }[],
): { col: number; totalCols: number }[] {
  const sorted = [...events].sort(
    (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
  );
  const result: { col: number; totalCols: number }[] = new Array(events.length);
  const groups: number[][] = []; // groups of overlapping event indices

  // Group overlapping events
  for (const ev of sorted) {
    let placed = false;
    for (const group of groups) {
      const lastInGroup = events[group[group.length - 1]];
      if (ev.startMin < lastInGroup.endMin) {
        group.push(ev.index);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([ev.index]);
  }

  // Re-group using a proper interval overlap algorithm
  const overlapGroups: number[][] = [];
  let currentGroup: number[] = [];
  let groupEnd = -1;

  for (const ev of sorted) {
    if (currentGroup.length === 0 || ev.startMin < groupEnd) {
      currentGroup.push(ev.index);
      groupEnd = Math.max(groupEnd, ev.endMin);
    } else {
      overlapGroups.push(currentGroup);
      currentGroup = [ev.index];
      groupEnd = ev.endMin;
    }
  }
  if (currentGroup.length > 0) overlapGroups.push(currentGroup);

  // Assign columns within each overlap group
  for (const group of overlapGroups) {
    const totalCols = group.length;
    group.forEach((eventIdx, colIdx) => {
      result[eventIdx] = { col: colIdx, totalCols };
    });
  }

  // Fill any gaps (shouldn't happen but safety)
  for (let i = 0; i < events.length; i++) {
    if (!result[i]) result[i] = { col: 0, totalCols: 1 };
  }

  return result;
}

function TimelineView({
  events,
  showNowLine: showNow = false,
}: {
  events: CalendarEvent[];
  showNowLine?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Filter to non-all-day events
  const timelineEvents = events.filter((e) => {
    const d = new Date(e.startTime);
    return d.getHours() > 0 || d.getMinutes() > 0; // skip midnight-only (all-day)
  });

  // Dynamic hour range based on actual events
  let startHour = 7;
  let endHour = 20;
  if (timelineEvents.length > 0) {
    const earliest = Math.min(
      ...timelineEvents.map((e) => new Date(e.startTime).getHours()),
    );
    const latest = Math.max(
      ...timelineEvents.map((e) => {
        const end = e.endTime ? new Date(e.endTime) : new Date(e.startTime);
        return end.getHours() + (end.getMinutes() > 0 ? 1 : 0);
      }),
    );
    startHour = Math.max(0, Math.min(earliest - 1, 7));
    endHour = Math.min(24, Math.max(latest + 1, 20));
  }

  const totalHours = endHour - startHour;
  const timelineHeight = totalHours * HOUR_HEIGHT;

  // Prepare event positions for overlap detection
  const eventPositions = timelineEvents.map((e, i) => {
    const startMin = getMinutesFromMidnight(e.startTime);
    const endMin = e.endTime
      ? getMinutesFromMidnight(e.endTime)
      : startMin + 30;
    return { startMin, endMin: Math.max(endMin, startMin + 15), index: i };
  });
  const columns = assignColumns(eventPositions);

  // Auto-scroll to current time (today) or first event (tomorrow)
  useEffect(() => {
    if (scrollRef.current) {
      if (showNow) {
        const scrollTo = Math.max(
          0,
          (now.getHours() - startHour - 1) * HOUR_HEIGHT,
        );
        scrollRef.current.scrollTop = scrollTo;
      } else if (timelineEvents.length > 0) {
        const firstHour = new Date(timelineEvents[0].startTime).getHours();
        scrollRef.current.scrollTop = Math.max(
          0,
          (firstHour - startHour - 1) * HOUR_HEIGHT,
        );
      }
    }
  }, []);

  // Current time indicator
  const nowTop = ((currentMinutes - startHour * 60) / 60) * HOUR_HEIGHT;
  const showNowLine =
    showNow &&
    currentMinutes >= startHour * 60 &&
    currentMinutes <= endHour * 60;

  return (
    <div
      ref={scrollRef}
      className="relative overflow-y-auto"
      style={{ maxHeight: "480px" }}
    >
      <div
        className="relative pb-8"
        style={{ height: `${timelineHeight + 44}px` }}
      >
        {/* Hour grid lines */}
        {Array.from({ length: totalHours }, (_, i) => {
          const hour = startHour + i;
          const label =
            hour === 0
              ? "12 AM"
              : hour < 12
                ? `${hour} AM`
                : hour === 12
                  ? "12 PM"
                  : `${hour - 12} PM`;
          return (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-start"
              style={{ top: `${i * HOUR_HEIGHT + 12}px` }}
            >
              <span className="text-[10px] text-muted-foreground/50 tabular-nums w-12 shrink-0 -mt-1.5 select-none">
                {label}
              </span>
              <div className="flex-1 border-t border-white/[0.04]" />
            </div>
          );
        })}

        {/* Now indicator */}
        {showNowLine && (
          <div
            className="absolute left-10 right-0 flex items-center z-20 pointer-events-none"
            style={{ top: `${nowTop + 12}px` }}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
            <div className="flex-1 border-t border-red-500/60" />
          </div>
        )}

        {/* Event blocks */}
        {timelineEvents.map((event, i) => {
          const pos = eventPositions[i];
          const col = columns[i];
          const duration = pos.endMin - pos.startMin;
          const top = ((pos.startMin - startHour * 60) / 60) * HOUR_HEIGHT + 12;
          const height = (duration / 60) * HOUR_HEIGHT;
          const color = getEventColor(event.id, event.color);
          const isPast = new Date(event.endTime || event.startTime) < now;
          const durationLabel =
            duration >= 60
              ? `${Math.floor(duration / 60)} hr${duration % 60 > 0 ? ` ${duration % 60}m` : ""}`
              : `${duration} min`;
          const location = event.location;

          // Column layout: divide the event area among overlapping events
          const colWidth = 100 / col.totalCols;
          const leftPct = col.col * colWidth;
          const GAP = 2; // px gap between columns

          return (
            <div
              key={event.id}
              className={`absolute rounded-lg border-l-[3px] px-2.5 py-1.5 overflow-hidden transition-opacity ${
                isPast ? "opacity-30" : "opacity-100"
              }`}
              style={{
                top: `${top}px`,
                height: `${Math.max(height, 26)}px`,
                left: `calc(48px + ${leftPct}% + ${col.col > 0 ? GAP : 0}px)`,
                width: `calc(${colWidth}% - 48px / ${col.totalCols} - ${GAP}px)`,
                borderLeftColor: color,
                backgroundColor: `${color}15`,
              }}
            >
              <p className="text-[11px] font-semibold text-foreground truncate leading-tight">
                {event.title}
              </p>
              {height >= 36 && (
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {durationLabel}
                  {location ? ` · ${location}` : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Simple list row for week view */
function EventRow({
  event,
  isNext,
}: {
  event: CalendarEvent;
  isNext?: boolean;
}) {
  const isPast = new Date(event.endTime || event.startTime) < new Date();
  const time = formatTime(event.startTime);
  const endTime = event.endTime ? formatTime(event.endTime) : "";
  const accentColor = getEventColor(event.id, event.color);

  return (
    <div
      className={`flex items-start gap-3 py-2.5 ${isPast ? "opacity-30" : ""}`}
    >
      <div
        className="w-[2px] rounded-full shrink-0 mt-1"
        style={{
          height: endTime ? "32px" : "18px",
          backgroundColor: accentColor,
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground leading-snug truncate">
          {event.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {isNext && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          )}
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {time}
          </span>
          {endTime && (
            <>
              <span className="text-[10px] text-muted-foreground/60">—</span>
              <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                {endTime}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Calendar Connect Prompt ────────────────────────────── */

function CalendarConnectPrompt() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthName = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex flex-col items-center py-6 text-center">
      {/* Mini calendar */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 mb-6 w-[220px]">
        <p className="text-[13px] font-semibold text-foreground mb-3">
          {monthName}
        </p>
        <div className="grid grid-cols-7 gap-0">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span
              key={i}
              className="text-[10px] text-muted-foreground/50 font-medium text-center py-1"
            >
              {d}
            </span>
          ))}
          {cells.map((day, i) => (
            <span
              key={i}
              className={`text-[11px] text-center py-[5px] rounded-md ${
                day === today
                  ? "bg-indigo-500/20 text-indigo-400 font-bold"
                  : day
                    ? "text-muted-foreground/70"
                    : ""
              }`}
            >
              {day ?? ""}
            </span>
          ))}
        </div>
      </div>

      {/* Copy */}
      <h4 className="text-base font-semibold text-foreground mb-1.5">
        Your schedule awaits
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mb-5">
        Connect Google Calendar to see your day at a glance. CalmPilot reads
        your calendar but never modifies it.
      </p>

      {/* CTA */}
      <Link
        href="/dashboard/integrations?connect=googlecalendar"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/15 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/25 transition-all duration-200"
      >
        <Calendar strokeWidth={1.75} size={14} />
        Connect Google Calendar
      </Link>
      <p className="text-[11px] text-muted-foreground/50 mt-2.5">
        We read your calendar but never modify it without asking
      </p>
    </div>
  );
}

/* ─── Schedule Section ───────────────────────────────────── */

type CalendarView = "today" | "tomorrow" | "week";

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDayHeading(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const sub = `${DAY_SHORT[d.getDay()]}, ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
  if (diff === 0)
    return { label: "Today", sub, isToday: true, isTomorrow: false };
  if (diff === 1)
    return { label: "Tomorrow", sub, isToday: false, isTomorrow: true };
  return {
    label: DAY_LABELS[d.getDay()],
    sub,
    isToday: false,
    isTomorrow: false,
  };
}

function ScheduleSection({
  calendarConnected = true,
}: {
  calendarConnected?: boolean;
}) {
  const [view, setView] = useState<CalendarView>("today");
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [tomorrowEvents, setTomorrowEvents] = useState<CalendarEvent[]>([]);
  const [weekEvents, setWeekEvents] = useState<Record<string, CalendarEvent[]>>(
    {},
  );
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingTomorrow, setLoadingTomorrow] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const todayFetched = useRef(false);
  const tomorrowFetched = useRef(false);
  const weekFetched = useRef(false);

  const fetchToday = useCallback(async () => {
    if (todayFetched.current) return;
    todayFetched.current = true;
    setLoadingToday(true);
    try {
      const data = await api.get("/dashboard/calendar?range=today");
      setTodayEvents(data?.events ?? []);
    } catch {
      setTodayEvents([]);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const fetchTomorrow = useCallback(async () => {
    if (tomorrowFetched.current) return;
    tomorrowFetched.current = true;
    setLoadingTomorrow(true);
    try {
      const data = await api.get("/dashboard/calendar?range=tomorrow");
      setTomorrowEvents(data?.events ?? []);
    } catch {
      setTomorrowEvents([]);
    } finally {
      setLoadingTomorrow(false);
    }
  }, []);

  const fetchWeek = useCallback(async () => {
    if (weekFetched.current) return;
    weekFetched.current = true;
    setLoadingWeek(true);
    try {
      const data = await api.get("/dashboard/calendar?range=week");
      setWeekEvents(data?.grouped ?? {});
    } catch {
      setWeekEvents({});
    } finally {
      setLoadingWeek(false);
    }
  }, []);

  // Fetch today on mount
  useEffect(() => {
    if (calendarConnected) fetchToday();
  }, [calendarConnected, fetchToday]);

  const handleViewChange = (v: CalendarView) => {
    setView(v);
    if (v === "today") fetchToday();
    if (v === "tomorrow") fetchTomorrow();
    if (v === "week") fetchWeek();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-foreground">Schedule</h3>
        <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
          {(["today", "tomorrow", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={() => handleViewChange(v)}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                view === v
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "today" ? "Today" : v === "tomorrow" ? "Tomorrow" : "Week"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {!calendarConnected ? (
          <CalendarConnectPrompt />
        ) : view === "today" ? (
          loadingToday ? (
            <div className="space-y-3 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 ml-12">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : todayEvents.length > 0 ? (
            <TimelineView events={todayEvents} showNowLine />
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-sm text-muted-foreground">You're free today</p>
            </div>
          )
        ) : view === "tomorrow" ? (
          loadingTomorrow ? (
            <div className="space-y-3 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 ml-12">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : tomorrowEvents.length > 0 ? (
            <TimelineView events={tomorrowEvents} />
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing scheduled tomorrow
              </p>
            </div>
          )
        ) : loadingWeek ? (
          <div className="space-y-3 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-[2px] rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(weekEvents).length > 0 ? (
          <div className="max-h-[480px] overflow-y-auto">
            {Object.entries(weekEvents)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, events]) => {
                const heading = formatDayHeading(dateKey);
                const isDayPast = (() => {
                  const d = new Date(dateKey + "T23:59:59");
                  return d < new Date();
                })();
                return (
                  <div
                    key={dateKey}
                    className={`mb-2 ${isDayPast ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1 mt-3 first:mt-0">
                      <span
                        className={`text-[11px] font-medium ${
                          heading.isToday
                            ? "text-violet-400"
                            : heading.isTomorrow
                              ? "text-amber-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {heading.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {heading.sub}
                      </span>
                    </div>
                    {events.map((event, i) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        isNext={
                          heading.isToday && i === findNextEventIndex(events)
                        }
                      />
                    ))}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="text-sm text-muted-foreground">Clear week ahead</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Recommended apps for onboarding ────────────────────── */

const RECOMMENDED_APPS = [
  {
    slug: "gmail",
    name: "Gmail",
    description: "Read, draft, and manage your emails automatically.",
    color: "#EA4335",
    icon: <Mail strokeWidth={1.75} size={16} />,
    free: true,
  },
  {
    slug: "googlecalendar",
    name: "Google Calendar",
    description:
      "Track meetings, schedule events, and stay on top of your day.",
    color: "#4285F4",
    icon: <Calendar strokeWidth={1.75} size={16} />,
    free: true,
  },
  {
    slug: "slack",
    name: "Slack",
    description:
      "Monitor channels, respond to messages, and manage notifications.",
    color: "#E01E5A",
    icon: <MessageSquare strokeWidth={1.75} size={16} />,
    free: false,
  },
];

/* ─── Onboarding State ───────────────────────────────────── */

function OnboardingState({ firstName }: { firstName: string }) {
  const router = useRouter();
  const { getLogo } = useLogo();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-md mx-auto w-full">
        <div className="mb-6">
          <Logo className="w-11 h-11" />
        </div>

        <h1 className="text-3xl font-semibold text-foreground tracking-[-0.03em] mb-2 text-center">
          Welcome, {firstName}
        </h1>
        <p className="text-base text-muted-foreground text-center mb-12 leading-relaxed">
          Connect your first app so CalmPilot can start managing your day.
        </p>

        <div className="w-full space-y-0 divide-y divide-white/[0.04]">
          {RECOMMENDED_APPS.map((app) => (
            <button
              key={app.slug}
              onClick={() =>
                router.push(`/dashboard/integrations?connect=${app.slug}`)
              }
              className="w-full flex items-center gap-4 py-5 hover:bg-white/[0.02] transition-colors text-left group -mx-2 px-2 rounded-xl"
            >
              <DashboardAppLogo
                logoUrl={getLogo(app.slug)}
                alt={app.name}
                color={app.color}
                icon={app.icon}
                className="w-11 h-11 rounded-xl shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-foreground">
                  {app.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {app.description}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0"
              />
            </button>
          ))}
        </div>

        <Button
          onClick={() => router.push("/dashboard/integrations")}
          className="w-full mt-8 gap-2"
          size="lg"
        >
          <Plug strokeWidth={1.75} size={15} />
          Browse all apps
        </Button>
        <button
          onClick={() => router.push("/dashboard/assistant")}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip to chat
        </button>
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
  userId,
  connectedApps = [],
}: {
  firstName: string;
  briefing?: Briefing | null;
  reviewCounts?: ReviewCounts;
  onRefresh?: () => void;
  userId?: string; // reserved for future per-user state
  refreshing?: boolean;
  connectedApps?: string[];
}) {
  const router = useRouter();
  void userId;
  const calendarEvents = briefing?.events ?? [];
  const insight = briefing?.insight;
  const calendarConnected = connectedApps.includes("googlecalendar");

  const remainingMeetings = countRemainingMeetings(calendarEvents);

  // Contextual status based on actual data
  const statusLine =
    briefing?.subtitle ||
    (remainingMeetings === 0 && reviewCounts.total === 0
      ? "Your day is clear. Nothing needs your attention."
      : remainingMeetings > 0
        ? `You have ${remainingMeetings} meeting${remainingMeetings > 1 ? "s" : ""} left today.`
        : `${reviewCounts.total} item${reviewCounts.total > 1 ? "s" : ""} waiting for your review.`);

  return (
    <div className="flex flex-col h-full">
      {/* Two-column: greeting+context left, schedule right — both top-aligned */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* ── Left ────────────────────────────────────────────── */}
        <div className="flex flex-col px-6 sm:px-8 pt-8 sm:pt-10 pb-6 relative">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="absolute top-8 sm:top-10 right-6 sm:right-8 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          )}

          {/* Greeting */}
          <h1 className="text-xl font-semibold text-foreground tracking-[-0.01em]">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{statusLine}</p>

          {/* Compact stats row */}
          <div className="flex items-center gap-6 mt-8">
            {/* {calendarConnected && (
              <div className="flex items-center gap-2">
                <Calendar strokeWidth={1.5} size={14} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{remainingMeetings}</span>{" "}
                  meeting{remainingMeetings !== 1 ? "s" : ""} left
                </span>
              </div>
            )} */}
            {reviewCounts.total > 0 && (
              <Link
                href="/dashboard/review"
                className="flex items-center gap-2 group"
              >
                <CheckCircle2
                  strokeWidth={1.5}
                  size={14}
                  className="text-muted-foreground"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <span className="font-semibold text-foreground">
                    {reviewCounts.total}
                  </span>{" "}
                  to review
                </span>
              </Link>
            )}
            {!calendarConnected && (
              <Link
                href="/dashboard/integrations"
                className="flex items-center gap-2 group"
              >
                <Calendar
                  strokeWidth={1.5}
                  size={14}
                  className="text-muted-foreground"
                />
                <span className="text-sm text-indigo-400 group-hover:text-indigo-300 font-medium transition-colors">
                  Connect calendar
                </span>
              </Link>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/assistant")}
              className="gap-2"
            >
              <Sparkles strokeWidth={1.75} size={13} />
              Ask CalmPilot
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/integrations")}
              className="gap-2"
            >
              <Zap strokeWidth={1.75} size={13} />
              Integrations
            </Button>
            {reviewCounts.total > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push("/dashboard/review")}
              >
                <CheckCircle2 strokeWidth={1.75} size={13} />
                Review inbox
              </Button>
            )}
          </div>

          {/* Insight — anchored at bottom of left column */}
          {insight && (
            <div className="mt-auto pt-8">
              <div className="flex items-start gap-3 border-t border-border pt-4">
                <Sparkles
                  strokeWidth={1.5}
                  size={12}
                  className="text-indigo-400/50 shrink-0 mt-0.5"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insight}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right — Schedule ────────────────────────────────── */}
        <div className="px-6 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-6 lg:border-l lg:border-white/[0.04]">
          <ScheduleSection calendarConnected={calendarConnected} />
        </div>
      </div>
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
  const setPendingPrompt = usePromptStore((s) => s.setPendingPrompt);
  const { counts, proposals, events, insight } = briefing;

  const handleProposalAction = (proposal: Proposal, action: string) => {
    const prompt = `${action} for: "${proposal.title}"\n\nBackground: ${proposal.description}`;
    setPendingPrompt(prompt);
    router.push("/dashboard/assistant");
  };

  return (
    <div className="flex flex-col">
      {/* Greeting */}
      <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-2 relative">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="absolute top-8 sm:top-10 right-6 sm:right-8 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        )}
        <h1 className="text-xl font-semibold text-foreground tracking-[-0.01em]">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {briefing.subtitle}
        </p>
      </div>

      {/* Metrics — commented out for now
      <div className="px-6 sm:px-8 pt-8 pb-6 flex items-start gap-10 sm:gap-14">
        <Metric
          label="Meetings remaining"
          value={countRemainingMeetings(events)}
          dotColor={METRIC_DOT.meetings}
        />
        <Metric
          label="To review"
          value={counts.needs_judgment}
          dotColor={METRIC_DOT.review}
          href="/dashboard/review"
        />
      </div>
      */}

      {/* Plan usage */}
      <WeeklyStats />

      {/* Main grid: Proposals + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 sm:px-8 py-6">
        {/* Proposals */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-foreground">
              Needs your attention
              {proposals.length > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {proposals.length}
                </span>
              )}
            </h3>
            {reviewCounts.total > 0 && (
              <Link
                href="/dashboard/review"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View inbox <ArrowRight size={10} />
              </Link>
            )}
          </div>

          {proposals.length > 0 ? (
            <div className="divide-y divide-border">
              {proposals.map((p) => (
                <ProposalItem
                  key={`${p.app}-${p.title}`}
                  proposal={p}
                  logoUrl={logoMap[p.app?.toLowerCase()]}
                  onAction={handleProposalAction}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle2
                strokeWidth={1.25}
                size={24}
                className="text-emerald-400/40 mb-3"
              />
              <p className="text-sm text-muted-foreground">All caught up</p>
            </div>
          )}

          {/* Insight */}
          {insight && (
            <div className="mt-6 pt-4 border-t border-border flex items-start gap-3">
              <Sparkles
                strokeWidth={1.5}
                size={12}
                className="text-indigo-400/50 shrink-0 mt-0.5"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight}
              </p>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="lg:col-span-1">
          <ScheduleSection />
        </div>
      </div>
    </div>
  );
}

/* ─── Loading Skeleton ───────────────────────────────────── */

function LoadingSkeleton({ firstName }: { firstName?: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* ── Left column ──────────────────────────────────── */}
        <div className="flex flex-col px-6 sm:px-8 pt-8 sm:pt-10 pb-6">
          {/* Greeting */}
          <Skeleton className="h-6 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-8">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-2 mt-8">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>

          {/* Loading message */}
          <div className="mt-auto pt-12 flex flex-col items-center">
            <div className="mb-4 animate-pulse">
              <Logo className="w-10 h-10" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Preparing your briefing{firstName ? `, ${firstName}` : ""}...
            </p>
            <p className="text-xs text-muted-foreground">
              Your digital proxy is handling it.
            </p>
          </div>
        </div>

        {/* ── Right column — Schedule skeleton ─────────────── */}
        <div className="px-6 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-6 lg:border-l lg:border-white/[0.04]">
          {/* Schedule header + tabs */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-1">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-14 rounded-full" />
            </div>
          </div>

          {/* Timeline hour rows */}
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-3 border-t border-white/[0.04]"
              >
                <Skeleton className="h-3 w-10 shrink-0 mt-0.5" />
                {i === 2 || i === 4 ? (
                  <Skeleton className="h-14 flex-1 rounded-lg" />
                ) : (
                  <div className="flex-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function DashboardHome() {
  const { user } = useAuth();
  const { balanceData } = useBilling();
  const { openUpgrade } = useUpgradeDialog();
  const router = useRouter();
  const isFree = (balanceData?.subscription_tier ?? "free") === "free";
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
  const [showNudge, setShowNudge] = useState(false);
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  const [newEventCount, setNewEventCount] = useState(0);
  const [bootstrapMode, setBootstrapMode] = useState(false);
  const bootstrapPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchingRef = useRef(false);

  const fetchBriefingRef = useRef<((silent?: boolean) => void) | null>(null);

  const fetchBriefing = useCallback(
    async (silent = false) => {
      if (!user?.id) return;
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const intData = await api.get(`/integrations`).catch(() => null);
        const apps: string[] = [];
        if (intData?.integrations) {
          const map: Record<string, string> = {};
          for (const int of intData.integrations) {
            if (int.logo && int.appName)
              map[int.appName.toLowerCase()] = int.logo;
            if (int.status === "connected" && int.canDisconnect !== false)
              apps.push(int.appName);
          }
          setLogoMap(map);
        }
        setConnectedApps(apps.map((a) => a.toLowerCase()));

        if (apps.length === 0) {
          trackEvent("dashboard_no_apps_redirect");
          router.push("/dashboard/integrations");
          return;
        }
        setHasConnections(true);
        trackEvent("dashboard_loaded", {
          connected_apps: apps.length,
          tier: isFree ? "free" : "paid",
        });

        const [data, reviewData] = await Promise.all([
          api
            .get(`/dashboard/briefing${silent ? "?force=true" : ""}`)
            .catch((e: unknown) => {
              if (e instanceof Error && e.message.includes("403")) {
                return {
                  is_calm: true,
                  subtitle:
                    "Your free briefing trial has ended. Upgrade to get daily AI briefings.",
                  counts: { emails: 0, events: 0 },
                  events: [],
                  proposals: [],
                  insight: null,
                  _needs_upgrade: true,
                };
              }
              throw e;
            }),
          api.get(`/review?status=pending`).catch(() => null),
        ]);
        if (data) {
          setBriefing(data);
          // Auto-open upgrade dialog when trial has expired
          if ((data as any)._needs_upgrade) {
            openUpgrade("briefing");
          }
        }
        if (reviewData?.counts) setReviewCounts(reviewData.counts);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Couldn't load your briefing.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        fetchingRef.current = false;
      }
    },
    [user?.id],
  );

  // Keep ref in sync so realtime callback always calls the latest version
  fetchBriefingRef.current = fetchBriefing;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("bootstrap") === "true") {
      setBootstrapMode(true);
      window.history.replaceState({}, "", "/dashboard");
      const poll = setInterval(async () => {
        try {
          const status = await api.get("/dashboard/bootstrap-status");
          if (status.bootstrap_status === "completed" || status.bootstrap_status === "failed") {
            clearInterval(poll);
            setBootstrapMode(false);
            fetchBriefing();
          }
        } catch {
          // Ignore poll errors
        }
      }, 3000);
      bootstrapPollRef.current = poll;
      // Safety timeout: stop polling after 60 seconds and try anyway
      setTimeout(() => {
        if (bootstrapPollRef.current) {
          clearInterval(bootstrapPollRef.current);
          bootstrapPollRef.current = null;
          setBootstrapMode(false);
          fetchBriefing();
        }
      }, 60000);
      return;
    }
    fetchBriefing();
  }, [fetchBriefing]);

  // Cleanup bootstrap poll on unmount
  useEffect(() => {
    return () => {
      if (bootstrapPollRef.current) clearInterval(bootstrapPollRef.current);
    };
  }, []);

  // ── Supabase Realtime: listen for new trigger events ──
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`dashboard-events-${user.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "trigger_events",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          setNewEventCount((prev) => prev + 1);
          const slug = payload?.new?.trigger_slug || "";
          const source = payload?.new?.source || "";
          // Auto-refresh on bootstrap events or calendar triggers
          if (source === "bootstrap" || slug.startsWith("GOOGLECALENDAR")) {
            fetchBriefingRef.current?.(true);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !briefing || connectedApps.length === 0) return;
    const nudgeKey = `calmpilot_nudge_dismissed_${user.id}`;
    if (localStorage.getItem(nudgeKey)) return;
    const hasSlack = connectedApps.includes("slack");
    const hasCalendar = connectedApps.includes("googlecalendar");
    if (!hasSlack || !hasCalendar) setShowNudge(true);
  }, [user?.id, briefing, connectedApps]);

  const dismissNudge = () => {
    setShowNudge(false);
    if (user?.id) {
      localStorage.setItem(`calmpilot_nudge_dismissed_${user.id}`, "1");
    }
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  if (bootstrapMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Logo className="w-12 h-12 mx-auto mb-6 animate-pulse" />
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Preparing your briefing, {firstName}...
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-8">
          CalmPilot is connecting to your apps and preparing your first
          daily briefing. This takes about 30 seconds.
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <RefreshCw size={14} className="animate-spin" />
          <span>Fetching your data...</span>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton firstName={firstName} />;

  if (hasConnections === false) {
    return <OnboardingState firstName={firstName} />;
  }

  // Free users don't get briefings
  if (isFree && !briefing && !loading) {
    return (
      <CalmState
        firstName={firstName}
        reviewCounts={reviewCounts}
        briefing={null}
        userId={user?.id}
        connectedApps={connectedApps}
      />
    );
  }

  if (error && !briefing) {
    const isCredits = error === "INSUFFICIENT_CREDITS";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        {isCredits ? (
          <div className="text-center space-y-5 max-w-xs">
            <Logo className="w-10 h-10 mx-auto opacity-50" />
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                Plan limit reached
              </h3>
              <p className="text-sm text-muted-foreground">
                Upgrade your plan to continue using CalmPilot.
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => openUpgrade()}>
              <Sparkles strokeWidth={1.75} size={13} />
              Upgrade
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              size="sm"
              onClick={() => fetchBriefing(true)}
              className="gap-2"
            >
              <RefreshCw strokeWidth={1.75} size={13} />
              Try again
            </Button>
          </div>
        )}
      </div>
    );
  }

  /* Nudge banner */
  const nudgeBanner = showNudge ? (
    <div className="mx-6 sm:mx-8 mb-4 flex items-center gap-4 pl-4 border-l-2 border-indigo-500/30">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">
          {!connectedApps.includes("slack")
            ? "Connect Slack to include your team messages."
            : "Connect Google Calendar to include your meetings."}
        </p>
      </div>
      <button
        onClick={() =>
          router.push(
            `/dashboard/integrations?connect=${!connectedApps.includes("slack") ? "slack" : "googlecalendar"}`,
          )
        }
        className="shrink-0 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
      >
        Connect
      </button>
      <button
        onClick={dismissNudge}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X strokeWidth={1.75} size={14} />
      </button>
    </div>
  ) : null;

  // New events banner
  const newEventsBanner =
    newEventCount > 0 ? (
      <button
        onClick={() => {
          setNewEventCount(0);
          fetchBriefing(true);
        }}
        className="mx-6 sm:mx-8 mt-3 w-[calc(100%-3rem)] sm:w-[calc(100%-4rem)] flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/[0.05] text-[13px] text-indigo-300 hover:bg-indigo-500/[0.08] transition-colors"
      >
        <RefreshCw size={12} strokeWidth={1.5} />
        {newEventCount} new {newEventCount === 1 ? "event" : "events"} — tap to
        refresh
      </button>
    ) : null;

  if (!briefing || briefing.is_calm) {
    return (
      <>
        <CalmState
          firstName={firstName}
          briefing={briefing}
          reviewCounts={reviewCounts}
          onRefresh={() => {
            setNewEventCount(0);
            fetchBriefing(true);
          }}
          refreshing={refreshing}
          userId={user?.id}
          connectedApps={connectedApps}
        />
        {newEventsBanner}
        {nudgeBanner}
      </>
    );
  }

  return (
    <>
      <ActiveState
        firstName={firstName}
        briefing={briefing}
        logoMap={logoMap}
        reviewCounts={reviewCounts}
        onRefresh={() => {
          setNewEventCount(0);
          fetchBriefing(true);
        }}
        refreshing={refreshing}
      />
      {nudgeBanner}
    </>
  );
}
