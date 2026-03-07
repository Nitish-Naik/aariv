// Types ported from the Expo app
export type Platform = string;

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
  metadata?: Record<string, any>;
  requiresApproval: boolean;
}

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

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId: string;
  subscriptionTier?: "free" | "pro";
}

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

export interface DataCardGroup {
  cardType: DataCardType;
  cards: (EmailCard | CalendarCard | MessageCard)[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
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
  auth_actions?: AuthAction[];
  data_cards?: DataCardGroup[];
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
