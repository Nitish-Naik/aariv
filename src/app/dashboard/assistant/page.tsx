"use client";

import { DataCard, PulsingAvatar } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { getAppLogo } from "@/lib/platform-logos";
import type { ChatMessage } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  FileUp,
  Menu,
  MessageSquare,
  PanelLeftClose,
  Plus,
  Send,
  Shield,
  Terminal,
  Trash2
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { DetailedLogEntry } from "@/components";

// Detect completed actions in the agent's final response text
const ACTION_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\b(sent|send|emailed)\b.{0,40}\b(email|message)\b/i, label: "Email sent" },
  { re: /\b(created|scheduled|added)\b.{0,40}\b(meeting|event|calendar)\b/i, label: "Meeting created" },
  { re: /\b(sent|posted|messaged)\b.{0,40}\bslack\b/i, label: "Slack message sent" },
  { re: /\bslack\b.{0,40}\b(sent|posted|messaged)\b/i, label: "Slack message sent" },
  { re: /\b(created|filed|opened)\b.{0,40}\b(issue|ticket|pr|pull request)\b/i, label: "Issue created" },
  { re: /\b(created|added|made)\b.{0,40}\b(task|to.?do)\b/i, label: "Task created" },
  { re: /\b(created|wrote|added)\b.{0,40}\b(note|page|document|doc)\b/i, label: "Note created" },
  { re: /\b(deleted|removed|archived)\b.{0,40}\b(email|message|file|event)\b/i, label: "Item deleted" },
  { re: /\b(updated|edited|modified)\b.{0,40}\b(event|task|issue|page)\b/i, label: "Item updated" },
  { re: /\b(replied|responded)\b.{0,40}\b(email|message|thread)\b/i, label: "Reply sent" },
];

function parseCompletions(response: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  for (const { re, label } of ACTION_PATTERNS) {
    if (re.test(response) && !seen.has(label)) {
      seen.add(label);
      found.push(label);
    }
  }
  return found;
}

function AssistantPageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const promptAutoSentRef = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "single" | "all" | "range";
    conversationId?: string;
    days?: number;
    label?: string;
  } | null>(null);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState<number | null>(null);
  const [retentionSaving, setRetentionSaving] = useState(false);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(true); // Right panel toggle
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { label: string; message: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragCounter = useRef(0);
  const streamAbortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight stream when the component unmounts
  useEffect(() => {
    return () => { streamAbortRef.current?.abort(); };
  }, []);

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

  // Auto-send ?prompt= param from proposal action buttons on the home page
  useEffect(() => {
    if (!user?.id || promptAutoSentRef.current) return;
    const raw = searchParams.get("prompt");
    if (!raw) return;
    promptAutoSentRef.current = true;
    const decoded = decodeURIComponent(raw);
    // Small delay so localStorage model preference loads first
    const timer = setTimeout(() => handleSend(decoded), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, searchParams]);

  // Fetch dynamic suggestion chips based on connected apps
  useEffect(() => {
    if (!user?.id) return;
    const fetchSuggestions = async () => {
      try {
        const res = await api.get(`/chat/suggestions/${user.id}`);
        if (res?.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch (e) {
        console.error("Failed to fetch suggestions", e);
      }
    };
    fetchSuggestions();
  }, [user?.id]);

  // Load retention preference
  useEffect(() => {
    if (!user?.id) return;
    const fetchRetention = async () => {
      try {
        const data = await api.get(`/history/retention/${user.id}`);
        if (data?.retention_days !== undefined) {
          setRetentionDays(data.retention_days);
        }
      } catch (e) {
        console.error("Failed to fetch retention", e);
      }
    };
    fetchRetention();
  }, [user?.id]);

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
        const data = await api.get(`/history/conversations/${user.id}`);
        setConversations(data);
        // Always start with a fresh new chat — previous chats available in sidebar
        setMessages([]);
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
        const data = await api.get(`/history/messages/${activeConversationId}`);
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
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }
    };
    fetchMessages();
  }, [activeConversationId]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await api.delete(`/history/conversations/${conversationId}`);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        handleNewChat();
      }
    } catch (e) {
      console.error("Failed to delete conversation", e);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDeleteAllConversations = async (days?: number) => {
    if (!user?.id) return;
    try {
      const endpoint = days
        ? `/history/conversations/user/${user.id}?older_than_days=${days}`
        : `/history/conversations/user/${user.id}`;
      await api.delete(endpoint);
      // Re-fetch conversations to reflect remaining ones
      try {
        const data = await api.get(`/history/conversations/${user.id}`);
        setConversations(data);
        if (!data.find((c: any) => c.id === activeConversationId)) {
          handleNewChat();
        }
      } catch {
        setConversations([]);
        handleNewChat();
      }
    } catch (e) {
      console.error("Failed to delete conversations", e);
    } finally {
      setDeleteConfirm(null);
      setIsDeleteMenuOpen(false);
    }
  };

  const handleRetentionChange = async (days: number | null) => {
    if (!user?.id) return;
    setRetentionSaving(true);
    try {
      await api.put(`/history/retention/${user.id}`, { days });
      setRetentionDays(days);
      // Re-fetch conversations since old ones may have been cleaned up
      const data = await api.get(`/history/conversations/${user.id}`);
      setConversations(data);
      if (
        activeConversationId &&
        !data.find((c: any) => c.id === activeConversationId)
      ) {
        handleNewChat();
      }
    } catch (e) {
      console.error("Failed to update retention", e);
    } finally {
      setRetentionSaving(false);
    }
  };

  // Copy message content to clipboard
  const handleCopyMessage = useCallback(
    async (messageId: string, content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      } catch {
        console.error("Failed to copy");
      }
    },
    [],
  );

  // Drag & drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Read text files and paste content into the input
      const textFiles = files.filter(
        (f) =>
          f.type.startsWith("text/") ||
          f.name.endsWith(".txt") ||
          f.name.endsWith(".md") ||
          f.name.endsWith(".json") ||
          f.name.endsWith(".csv"),
      );
      if (textFiles.length > 0) {
        textFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const text = ev.target?.result as string;
            setInputText(
              (prev) =>
                prev + (prev ? "\n\n" : "") + `[File: ${file.name}]\n${text}`,
            );
            inputRef.current?.focus();
          };
          reader.readAsText(file);
        });
      }
    }
  }, []);

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

    // Abort any previous in-flight stream, then create a new controller
    streamAbortRef.current?.abort();
    const abortController = new AbortController();
    streamAbortRef.current = abortController;

    try {
      const response = await api.stream("/chat", {
        userId: user.id,
        message: messageText,
        model: selectedModel,
        ...(activeConversationId
          ? { conversationId: activeConversationId }
          : {}),
      }, abortController.signal);

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

                  if (event.type === "token") {
                    return { ...msg, content: (msg.content || "") + event.data };
                  } else if (event.type === "log") {
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
                  } else if (event.type === "data_card") {
                    const newDataCards = [...(msg.data_cards || [])];
                    newDataCards.push(event.data);
                    return { ...msg, data_cards: newDataCards };
                  } else if (event.type === "result") {
                    // Only replace logs if result has actual log entries,
                    // otherwise keep the streaming logs we accumulated
                    const finalLogs =
                      event.data.logs?.length > 0 ? event.data.logs : msg.logs;

                    // Wire the conversation ID returned by the backend so
                    // subsequent messages in this chat have history context.
                    if (event.data.conversationId && !activeConversationId) {
                      const newId = event.data.conversationId;
                      setActiveConversationId(newId);
                      // Prepend to sidebar without a re-fetch
                      setConversations((prev) => {
                        if (prev.some((c) => c.id === newId)) return prev;
                        const title =
                          messageText.length > 40
                            ? messageText.slice(0, 40) + "..."
                            : messageText;
                        return [
                          {
                            id: newId,
                            title,
                            updated_at: new Date().toISOString(),
                          },
                          ...prev,
                        ];
                      });
                    }

                    return {
                      ...msg,
                      content: event.data.response,
                      auth_actions:
                        event.data.auth_actions?.length > 0
                          ? event.data.auth_actions
                          : msg.auth_actions,
                      logs: finalLogs,
                      completions: parseCompletions(event.data.response || ""),
                    };
                  } else if (event.type === "insufficient_credits") {
                    return {
                      ...msg,
                      content:
                        "You've run out of credits. Please add credits in **Settings** to continue using Aariv.\n\n[Go to Settings →](/dashboard/settings)",
                    };
                  } else if (event.type === "error") {
                    return { ...msg, content: `Error: ${event.data}` };
                  }
                  return msg;
                }),
              );
            } catch { }
          }
        }
      }
    } catch (e: any) {
      // Ignore AbortError — user navigated away or sent a new message
      if (e?.name !== "AbortError") {
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
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── LEFT SIDEBAR (Chat History) ── */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full z-40 flex flex-col bg-neutral-900 border-r border-white/10 transition-all duration-300 ease-in-out ${isSidebarOpen
          ? "w-72 translate-x-0"
          : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden"
          }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <span className="text-sm font-semibold text-white tracking-wide">
            Chat History
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <PanelLeftClose strokeWidth={1.5} size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white hover:text-black transition-colors"
          >
            <Plus strokeWidth={1.5} size={16} />
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-xs text-neutral-500 italic text-center">
              No recent chats.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors group/conv cursor-pointer ${activeConversationId === conv.id
                  ? "bg-white/[0.08] text-white"
                  : "text-neutral-400 hover:bg-white/[0.04]"
                  }`}
              >
                <button
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center gap-2.5 flex-1 min-w-0"
                >
                  <MessageSquare strokeWidth={1.5} size={14} className="shrink-0 opacity-50" />
                  <span className="text-[13px] truncate">{conv.title}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({
                      type: "single",
                      conversationId: conv.id,
                    });
                  }}
                  className="shrink-0 p-1 rounded-md opacity-0 group-hover/conv:opacity-100 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 strokeWidth={1.5} size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Manage History Section */}
        {conversations.length > 0 && (
          <div className="border-t border-white/10 shrink-0">
            <button
              onClick={() => setIsDeleteMenuOpen(!isDeleteMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-400 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              <span className="flex items-center gap-2 text-xs font-medium">
                <Shield strokeWidth={1.5} size={14} className="opacity-60" />
                Manage History
              </span>
              <ChevronDown strokeWidth={1.5}
                size={12}
                className={`transition-transform ${isDeleteMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isDeleteMenuOpen && (
              <div className="bg-[rgba(0,0,0,0.15)] pb-2">
                {/* Auto-delete retention setting */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock strokeWidth={1.5}
                      size={12}
                      className="text-white opacity-80"
                    />
                    <span className="text-[11px] font-medium text-white uppercase tracking-wider">
                      Auto-delete
                    </span>
                    {retentionDays && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 mb-2.5">
                    Automatically delete history older than:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 7, label: "7d" },
                      { value: 30, label: "30d" },
                      { value: 90, label: "90d" },
                      { value: 180, label: "6mo" },
                      { value: null as number | null, label: "Never" },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleRetentionChange(opt.value)}
                        disabled={retentionSaving}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${retentionDays === opt.value
                          ? "bg-white text-black"
                          : "bg-white/5 text-neutral-400 hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
                          } disabled:opacity-50`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual delete options */}
                {[
                  { days: 1, label: "Last 24 hours" },
                  { days: 7, label: "Last 7 days" },
                  { days: 30, label: "Last 30 days" },
                  { days: 90, label: "Last 90 days" },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() =>
                      setDeleteConfirm({
                        type: "range",
                        days: opt.days,
                        label: opt.label,
                      })
                    }
                    className="w-full flex items-center gap-2 px-5 py-2 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Clock strokeWidth={1.5} size={12} className="opacity-60" />
                    Delete {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => setDeleteConfirm({ type: "all" })}
                  className="w-full flex items-center gap-2 px-5 py-2 text-xs text-red-500 font-medium hover:bg-red-400/10 transition-colors border-t border-white/[0.03]"
                >
                  <Trash2 strokeWidth={1.5} size={12} />
                  Delete Everything
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ─── MAIN CHAT PANEL ─── */}
      <div
        className="flex flex-col h-full flex-1 bg-black relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-xl m-4 pointer-events-none">
            <div className="flex flex-col items-center gap-3 text-white">
              <FileUp size={40} strokeWidth={1.5} />
              <span className="text-lg font-medium">Drop files here</span>
              <span className="text-xs text-neutral-500">
                Text, Markdown, JSON, CSV files supported
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 flex items-center justify-between h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
              title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu strokeWidth={1.5} size={18} />
            </button>
            <div>
              <h1 className="text-lg font-serif font-semibold text-white">
                Assistant
              </h1>
              <p className="text-[11px] text-neutral-500">
                Your calm thinking partner
              </p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
            title="New chat"
          >
            <Plus strokeWidth={1.5} size={18} />
          </button>
        </div>

        {/* ─── Run Status Bar ─── */}
        {isLoading && (
          <div className="relative shrink-0 z-10">
            {/* Shimmer sweep bar */}
            <div className="h-[2px] w-full bg-white/[0.04] overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 w-[40%] bg-gradient-to-r from-transparent via-white/35 to-transparent"
                animate={{ left: ["-40%", "140%"] }}
                transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
              />
            </div>
            {/* Mobile-only activity label (logs panel is desktop-only) */}
            <div className="lg:hidden px-4 py-1.5 flex items-center gap-2 bg-black border-b border-white/[0.03]">
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse shrink-0" />
              <span className="text-[11px] text-neutral-500 truncate">
                {(() => {
                  const lastMsg = [...messages].reverse().find(m => m.role === "assistant");
                  const lastLog = lastMsg?.logs?.[lastMsg.logs.length - 1];
                  return (lastLog as any)?.label || "Thinking…";
                })()}
              </span>
            </div>
          </div>
        )}

        {/* Empty State — Centered landing */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
            <div className="flex flex-col items-center text-center max-w-2xl w-full space-y-6">
              {/* Gradient headline */}
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{
                  background:
                    "linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #fb923c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Chat with 500+ Apps
              </h1>
              <p className="text-sm text-neutral-500 -mt-2">
                Connect your favorite tools and let Aariv automate your work.
              </p>

              {/* Centered input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="w-full max-w-xl relative flex items-end rounded-xl overflow-hidden bg-neutral-900 border border-[rgba(255,255,255,0.1)] focus-within:border-[rgba(255,255,255,0.2)] focus-within:ring-1 focus-within:ring-[rgba(255,255,255,0.1)] shadow-lg transition-all"
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
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full max-h-32 min-h-[56px] py-4 pl-5 pr-14 bg-transparent text-[15px] text-white placeholder:text-neutral-500 resize-none outline-none disabled:opacity-50"
                  style={{ height: "auto", overflowY: "auto" }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:bg-transparent disabled:text-neutral-500"
                >
                  <Send strokeWidth={1.5} size={18} className="ml-0.5" />
                </button>
              </form>

              {/* Suggestion chips */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {suggestions.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputText(chip.message);
                        inputRef.current?.focus();
                      }}
                      className="px-4 py-2.5 rounded-full bg-neutral-900 border border-white/[0.08] text-sm text-neutral-400 hover:text-white hover:border-white/30 transition-all"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6 scroll-smooth">
            <div className="max-w-3xl mx-auto w-full space-y-8">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const isThinking = !msg.content && (msg.logs?.length || 0) > 0;

                // Only render the AI bubble if it has text ORauth actions OR if it's currently thinking
                const shouldRenderAiBubble =
                  msg.content ||
                  (msg.auth_actions && msg.auth_actions.length > 0) ||
                  isThinking;

                if (!isUser && !shouldRenderAiBubble) return null;

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
                      className={`flex flex-col group ${isUser ? "items-end" : "items-start w-full"
                        }`}
                    >
                      <div className="max-w-[85%] lg:max-w-[90%] rounded-xl px-5 py-4 bg-neutral-900 border border-white/[0.02] shadow-sm">
                        {/* Content */}
                        {isUser ? (
                          <div className="relative group/userMsg">
                            <p className="text-[15px] leading-relaxed text-white">
                              {msg.content}
                            </p>
                            <div className="flex justify-end mt-1 -mb-1">
                              <button
                                onClick={() =>
                                  handleCopyMessage(msg.id, msg.content)
                                }
                                className="p-1 rounded-md text-neutral-500 opacity-0 group-hover/userMsg:opacity-100 hover:text-white hover:bg-white/[0.06] transition-all"
                                title="Copy message"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check strokeWidth={1.5} size={14} className="text-green-400" />
                                ) : (
                                  <Copy strokeWidth={1.5} size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : msg.content ? (
                          <>
                            <div className="markdown-content text-[15px] leading-relaxed text-white">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ href, children }) => {
                                    // Render Composio connection links as cards
                                    const isConnectLink = href?.includes("connect.composio.dev/link/") || href?.includes("composio.dev/connect/");
                                    if (isConnectLink) {
                                      const label = typeof children === "string" ? children : String(children);
                                      const appName = label.replace(/^connect\s*/i, "").replace(/^to\s*/i, "").trim() || "App";
                                      const appSlug = appName.toLowerCase().replace(/\s+/g, "");
                                      const logoUrl = getAppLogo(appSlug);
                                      return (
                                        <div className="flex items-center gap-3 w-full my-2 px-4 py-3 rounded-xl bg-black border border-white/10 hover:border-white/30/40 transition-colors">
                                          {logoUrl ? (
                                            <img
                                              src={logoUrl}
                                              alt={appName}
                                              className="w-8 h-8 rounded-lg object-contain"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white text-xs font-bold">
                                              {appName.charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                          <span className="flex-1 text-sm font-medium text-white">
                                            Connect to {appName.charAt(0).toUpperCase() + appName.slice(1)}
                                          </span>
                                          <button
                                            onClick={() => {
                                              window.open(href, "composio_connect", "width=600,height=700,left=200,top=100");
                                            }}
                                            className="shrink-0 px-4 py-1.5 rounded-lg bg-white text-[black] text-xs font-semibold hover:opacity-90 transition-opacity"
                                          >
                                            Connect
                                          </button>
                                        </div>
                                      );
                                    }
                                    return (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white hover:underline"
                                      >
                                        {children}
                                      </a>
                                    );
                                  },
                                  strong: ({ children }) => (
                                    <strong className="font-semibold">{children}</strong>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="my-2 ml-6 list-disc space-y-1">{children}</ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="my-2 ml-6 list-decimal space-y-1">{children}</ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="pl-1">{children}</li>
                                  ),
                                  p: ({ children }) => (
                                    <p className="mb-2.5 last:mb-0 leading-[1.75]">{children}</p>
                                  ),
                                  code: ({ className, children }) => {
                                    const isBlock = className?.includes("language-");
                                    return isBlock ? (
                                      <pre className="my-3 p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] overflow-x-auto">
                                        <code className="text-[13px] font-mono">{children}</code>
                                      </pre>
                                    ) : (
                                      <code className="px-1.5 py-0.5 rounded text-[13px] font-mono bg-black/[0.06] dark:bg-white/[0.1]">{children}</code>
                                    );
                                  },
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-[3px] border-white/10 pl-4 my-3 text-neutral-400">{children}</blockquote>
                                  ),
                                  hr: () => (
                                    <hr className="border-white/10 my-4" />
                                  ),
                                  h1: ({ children }) => <h1 className="text-xl font-semibold mt-4 mb-2">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1.5">{children}</h3>,
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-3">
                                      <table className="w-full text-sm border-collapse">{children}</table>
                                    </div>
                                  ),
                                  th: ({ children }) => (
                                    <th className="px-3 py-2 text-left border-b-2 border-white/10 font-semibold text-sm">{children}</th>
                                  ),
                                  td: ({ children }) => (
                                    <td className="px-3 py-2 border-b border-white/10">{children}</td>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                            {msg.completions && msg.completions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {msg.completions.map((label) => (
                                  <span
                                    key={label}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20"
                                  >
                                    <Check strokeWidth={2.5} size={10} />
                                    {label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          isThinking && (
                            <div className="flex items-center gap-2 py-1.5 px-2">
                              {msg.logs && msg.logs.length > 0 ? (
                                <span className="text-[13px] font-medium font-mono animate-pulse bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                  {msg.logs[msg.logs.length - 1].label
                                    .replace(/composio_?/i, "")
                                    .replace(/composio\s*/i, "")}
                                  ...
                                </span>
                              ) : (
                                <>
                                  <motion.span
                                    className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-500"
                                    animate={{
                                      opacity: [0.4, 1, 0.4],
                                      scale: [0.8, 1, 0.8],
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 1.4,
                                      ease: "easeInOut",
                                      delay: 0,
                                    }}
                                  />
                                  <motion.span
                                    className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-500"
                                    animate={{
                                      opacity: [0.4, 1, 0.4],
                                      scale: [0.8, 1, 0.8],
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 1.4,
                                      ease: "easeInOut",
                                      delay: 0.2,
                                    }}
                                  />
                                  <motion.span
                                    className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-500"
                                    animate={{
                                      opacity: [0.4, 1, 0.4],
                                      scale: [0.8, 1, 0.8],
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 1.4,
                                      ease: "easeInOut",
                                      delay: 0.4,
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          )
                        )}

                        {/* Copy button for AI messages */}
                        {!isUser && msg.content && (
                          <div className="flex justify-end mt-1 -mb-1">
                            <button
                              onClick={() =>
                                handleCopyMessage(msg.id, msg.content)
                              }
                              className="p-1 rounded-md text-neutral-500 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/[0.06] transition-all"
                              title="Copy response"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check strokeWidth={1.5} size={14} className="text-green-400" />
                              ) : (
                                <Copy strokeWidth={1.5} size={14} />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Auth actions — connection cards */}
                        {msg.auth_actions && msg.auth_actions.length > 0 && (
                          <div className="mt-4 space-y-2 max-w-md w-full">
                            {msg.auth_actions.map((action, idx) => {
                              const appSlug = action.appName.toLowerCase().replace(/\s+/g, "");
                              const logoUrl = getAppLogo(appSlug);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-black border border-white/10 hover:border-white/30/40 transition-colors"
                                >
                                  {logoUrl ? (
                                    <img
                                      src={logoUrl}
                                      alt={action.appName}
                                      className="w-8 h-8 rounded-lg object-contain"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white text-xs font-bold">
                                      {action.appName.charAt(0)}
                                    </div>
                                  )}
                                  <span className="flex-1 text-sm font-medium text-white">
                                    Connect to {action.appName}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const popup = window.open(
                                        action.url,
                                        "composio_connect",
                                        "width=600,height=700,left=200,top=100",
                                      );
                                      const pollTimer = setInterval(() => {
                                        if (!popup || popup.closed) {
                                          clearInterval(pollTimer);
                                          if (user?.id) {
                                            api
                                              .get(`/chat/suggestions/${user.id}`)
                                              .then((res) => {
                                                if (res?.suggestions)
                                                  setSuggestions(res.suggestions);
                                              })
                                              .catch(() => { });
                                          }
                                        }
                                      }, 1000);
                                    }}
                                    className="shrink-0 px-4 py-1.5 rounded-lg bg-white text-[black] text-xs font-semibold hover:opacity-90 transition-opacity"
                                  >
                                    Connect
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Data cards — structured tool results */}
                        {msg.data_cards && msg.data_cards.length > 0 && (
                          <div className="mt-4 space-y-3 max-w-md w-full">
                            {msg.data_cards.map((group, idx) => (
                              <DataCard key={idx} cardType={group.cardType} cards={group.cards} />
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
        )}

        {/* Input Area — hidden on empty state since input is in the hero */}
        {messages.length > 0 && (
          <div className="p-4 sm:p-6 lg:p-8 shrink-0 relative bg-gradient-to-t from-black to-transparent via-black">
            <div className="max-w-3xl mx-auto w-full relative">
              {/* Model Toggle */}
              {/* <div className="flex items-center gap-1 mb-2.5 ml-1">
              <div className="inline-flex items-center bg-neutral-900 border border-white/[0.08] rounded-full p-0.5">
                <button
                  type="button"
                  onClick={() => { setSelectedModel("gpt-4o-mini"); localStorage.setItem("aariv_model", "gpt-4o-mini"); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${selectedModel.includes("mini")
                    ? "bg-[rgba(255,255,255,0.1)] text-amber-400 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-400"
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
                    : "text-neutral-500 hover:text-neutral-400"
                    }`}
                >
                  <Brain size={12} />
                  Smart
                </button>
              </div>
              <span className="text-[10px] text-neutral-500 ml-2">
                {selectedModel.includes("mini") ? "Quicker responses, lower cost" : "Better reasoning, more accurate"}
              </span>
            </div> */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-end shadow-lg rounded-xl overflow-hidden bg-neutral-900 border border-[rgba(255,255,255,0.1)] focus-within:border-[rgba(255,255,255,0.2)] focus-within:ring-1 focus-within:ring-[rgba(255,255,255,0.1)] transition-all"
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
                  className="w-full max-h-32 min-h-[56px] py-4 pl-5 pr-14 bg-transparent text-[15px] text-white placeholder:text-neutral-500 resize-none outline-none disabled:opacity-50"
                  style={{ height: "auto", overflowY: "auto" }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:bg-transparent disabled:text-neutral-500"
                >
                  <Send strokeWidth={1.5} size={18} className="ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-3">
                <span className="text-[10px] text-neutral-500">
                  Press Enter to send, Shift+Enter for new line
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── RIGHT PANEL (TOOL EXECUTION LOGS) ─── */}

      {/* <div
        className={`fixed lg:static top-0 right-0 h-full bg-[#111111] z-40 transition-all duration-300 ease-in-out transform flex flex-col border-l border-white/5 ${isLogsOpen
            ? "translate-x-0 w-[320px] lg:w-[40%]"
            : "translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none"
          }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#1A1A1A]/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
            <Terminal strokeWidth={1.5} size={16} className="text-neutral-400" />
            <span className="text-xs font-mono font-medium tracking-wider text-neutral-300 uppercase">
              Execution Logs
            </span>
          </div>
          <button
            onClick={() => setIsLogsOpen(false)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors lg:hidden"
          >
            <ChevronRight strokeWidth={1.5} size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
          {allLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-600 text-xs">
              <Terminal strokeWidth={1.5} size={24} className="mb-2 opacity-50" />
              <span>Waiting for tasks...</span>
            </div>
          ) : (
            allLogs.map((log, idx) => <DetailedLogEntry key={idx} log={log} />)
          )}
          <div ref={logsEndRef} />
        </div>
      </div> */}




      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              {deleteConfirm.type === "all"
                ? "Delete All History?"
                : deleteConfirm.type === "range"
                  ? `Delete ${deleteConfirm.label}?`
                  : "Delete Conversation?"}
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              {deleteConfirm.type === "all"
                ? "This will permanently delete all your conversations and their messages. This action cannot be undone."
                : deleteConfirm.type === "range"
                  ? `This will permanently delete all conversations from the ${deleteConfirm.label?.toLowerCase()}. This action cannot be undone.`
                  : "This will permanently delete this conversation and all its messages. This action cannot be undone."}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "all") {
                    handleDeleteAllConversations();
                  } else if (
                    deleteConfirm.type === "range" &&
                    deleteConfirm.days
                  ) {
                    handleDeleteAllConversations(deleteConfirm.days);
                  } else if (deleteConfirm.conversationId) {
                    handleDeleteConversation(deleteConfirm.conversationId);
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense>
      <AssistantPageInner />
    </Suspense>
  );
}
