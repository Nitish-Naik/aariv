"use client";

import type {
    CalendarCard,
    DataCardGroup,
    EmailCard,
    MessageCard,
} from "@/lib/types";
import {
    Calendar,
    Clock,
    Hash,
    Mail,
    MapPin,
    MessageSquare,
    Users,
} from "lucide-react";

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
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTimeRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime())) return start;
    const opts: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
    };
    const dayOpts: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    const day = s.toLocaleDateString(undefined, dayOpts);
    const startTime = s.toLocaleTimeString(undefined, opts);
    const endTime = isNaN(e.getTime())
      ? ""
      : ` - ${e.toLocaleTimeString(undefined, opts)}`;
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
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-card/70 backdrop-blur-sm ring-1 ring-inset ring-foreground/10 hover:bg-card/90 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 text-sm font-semibold">
          {initial}
        </div>
        {card.isUnread && (
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm truncate ${card.isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}
          >
            {name}
          </p>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatRelativeTime(card.date)}
          </span>
        </div>
        <p className="text-sm text-foreground truncate mt-0.5">
          {card.subject}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {card.snippet}
        </p>
      </div>
    </div>
  );
}

function CalendarDataCard({ card }: { card: CalendarCard }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-card/70 backdrop-blur-sm ring-1 ring-inset ring-foreground/10 hover:bg-card/90 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <div className="w-1 self-stretch rounded-full bg-foreground/50 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{card.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Clock
            strokeWidth={1.5}
            size={12}
            className="text-neutral-500 shrink-0"
          />
          <span className="text-xs text-muted-foreground">
            {formatTimeRange(card.startTime, card.endTime)}
          </span>
        </div>
        {card.location && (
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin
              strokeWidth={1.5}
              size={12}
              className="text-neutral-500 shrink-0"
            />
            <span className="text-xs text-muted-foreground truncate">
              {card.location}
            </span>
          </div>
        )}
        {card.attendees && card.attendees.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <Users
              strokeWidth={1.5}
              size={12}
              className="text-neutral-500 shrink-0"
            />
            <span className="text-xs text-muted-foreground">
              {card.attendees.length} attendee
              {card.attendees.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageDataCard({ card }: { card: MessageCard }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-card/70 backdrop-blur-sm ring-1 ring-inset ring-foreground/10 hover:bg-card/90 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 text-xs font-semibold shrink-0">
        {card.sender.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {card.sender}
          </p>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatRelativeTime(card.timestamp)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {card.content}
        </p>
        {card.channel && (
          <div className="flex items-center gap-1 mt-1">
            <Hash strokeWidth={1.5} size={11} className="text-neutral-500" />
            <span className="text-[11px] text-muted-foreground">
              {card.channel}
            </span>
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
        <Icon size={14} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {cards.length} {label}
          {cards.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-1.5">
        {cards.map((card, idx) => {
          if (cardType === "email")
            return (
              <EmailDataCard key={card.id || idx} card={card as EmailCard} />
            );
          if (cardType === "calendar")
            return (
              <CalendarDataCard
                key={card.id || idx}
                card={card as CalendarCard}
              />
            );
          if (cardType === "message")
            return (
              <MessageDataCard
                key={card.id || idx}
                card={card as MessageCard}
              />
            );
          return null;
        })}
      </div>
    </div>
  );
}
