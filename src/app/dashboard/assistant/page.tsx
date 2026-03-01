"use client";

import { DetailedLogEntry, PulsingAvatar } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import {
    ChevronDown,
    ChevronRight,
    MessageSquare,
    Plus,
    Send,
    Terminal,
    Zap
} from "lucide-react";
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
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(true); // Right panel toggle
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load model preference from Settings
  useEffect(() => {
    const saved = localStorage.getItem("aariv_model");
    if (saved) setSelectedModel(saved);
    const handler = (e: Event) => {
      const model = (e as CustomEvent).detail;
      if (model) setSelectedModel(model);
    };
    window.addEventListener("aariv-model-change", handler);
    return () => window.removeEventListener("aariv-model-change", handler);
  }, []);

  // Extract all logs to render in the right panel sequentially
  const allLogs = messages.flatMap((msg) => msg.logs || []).filter(Boolean);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allLogs]);

  // Fetch conversations on load
  useEffect(() => {
    if (!user?.id) return;
    const fetchHistory = async () => {
      try {
        const envUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const baseUrl = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
        const res = await fetch(
          `${baseUrl}/api/history/conversations/${user.id}`,
        );
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          if (data.length > 0) {
            setActiveConversationId(data[0].id);
          } else {
            // New user, show welcome
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content: "Hello! I am Aariv. How can I help you today?",
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch conversations", e);
      }
    };
    fetchHistory();
  }, [user?.id]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    const fetchMessages = async () => {
      try {
        const envUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const baseUrl = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
        const res = await fetch(
          `${baseUrl}/api/history/messages/${activeConversationId}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const mapped = data.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              logs: msg.logs || [],
            }));
            setMessages(mapped);
          }
        }
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }
    };
    fetchMessages();
  }, [activeConversationId]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am Aariv. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setIsDropdownOpen(false);
  };

  // Notification SSE stream
  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();

    const startNotificationStream = async () => {
      try {
        const response = await fetch(
          `${api.getBaseUrl()}/notifications/${user.id}`,
          { signal: controller.signal },
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
                // Handle all trigger notification types
                const triggerTypes = new Set([
                  "proactive_summary",
                  "email_summary",
                  "github_update",
                  "slack_summary",
                  "calendar_alert",
                  "notion_update",
                  "linear_update",
                  "discord_summary",
                ]);
                if (triggerTypes.has(event.type)) {
                  const labelMap: Record<string, string> = {
                    email_summary: "📧 Email",
                    github_update: "🐙 GitHub",
                    slack_summary: "💬 Slack",
                    calendar_alert: "📅 Calendar",
                    notion_update: "📝 Notion",
                    linear_update: "📋 Linear",
                    discord_summary: "🎮 Discord",
                    proactive_summary: "🔔 Update",
                  };
                  const label = labelMap[event.type as string] || "🔔 Update";

                  setMessages((prev) => [
                    ...prev,
                    {
                      id: event.data.id || Date.now().toString(),
                      role: "assistant",
                      content: `**${label}**\n\n${event.data.content}`,
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

    // Open logs panel automatically on send
    setIsLogsOpen(true);

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
        model: selectedModel,
        ...(activeConversationId
          ? { conversationId: activeConversationId }
          : {}),
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
                    // Only replace logs if result has actual log entries,
                    // otherwise keep the streaming logs we accumulated
                    const finalLogs =
                      event.data.logs?.length > 0 ? event.data.logs : msg.logs;
                    return {
                      ...msg,
                      content: event.data.response,
                      auth_actions:
                        event.data.auth_actions?.length > 0
                          ? event.data.auth_actions
                          : msg.auth_actions,
                      logs: finalLogs,
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
    <div className="flex h-screen overflow-hidden bg-[var(--bg-deep)]">
      {/* ─── LEFT PANEL (CHAT) ─── */}
      <div
        className={`flex flex-col h-full bg-[var(--bg-surface)] transition-all duration-300 ease-in-out ${
          isLogsOpen
            ? "w-full lg:w-[60%] border-r border-[var(--border)]"
            : "w-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 flex items-center justify-between h-16 border-b border-[var(--border)] shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-left group"
            >
              <div>
                <h1 className="text-lg font-serif font-semibold text-[var(--text-primary)] group-hover:text-white transition-colors">
                  Assistant
                </h1>
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  Powered by SecureAgent{" "}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </p>
              </div>
            </button>

            {/* Conversations Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-12 left-0 w-64 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] border-b border-[var(--border)] transition-colors"
                >
                  <Plus size={16} />
                  New Chat
                </button>
                <div className="max-h-64 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-[var(--text-muted)] italic">
                      No recent chats.
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          activeConversationId === conv.id
                            ? "bg-[rgba(255,255,255,0.05)] text-white"
                            : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.02)]"
                        }`}
                      >
                        <MessageSquare
                          size={14}
                          className="shrink-0 opacity-50"
                        />
                        <span className="text-sm truncate">{conv.title}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Toggle Log Panel Button (Desktop) */}
          <button
            onClick={() => setIsLogsOpen(!isLogsOpen)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Terminal size={16} />
            {isLogsOpen ? "Hide Tools" : "Show Tools"}
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6 scroll-smooth">
          {messages.length <= 1 && (
            <div className="flex flex-col py-10 space-y-8 max-w-2xl mx-auto w-full">
              <h2 className="text-2xl font-serif text-[var(--text-primary)]">
                What do you want to achieve?
              </h2>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(chip.message)}
                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.05)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all text-left"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto w-full space-y-8">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isThinking = !msg.content && (msg.logs?.length || 0) > 0;

              // Only render the AI bubble if it has text ORauth actions OR if it's currently thinking and logs are hidden
              // Wait, if we want a clean chat stream we only show AI when content or auth arrives.
              const shouldRenderAiBubble =
                msg.content ||
                (msg.auth_actions && msg.auth_actions.length > 0) ||
                (isThinking && !isLogsOpen);

              if (!isUser && !shouldRenderAiBubble && !msg.is_proactive)
                return null;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar for AI */}
                  {!isUser && (
                    <div className="flex-shrink-0 mt-1">
                      <PulsingAvatar isThinking={isThinking} size={36} />
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div
                    className={`flex flex-col group ${
                      isUser ? "items-end" : "items-start w-full"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] lg:max-w-[90%] rounded-2xl px-5 py-3.5 ${
                        isUser
                          ? "bg-zinc-800 text-[var(--text-primary)]"
                          : "bg-transparent text-[var(--text-primary)]"
                      } ${msg.is_proactive ? "border-l-2 border-l-yellow-500 pl-4 bg-yellow-500/5 rounded-l-none" : ""}`}
                    >
                      {/* Proactive badge */}
                      {msg.is_proactive && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Zap size={14} className="text-yellow-500" />
                          <span className="text-xs uppercase tracking-wider font-semibold text-yellow-500">
                            Proactive Summary
                          </span>
                        </div>
                      )}

                      {/* Content */}
                      {isUser ? (
                        <p className="text-[15px] leading-relaxed text-zinc-200">
                          {msg.content}
                        </p>
                      ) : msg.content ? (
                        <div className="markdown-content text-[15px] leading-relaxed text-zinc-300">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        isThinking &&
                        !isLogsOpen && (
                          <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
                            </span>
                            Executing tasks... open Tool panel to specify.
                          </div>
                        )
                      )}

                      {/* Auth actions */}
                      {msg.auth_actions && msg.auth_actions.length > 0 && (
                        <div className="mt-4 space-y-2 max-w-md w-full">
                          {msg.auth_actions.map((action, idx) => (
                            <a
                              key={idx}
                              href={action.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors group/link"
                            >
                              <span className="text-sm text-[var(--text-primary)] font-medium">
                                Connect {action.appName}
                              </span>
                              <span className="text-xs text-[var(--accent)] font-medium group-hover/link:translate-x-1 transition-transform">
                                Authenticate →
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 lg:p-8 shrink-0 relative bg-gradient-to-t from-[var(--bg-surface)] to-transparent via-[var(--bg-surface)]">
          <div className="max-w-3xl mx-auto w-full relative">
            {/* Model Toggle */}
            {/* <div className="flex items-center gap-1 mb-2.5 ml-1">
              <div className="inline-flex items-center bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.08)] rounded-full p-0.5">
                <button
                  type="button"
                  onClick={() => { setSelectedModel("gpt-4o-mini"); localStorage.setItem("aariv_model", "gpt-4o-mini"); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${selectedModel.includes("mini")
                    ? "bg-[rgba(255,255,255,0.1)] text-amber-400 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                >
                  <Zap size={12} />
                  Fast
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedModel("gpt-4o"); localStorage.setItem("aariv_model", "gpt-4o"); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${!selectedModel.includes("mini")
                    ? "bg-[rgba(255,255,255,0.1)] text-purple-400 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                >
                  <Brain size={12} />
                  Smart
                </button>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] ml-2">
                {selectedModel.includes("mini") ? "Quicker responses, lower cost" : "Better reasoning, more accurate"}
              </span>
            </div> */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-end shadow-lg rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.1)] focus-within:border-[rgba(255,255,255,0.2)] focus-within:ring-1 focus-within:ring-[rgba(255,255,255,0.1)] transition-all"
            >
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Aariv to do something..."
                disabled={isLoading}
                rows={1}
                className="w-full max-h-32 min-h-[56px] py-4 pl-5 pr-14 bg-transparent text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none outline-none disabled:opacity-50"
                style={{ height: "auto", overflowY: "auto" }}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:bg-transparent disabled:text-[var(--text-muted)]"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </form>
            <div className="text-center mt-3">
              <span className="text-[10px] text-[var(--text-muted)]">
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (TOOL EXECUTION LOGS) ─── */}
      <div
        className={`fixed lg:static top-0 right-0 h-full bg-[#111111] z-40 transition-all duration-300 ease-in-out transform flex flex-col border-l border-[rgba(255,255,255,0.05)] ${
          isLogsOpen
            ? "translate-x-0 w-[320px] lg:w-[40%]"
            : "translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[rgba(255,255,255,0.05)] bg-[#1A1A1A]/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-zinc-400" />
            <span className="text-xs font-mono font-medium tracking-wider text-zinc-300 uppercase">
              Execution Logs
            </span>
          </div>
          <button
            onClick={() => setIsLogsOpen(false)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors lg:hidden"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
          {allLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-xs">
              <Terminal size={24} className="mb-2 opacity-50" />
              <span>Waiting for tasks...</span>
            </div>
          ) : (
            allLogs.map((log, idx) => <DetailedLogEntry key={idx} log={log} />)
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
