"use client";

import type { CalendarCard, DataCardGroup, EmailCard, MessageCard } from "@/lib/types";
import { Calendar, Clock, Hash, Mail, MapPin, MessageSquare, Users } from "lucide-react";

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatTimeRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime())) return start;
    const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
    const dayOpts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    const day = s.toLocaleDateString(undefined, dayOpts);
    const startTime = s.toLocaleTimeString(undefined, opts);
    const endTime = isNaN(e.getTime()) ? "" : ` - ${e.toLocaleTimeString(undefined, opts)}`;
    return `${day}, ${startTime}${endTime}`;
  } catch {
    return start;
  }
}

function extractName(sender: string): string {
  // "John Doe <john@example.com>" -> "John Doe"
  const match = sender.match(/^(.+?)\s*<.*>$/);
  return match ? match[1].trim() : sender.split("@")[0];
}

function EmailDataCard({ card }: { card: EmailCard }) {
  const name = extractName(card.sender);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--border-hover,rgba(255,255,255,0.1))] transition-colors">
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 text-sm font-semibold">
          {initial}
        </div>
        {card.isUnread && (
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-[var(--bg-deep)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${card.isUnread ? "font-semibold text-[var(--text-primary)]" : "font-medium text-[var(--text-secondary)]"}`}>
            {name}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] shrink-0">{formatRelativeTime(card.date)}</span>
        </div>
        <p className="text-sm text-[var(--text-primary)] truncate mt-0.5">{card.subject}</p>
        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{card.snippet}</p>
      </div>
    </div>
  );
}

function CalendarDataCard({ card }: { card: CalendarCard }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--border-hover,rgba(255,255,255,0.1))] transition-colors">
      <div className="w-1 self-stretch rounded-full bg-[var(--accent)] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{card.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={12} className="text-[var(--text-muted)] shrink-0" />
          <span className="text-xs text-[var(--text-secondary)]">{formatTimeRange(card.startTime, card.endTime)}</span>
        </div>
        {card.location && (
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-[var(--text-muted)] shrink-0" />
            <span className="text-xs text-[var(--text-secondary)] truncate">{card.location}</span>
          </div>
        )}
        {card.attendees && card.attendees.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <Users size={12} className="text-[var(--text-muted)] shrink-0" />
            <span className="text-xs text-[var(--text-muted)]">{card.attendees.length} attendee{card.attendees.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageDataCard({ card }: { card: MessageCard }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--border-hover,rgba(255,255,255,0.1))] transition-colors">
      <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 text-xs font-semibold shrink-0">
        {card.sender.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{card.sender}</p>
          <span className="text-[11px] text-[var(--text-muted)] shrink-0">{formatRelativeTime(card.timestamp)}</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-2">{card.content}</p>
        {card.channel && (
          <div className="flex items-center gap-1 mt-1">
            <Hash size={11} className="text-[var(--text-muted)]" />
            <span className="text-[11px] text-[var(--text-muted)]">{card.channel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const CARD_ICONS = {
  email: Mail,
  calendar: Calendar,
  message: MessageSquare,
};

const CARD_LABELS = {
  email: "email",
  calendar: "event",
  message: "message",
};

export function DataCard({ cardType, cards }: DataCardGroup) {
  if (!cards || cards.length === 0) return null;

  const Icon = CARD_ICONS[cardType] || Mail;
  const label = CARD_LABELS[cardType] || "item";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Icon size={14} className="text-[var(--text-muted)]" />
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {cards.length} {label}{cards.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-1.5">
        {cards.map((card, idx) => {
          if (cardType === "email") return <EmailDataCard key={card.id || idx} card={card as EmailCard} />;
          if (cardType === "calendar") return <CalendarDataCard key={card.id || idx} card={card as CalendarCard} />;
          if (cardType === "message") return <MessageDataCard key={card.id || idx} card={card as MessageCard} />;
          return null;
        })}
      </div>
    </div>
  );
}
