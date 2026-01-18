/**
 * Type definitions for Aariv app
 */

export type Platform =
  | "gmail"
  | "google-calendar"
  | "slack"
  | "notion"
  | "linear"
  | "discord"
  | "maps"
  | "github";

export interface PlatformConnection {
  id: string;
  platform: Platform;
  name: string;
  icon: string;
  connected: boolean;
  connectedAt?: Date;
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

export interface KnowledgeGraphNode {
  id: string;
  type: "pattern" | "preference" | "ritual" | "cadence";
  label: string;
  description: string;
  createdAt: Date;
  expiresAt: Date;
  connections: string[];
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId: string;
  subscriptionTier?: "free" | "pro";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: ActionItem[];
}
