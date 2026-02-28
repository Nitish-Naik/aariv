"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Mail, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface InboxMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  unread: boolean;
  platform: string;
  priority?: "low" | "medium" | "high";
}

export default function InboxPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!user?.id) return;
    loadInbox();
  }, [user?.id]);

  const loadInbox = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/inbox?userId=${user!.id}`);
      setMessages(data.messages || []);
    } catch (e: any) {
      console.error("Failed to load inbox:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    filter === "unread" ? messages.filter((m) => m.unread) : messages;
  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[var(--text-primary)]">
            Inbox
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {unreadCount} unread
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-0.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === "unread"
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Mail size={40} className="text-[var(--text-muted)] mx-auto" />
          <p className="text-sm text-[var(--text-secondary)]">
            {filter === "unread" ? "No unread messages" : "Your inbox is empty"}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-colors hover:bg-[var(--bg-surface)] ${
                msg.unread ? "bg-[var(--bg-surface)]" : ""
              }`}
            >
              {/* Unread indicator */}
              <div className="pt-1.5">
                {msg.unread ? (
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                ) : (
                  <div className="w-2 h-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm truncate ${
                      msg.unread
                        ? "font-semibold text-[var(--text-primary)]"
                        : "font-medium text-[var(--text-secondary)]"
                    }`}
                  >
                    {msg.from}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0 ml-4">
                    {new Date(msg.receivedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${
                    msg.unread
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {msg.subject}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {msg.preview}
                </p>
              </div>

              {/* Priority */}
              {msg.priority === "high" && (
                <Star
                  size={14}
                  className="text-warning flex-shrink-0 mt-1"
                  fill="currentColor"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
