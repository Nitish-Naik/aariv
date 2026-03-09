/**
 * appMeta.tsx — single source of truth for app + trigger display names.
 *
 * Import from here everywhere you need:
 *   - Human-readable app labels  (getAppLabel)
 *   - Brand colors               (getAppColor)
 *   - Lucide icons               (getAppIcon)
 *   - Human-readable trigger names (formatTriggerSlug)
 */

import {
  Activity,
  Calendar,
  CheckSquare,
  CreditCard,
  FileText,
  FolderOpen,
  GitPullRequest,
  Inbox,
  Mail,
  MessageSquare,
  Mic,
  Music,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

/* ─── App metadata ──────────────────────────────────────────── */

interface AppMeta {
  label: string;
  color: string;
  icon: ReactNode;
}

export const APP_META: Record<string, AppMeta> = {
  gmail: {
    label: "Gmail",
    color: "#EA4335",
    icon: <Mail strokeWidth={1.5} size={15} />,
  },
  googlecalendar: {
    label: "Google Calendar",
    color: "#4285F4",
    icon: <Calendar strokeWidth={1.5} size={15} />,
  },
  googlesheets: {
    label: "Google Sheets",
    color: "#34A853",
    icon: <FileText strokeWidth={1.5} size={15} />,
  },
  googledrive: {
    label: "Google Drive",
    color: "#0F9D58",
    icon: <FolderOpen strokeWidth={1.5} size={15} />,
  },
  googledocs: {
    label: "Google Docs",
    color: "#4285F4",
    icon: <FileText strokeWidth={1.5} size={15} />,
  },
  slack: {
    label: "Slack",
    color: "#4A154B",
    icon: <MessageSquare strokeWidth={1.5} size={15} />,
  },
  slackbot: {
    label: "Slackbot",
    color: "#4A154B",
    icon: <MessageSquare strokeWidth={1.5} size={15} />,
  },
  github: {
    label: "GitHub",
    color: "#24292e",
    icon: <GitPullRequest strokeWidth={1.5} size={15} />,
  },
  notion: {
    label: "Notion",
    color: "#FFFFFF",
    icon: <Zap strokeWidth={1.5} size={15} />,
  },
  linear: {
    label: "Linear",
    color: "#5E6AD2",
    icon: <CheckSquare strokeWidth={1.5} size={15} />,
  },
  discord: {
    label: "Discord",
    color: "#5865F2",
    icon: <MessageSquare strokeWidth={1.5} size={15} />,
  },
  outlook: {
    label: "Outlook",
    color: "#0078D4",
    icon: <Mail strokeWidth={1.5} size={15} />,
  },
  stripe: {
    label: "Stripe",
    color: "#635BFF",
    icon: <CreditCard strokeWidth={1.5} size={15} />,
  },
  jira: {
    label: "Jira",
    color: "#0052CC",
    icon: <CheckSquare strokeWidth={1.5} size={15} />,
  },
  trello: {
    label: "Trello",
    color: "#0079BF",
    icon: <CheckSquare strokeWidth={1.5} size={15} />,
  },
  todoist: {
    label: "Todoist",
    color: "#E44332",
    icon: <CheckSquare strokeWidth={1.5} size={15} />,
  },
  hubspot: {
    label: "HubSpot",
    color: "#FF7A59",
    icon: <Activity strokeWidth={1.5} size={15} />,
  },
  pipedrive: {
    label: "Pipedrive",
    color: "#1BAA6B",
    icon: <Activity strokeWidth={1.5} size={15} />,
  },
  salesforce: {
    label: "Salesforce",
    color: "#00A1E0",
    icon: <Activity strokeWidth={1.5} size={15} />,
  },
  spotify: {
    label: "Spotify",
    color: "#1DB954",
    icon: <Music strokeWidth={1.5} size={15} />,
  },
  youtube: {
    label: "YouTube",
    color: "#FF0000",
    icon: <Music strokeWidth={1.5} size={15} />,
  },
  fireflies: {
    label: "Fireflies",
    color: "#6C2BD9",
    icon: <Mic strokeWidth={1.5} size={15} />,
  },
};

/** Fallback meta for unknown apps. */
const FALLBACK_META: AppMeta = {
  label: "",
  color: "#737373",
  icon: <Inbox strokeWidth={1.5} size={15} />,
};

export function getAppMeta(slug: string): AppMeta {
  return APP_META[slug.toLowerCase()] ?? FALLBACK_META;
}

export function getAppLabel(slug: string): string {
  return APP_META[slug.toLowerCase()]?.label || slug;
}

export function getAppColor(slug: string): string {
  return APP_META[slug.toLowerCase()]?.color ?? "#737373";
}

export function getAppIcon(slug: string): ReactNode {
  return APP_META[slug.toLowerCase()]?.icon ?? <Inbox strokeWidth={1.5} size={15} />;
}

/* ─── Trigger labels ────────────────────────────────────────── */

/**
 * Maps raw Composio trigger slugs → short human-readable event names.
 * Keep these concise: they appear inline next to the app label.
 */
export const TRIGGER_LABELS: Record<string, string> = {
  // Gmail
  GMAIL_NEW_GMAIL_MESSAGE: "New email",
  GMAIL_NEW_GMAIL_MESSAGE_TRIGGER: "New email",
  GMAIL_NEW_THREAD: "New thread",
  GMAIL_NEW_LABEL: "Label applied",
  GMAIL_MESSAGE_SENT: "Email sent",

  // Google Calendar
  GOOGLECALENDAR_EVENT_CREATED: "Event created",
  GOOGLECALENDAR_EVENT_UPDATED: "Event updated",
  GOOGLECALENDAR_EVENT_DELETED: "Event deleted",
  GOOGLECALENDAR_NEW_EVENT: "New event",
  GOOGLECALENDAR_UPDATED_EVENT: "Event updated",
  GOOGLE_CALENDAR_NEW_EVENT: "New event",

  // Slack
  SLACK_RECEIVE_MESSAGE: "New message",
  SLACK_NEW_MESSAGE: "New message",
  SLACK_BOT_MENTION: "Mentioned in Slack",
  SLACK_DIRECT_MESSAGE: "Direct message",
  SLACK_REACTION_ADDED: "Reaction added",
  SLACK_CHANNEL_CREATED: "Channel created",
  SLACK_MEMBER_JOINED_CHANNEL: "Member joined",
  SLACK_MEMBER_LEFT_CHANNEL: "Member left",
  SLACK_NEW_MESSAGE_IN_THREAD: "Thread reply",

  // GitHub
  GITHUB_PULL_REQUEST: "Pull request",
  GITHUB_PULL_REQUEST_EVENT: "Pull request",
  GITHUB_ISSUE: "Issue",
  GITHUB_ISSUE_OPENED: "Issue opened",
  GITHUB_ISSUE_COMMENTED: "Issue comment",
  GITHUB_STAR: "Repo starred",
  GITHUB_PUSH_EVENT: "Code pushed",
  GITHUB_COMMIT_PUSHED: "Code pushed",
  GITHUB_REVIEW_REQUESTED: "Review requested",

  // Linear
  LINEAR_ISSUE_CREATED: "Issue created",
  LINEAR_ISSUE_UPDATED: "Issue updated",
  LINEAR_ISSUE_ASSIGNED: "Issue assigned",
  LINEAR_ISSUE_DONE: "Issue closed",
  LINEAR_COMMENT_CREATED: "Comment added",

  // Notion
  NOTION_PAGE_CREATED: "Page created",
  NOTION_PAGE_UPDATED: "Page updated",
  NOTION_DATABASE_ITEM_CREATED: "Database item added",
  NOTION_DATABASE_ITEM_UPDATED: "Database item updated",
  NOTION_COMMENT_CREATED: "Comment added",

  // HubSpot
  HUBSPOT_NEW_CONTACT: "New contact",
  HUBSPOT_NEW_DEAL: "New deal",
  HUBSPOT_DEAL_UPDATED: "Deal updated",

  // Stripe
  STRIPE_PAYMENT_INTENT_SUCCEEDED: "Payment succeeded",
  STRIPE_PAYMENT_FAILED: "Payment failed",
  STRIPE_NEW_CUSTOMER: "New customer",
  STRIPE_SUBSCRIPTION_CREATED: "Subscription created",
  STRIPE_SUBSCRIPTION_UPDATED: "Subscription updated",
  STRIPE_SUBSCRIPTION_DELETED: "Subscription cancelled",
  STRIPE_REFUND_CREATED: "Refund issued",

  // Jira
  JIRA_ISSUE_CREATED: "Issue created",
  JIRA_ISSUE_UPDATED: "Issue updated",
  JIRA_ISSUE_COMMENTED: "Comment added",

  // Discord
  DISCORD_NEW_MESSAGE: "New message",
  DISCORD_BOT_MENTIONED: "Bot mentioned",

  // Fireflies
  FIREFLIES_TRANSCRIPT_COMPLETED: "Meeting transcript ready",
  FIREFLIES_NEW_MEETING: "New meeting",
};

/**
 * Returns a short human-readable label for a trigger slug.
 * Falls back to stripping the app prefix and title-casing.
 *
 * Examples:
 *   GMAIL_NEW_GMAIL_MESSAGE  → "New email"
 *   SLACK_RECEIVE_MESSAGE    → "New message"
 *   SOME_UNKNOWN_TRIGGER     → "Unknown Trigger"
 */
export function formatTriggerSlug(slug: string): string {
  if (!slug) return "";
  const explicit = TRIGGER_LABELS[slug.toUpperCase()];
  if (explicit) return explicit;

  // Fallback: strip leading APP_ prefix (e.g. GMAIL_NEW_... → NEW_...)
  // then convert remaining underscores to title case
  return slug
    .replace(/^[A-Z]+_/, "")       // drop first segment (app name)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
