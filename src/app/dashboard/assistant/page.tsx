"use client";

import { PulsingAvatar, StatusLogCard } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import { Send, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const SUGGESTION_CHIPS = [
  { label: "Tomorrow's schedule", message: "What's on my calendar tomorrow?" },
  { label: "Draft a reply", message: "Help me draft a reply to Sarah" },
  { label: "Check emails", message: "What emails need my attention?" },
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I am Aariv, your productivity assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Notification SSE stream
  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();

    const startNotificationStream = async () => {
      try {
        const response = await fetch(
          `${api.getBaseUrl()}/notifications/${user.id}`,
          {
            signal: controller.signal,
          },
        );
        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });
          const parts = accumulated.split("\n\n");
          accumulated = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              try {
                const event = JSON.parse(part.substring(6));
                if (event.type === "proactive_summary") {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: event.data.id || Date.now().toString(),
                      role: "assistant",
                      content: event.data.content,
                      timestamp: new Date(event.data.timestamp),
                      is_proactive: true,
                    },
                  ]);
                }
              } catch {}
            }
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("Notification stream error:", e);
          setTimeout(startNotificationStream, 5000);
        }
      }
    };

    startNotificationStream();
    return () => controller.abort();
  }, [user?.id]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || !user?.id) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    const aiMessageId = Date.now().toString() + "_ai";
    const initialAiMessage: ChatMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      logs: [],
    };

    setMessages((prev) => [...prev, userMessage, initialAiMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await api.stream("/chat", {
        userId: user.id,
        message: messageText,
      });

      if (!response.body) throw new Error("No response body from server");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const parts = accumulated.split("\n\n");
        accumulated = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith("data: ")) {
            try {
              const event = JSON.parse(part.substring(6));

              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== aiMessageId) return msg;

                  if (event.type === "log") {
                    const newLogs = [...(msg.logs || [])];
                    const existingIdx = newLogs.findIndex(
                      (l) => l.label === event.data.label,
                    );
                    if (existingIdx >= 0) {
                      newLogs[existingIdx] = event.data;
                    } else {
                      newLogs.push(event.data);
                    }
                    return { ...msg, logs: newLogs };
                  } else if (event.type === "auth_required") {
                    const newAuthActions = [...(msg.auth_actions || [])];
                    if (!newAuthActions.some((a) => a.url === event.data.url)) {
                      newAuthActions.push(event.data);
                    }
                    return { ...msg, auth_actions: newAuthActions };
                  } else if (event.type === "result") {
                    return {
                      ...msg,
                      content: event.data.response,
                      auth_actions:
                        event.data.auth_actions?.length > 0
                          ? event.data.auth_actions
                          : msg.auth_actions,
                      logs: event.data.logs || msg.logs,
                    };
                  } else if (event.type === "error") {
                    return { ...msg, content: `Error: ${event.data}` };
                  }
                  return msg;
                }),
              );
            } catch {}
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content:
                  "Sorry, I encountered an error: " +
                  (e.message || "Unknown error"),
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-surface)]">
        <h1 className="text-lg font-serif font-semibold text-[var(--text-primary)]">
          Assistant
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Ask anything, or let me help proactively
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length <= 1 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <p className="text-4xl">🌙</p>
            <p className="text-base text-[var(--text-secondary)]">
              Here when you need me
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTION_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip.message)}
                  className="px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const isThinking = !msg.content && (msg.logs?.length || 0) > 0;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar */}
              {!isUser && (
                <div className="flex-shrink-0 mt-1">
                  <PulsingAvatar isThinking={isThinking} size={32} />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)]"
                } ${msg.is_proactive ? "border-l-2 border-l-yellow-500" : ""}`}
              >
                {/* Proactive badge */}
                {msg.is_proactive && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap size={12} className="text-yellow-500" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-yellow-500">
                      Proactive Summary
                    </span>
                  </div>
                )}

                {/* Logs */}
                {msg.logs && msg.logs.length > 0 && (
                  <div className={`space-y-0.5 ${msg.content ? "mb-3" : ""}`}>
                    {msg.logs.map((log, idx) => {
                      const isLatest = idx === msg.logs!.length - 1;
                      if (!msg.content || isLatest) {
                        return (
                          <StatusLogCard
                            key={idx}
                            label={log.label}
                            status={log.status || "completed"}
                            tool={log.tool}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                {/* Content */}
                {isUser ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : msg.content ? (
                  <div className="markdown-content text-sm leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : null}

                {/* Auth actions */}
                {msg.auth_actions && msg.auth_actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.auth_actions.map((action, idx) => (
                      <a
                        key={idx}
                        href={action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--accent-soft)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
                      >
                        <span className="text-sm text-[var(--text-primary)] font-medium">
                          Connect to {action.appName}
                        </span>
                        <span className="text-xs text-[var(--accent)] font-medium">
                          Connect →
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Aariv anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
