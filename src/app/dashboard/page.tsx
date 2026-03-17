"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useLogo } from "@/context/LogoContext";
import { api } from "@/lib/api";
import { getAppColor, getAppIcon } from "@/lib/appMeta";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  MessageSquare,
  Plug,
  RefreshCw,
  Sparkles,
  Target,
  X,
  Zap,
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

const sanitizeBranding = (text: string) =>
  text.replace(/\bAariv\b/g, "CalmPilot");

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

/* ─── Stat Card ──────────────────────────────────────────── */

const STAT_COLORS: Record<string, { bg: string; icon: string; ring: string }> =
  {
    Meetings: {
      bg: "bg-violet-500/10",
      icon: "text-violet-400",
      ring: "ring-violet-500/20",
    },
    "Focus Hours": {
      bg: "bg-sky-500/10",
      icon: "text-sky-400",
      ring: "ring-sky-500/20",
    },
    Emails: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-400",
      ring: "ring-emerald-500/20",
    },
    Pending: {
      bg: "bg-amber-500/10",
      icon: "text-amber-400",
      ring: "ring-amber-500/20",
    },
    "Needs Judgment": {
      bg: "bg-amber-500/10",
      icon: "text-amber-400",
      ring: "ring-amber-500/20",
    },
  };

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  href?: string;
}) {
  const colors = STAT_COLORS[label] ?? {
    bg: "bg-muted",
    icon: "text-muted-foreground",
    ring: "ring-border",
  };
  const inner = (
    <Card className="border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer group shadow-none">
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}
        >
          <Icon size={16} strokeWidth={1.75} className={colors.icon} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums leading-tight mt-0.5">
            {value}
          </p>
        </div>
        {href && (
          <ArrowRight
            size={14}
            strokeWidth={1.75}
            className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors ml-auto shrink-0"
          />
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

/* ─── Proposal Row ───────────────────────────────────────── */

const PRIORITY_STYLES = {
  high: {
    bar: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    label: "Urgent",
  },
  medium: {
    bar: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    label: "Medium",
  },
  low: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    label: "Low",
  },
};

function ProposalRow({
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
  const p = PRIORITY_STYLES[proposal.priority] ?? PRIORITY_STYLES.low;
  const reviewLink = `/dashboard/review?q=${encodeURIComponent(proposal.title)}`;

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/40 transition-colors group relative">
      {/* Priority bar */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full ${p.bar}`}
      />

      {/* App icon */}
      <DashboardAppLogo
        logoUrl={logoUrl}
        alt={proposal.app}
        color={color}
        icon={icon}
        className="w-8 h-8 rounded-lg shrink-0 mt-0.5"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <Link
            href={reviewLink}
            className="text-sm font-medium text-foreground leading-snug truncate hover:underline underline-offset-2 max-w-[260px]"
          >
            {proposal.title}
          </Link>
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] px-1.5 py-0 ${p.badge}`}
          >
            {p.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
          {proposal.description}
        </p>
      </div>

      {/* Actions (show on hover) */}
      {proposal.actions.length > 0 && (
        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {proposal.actions.slice(0, 2).map((action, i) => (
            <Button
              key={i}
              size="sm"
              variant={i === 0 ? "default" : "outline"}
              className="h-7 text-xs px-2.5"
              onClick={() => onAction?.(proposal, action)}
            >
              {action}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

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

/* ─── Calendar Row ───────────────────────────────────────── */

const EVENT_ACCENT_COLORS = [
  "#818cf8", // violet
  "#38bdf8", // sky
  "#34d399", // emerald
  "#fb923c", // orange
  "#f472b6", // pink
  "#a78bfa", // purple
];

function getEventColor(eventId: string, overrideColor?: string | null): string {
  if (overrideColor) return overrideColor;
  // Deterministic color from event id
  let hash = 0;
  for (let i = 0; i < (eventId?.length ?? 0); i++)
    hash = eventId.charCodeAt(i) + ((hash << 5) - hash);
  return EVENT_ACCENT_COLORS[Math.abs(hash) % EVENT_ACCENT_COLORS.length];
}

function CalendarRow({
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
      className={`mx-3 mb-2 rounded-xl p-3 transition-all cursor-default group ${
        isPast
          ? "opacity-40 bg-muted/20"
          : isNext
            ? "bg-muted/60 ring-1 ring-border"
            : "bg-muted/35 hover:bg-muted/55"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Colored accent bar */}
        <div
          className="w-[3px] rounded-full shrink-0 mt-0.5"
          style={{
            height: endTime ? "36px" : "20px",
            backgroundColor: accentColor,
            opacity: isPast ? 0.3 : 1,
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold leading-snug truncate ${isPast ? "text-muted-foreground" : "text-foreground"}`}
          >
            {event.title}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span
              className="text-[11px] tabular-nums font-medium px-1.5 py-0.5 rounded-md"
              style={{
                backgroundColor: isPast ? "transparent" : `${accentColor}18`,
                color: isPast ? "var(--muted-foreground)" : accentColor,
              }}
            >
              {time}
            </span>
            {endTime && (
              <>
                <span className="text-[10px] text-muted-foreground/30">—</span>
                <span className="text-[11px] tabular-nums text-muted-foreground/50">
                  {endTime}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Next badge */}
        {isNext && (
          <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
              Now
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function findNextEventIndex(events: CalendarEvent[]): number {
  const now = new Date();
  return events.findIndex((e) => new Date(e.endTime || e.startTime) >= now);
}

/* ─── Calendar Section (today / week toggle) ─────────────── */

type CalendarView = "today" | "week";

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

function formatDayHeading(dateStr: string): {
  label: string;
  sub: string;
  isToday: boolean;
  isTomorrow: boolean;
} {
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

function CalendarEmptyState({ label, sub }: { label: string; sub: string }) {
  const now = new Date();
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] flex flex-col items-center justify-center gap-0.5">
          <span className="text-[10px] font-bold text-violet-400/80 uppercase tracking-[0.15em] leading-none">
            {now.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-[28px] font-bold text-foreground leading-none">
            {now.getDate()}
          </span>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-2xl -z-10 scale-75" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
          {sub}
        </p>
      </div>
    </div>
  );
}

function CalendarSection({ todayEvents }: { todayEvents: CalendarEvent[] }) {
  const [view, setView] = useState<CalendarView>("today");
  const [weekEvents, setWeekEvents] = useState<Record<string, CalendarEvent[]>>(
    {},
  );
  const [loadingWeek, setLoadingWeek] = useState(false);
  const weekFetched = useRef(false);

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

  const handleViewChange = (v: CalendarView) => {
    setView(v);
    if (v === "week") fetchWeek();
  };

  const todayCount = todayEvents.length;
  const weekCount = Object.values(weekEvents).reduce(
    (s, evs) => s + evs.length,
    0,
  );

  return (
    <Card className="h-full flex flex-col border border-border bg-card overflow-hidden">
      <div className="px-4 pt-4 pb-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-500/10 flex items-center justify-center">
            <Calendar size={13} strokeWidth={2} className="text-violet-400" />
          </div>
          <span className="text-xs font-bold text-foreground/70 uppercase tracking-[0.12em]">
            Schedule
          </span>
        </div>

        <div className="flex items-center gap-0 border-b border-border">
          {(["today", "week"] as const).map((v) => {
            const active = view === v;
            const count = v === "today" ? todayCount : weekCount;
            return (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={`relative flex items-center gap-1.5 px-3 pb-2.5 pt-0.5 text-xs font-semibold transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {v === "today" ? "Today" : "This week"}
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-px rounded-full font-bold tabular-nums ${
                      active
                        ? "bg-violet-500/20 text-violet-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <CardContent className="p-0 pt-2 h-[320px] sm:h-[360px] overflow-y-auto">
        {view === "today" ? (
          todayEvents.length > 0 ? (
            (() => {
              const nextIdx = findNextEventIndex(todayEvents);
              return todayEvents.map((event, i) => (
                <CalendarRow
                  key={event.id}
                  event={event}
                  isNext={i === nextIdx}
                />
              ));
            })()
          ) : (
            <CalendarEmptyState
              label="You're free today"
              sub="No events scheduled — enjoy the open time"
            />
          )
        ) : loadingWeek ? (
          <div className="px-3 pt-1 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-card p-3 flex items-center gap-3 border border-border"
              >
                <Skeleton className="h-9 w-[3px] rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4 rounded-md" />
                  <Skeleton className="h-2.5 w-1/3 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(weekEvents).length > 0 ? (
          Object.entries(weekEvents)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateKey, events]) => {
              const heading = formatDayHeading(dateKey);
              return (
                <div key={dateKey} className="mb-1">
                  <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-1.5 bg-card/95 backdrop-blur-sm">
                    <span
                      className={`text-[11px] font-bold tracking-wide ${
                        heading.isToday
                          ? "text-violet-400"
                          : heading.isTomorrow
                            ? "text-amber-400"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      {heading.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">
                      {heading.sub}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground/40">
                      {events.length} event{events.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {events.map((event, i) => (
                    <CalendarRow
                      key={event.id}
                      event={event}
                      isNext={
                        heading.isToday && i === findNextEventIndex(events)
                      }
                    />
                  ))}
                </div>
              );
            })
        ) : (
          <CalendarEmptyState
            label="Clear week ahead"
            sub="No events this week"
          />
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Recommended apps for onboarding ─────────────────────── */

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
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate()}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-lg mx-auto w-full">
        {/* Welcome */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
            <Sparkles
              strokeWidth={1.75}
              size={22}
              className="text-violet-400"
            />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Welcome, {firstName}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your first app so CalmPilot can start managing your day.
          </p>
        </div>

        {/* App list */}
        <Card className="w-full mb-5 border border-border bg-card">
          <CardContent className="p-0 divide-y divide-border">
            {RECOMMENDED_APPS.map((app) => (
              <button
                key={app.slug}
                onClick={() =>
                  router.push(`/dashboard/integrations?connect=${app.slug}`)
                }
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors text-left group"
              >
                <div className="shrink-0">
                  <DashboardAppLogo
                    logoUrl={getLogo(app.slug)}
                    alt={app.name}
                    color={app.color}
                    icon={app.icon}
                    className="w-9 h-9 rounded-xl"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {app.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {app.description}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  strokeWidth={1.75}
                  className="text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0"
                />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => router.push("/dashboard/integrations")}
            className="flex-1 gap-2"
          >
            <Plug strokeWidth={1.75} size={14} />
            Browse all apps
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/assistant")}
            className="flex-1 gap-2"
          >
            <Sparkles strokeWidth={1.75} size={14} />
            Skip to chat
          </Button>
        </div>
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
}: {
  firstName: string;
  briefing?: Briefing | null;
  reviewCounts?: ReviewCounts;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const router = useRouter();
  const calendarEvents = briefing?.events ?? [];
  const insight = briefing?.insight;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate()}</p>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 pb-0">
        <StatCard
          label="Meetings"
          value={briefing?.counts.meetings ?? 0}
          icon={Calendar}
        />
        <StatCard
          label="Focus Hours"
          value={`${briefing?.counts.focus_hours ?? 0}h`}
          icon={Clock}
        />
        <StatCard
          label="Emails"
          value={briefing?.counts.emails ?? 0}
          icon={Mail}
          href="/dashboard/review"
        />
        <StatCard
          label="Pending"
          value={reviewCounts.total}
          icon={CheckCircle2}
          href="/dashboard/review"
        />
      </div>

      {/* All-clear + actions */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Icon */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2
              strokeWidth={1.5}
              size={26}
              className="text-emerald-400"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-[8px] font-bold text-emerald-400">✓</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-foreground mb-1.5">
          {getGreeting()}, {firstName}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
          {sanitizeBranding(
            briefing?.subtitle ||
              "Nothing needs your attention right now. Your day is running smoothly.",
          )}
        </p>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 justify-center">
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
            onClick={() => router.push("/dashboard/triggers")}
            className="gap-2"
          >
            <Zap strokeWidth={1.75} size={13} />
            Automations
          </Button>
          {reviewCounts.total > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => router.push("/dashboard/review")}
            >
              <CheckCircle2 strokeWidth={1.75} size={13} />
              {reviewCounts.total} to review
              {reviewCounts.high > 0 && (
                <Badge className="ml-1 px-1.5 py-0 text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10">
                  {reviewCounts.high} urgent
                </Badge>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => router.push("/dashboard/feed")}
          >
            <Activity strokeWidth={1.75} size={13} />
            View activity
          </Button>
        </div>

        {/* Schedule */}
        <div className="mt-10 w-full max-w-sm text-left">
          <CalendarSection todayEvents={calendarEvents} />
        </div>

        {/* Insight */}
        {insight && (
          <Card className="mt-4 max-w-sm w-full text-left border border-border bg-card">
            <CardContent className="p-4 flex items-start gap-3">
              <Sparkles
                strokeWidth={1.75}
                size={14}
                className="text-violet-400 shrink-0 mt-0.5"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {sanitizeBranding(insight)}
              </p>
            </CardContent>
          </Card>
        )}
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
  const { counts, proposals, events, insight } = briefing;

  const handleProposalAction = (proposal: Proposal, action: string) => {
    const prompt = encodeURIComponent(
      `${action} for: "${proposal.title}"\n\nBackground: ${proposal.description}`,
    );
    router.push(`/dashboard/assistant?prompt=${prompt}`);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-foreground">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate()}</p>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 pb-0">
        <StatCard label="Meetings" value={counts.meetings} icon={Calendar} />
        <StatCard
          label="Focus Hours"
          value={`${counts.focus_hours}h`}
          icon={Clock}
        />
        <StatCard
          label="Emails"
          value={counts.emails}
          icon={Mail}
          href="/dashboard/review"
        />
        <StatCard
          label="Needs Judgment"
          value={counts.needs_judgment}
          icon={Target}
          href="/dashboard/review"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 min-h-0">
        {/* Left: Proposals */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col border border-border bg-card">
            <CardHeader className="px-4 py-3 border-b border-border flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Proposals
                {proposals.length > 0 && (
                  <span className="ml-2 text-xs font-semibold text-foreground normal-case tracking-normal">
                    {proposals.length}
                  </span>
                )}
              </CardTitle>
              {reviewCounts.total > 0 && (
                <Link
                  href="/dashboard/review"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View inbox
                  <ArrowRight size={11} strokeWidth={1.75} />
                </Link>
              )}
            </CardHeader>

            <CardContent className="p-0 flex-1">
              {proposals.length > 0 ? (
                <div>
                  {proposals.map((p) => (
                    <ProposalRow
                      key={`${p.app}-${p.title}`}
                      proposal={p}
                      logoUrl={logoMap[p.app?.toLowerCase()]}
                      onAction={handleProposalAction}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-16 px-6 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <CheckCircle2
                      strokeWidth={1.75}
                      size={18}
                      className="text-emerald-400"
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    All caught up
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No proposals right now.
                  </p>
                </div>
              )}
            </CardContent>

            {/* Insight */}
            {insight && (
              <div className="px-4 py-3 border-t border-border flex items-start gap-3">
                <Sparkles
                  strokeWidth={1.75}
                  size={13}
                  className="text-violet-400 shrink-0 mt-0.5"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sanitizeBranding(insight)}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Calendar */}
        <div className="lg:col-span-2">
          <CalendarSection todayEvents={events} />
        </div>
      </div>
    </div>
  );
}

/* ─── Loading skeleton ───────────────────────────────────── */

function LoadingSkeleton({ firstName }: { firstName?: string }) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate()}</p>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 pb-0">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-7 w-10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading message */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/15 to-blue-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
          <Sparkles
            strokeWidth={1.5}
            size={22}
            className="text-violet-400 animate-pulse"
          />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">
          Preparing your briefing{firstName ? `, ${firstName}` : ""}…
        </p>
        <p className="text-xs text-muted-foreground">
          Your digital proxy is handling it.
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();
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
  const step3Tracked = useRef(false);
  const fetchingRef = useRef(false);

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
          setHasConnections(false);
          return;
        }
        setHasConnections(true);

        const [data, reviewData] = await Promise.all([
          api.get(`/dashboard/briefing${silent ? "?force=true" : ""}`),
          api.get(`/review?status=pending`).catch(() => null),
        ]);
        setBriefing(data);
        if (reviewData?.counts) setReviewCounts(reviewData.counts);

        if (!step3Tracked.current) {
          step3Tracked.current = true;
          api.patch("/auth/onboarding-step", { step: 3 }).catch(() => {});
        }
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

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

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
      api.patch("/auth/onboarding-step", { step: 4 }).catch(() => {});
    }
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) return <LoadingSkeleton firstName={firstName} />;

  if (hasConnections === false) {
    return <OnboardingState firstName={firstName} />;
  }

  if (error && !briefing) {
    const isCredits = error === "INSUFFICIENT_CREDITS";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        {isCredits ? (
          <div className="text-center space-y-4 max-w-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
              <CreditCard
                strokeWidth={1.75}
                size={22}
                className="text-amber-400"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Out of credits
              </h3>
              <p className="text-xs text-muted-foreground">
                Add credits to continue using CalmPilot.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => router.push("/dashboard/usage")}
            >
              <CreditCard strokeWidth={1.75} size={13} />
              Add Credits
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
              <Loader2 strokeWidth={1.75} size={13} />
              Try again
            </Button>
          </div>
        )}
      </div>
    );
  }

  /* Nudge banner */
  const nudgeBanner = showNudge ? (
    <div className="mx-4 mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">
          Want a fuller brief?
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {!connectedApps.includes("slack")
            ? "Connect Slack to include your team messages."
            : "Connect Google Calendar to include your meetings."}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() =>
          router.push(
            `/dashboard/integrations?connect=${!connectedApps.includes("slack") ? "slack" : "googlecalendar"}`,
          )
        }
      >
        Connect
      </Button>
      <button
        onClick={dismissNudge}
        className="shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors"
      >
        <X strokeWidth={1.75} size={14} />
      </button>
    </div>
  ) : null;

  if (!briefing || briefing.is_calm) {
    return (
      <>
        <CalmState
          firstName={firstName}
          briefing={briefing}
          reviewCounts={reviewCounts}
          onRefresh={() => fetchBriefing(true)}
          refreshing={refreshing}
        />
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
        onRefresh={() => fetchBriefing(true)}
        refreshing={refreshing}
      />
      {nudgeBanner}
    </>
  );
}
