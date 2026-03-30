// Types ported from the Expo app
export type Platform = string;

/**
 * Represents a third-party platform integration (e.g. Gmail, Slack, Notion).
 * `connected` reflects whether the user has an active Composio connection.
 * `isPro` marks integrations that require a paid subscription tier.
 */
export interface PlatformConnection {
  id: string;
  platform: Platform;
  name: string;
  icon: string;
  logo?: string;
  connected: boolean;
  connectedAt?: Date;
  isPro?: boolean;
  permissions: string[];
}

/**
 * A proposed action that the AI assistant wants to execute on behalf of the user.
 * Actions require explicit approval when `requiresApproval` is `true`.
 * They expire at `expiresAt` and transition through `pending → approved/rejected → executed`.
 */
export interface ActionItem {
  id: string;
  type:
  | "email"
  | "calendar"
  | "slack"
  | "notion"
  | "linear"
  | "discord"
  | "maps";
  title: string;
  description: string;
  platform: Platform;
  proposedAt: Date;
  expiresAt: Date;
  status: "pending" | "approved" | "rejected" | "expired" | "executed";
  metadata?: Record<string, unknown>;
  requiresApproval: boolean;
}

/**
 * A calendar event returned by the AI assistant from any connected calendar
 * platform. `attendees` contains display names or email addresses.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  platform: Platform;
  location?: string;
  attendees?: string[];
  color?: string;
}

export interface InboxItem {
  id: string;
  platform: Platform;
  from: string;
  subject: string;
  preview: string;
  receivedAt: Date;
  unread: boolean;
  priority?: "low" | "medium" | "high";
}

/**
 * Represents an authenticated application user.
 * Mapped from the Supabase session object on every auth state change.
 * `googleId` is non-empty only for users who signed in via Google OAuth.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId: string;
  subscriptionTier?: "free" | "starter" | "pro";
}

/**
 * An OAuth re-authorization action returned by the assistant when a connected
 * integration requires the user to re-grant permissions.
 * `url` is the Composio-generated OAuth redirect link.
 */
export interface AuthAction {
  appName: string;
  url: string;
}

// Data card types for structured tool output rendering
export type DataCardType = "email" | "calendar" | "message";

export interface EmailCard {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  isUnread?: boolean;
}

export interface CalendarCard {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
}

export interface MessageCard {
  id: string;
  sender: string;
  content: string;
  channel?: string;
  timestamp: string;
}

/**
 * A collection of structured data cards of a single type produced by an
 * AI tool call. Rendered as a card list rather than raw JSON in the chat UI.
 *
 * @example
 * ```ts
 * { cardType: "email", cards: [{ id: "1", sender: "...", ... }] }
 * ```
 */
export interface DataCardGroup {
  cardType: DataCardType;
  cards: (EmailCard | CalendarCard | MessageCard)[];
}

/**
 * A single message in a conversation thread.
 *
 * - `role` — `"user"` for human input, `"assistant"` for AI responses,
 *   `"system"` for injected context messages.
 * - `logs` — tool-call trace entries shown in the reasoning panel.
 * - `data_cards` — structured tool output rendered as card groups
 *   (emails, calendar events, messages) instead of plain text.
 * - `is_proactive` — set when the assistant initiated the message without
 *   a user prompt (e.g. a trigger-fired briefing).
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: ActionItem[];
  logs?: {
    label: string;
    status: string;
    tool: string;
    args?: any;
    result?: any;
    action_required?: { message: string, url: string };
  }[];
  is_proactive?: boolean;
  isFirstMessage?: boolean;
  auth_actions?: AuthAction[];
  data_cards?: DataCardGroup[];
  completions?: string[];
}

/**
 * A top-level conversation thread belonging to a user.
 * Each conversation contains an ordered sequence of `ChatMessage` objects
 * stored on the backend and identified by `id`.
 */
export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
