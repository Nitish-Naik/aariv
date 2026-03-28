"use client";

import { DataCard, PulsingAvatar } from "@/components";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useUpgradeDialog } from "@/components/UpgradeDialog";
import { Logo } from "@/components/secure-agent/Logo";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/useBilling";
import { useLogo } from "@/context/LogoContext";
import { trackEvent } from "@/lib/analytics";
import { api } from "@/lib/api";
import { getAppLogo } from "@/lib/platform-logos";
import type { ChatMessage, Conversation } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  FileUp,
  Loader2,
  Menu,
  MessageSquare,
  Link2,
  PanelLeftClose,
  Plus,
  Send,
  Shield,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePromptStore } from "@/lib/prompt-store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Detect completed actions in the agent's final response text
const ACTION_PATTERNS: { re: RegExp; label: string }[] = [
  {
    re: /\b(have sent|has been sent|successfully sent|email sent|sent the email|sent your email|emailed)\b/i,
    label: "Email sent",
  },
  {
    re: /\b(have created|has been created|successfully created|successfully scheduled|event created|meeting created)\b/i,
    label: "Meeting created",
  },
  {
    re: /\b(have sent|has been sent|successfully sent|posted to|sent the message).{0,20}\bslack\b/i,
    label: "Slack message sent",
  },
  {
    re: /\bslack\b.{0,20}\b(has been sent|successfully sent|message sent|posted)\b/i,
    label: "Slack message sent",
  },
  // ── Commented out: only Gmail, Calendar, Slack active for launch ──
  // {
  //   re: /\b(created|filed|opened)\b.{0,40}\b(issue|ticket|pr|pull request)\b/i,
  //   label: "Issue created",
  // },
  // {
  //   re: /\b(created|added|made)\b.{0,40}\b(task|to.?do)\b/i,
  //   label: "Task created",
  // },
  // {
  //   re: /\b(created|wrote|added)\b.{0,40}\b(note|page|document|doc)\b/i,
  //   label: "Note created",
  // },
  {
    re: /\b(have deleted|has been deleted|successfully deleted|successfully removed|successfully archived)\b/i,
    label: "Item deleted",
  },
  {
    re: /\b(have updated|has been updated|successfully updated|successfully edited|successfully modified)\b/i,
    label: "Item updated",
  },
  {
    re: /\b(have replied|has been replied|successfully replied|reply has been sent|reply sent)\b/i,
    label: "Reply sent",
  },
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
  const { balanceData, refetch: refetchBilling } = useBilling();
  const { openUpgrade } = useUpgradeDialog();
  const { getLogo } = useLogo();
  // Track whether we've shown the soft-wall nudge this session
  const nudgeSentRef = useRef(false);
  const searchParams = useSearchParams();
  const promptAutoSentRef = useRef(false);
  const handleSendRef = useRef<(text?: string) => void>(() => {});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(() => {
    if (typeof window === "undefined") return null;
    // If a prompt is pending (from Zustand or URL), start fresh
    if (usePromptStore.getState().pendingPrompt) return null;
    return localStorage.getItem("calmpilot_active_conversation") || null;
  });
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
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // upgradeReason state removed — uses useUpgradeDialog() context instead
  const [suggestions, setSuggestions] = useState<
    { label: string; message: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragCounter = useRef(0);
  const streamAbortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight stream when the component unmounts
  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  // Persist active conversation ID so refresh resumes the same chat
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("calmpilot_active_conversation", activeConversationId);
    } else {
      localStorage.removeItem("calmpilot_active_conversation");
    }
  }, [activeConversationId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load model preference from Settings
  useEffect(() => {
    const saved = localStorage.getItem("calmpilot_model");
    if (saved) setSelectedModel(saved);
    const handler = (e: Event) => {
      const model = (e as CustomEvent).detail;
      if (model) setSelectedModel(model);
    };
    window.addEventListener("calmpilot-model-change", handler);
    return () => window.removeEventListener("calmpilot-model-change", handler);
  }, []);

  // Consume pending prompts from Zustand store — inject into input field
  useEffect(() => {
    if (!user?.id) return;

    const tryConsume = () => {
      const { pendingPrompt, clearPendingPrompt } = usePromptStore.getState();
      if (!pendingPrompt) return;
      clearPendingPrompt();
      // Just set the text and let React handle the rest
      setActiveConversationId(null);
      setMessages([]);
      setInputText(pendingPrompt);
      // Focus input and auto-submit after React renders
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        // Auto-submit the form
        handleSendRef.current(pendingPrompt);
      });
    };

    tryConsume();

    const unsub = usePromptStore.subscribe((state) => {
      if (state.pendingPrompt) tryConsume();
    });

    return () => unsub();
  }, [user?.id]);

  // Track connected apps for empty-state UX
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  useEffect(() => {
    if (!user?.id) return;
    api.get("/integrations").then((data) => {
      const apps = data?.integrations || [];
      const connected = apps
        .filter((a: any) => a.status === "connected")
        .map((a: any) => a.appName?.toLowerCase() || "");
      setConnectedApps(connected);
    }).catch(() => {});
  }, [user?.id]);

  // Fetch dynamic suggestion chips based on connected apps
  useEffect(() => {
    if (!user?.id) return;
    const fetchSuggestions = async () => {
      try {
        const res = await api.get(`/chat/suggestions/${user.id}`);
        if (res?.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch {
        // Non-fatal — suggestions are optional
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
      } catch {
        // Non-fatal — retention defaults to null (keep forever)
      }
    };
    fetchRetention();
  }, [user?.id]);

  // Extract all logs to render in the right panel sequentially
  const allLogs = messages.flatMap((msg) => msg.logs || []).filter(Boolean);

  // Fetch conversations on load — restore active conversation if one was persisted
  useEffect(() => {
    if (!user?.id) return;
    const fetchHistory = async () => {
      try {
        const data = await api.get(`/history/conversations/${user.id}`);
        setConversations(data);

        // If a prompt is pending or being processed, don't interfere
        if (isLoading || messages.length > 0 || inputText.trim()) return;

        const restoredId = activeConversationId;
        if (restoredId && data.some((c: Conversation) => c.id === restoredId)) {
          // Conversation exists — messages will load via the activeConversationId effect
        } else if (restoredId) {
          setActiveConversationId(null);
          setMessages([]);
        } else {
          setMessages([]);
        }
      } catch {
        // Non-fatal — start with empty conversation list
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
          const mapped = data.map(
            (msg: {
              id: string;
              role: string;
              content: string;
              timestamp: string;
              logs?: string[];
            }) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              logs: msg.logs || [],
            }),
          );
          setMessages(mapped);
        }
      } catch {
        // Non-fatal — conversation will show empty
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
    } catch {
      // Non-fatal — conversation remains in list
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
        if (!data.find((c: Conversation) => c.id === activeConversationId)) {
          handleNewChat();
        }
      } catch {
        setConversations([]);
        handleNewChat();
      }
    } catch {
      // Non-fatal
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
        !data.find((c: Conversation) => c.id === activeConversationId)
      ) {
        handleNewChat();
      }
    } catch {
      // Non-fatal — retention setting unchanged
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
        // Clipboard API unavailable
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

    trackEvent("assistant_message_sent", {
      model: selectedModel,
      source: text ? "auto_prompt" : "manual",
      is_new_chat: messages.length === 0,
    });

    const msgTimestamp = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const userMessage: ChatMessage = {
      id: msgTimestamp,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    const aiMessageId = msgTimestamp + "_ai";
    const initialAiMessage: ChatMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      logs: [],
      isFirstMessage: messages.length === 0,
    };

    setMessages((prev) => [...prev, userMessage, initialAiMessage]);
    setInputText("");
    setIsLoading(true);

    // Abort any previous in-flight stream, then create a new controller
    streamAbortRef.current?.abort();
    const abortController = new AbortController();
    streamAbortRef.current = abortController;

    try {
      const response = await api.stream(
        "/chat",
        {
          userId: user.id,
          message: messageText,
          model: selectedModel,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          currentDate: new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
          ...(activeConversationId
            ? { conversationId: activeConversationId }
            : {}),
        },
        abortController.signal,
      );

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
                    return {
                      ...msg,
                      content: (msg.content || "") + event.data,
                    };
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
                    trackEvent("assistant_message_completed", {
                      model: selectedModel,
                    });
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
                        const now = new Date();
                        return [
                          {
                            id: newId,
                            title,
                            user_id: user?.id ?? "",
                            created_at: now,
                            updated_at: now,
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
                  } else if (event.type === "insufficient_credits" || event.type === "chat_quota_exceeded") {
                    openUpgrade("chat_limit");
                    const limit = event.data?.limit ?? 50;
                    return {
                      ...msg,
                      content: `You've used all **${limit} messages** this month. Upgrade your plan or wait for your quota to reset.`,
                    };
                  } else if (event.type === "error") {
                    trackEvent("assistant_message_error", {
                      model: selectedModel,
                    });
                    const rawError = typeof event.data === "string" ? event.data : JSON.stringify(event.data);
                    let friendlyError = "Something went wrong. Please try again.";
                    if (/timeout|timed out/i.test(rawError)) {
                      friendlyError = "That took too long. Try a simpler request or try again.";
                    } else if (/auth|connect|unauthorized/i.test(rawError)) {
                      friendlyError = "I couldn't access that app. Make sure it's connected in **[Integrations](/dashboard/integrations)**.";
                    } else if (/rate.?limit/i.test(rawError)) {
                      friendlyError = "Too many requests. Wait a moment and try again.";
                    } else if (/invalid.*toolkit|toolkit.*not found/i.test(rawError)) {
                      friendlyError = "That app isn't available. Connect it from **[Integrations](/dashboard/integrations)**.";
                    }
                    return { ...msg, content: friendlyError };
                  }
                  return msg;
                }),
              );
            } catch {}
          }
        }
      }
    } catch (e: unknown) {
      // Ignore AbortError — user navigated away or sent a new message
      if (e instanceof Error && e.name !== "AbortError") {
        trackEvent("assistant_message_error", {
          model: selectedModel,
        });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: "Something went wrong. Please try again.",
                }
              : msg,
          ),
        );
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();

      // Soft wall: after a completed response, refresh billing data and show
      // a one-time in-chat nudge when a free user crosses the 50% mark (25/50).
      try {
        const bd = await refetchBilling();
        if (
          bd &&
          !nudgeSentRef.current &&
          bd.subscription_tier === "free" &&
          bd.chat_messages_used >= Math.floor(bd.chat_messages_limit / 2) &&
          bd.chat_messages_used < bd.chat_messages_limit
        ) {
          nudgeSentRef.current = true;
          const remaining = bd.chat_messages_limit - bd.chat_messages_used;
          setMessages((prev) => [
            ...prev,
            {
              id: `nudge_${Date.now()}`,
              role: "system" as const,
              content: `You have **${remaining} messages** left this month.`,
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        // non-fatal
      }
    }
  };

  // Keep ref in sync so useEffect closures always call the latest version
  handleSendRef.current = handleSend;

  // (prompt firing handled by event listener in useEffect above)

  return (
    <div className="flex overflow-hidden bg-background fixed inset-0 md:left-[220px] top-[48px] md:top-0 z-10">
      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── RIGHT SIDEBAR (Chat History) ── */}
      <aside
        className={`fixed lg:static top-0 right-0 h-full z-40 flex flex-col bg-[#111111] border-l border-white/[0.06] transition-all duration-300 ease-in-out order-last ${
          isSidebarOpen
            ? "w-72 translate-x-0"
            : "w-0 translate-x-full lg:translate-x-0 lg:w-64 overflow-hidden"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-white/[0.06]">
          <span className="text-sm font-semibold text-foreground tracking-[-0.01em]">
            History
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-200"
              title="New chat"
            >
              <Plus strokeWidth={1.5} size={16} />
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-200 lg:hidden"
            >
              <X strokeWidth={1.5} size={16} />
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-xs text-zinc-600 text-center">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => {
              const relTime = (() => {
                if (!conv.updated_at) return "";
                const diff = Date.now() - new Date(conv.updated_at).getTime();
                const days = Math.floor(diff / 86400000);
                if (days === 0) return "Today";
                if (days === 1) return "Yesterday";
                if (days < 7) return `${days} days ago`;
                return new Date(conv.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              })();
              return (
                <div
                  key={conv.id}
                  className={`w-full flex flex-col px-3 py-2.5 rounded-xl text-left transition-all duration-200 group/conv cursor-pointer ${
                    activeConversationId === conv.id
                      ? "bg-white/[0.06] border-l-2 border-indigo-400"
                      : "hover:bg-white/[0.04] border-l-2 border-transparent"
                  }`}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[13px] font-medium truncate ${
                      activeConversationId === conv.id ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {conv.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({
                          type: "single",
                          conversationId: conv.id,
                        });
                      }}
                      className="shrink-0 p-1 rounded-md opacity-0 group-hover/conv:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 strokeWidth={1.5} size={13} />
                    </button>
                  </div>
                  {relTime && (
                    <span className="text-[10px] text-muted-foreground/60 mt-0.5">{relTime}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Manage History Section */}
        {conversations.length > 0 && (
          <div className="shrink-0">
            <button
              onClick={() => setIsDeleteMenuOpen(!isDeleteMenuOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
            >
              <span className="flex items-center gap-2 text-xs font-medium">
                <Shield strokeWidth={1.5} size={14} className="opacity-60" />
                Manage History
              </span>
              <ChevronDown
                strokeWidth={1.5}
                size={12}
                className={`transition-transform ${isDeleteMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isDeleteMenuOpen && (
              <div className="bg-muted/30 pb-2">
                {/* Auto-delete retention setting */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock
                      strokeWidth={1.5}
                      size={12}
                      className="text-foreground opacity-80"
                    />
                    <span className="text-[11px] font-medium text-foreground uppercase tracking-wider">
                      Auto-delete
                    </span>
                    {retentionDays && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-foreground">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2.5">
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
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          retentionDays === opt.value
                            ? "bg-blue-500 text-white ring-1 ring-blue-400 shadow-sm shadow-blue-500/30"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
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
                    className="w-full flex items-center gap-2 px-5 py-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Clock strokeWidth={1.5} size={12} className="opacity-60" />
                    Delete {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => setDeleteConfirm({ type: "all" })}
                  className="w-full flex items-center gap-2 px-5 py-2 text-xs text-red-500 font-medium hover:bg-red-400/10 transition-colors"
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
        className="flex flex-col h-full flex-1 bg-background relative overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-xl m-4 pointer-events-none ring-1 ring-inset ring-foreground/15">
            <div className="flex flex-col items-center gap-3 text-foreground">
              <FileUp size={40} strokeWidth={1.5} />
              <span className="text-lg font-medium">Drop files here</span>
              <span className="text-xs text-muted-foreground">
                Text, Markdown, JSON, CSV files supported
              </span>
            </div>
          </div>
        )}

        {/* Quota banner — only for free users approaching/at limit */}
        {(() => {
          const tier = balanceData?.subscription_tier ?? "free";
          if (tier !== "free" || !balanceData) return null;
          const used = balanceData.chat_messages_used ?? 0;
          const limit = balanceData.chat_messages_limit ?? 50;
          const remaining = limit - used;
          const pct = limit > 0 ? used / limit : 0;
          if (used >= limit) {
            return (
              <div className="flex items-center justify-between gap-3 px-4 py-2 bg-indigo-500/[0.07] border-b border-indigo-500/[0.12] text-indigo-300 text-xs font-medium shrink-0">
                <span>You&apos;ve used all <strong>{limit} messages</strong> this month.</span>
                <button onClick={() => openUpgrade("chat_limit")} className="shrink-0 px-3 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 text-xs font-semibold transition-all">
                  Upgrade →
                </button>
              </div>
            );
          }
          if (pct >= 0.5) {
            return (
              <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-500/[0.06] border-b border-amber-500/[0.1] text-amber-400/80 text-xs font-medium shrink-0">
                <span><strong>{remaining} of {limit}</strong> messages remaining this month.</span>
                <button onClick={() => openUpgrade("chat_limit")} className="shrink-0 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold transition-all">
                  Upgrade →
                </button>
              </div>
            );
          }
          return null;
        })()}

        {/* Header */}
        <div className="px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-foreground tracking-[-0.01em]">
              Assistant
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-200"
              title="New chat"
            >
              <Plus strokeWidth={1.5} size={18} />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-200 lg:hidden"
              title="History"
            >
              <Menu strokeWidth={1.5} size={18} />
            </button>
          </div>
        </div>

        {/* ─── Run Status Bar ─── */}
        {isLoading && (
          <div className="relative shrink-0 z-10">
            {/* Shimmer sweep bar */}
            <div className="h-[2px] w-full bg-muted/50 overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 w-[40%] bg-gradient-to-r from-transparent via-white/35 to-transparent"
                animate={{ left: ["-40%", "140%"] }}
                transition={{
                  duration: 1.4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>
            {/* Mobile-only activity label (logs panel is desktop-only) */}
            <div className="lg:hidden px-4 py-1.5 flex items-center gap-2 bg-background/90 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">
                {(() => {
                  const lastMsg = [...messages]
                    .reverse()
                    .find((m) => m.role === "assistant");
                  const lastLog = lastMsg?.logs?.[lastMsg.logs.length - 1];
                  return lastLog?.label || "Thinking…";
                })()}
              </span>
            </div>
          </div>
        )}

        {/* Empty State — Centered landing */}
        {messages.length === 0 && isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm">Processing your request...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
            <div className="flex flex-col items-center text-center max-w-lg w-full">

              {/* Logo */}
              <Logo className="w-12 h-12 mb-6" />

              {/* Heading */}
              <h1 className="text-xl font-semibold text-foreground tracking-[-0.01em] mb-1.5">
                Here when you need me
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                Ask anything, or try one of these:
              </p>

              {/* 2x2 Suggestion cards */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-8">
                {(suggestions.length > 0
                  ? suggestions.slice(0, 4)
                  : [
                      { label: "What's on my calendar tomorrow?", message: "What's on my calendar tomorrow?" },
                      { label: "Help me draft a reply", message: "Help me draft a reply to my latest email" },
                      { label: "Check my emails", message: "Check my recent emails and summarize them" },
                      { label: "Block focus time", message: "Block 2 hours of focus time on my calendar this week" },
                    ]
                ).map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(chip.message);
                      setTimeout(() => handleSend(), 50);
                    }}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-left hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200 group"
                  >
                    <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                      {chip.label.replace(/^(?:[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|\u200D|\uFE0F)+\s*/, "")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scroll-smooth">
            <div className="max-w-2xl mx-auto w-full space-y-5">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const isSystem = msg.role === "system";
                const isThinking = !msg.content && (msg.logs?.length || 0) > 0;

                // ── System nudge — distinct inline pill style ─────────────
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="max-w-sm text-center px-4 py-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.15] text-xs text-amber-400/90">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <a href={href} className="font-semibold underline underline-offset-2 hover:text-amber-300 transition-colors">
                                {children}
                              </a>
                            ),
                            strong: ({ children }) => <strong className="font-semibold text-amber-300">{children}</strong>,
                            p: ({ children }) => <span>{children}</span>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  );
                }

                // Only render the AI bubble if it has text OR auth actions OR if it's currently thinking
                const shouldRenderAiBubble =
                  msg.content ||
                  (msg.auth_actions && msg.auth_actions.length > 0) ||
                  isThinking;

                if (!isUser && !shouldRenderAiBubble) return null;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar for AI */}
                    {!isUser && (
                      <div className="flex-shrink-0 mt-1">
                        <PulsingAvatar isThinking={isThinking} size={36} />
                      </div>
                    )}

                    {/* Bubble Container */}
                    <div
                      className={`flex flex-col group min-w-0 ${
                        isUser ? "items-end" : "items-start flex-1"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${isUser ? "max-w-[85%] bg-white/[0.06] border border-white/[0.08]" : "w-full bg-transparent"}`}
                      >
                        {/* Content */}
                        {isUser ? (
                          <div className="relative group/userMsg">
                            <p className="text-[15px] leading-relaxed text-foreground">
                              {msg.content}
                            </p>
                            <div className="flex justify-end mt-1 -mb-1">
                              <button
                                onClick={() =>
                                  handleCopyMessage(msg.id, msg.content)
                                }
                                className="p-1 rounded-md text-muted-foreground opacity-0 group-hover/userMsg:opacity-100 hover:text-foreground hover:bg-muted transition-all"
                                title="Copy message"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check
                                    strokeWidth={1.5}
                                    size={14}
                                    className="text-green-400"
                                  />
                                ) : (
                                  <Copy strokeWidth={1.5} size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : msg.content ? (
                          <>
                            <div className="markdown-content text-[15px] leading-relaxed text-foreground">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ href, children }) => {
                                    // Render Composio connection links as cards
                                    const isConnectLink =
                                      href?.includes(
                                        "connect.composio.dev/link/",
                                      ) ||
                                      href?.includes("composio.dev/connect/");
                                    if (isConnectLink) {
                                      const label =
                                        typeof children === "string"
                                          ? children
                                          : String(children);
                                      const appName =
                                        label
                                          .replace(/^connect\s*/i, "")
                                          .replace(/^to\s*/i, "")
                                          .trim() || "App";
                                      const appSlug = appName
                                        .toLowerCase()
                                        .replace(/\s+/g, "");
                                      const logoUrl =
                                        getLogo(appSlug) || getAppLogo(appSlug);
                                      return (
                                        <div className="flex items-center gap-3 w-full my-2 px-4 py-3 rounded-xl bg-card/70 backdrop-blur-sm ring-1 ring-inset ring-white/[0.08] hover:bg-card/90 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                                          {logoUrl ? (
                                            <img
                                              src={logoUrl}
                                              alt={appName}
                                              className="w-8 h-8 rounded-lg object-contain"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-foreground text-xs font-bold">
                                              {appName.charAt(0).toUpperCase()}
                                            </div>
                                          )}
                                          <span className="flex-1 text-sm font-medium text-foreground">
                                            Connect to{" "}
                                            {appName.charAt(0).toUpperCase() +
                                              appName.slice(1)}
                                          </span>
                                          <button
                                            onClick={() => {
                                              window.open(
                                                href,
                                                "composio_connect",
                                                "width=600,height=700,left=200,top=100",
                                              );
                                            }}
                                            className="shrink-0 px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97]"
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
                                        className="text-foreground hover:underline"
                                      >
                                        {children}
                                      </a>
                                    );
                                  },
                                  strong: ({ children }) => (
                                    <strong className="font-semibold">
                                      {children}
                                    </strong>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="my-2 ml-6 list-disc space-y-1">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="my-2 ml-6 list-decimal space-y-1">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="pl-1">{children}</li>
                                  ),
                                  p: ({ children }) => (
                                    <p className="mb-2.5 last:mb-0 leading-[1.75]">
                                      {children}
                                    </p>
                                  ),
                                  code: ({ className, children }) => {
                                    const isBlock =
                                      className?.includes("language-");
                                    return isBlock ? (
                                      <pre className="my-3 p-4 rounded-lg bg-background/[0.03] dark:bg-muted overflow-x-auto">
                                        <code className="text-[13px] font-mono">
                                          {children}
                                        </code>
                                      </pre>
                                    ) : (
                                      <code className="px-1.5 py-0.5 rounded text-[13px] font-mono bg-background/[0.06] dark:bg-muted">
                                        {children}
                                      </code>
                                    );
                                  },
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-[3px] border-white/[0.08] pl-4 my-3 text-muted-foreground">
                                      {children}
                                    </blockquote>
                                  ),
                                  hr: () => (
                                    <hr className="border-white/[0.08] my-4" />
                                  ),
                                  h1: ({ children }) => (
                                    <h1 className="text-xl font-semibold mt-4 mb-2">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-lg font-semibold mt-4 mb-2">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-base font-semibold mt-3 mb-1.5">
                                      {children}
                                    </h3>
                                  ),
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-3">
                                      <table className="w-full text-sm border-collapse">
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                  th: ({ children }) => (
                                    <th className="px-3 py-2 text-left border-b-2 border-white/[0.08] font-semibold text-sm">
                                      {children}
                                    </th>
                                  ),
                                  td: ({ children }) => (
                                    <td className="px-3 py-2 border-b border-white/[0.06]">
                                      {children}
                                    </td>
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
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/14 text-emerald-300 ring-1 ring-inset ring-emerald-400/35 shadow-[0_4px_12px_rgba(16,185,129,0.18)]"
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
                            <div className="py-0.5 space-y-2.5 min-w-[160px]">
                              {!msg.logs ||
                              msg.logs.filter(
                                (log) =>
                                  msg.isFirstMessage ||
                                  !/initializ/i.test(log.label),
                              ).length === 0 ? (
                                /* No steps yet — subtle three dots */
                                <div className="flex items-center gap-1.5 px-1 py-0.5">
                                  {[0, 0.2, 0.4].map((delay) => (
                                    <motion.span
                                      key={delay}
                                      className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground"
                                      animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scale: [0.8, 1, 0.8],
                                      }}
                                      transition={{
                                        repeat: Infinity,
                                        duration: 1.4,
                                        ease: "easeInOut",
                                        delay,
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                /* Step-by-step progress list */
                                <div className="space-y-2">
                                  {msg.logs
                                    .filter(
                                      (log) =>
                                        msg.isFirstMessage ||
                                        !/initializ/i.test(log.label),
                                    )
                                    .map((log, i) => {
                                      const isRunning =
                                        log.status === "running" || log.status === "loading";
                                      const isDone =
                                        log.status === "completed" ||
                                        log.status === "success";
                                      const isFailed =
                                        log.status === "failed" ||
                                        log.status === "error";
                                      const label = (log.label || "Working...")
                                        .replace(/composio[_ ]?/gi, "")
                                        .replace(/^Thinking:\s*/i, "")
                                        .replace(/^Using\s*\.\.\.$/, "Working...")
                                        .trim() || "Working...";
                                      return (
                                        <motion.div
                                          key={i}
                                          initial={{ opacity: 0, y: 4 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="flex items-center gap-2.5"
                                        >
                                          {isRunning ? (
                                            <div className="w-3 h-3 rounded-full border border-muted-foreground border-t-foreground/70 animate-spin shrink-0" />
                                          ) : isDone ? (
                                            <Check
                                              strokeWidth={2.5}
                                              size={12}
                                              className="text-emerald-400 shrink-0"
                                            />
                                          ) : isFailed ? (
                                            <X
                                              strokeWidth={2.5}
                                              size={12}
                                              className="text-red-400 shrink-0"
                                            />
                                          ) : (
                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0 ml-[3px]" />
                                          )}
                                          <span
                                            className={`text-[12.5px] font-medium capitalize ${isRunning ? "text-foreground/80" : "text-muted-foreground"}`}
                                          >
                                            {label}
                                          </span>
                                        </motion.div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          )
                        )}

                        {/* Action buttons for AI messages */}
                        {!isUser && msg.content && (
                          <div className="flex items-center gap-1 mt-1 -mb-1">
                            {/* Retry button — shown when response is an error */}
                            {/something went wrong|try again|couldn't access|isn't available|took too long/i.test(msg.content) && (
                              <button
                                onClick={() => {
                                  // Find the user message before this AI message
                                  const idx = messages.findIndex((m) => m.id === msg.id);
                                  const prevUserMsg = idx > 0 ? messages[idx - 1] : null;
                                  if (prevUserMsg?.role === "user" && prevUserMsg.content) {
                                    // Remove the failed AI message and resend
                                    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                                    handleSendRef.current?.(prevUserMsg.content);
                                  }
                                }}
                                disabled={isLoading}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10 transition-all disabled:opacity-30"
                                title="Retry"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                                Retry
                              </button>
                            )}
                            {/* Copy button */}
                            <button
                              onClick={() =>
                                handleCopyMessage(msg.id, msg.content)
                              }
                              className="p-1 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted transition-all"
                              title="Copy response"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check
                                  strokeWidth={1.5}
                                  size={14}
                                  className="text-green-400"
                                />
                              ) : (
                                <Copy strokeWidth={1.5} size={14} />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Auth actions — connection cards */}
                        {msg.auth_actions && msg.auth_actions.length > 0 && (
                          <div className="mt-3 space-y-2 w-full">
                            {msg.auth_actions.map((action, idx) => {
                              const appSlug = action.appName
                                .toLowerCase()
                                .replace(/\s+/g, "");
                              const logoUrl =
                                getLogo(appSlug) || getAppLogo(appSlug);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card/70 backdrop-blur-sm ring-1 ring-inset ring-white/[0.08] hover:bg-card/90 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                                >
                                  {logoUrl ? (
                                    <img
                                      src={logoUrl}
                                      alt={action.appName}
                                      className="w-8 h-8 rounded-lg object-contain"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-foreground text-xs font-bold">
                                      {action.appName.charAt(0)}
                                    </div>
                                  )}
                                  <span className="flex-1 text-sm font-medium text-foreground">
                                    Connect to {action.appName}
                                  </span>
                                  <button
                                    onClick={async () => {
                                      // Use OUR connect flow (with callback) instead of Composio's direct URL
                                      // This ensures /api/callback fires and auto-setup runs server-side
                                      const appSlug = action.appName.toLowerCase().replace(/[\s-]/g, "");
                                      try {
                                        const connectData = await api.post("/integrations/connect", {
                                          userId: user!.id,
                                          appName: appSlug,
                                          platform: "web",
                                        });
                                        const ourUrl = connectData.url || connectData.redirectUrl || action.url;
                                        const popup = window.open(
                                          ourUrl,
                                          "composio_connect",
                                          "width=600,height=700,left=200,top=100",
                                        );
                                        const pollTimer = setInterval(() => {
                                          if (!popup || popup.closed) {
                                            clearInterval(pollTimer);
                                            // Refresh connected apps list
                                            if (user?.id) {
                                              api.get("/integrations").then((data: any) => {
                                                const apps = data?.integrations || [];
                                                const connected = apps
                                                  .filter((a: any) => a.status === "connected")
                                                  .map((a: any) => a.appName?.toLowerCase() || "");
                                                setConnectedApps(connected);
                                              }).catch(() => {});
                                              api.get(`/chat/suggestions/${user.id}`).then((res: any) => {
                                                if (res?.suggestions) setSuggestions(res.suggestions);
                                              }).catch(() => {});
                                            }
                                          }
                                        }, 1000);
                                      } catch {
                                        // Fallback: open Composio URL directly if our connect fails
                                        window.open(action.url, "composio_connect", "width=600,height=700,left=200,top=100");
                                      }
                                    }}
                                    className="shrink-0 px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97]"
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
                          <div className="mt-3 space-y-3 w-full">
                            {msg.data_cards.map((group, idx) => (
                              <DataCard
                                key={idx}
                                cardType={group.cardType}
                                cards={group.cards}
                              />
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

        {/* Input Area — always visible */}
        {(
          <div className="px-4 sm:px-6 py-3 shrink-0 relative border-t border-white/[0.04]">
            <div className="max-w-2xl mx-auto w-full relative">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3 rounded-3xl bg-white/[0.07] backdrop-blur-sm px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-all focus-within:bg-white/[0.11] focus-within:shadow-[0_14px_36px_rgba(0,0,0,0.34)]"
              >
                <label className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {/* <Plus strokeWidth={2} size={17} /> */}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const text = ev.target?.result as string;
                        setInputText(
                          (prev) =>
                            prev +
                            (prev ? "\n\n" : "") +
                            `[File: ${file.name}]\n${text}`,
                        );
                        inputRef.current?.focus();
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
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
                  placeholder="Ask CalmPilot to do something..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground resize-none outline-none disabled:opacity-50 leading-6"
                  style={{
                    height: "24px",
                    minHeight: "24px",
                    maxHeight: "168px",
                    overflowY: "hidden",
                  }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "24px";
                    const next = Math.min(el.scrollHeight, 168);
                    el.style.height = next + "px";
                    el.style.overflowY = next >= 168 ? "auto" : "hidden";
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <Send strokeWidth={2} size={13} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        title={
          deleteConfirm?.type === "all"
            ? "Delete all history?"
            : deleteConfirm?.type === "range"
              ? `Delete ${deleteConfirm.label}?`
              : "Delete conversation?"
        }
        description={
          deleteConfirm?.type === "all"
            ? "This will permanently delete all your conversations and messages. This cannot be undone."
            : deleteConfirm?.type === "range"
              ? `This will permanently delete all conversations from the ${deleteConfirm.label?.toLowerCase()}. This cannot be undone.`
              : "This will permanently delete this conversation and all its messages. This cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm?.type === "all") {
            handleDeleteAllConversations();
          } else if (deleteConfirm?.type === "range" && deleteConfirm.days) {
            handleDeleteAllConversations(deleteConfirm.days);
          } else if (deleteConfirm?.conversationId) {
            handleDeleteConversation(deleteConfirm.conversationId);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
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

