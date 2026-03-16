"use client";

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

/** Replace legacy "Aariv" branding that the backend may still return */
const sanitizeBranding = (text: string) => text.replace(/\bAariv\b/g, "CalmPilot");

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

/* ─── Page Header (shared across states) ─────────────────── */

function PageHeader({
  title,
  subtitle,
  onRefresh,
  refreshing,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Regenerate your daily briefing — re-fetches calendar, emails, and app data"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors text-neutral-400 hover:text-white disabled:opacity-40 text-xs font-medium"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh briefing"}
        </button>
      )}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────── */

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
  const inner = (
    <div className="border-r border-white/[0.06] last:border-r-0 px-5 py-4 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon size={13} strokeWidth={1.75} className="text-neutral-600" />
        <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <span className="text-2xl font-semibold text-white tabular-nums leading-none">
        {value}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:bg-white/[0.02] transition-colors">
        {inner}
      </Link>
    );
  }
  return <div>{inner}</div>;
}

/* ─── Proposal Row ───────────────────────────────────────── */

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
  const isHigh = proposal.priority === "high";

  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors group">
      {/* App icon — colored fallback always rendered, logo fades in on load */}
      <div className="w-7 h-7 rounded-lg shrink-0 mt-0.5 relative overflow-hidden" style={{ background: color }}>
        <span className="absolute inset-0 flex items-center justify-center text-white">
          {icon}
        </span>
        {logoUrl && (
          <img
            src={logoUrl}
            alt={proposal.app}
            className="absolute inset-0 w-full h-full object-contain p-1 bg-[#111319] opacity-0 transition-opacity duration-200"
            loading="lazy"
            decoding="async"
            onLoad={(e) => { e.currentTarget.style.opacity = "1"; }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-white leading-snug truncate">
            {proposal.title}
          </p>
          {isHigh && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Urgent
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-1">
          {proposal.description}
        </p>
      </div>

      {/* Actions */}
      {proposal.actions.length > 0 && (
        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {proposal.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction?.(proposal, action)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                i === 0
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-white/[0.05] text-white hover:bg-white/10 border border-white/[0.08]"
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Calendar Row ───────────────────────────────────────── */

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

  return (
    <div
      className={`flex items-center gap-4 px-5 py-3 border-b border-white/[0.05] last:border-0 transition-colors ${
        isPast
          ? "opacity-40"
          : isNext
            ? "bg-white/[0.03] border-l-2 border-l-amber-500/70"
            : ""
      }`}
    >
      <div className="w-20 shrink-0">
        <span className={`text-[11px] font-medium tabular-nums ${isPast ? "text-neutral-600" : "text-neutral-400"}`}>
          {time}
        </span>
        {endTime && (
          <span className="text-[10px] text-neutral-600 ml-1">– {endTime}</span>
        )}
      </div>
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPast ? "opacity-50" : ""}`}
        style={{ backgroundColor: event.color || (isPast ? "#525252" : "#f59e0b") }}
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isPast ? "text-neutral-500 line-through" : "text-white"}`}>
          {event.title}
        </p>
      </div>
      {isNext && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/80 shrink-0">
          Next
        </span>
      )}
    </div>
  );
}

function findNextEventIndex(events: CalendarEvent[]): number {
  const now = new Date();
  return events.findIndex(
    (e) => new Date(e.endTime || e.startTime) >= now,
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
    description: "Track meetings, schedule events, and stay on top of your day.",
    color: "#4285F4",
    icon: <Calendar strokeWidth={1.75} size={16} />,
    free: true,
  },
  {
    slug: "slack",
    name: "Slack",
    description: "Monitor channels, respond to messages, and manage notifications.",
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
      <PageHeader title="Overview" subtitle={formatDate()} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-lg mx-auto w-full">
        {/* Welcome */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
            <Sparkles strokeWidth={1.75} size={20} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Welcome, {firstName}
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Connect your first app so CalmPilot can start managing your day.
          </p>
        </div>

        {/* App list */}
        <div className="w-full border border-white/[0.06] rounded-lg overflow-hidden mb-4">
          {RECOMMENDED_APPS.map((app) => (
            <button
              key={app.slug}
              onClick={() => router.push(`/dashboard/integrations?connect=${app.slug}`)}
              className="w-full flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors text-left group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 relative overflow-hidden"
                style={{ backgroundColor: app.color }}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {app.icon}
                </span>
                {getLogo(app.slug) && (
                  <img
                    src={getLogo(app.slug)}
                    alt={app.name}
                    className="absolute inset-0 w-full h-full object-contain p-1.5 bg-[#111319] opacity-0 transition-opacity duration-200"
                    loading="lazy"
                    decoding="async"
                    onLoad={(e) => { e.currentTarget.style.opacity = "1"; }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {/* <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{app.name}</span>
                  {app.free && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                      Free
                    </span>
                  )}
                </div> */}
                <p className="text-xs text-neutral-500 mt-0.5 truncate">
                  {app.description}
                </p>
              </div>
              <ArrowRight
                size={14}
                strokeWidth={1.75}
                className="text-neutral-600 group-hover:text-white transition-colors shrink-0"
              />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => router.push("/dashboard/integrations")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-white text-black text-sm font-medium hover:bg-neutral-100 transition-colors"
          >
            <Plug strokeWidth={1.75} size={14} />
            Browse all apps
          </button>
          <button
            onClick={() => router.push("/dashboard/assistant")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-white/[0.1] text-sm font-medium text-white hover:bg-white/[0.04] transition-colors"
          >
            <Sparkles strokeWidth={1.75} size={14} />
            Skip to chat
          </button>
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
      <PageHeader
        title="Overview"
        subtitle={formatDate()}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.06]">
        <StatCard label="Meetings" value={briefing?.counts.meetings ?? 0} icon={Calendar} />
        <StatCard label="Focus Hours" value={`${briefing?.counts.focus_hours ?? 0}h`} icon={Clock} />
        <StatCard label="Emails" value={briefing?.counts.emails ?? 0} icon={Mail} href="/dashboard/review" />
        <StatCard label="Pending" value={reviewCounts.total} icon={CheckCircle2} href="/dashboard/review" />
      </div>

      {/* All caught up */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
          <CheckCircle2 strokeWidth={1.75} size={18} className="text-neutral-500" />
        </div>
        <h2 className="text-sm font-semibold text-white mb-1">
          {getGreeting()}, {firstName}
        </h2>
        <p className="text-xs text-neutral-500 max-w-xs leading-relaxed mb-8">
          {sanitizeBranding(briefing?.subtitle || "Nothing needs your attention right now. Your day is running smoothly.")}
        </p>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => router.push("/dashboard/assistant")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-white/[0.1] text-xs font-medium text-white hover:bg-white/[0.04] transition-colors"
          >
            <Sparkles strokeWidth={1.75} size={13} />
            Ask CalmPilot
          </button>
          <button
            onClick={() => router.push("/dashboard/triggers")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-white/[0.1] text-xs font-medium text-white hover:bg-white/[0.04] transition-colors"
          >
            <Zap strokeWidth={1.75} size={13} />
            Automations
          </button>
          {reviewCounts.total > 0 && (
            <Link
              href="/dashboard/review"
              className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-white/[0.1] text-xs font-medium text-white hover:bg-white/[0.04] transition-colors"
            >
              <CheckCircle2 strokeWidth={1.75} size={13} />
              {reviewCounts.total} to review
              {reviewCounts.high > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold">
                  {reviewCounts.high} urgent
                </span>
              )}
            </Link>
          )}
          <Link
            href="/dashboard/feed"
            className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-white/[0.1] text-xs font-medium text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <Activity strokeWidth={1.75} size={13} />
            View activity
          </Link>
        </div>

        {/* Upcoming events */}
        {calendarEvents.length > 0 && (
          <div className="mt-10 w-full max-w-sm border border-white/[0.06] rounded-lg overflow-hidden text-left">
            <div className="px-4 py-2.5 border-b border-white/[0.06]">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                Today&apos;s schedule
              </p>
            </div>
            {(() => {
              const nextIdx = findNextEventIndex(calendarEvents);
              return calendarEvents.map((event, i) => (
                <CalendarRow key={event.id} event={event} isNext={i === nextIdx} />
              ));
            })()}
          </div>
        )}

        {/* Insight */}
        {insight && (
          <div className="mt-6 flex items-start gap-3 border border-white/[0.06] rounded-lg px-4 py-3 max-w-sm w-full text-left">
            <Sparkles strokeWidth={1.75} size={14} className="text-neutral-500 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-500 leading-relaxed">{sanitizeBranding(insight)}</p>
          </div>
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
      <PageHeader
        title="Overview"
        subtitle={`${getGreeting()}, ${firstName} · ${formatDate()}`}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.06]">
        <StatCard label="Meetings" value={counts.meetings} icon={Calendar} />
        <StatCard label="Focus Hours" value={`${counts.focus_hours}h`} icon={Clock} />
        <StatCard label="Emails" value={counts.emails} icon={Mail} href="/dashboard/review" />
        <StatCard label="Needs Judgment" value={counts.needs_judgment} icon={Target} href="/dashboard/review" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 divide-x divide-white/[0.05] min-h-0">

        {/* Left: Proposals */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
              Proposals
            </p>
            {reviewCounts.total > 0 && (
              <Link
                href="/dashboard/review"
                className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
              >
                View inbox
                <ArrowRight size={11} strokeWidth={1.75} />
              </Link>
            )}
          </div>

          {proposals.length > 0 ? (
            <div className="divide-y divide-white/[0.05]">
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
              <CheckCircle2 strokeWidth={1.75} size={20} className="text-neutral-700 mb-3" />
              <p className="text-sm text-neutral-500">No proposals right now.</p>
            </div>
          )}

          {/* Insight */}
          {insight && (
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-start gap-3">
              <Sparkles strokeWidth={1.75} size={13} className="text-neutral-600 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-500 leading-relaxed">{sanitizeBranding(insight)}</p>
            </div>
          )}
        </div>

        {/* Right: Calendar */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
              Today&apos;s schedule
            </p>
          </div>

          {events.length > 0 ? (
            <div className="divide-y divide-white/[0.05]">
              {(() => {
                const nextIdx = findNextEventIndex(events);
                return events.map((event, i) => (
                  <CalendarRow key={event.id} event={event} isNext={i === nextIdx} />
                ));
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-12 px-6 text-center">
              <Calendar strokeWidth={1.75} size={20} className="text-neutral-700 mb-3" />
              <p className="text-sm text-neutral-500">No events today</p>
            </div>
          )}
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
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-white">Overview</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{formatDate()}</p>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.06]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-r border-white/[0.06] last:border-r-0 px-5 py-4 space-y-2">
            <div className="h-2.5 w-16 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-7 w-10 rounded bg-white/[0.06] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Greeting center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-sm font-semibold text-white mb-1">
          Rest easy{firstName ? `, ${firstName}` : ""}
        </p>
        <p className="text-xs text-neutral-500">
          Your digital proxy is handling it.
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function DashboardHome() {
  const { user } = useAuth();
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
      if (fetchingRef.current) return; // prevent concurrent fetches
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
            if (int.logo && int.appName) map[int.appName.toLowerCase()] = int.logo;
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
        setError(err instanceof Error ? err.message : "Couldn't load your briefing.");
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
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
              <CreditCard strokeWidth={1.75} size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Out of credits</h3>
              <p className="text-xs text-neutral-500">Add credits to continue using CalmPilot.</p>
            </div>
            <a
              href="/dashboard/usage"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black text-xs font-medium hover:bg-neutral-100 transition-colors"
            >
              <CreditCard strokeWidth={1.75} size={13} />
              Add Credits
            </a>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-neutral-500">{error}</p>
            <button
              onClick={() => fetchBriefing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black text-xs font-medium hover:bg-neutral-100 transition-colors"
            >
              <Loader2 strokeWidth={1.75} size={13} />
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  /* Nudge banner */
  const nudgeBanner = showNudge ? (
    <div className="px-5 py-3 border-t border-white/[0.06] flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white">Want a fuller brief?</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {!connectedApps.includes("slack")
            ? "Connect Slack to include your team messages."
            : "Connect Google Calendar to include your meetings."}
        </p>
      </div>
      <Link
        href={`/dashboard/integrations?connect=${!connectedApps.includes("slack") ? "slack" : "googlecalendar"}`}
        className="shrink-0 px-3 py-1.5 rounded-md border border-white/[0.1] text-xs font-medium text-white hover:bg-white/[0.04] transition-colors"
      >
        Connect
      </Link>
      <button
        onClick={dismissNudge}
        className="shrink-0 text-neutral-600 hover:text-white transition-colors"
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
