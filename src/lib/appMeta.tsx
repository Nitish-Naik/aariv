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

/**
 * One-line descriptions for trigger slugs.
 * Shown as subtitle text below the trigger name.
 */
export const TRIGGER_DESCRIPTIONS: Record<string, string> = {
  // Gmail
  GMAIL_NEW_GMAIL_MESSAGE: "Fires whenever a new email arrives in your inbox",
  GMAIL_NEW_GMAIL_MESSAGE_TRIGGER: "Fires whenever a new email arrives in your inbox",
  GMAIL_NEW_THREAD: "Triggers when a new conversation thread starts",
  GMAIL_NEW_LABEL: "Fires when a label is applied to a message",
  GMAIL_MESSAGE_SENT: "Triggers when you send an email",

  // Google Calendar
  GOOGLECALENDAR_EVENT_CREATED: "Fires when a new calendar event is added",
  GOOGLECALENDAR_EVENT_UPDATED: "Fires when an existing event is modified",
  GOOGLECALENDAR_EVENT_DELETED: "Fires when an event is removed from your calendar",
  GOOGLECALENDAR_NEW_EVENT: "Fires when a new calendar event is added",
  GOOGLECALENDAR_UPDATED_EVENT: "Fires when an existing event is modified",
  GOOGLE_CALENDAR_NEW_EVENT: "Fires when a new calendar event is added",

  // Slack
  SLACK_RECEIVE_MESSAGE: "Fires on any new message in a channel you're in",
  SLACK_NEW_MESSAGE: "Fires on any new message in a channel you're in",
  SLACK_BOT_MENTION: "Fires when someone @-mentions CalmPilot in Slack",
  SLACK_DIRECT_MESSAGE: "Fires when you receive a direct message",
  SLACK_REACTION_ADDED: "Fires when a reaction emoji is added to a message",
  SLACK_CHANNEL_CREATED: "Fires when a new Slack channel is created",
  SLACK_MEMBER_JOINED_CHANNEL: "Fires when someone joins a channel",
  SLACK_MEMBER_LEFT_CHANNEL: "Fires when someone leaves a channel",
  SLACK_NEW_MESSAGE_IN_THREAD: "Fires when a reply is posted in a thread",

  // GitHub
  GITHUB_PULL_REQUEST: "Fires when a pull request is opened, closed, or merged",
  GITHUB_PULL_REQUEST_EVENT: "Fires when a pull request is opened, closed, or merged",
  GITHUB_ISSUE: "Fires when an issue is created or updated",
  GITHUB_ISSUE_OPENED: "Fires when a new issue is opened",
  GITHUB_ISSUE_COMMENTED: "Fires when someone comments on an issue",
  GITHUB_STAR: "Fires when someone stars your repository",
  GITHUB_PUSH_EVENT: "Fires when code is pushed to a branch",
  GITHUB_COMMIT_PUSHED: "Fires when code is pushed to a branch",
  GITHUB_REVIEW_REQUESTED: "Fires when a code review is requested from you",

  // Linear
  LINEAR_ISSUE_CREATED: "Fires when a new issue is created in Linear",
  LINEAR_ISSUE_UPDATED: "Fires when an issue's status or details change",
  LINEAR_ISSUE_ASSIGNED: "Fires when an issue is assigned to someone",
  LINEAR_ISSUE_DONE: "Fires when an issue is marked as completed",
  LINEAR_COMMENT_CREATED: "Fires when a comment is added to an issue",

  // Notion
  NOTION_PAGE_CREATED: "Fires when a new page is created in Notion",
  NOTION_PAGE_UPDATED: "Fires when a page's content is edited",
  NOTION_DATABASE_ITEM_CREATED: "Fires when a new row is added to a database",
  NOTION_DATABASE_ITEM_UPDATED: "Fires when a database row is updated",
  NOTION_COMMENT_CREATED: "Fires when a comment is added to a page",

  // HubSpot
  HUBSPOT_NEW_CONTACT: "Fires when a new contact is created in HubSpot",
  HUBSPOT_NEW_DEAL: "Fires when a new deal is created in your pipeline",
  HUBSPOT_DEAL_UPDATED: "Fires when a deal's stage or details change",

  // Stripe
  STRIPE_PAYMENT_INTENT_SUCCEEDED: "Fires when a payment completes successfully",
  STRIPE_PAYMENT_FAILED: "Fires when a payment attempt fails",
  STRIPE_NEW_CUSTOMER: "Fires when a new customer is created",
  STRIPE_SUBSCRIPTION_CREATED: "Fires when a new subscription starts",
  STRIPE_SUBSCRIPTION_UPDATED: "Fires when a subscription plan or status changes",
  STRIPE_SUBSCRIPTION_DELETED: "Fires when a subscription is cancelled",
  STRIPE_REFUND_CREATED: "Fires when a refund is issued",

  // Jira
  JIRA_ISSUE_CREATED: "Fires when a new issue is created in Jira",
  JIRA_ISSUE_UPDATED: "Fires when an issue is updated or transitions state",
  JIRA_ISSUE_COMMENTED: "Fires when a comment is added to a Jira issue",

  // Discord
  DISCORD_NEW_MESSAGE: "Fires when a new message is posted in a channel",
  DISCORD_BOT_MENTIONED: "Fires when the bot is @-mentioned in Discord",

  // Fireflies
  FIREFLIES_TRANSCRIPT_COMPLETED: "Fires when a meeting transcript is ready",
  FIREFLIES_NEW_MEETING: "Fires when a new meeting is recorded",
};

/**
 * Returns a one-line description for a trigger slug, or null if none defined.
 */
export function getTriggerDescription(slug: string): string | null {
  if (!slug) return null;
  return TRIGGER_DESCRIPTIONS[slug.toUpperCase()] ?? null;
}

/* ─── Tool labels (Assistant logs panel) ────────────────────── */

/**
 * Maps raw Composio tool names → short human-readable action labels.
 * Shown in the right-hand logs panel of the Assistant page.
 */
export const TOOL_LABELS: Record<string, string> = {
  // Gmail
  GMAIL_FETCH_EMAILS: "Reading Gmail inbox",
  GMAIL_GET_EMAILS: "Reading Gmail inbox",
  GMAIL_LIST_EMAILS: "Reading Gmail inbox",
  GMAIL_SEND_EMAIL: "Sending email",
  GMAIL_REPLY_TO_EMAIL: "Replying to email",
  GMAIL_REPLY_TO_THREAD: "Replying to thread",
  GMAIL_CREATE_EMAIL_DRAFT: "Creating draft",
  GMAIL_SAVE_DRAFT: "Saving draft",
  GMAIL_GET_EMAIL_BY_MESSAGE_ID: "Opening email",
  GMAIL_GET_ATTACHMENT: "Downloading attachment",
  GMAIL_MOVE_EMAIL_TO_TRASH: "Trashing email",
  GMAIL_DELETE_MESSAGE: "Deleting email",
  GMAIL_ADD_LABEL_TO_EMAIL: "Labelling email",
  GMAIL_REMOVE_LABEL_FROM_EMAIL: "Removing label",
  GMAIL_CREATE_LABEL: "Creating label",
  GMAIL_LIST_LABELS: "Listing labels",
  GMAIL_MARK_EMAIL_AS_READ: "Marking as read",
  GMAIL_MARK_EMAIL_AS_UNREAD: "Marking as unread",
  GMAIL_SEARCH_EMAILS: "Searching emails",

  // Google Calendar
  GOOGLECALENDAR_LIST_EVENTS: "Checking your calendar",
  GOOGLECALENDAR_GET_EVENTS: "Checking your calendar",
  GOOGLECALENDAR_CREATE_EVENT: "Creating calendar event",
  GOOGLECALENDAR_UPDATE_EVENT: "Updating calendar event",
  GOOGLECALENDAR_DELETE_EVENT: "Deleting calendar event",
  GOOGLECALENDAR_GET_EVENT: "Opening calendar event",
  GOOGLECALENDAR_FIND_FREE_SLOTS: "Finding free time",
  GOOGLECALENDAR_LIST_CALENDARS: "Listing calendars",
  GOOGLECALENDAR_CREATE_MEETING_WITH_DESCRIPTION: "Creating meeting",
  GOOGLE_CALENDAR_CREATE_EVENT: "Creating calendar event",
  GOOGLE_CALENDAR_LIST_EVENTS: "Checking your calendar",

  // Google Drive
  GOOGLEDRIVE_LIST_FILES: "Browsing Google Drive",
  GOOGLEDRIVE_GET_FILE: "Opening file",
  GOOGLEDRIVE_CREATE_FILE: "Creating file",
  GOOGLEDRIVE_UPLOAD_FILE: "Uploading file",
  GOOGLEDRIVE_DELETE_FILE: "Deleting file",
  GOOGLEDRIVE_SHARE_FILE: "Sharing file",
  GOOGLEDRIVE_SEARCH_FILES: "Searching Drive",
  GOOGLEDRIVE_MOVE_FILE: "Moving file",

  // Google Docs
  GOOGLEDOCS_GET_DOCUMENT: "Opening Google Doc",
  GOOGLEDOCS_CREATE_DOCUMENT: "Creating Google Doc",
  GOOGLEDOCS_UPDATE_DOCUMENT: "Updating Google Doc",

  // Google Sheets
  GOOGLESHEETS_GET_SPREADSHEET: "Opening spreadsheet",
  GOOGLESHEETS_GET_SPREADSHEET_CELL_DATA: "Reading spreadsheet",
  GOOGLESHEETS_APPEND_ROW: "Adding row to spreadsheet",
  GOOGLESHEETS_UPDATE_CELL: "Updating spreadsheet",
  GOOGLESHEETS_CREATE_GOOGLE_SHEET: "Creating spreadsheet",
  GOOGLESHEETS_BATCH_UPDATE: "Updating spreadsheet",

  // Slack
  SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL: "Sending Slack message",
  SLACK_SEND_MESSAGE: "Sending Slack message",
  SLACK_POST_MESSAGE: "Sending Slack message",
  SLACK_LIST_CHANNELS: "Listing Slack channels",
  SLACK_GET_CHANNEL_INFO: "Reading channel info",
  SLACK_SEARCH_MESSAGES: "Searching Slack",
  SLACK_LIST_MEMBERS_IN_CHANNEL: "Listing channel members",
  SLACKBOT_SEND_DIRECT_MESSAGE: "Sending DM",
  SLACK_SEND_DIRECT_MESSAGE: "Sending DM",

  // GitHub
  GITHUB_LIST_REPOS_ACCESSIBLE_TO_THE_APP: "Listing GitHub repos",
  GITHUB_LIST_REPOSITORIES: "Listing GitHub repos",
  GITHUB_GET_REPOSITORY: "Reading repo",
  GITHUB_CREATE_AN_ISSUE: "Creating GitHub issue",
  GITHUB_CREATE_ISSUE: "Creating GitHub issue",
  GITHUB_GET_ISSUE: "Reading issue",
  GITHUB_LIST_ISSUES: "Listing issues",
  GITHUB_UPDATE_ISSUE: "Updating issue",
  GITHUB_ADD_COMMENT: "Adding comment",
  GITHUB_CREATE_PULL_REQUEST: "Creating pull request",
  GITHUB_GET_PULL_REQUEST: "Reading pull request",
  GITHUB_LIST_PULL_REQUESTS: "Listing pull requests",
  GITHUB_MERGE_PULL_REQUEST: "Merging pull request",
  GITHUB_LIST_COMMITS: "Listing commits",

  // Linear
  LINEAR_LIST_ISSUES: "Listing Linear issues",
  LINEAR_GET_ISSUE: "Reading Linear issue",
  LINEAR_CREATE_ISSUE: "Creating Linear issue",
  LINEAR_UPDATE_ISSUE: "Updating Linear issue",
  LINEAR_LIST_PROJECTS: "Listing projects",
  LINEAR_GET_PROJECT: "Reading project",
  LINEAR_ADD_COMMENT: "Adding comment",

  // Notion
  NOTION_GET_DATABASE: "Reading Notion database",
  NOTION_LIST_DATABASES: "Listing Notion databases",
  NOTION_QUERY_DATABASE: "Querying Notion database",
  NOTION_CREATE_PAGE: "Creating Notion page",
  NOTION_GET_PAGE: "Reading Notion page",
  NOTION_UPDATE_PAGE: "Updating Notion page",
  NOTION_APPEND_BLOCK: "Appending to page",
  NOTION_SEARCH: "Searching Notion",

  // HubSpot
  HUBSPOT_LIST_CONTACTS: "Listing HubSpot contacts",
  HUBSPOT_GET_CONTACT: "Reading contact",
  HUBSPOT_CREATE_CONTACT: "Creating contact",
  HUBSPOT_UPDATE_CONTACT: "Updating contact",
  HUBSPOT_LIST_DEALS: "Listing deals",
  HUBSPOT_CREATE_DEAL: "Creating deal",
  HUBSPOT_UPDATE_DEAL: "Updating deal",

  // Stripe
  STRIPE_LIST_CUSTOMERS: "Listing Stripe customers",
  STRIPE_GET_CUSTOMER: "Reading customer",
  STRIPE_LIST_CHARGES: "Listing charges",
  STRIPE_LIST_SUBSCRIPTIONS: "Listing subscriptions",
  STRIPE_CREATE_INVOICE: "Creating invoice",

  // Jira
  JIRA_LIST_ISSUES: "Listing Jira issues",
  JIRA_GET_ISSUE: "Reading Jira issue",
  JIRA_CREATE_ISSUE: "Creating Jira issue",
  JIRA_UPDATE_ISSUE: "Updating Jira issue",
  JIRA_ADD_COMMENT: "Adding comment",

  // Discord
  DISCORD_SEND_MESSAGE: "Sending Discord message",
  DISCORD_LIST_CHANNELS: "Listing channels",

  // Fireflies
  FIREFLIES_GET_TRANSCRIPT: "Reading transcript",
  FIREFLIES_LIST_MEETINGS: "Listing meetings",
};

/**
 * Returns the app slug prefix from a tool name (e.g. "GMAIL_FETCH_EMAILS" → "gmail").
 * Used to show the app logo next to log entries.
 */
export function getToolAppSlug(toolName: string): string {
  if (!toolName) return "";
  // Multi-word prefixes first
  const multiPrefixes: Record<string, string> = {
    GOOGLECALENDAR: "googlecalendar",
    GOOGLE_CALENDAR: "googlecalendar",
    GOOGLESHEETS: "googlesheets",
    GOOGLEDRIVE: "googledrive",
    GOOGLEDOCS: "googledocs",
    SLACKBOT: "slackbot",
  };
  const upper = toolName.toUpperCase();
  for (const [prefix, slug] of Object.entries(multiPrefixes)) {
    if (upper.startsWith(prefix)) return slug;
  }
  // Single-word prefix
  const first = upper.split("_")[0].toLowerCase();
  return first;
}

/**
 * Returns a human-readable label for a Composio tool name.
 * Falls back to stripping the app prefix and title-casing.
 *
 * Examples:
 *   GMAIL_FETCH_EMAILS             → "Reading Gmail inbox"
 *   GOOGLECALENDAR_CREATE_EVENT    → "Creating calendar event"
 *   SOME_UNKNOWN_TOOL_NAME         → "Some Unknown Tool"
 */
export function formatToolName(toolName: string): string {
  if (!toolName) return "";
  const explicit = TOOL_LABELS[toolName.toUpperCase()];
  if (explicit) return explicit;

  // Fallback: strip app prefix, title-case remainder
  return toolName
    .replace(/^[A-Z]+_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
