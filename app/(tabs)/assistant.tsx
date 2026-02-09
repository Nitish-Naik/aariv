import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ActionReviewCard,
    PulsingAvatar,
    StatusLogCard,
} from "../../components";
import { useTheme } from "../../context/ThemeContext";

import { api } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import type { ActionItem, ChatMessage } from "../../types";
import { MarkdownText } from "../components/MarkdownText";

/* ─── Palette matching HTML template ─── */
const pal = (isDark: boolean) => ({
  bgDeep: isDark ? "#0c0c0e" : "#f7f6f4",
  bgCard: isDark ? "#141416" : "#ffffff",
  bgInput: isDark ? "#1f1f23" : "#f0efed",
  accent: isDark ? "#8b95b0" : "#6b7490",
  accentSoft: isDark ? "rgba(139,149,176,0.12)" : "rgba(107,116,144,0.1)",
  textPrimary: isDark ? "#e4e2df" : "#1a1918",
  textSecondary: isDark ? "#908c88" : "#6a6662",
  textMuted: isDark ? "#5a5754" : "#9a9794",
  border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
});

const SUGGESTION_CHIPS = [
  { label: "Tomorrow's schedule", message: "What's on my calendar tomorrow?" },
  { label: "Draft a reply", message: "Help me draft a reply to Sarah" },
  { label: "Check emails", message: "What emails need my attention?" },
];

export default function AssistantScreen() {
  const { colors, isDark } = useTheme();
  const p = pal(isDark);
  const styles = getStyles(p, isDark);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Proactive Notification Stream
    const controller = new AbortController();
    const startNotificationStream = async () => {
      console.log(`[SSE] Starting notification stream for user: ${userId}`);
      try {
        // Using standard fetch for SSE
        const response = await fetch(
          `${api.getBaseUrl()}/notifications/${userId}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.body) {
          console.error("[SSE] No response body for notifications");
          return;
        }
        console.log("[SSE] Notification stream established");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("[SSE] Notification stream closed");
            break;
          }

          accumulated += decoder.decode(value, { stream: true });
          const parts = accumulated.split("\n\n");
          accumulated = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              try {
                const rawData = part.substring(6);
                console.log("[SSE] Notification received:", rawData);
                const event = JSON.parse(rawData);
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
              } catch (err) {
                console.error("Failed to parse notification event:", err);
              }
            }
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("Notification stream error:", e);
          // Retry after 5 seconds
          setTimeout(startNotificationStream, 5000);
        }
      }
    };

    startNotificationStream();
    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    // Initialize with a welcome message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I am Aariv, your productivity assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);

    getCurrentUser().then((u) => {
      if (u) setUserId(u.id);
    });
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !userId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
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
    setLoading(true);

    try {
      const response = await api.stream("/chat", {
        userId,
        message: userMessage.content,
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
              const eventData = part.substring(6);
              const event = JSON.parse(eventData);

              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id === aiMessageId) {
                    if (event.type === "log") {
                      const newLogs = [...(msg.logs || [])];
                      // Update existing log if label matches, or if it's a transition from Running to Completed
                      const existingIdx = newLogs.findIndex(
                        (l) =>
                          l.label === event.data.label ||
                          (l.label.startsWith("Thinking:") &&
                            event.data.label.startsWith("Completed:") &&
                            l.label.split(":")[1] ===
                              event.data.label.split(":")[1]),
                      );

                      if (existingIdx >= 0) {
                        newLogs[existingIdx] = event.data;
                      } else {
                        newLogs.push(event.data);
                      }
                      return { ...msg, logs: newLogs };
                    } else if (event.type === "auth_required") {
                      const newAuthActions = [...(msg.auth_actions || [])];
                      // Avoid duplicates
                      if (
                        !newAuthActions.some((a) => a.url === event.data.url)
                      ) {
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
                  }
                  return msg;
                }),
              );
            } catch (e) {
              console.error("Failed to parse SSE line:", part, e);
            }
          }
        }
      }
    } catch (e: any) {
      console.error("Chat error:", e);
      const errorMessage =
        "Sorry, I encountered an error: " + (e.message || "Unknown error");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: errorMessage } : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    const isThinking = !item.content && (item.logs?.length || 0) > 0;

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <PulsingAvatar isThinking={isThinking} size={32} />
          </View>
        )}
        <View
          style={[
            styles.messageContent,
            isUser ? styles.userContent : styles.assistantContent,
            item.is_proactive && styles.proactiveContent,
          ]}
        >
          {item.is_proactive && (
            <View style={styles.proactiveBadge}>
              <Ionicons name="flash" size={12} color="#FFD700" />
              <Text style={styles.proactiveBadgeText}>PROACTIVE SUMMARY</Text>
            </View>
          )}

          {/* Render Logs (Thinking Process) - Minimal Inline Style */}
          {item.logs && item.logs.length > 0 && (
            <View style={{ marginBottom: item.content ? 12 : 0, gap: 2 }}>
              {item.logs.map((log, idx) => {
                // Only show physical cards for completed/historic logs if message has content
                // Otherwise if thinking, show all in minimal mode
                const isLatest = idx === item.logs!.length - 1;
                if (!item.content || isLatest) {
                  return (
                    <StatusLogCard
                      key={idx}
                      label={log.label}
                      status={log.status || "completed"}
                      tool={log.tool}
                      minimal={true}
                    />
                  );
                }
                return null;
              })}
            </View>
          )}

          {/* Render Tool Actions for Approval */}
          {item.actions && item.actions.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <ActionReviewCard
                actions={item.actions}
                onApprove={(action: ActionItem) => {
                  console.log("Approved action:", action);
                }}
                onReject={(id: string) => {
                  console.log("Rejected action:", id);
                }}
                isExecuting={false}
              />
            </View>
          )}

          {/* Message Content with Markdown Support */}
          {isUser ? (
            <Text style={styles.userText}>{item.content}</Text>
          ) : item.content ? (
            <MarkdownText content={item.content} />
          ) : null}

          {/* Render Auth Actions if available */}
          {item.auth_actions && item.auth_actions.length > 0 && (
            <View style={{ marginTop: 12, gap: 8 }}>
              {item.auth_actions.map((action, idx) => (
                <View key={idx} style={styles.authCard}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <Text style={styles.authCardTitle}>
                      {`Connect to ${action.appName}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => Linking.openURL(action.url)}
                  >
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderWelcome = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌙</Text>
      <Text style={styles.emptyText}>Here when you need me</Text>
      <View style={styles.chipsContainer}>
        {SUGGESTION_CHIPS.map((chip, index) => (
          <TouchableOpacity
            key={index}
            style={styles.chip}
            onPress={() => {
              setInputText(chip.message);
              handleSendWithText(chip.message);
            }}
          >
            <Text style={styles.chipText}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSendWithText = async (text: string) => {
    if (!text.trim() || !userId) return;
    const prev = inputText;
    setInputText(text);
    // Defer to handleSend logic
    setTimeout(() => {
      setInputText("");
    }, 50);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
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
    setLoading(true);

    try {
      const response = await api.stream("/chat", {
        userId,
        message: userMessage.content,
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
                  if (event.type === "result")
                    return {
                      ...msg,
                      content: event.data.response,
                      auth_actions:
                        event.data.auth_actions?.length > 0
                          ? event.data.auth_actions
                          : msg.auth_actions,
                      logs: event.data.logs || msg.logs,
                    };
                  if (event.type === "error")
                    return { ...msg, content: `Error: ${event.data}` };
                  if (event.type === "log") {
                    const newLogs = [...(msg.logs || [])];
                    const ex = newLogs.findIndex(
                      (l) => l.label === event.data.label,
                    );
                    ex >= 0
                      ? (newLogs[ex] = event.data)
                      : newLogs.push(event.data);
                    return { ...msg, logs: newLogs };
                  }
                  if (event.type === "auth_required") {
                    const na = [...(msg.auth_actions || [])];
                    if (!na.some((a) => a.url === event.data.url))
                      na.push(event.data);
                    return { ...msg, auth_actions: na };
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
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {messages.length <= 1 ? (
        renderWelcome()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputBarOuter}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything..."
              placeholderTextColor={p.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.voiceBtn} onPress={handleSend}>
              <Ionicons
                name={inputText.trim() ? "arrow-up" : "mic"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (p: ReturnType<typeof pal>, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: p.bgDeep,
    },

    /* ── Empty / Welcome state ── */
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 40,
      marginBottom: 16,
      opacity: 0.4,
    },
    emptyText: {
      fontSize: 16,
      color: p.textMuted,
      marginBottom: 24,
      textAlign: "center",
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: p.bgCard,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 20,
    },
    chipText: {
      fontSize: 13,
      color: p.textSecondary,
    },

    /* ── Messages ── */
    listContent: {
      padding: 16,
      paddingBottom: 20,
    },
    messageBubble: {
      flexDirection: "row",
      marginBottom: 16,
      alignItems: "flex-end",
    },
    userBubble: {
      justifyContent: "flex-end",
    },
    assistantBubble: {
      justifyContent: "flex-start",
    },
    avatarContainer: {
      marginRight: 10,
      marginBottom: 2,
      opacity: 0.8,
    },
    messageContent: {
      maxWidth: "85%",
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "transparent",
    },
    userContent: {
      backgroundColor: p.accent,
      borderBottomRightRadius: 6,
    },
    assistantContent: {
      backgroundColor: p.bgCard,
      borderColor: p.border,
      borderBottomLeftRadius: 6,
    },
    userText: {
      color: "#fff",
      fontSize: 15,
      lineHeight: 23,
    },

    /* ── Input bar ── */
    inputBarOuter: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: Platform.OS === "ios" ? 28 : 20,
      backgroundColor: p.bgDeep,
      borderTopWidth: 1,
      borderTopColor: p.border,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: p.bgInput,
      borderRadius: 24,
      paddingLeft: 18,
      paddingRight: 6,
      minHeight: 50,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: p.textPrimary,
      maxHeight: 120,
      paddingVertical: 10,
    },
    voiceBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: p.accent,
      alignItems: "center",
      justifyContent: "center",
    },

    /* ── Auth cards ── */
    authCard: {
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: p.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    authCardTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: p.textPrimary,
    },
    connectButton: {
      backgroundColor: p.accent,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    connectButtonText: {
      color: "#FFF",
      fontSize: 13,
      fontWeight: "bold",
    },
    proactiveContent: {
      borderColor: p.accent,
      backgroundColor: p.accentSoft,
    },
    proactiveBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 8,
      backgroundColor: p.accentSoft,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: "flex-start",
    },
    proactiveBadgeText: {
      fontSize: 10,
      fontWeight: "900",
      color: p.accent,
    },
  });
