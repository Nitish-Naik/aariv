import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/Card";
import { PlatformIcon } from "../../components/PlatformIcon";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { borderRadius, spacing, typography } from "../../theme";
// import { MOCK_INBOX_ITEMS } from "../../utils/mockData";

interface InboxItem {
    id: string;
    threadId?: string;
    sender: string;
    subject: string;
    snippet: string;
    time: string;
    unread: boolean;
    priority: "high" | "low";
    actionRequired: boolean;
    suggestedAction?: string;
}

export default function PriorityTab() {
  const router = useRouter();
  const [filter, setFilter] = useState<"high_priority" | "all">("high_priority");
  const [messages, setMessages] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);


  const fetchInbox = useCallback(async () => {
         try {
           setError(null);
           const user = await getCurrentUser();
           if (!user) {
             throw new Error("You are signed out. Please log in again.");
           }
           const data = await api.get(`/inbox?userId=${user.id}&filter=${filter}`);
           setMessages(Array.isArray(data.messages) ? data.messages : []);
         } catch (e: any) {
           console.log("Failed to fetch inbox", e);
           setError(e?.message || "Failed to load inbox");
         } finally {
           setLoading(false);
         }
  }, [filter]);

  useEffect(() => {
      fetchInbox();
  }, [fetchInbox]);

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchInbox();
      setRefreshing(false);
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: InboxItem;
    index: number;
  }) => {
    // Real Data Rendering
    const isActionable = item.actionRequired;
    const suggestedAction = item.suggestedAction;
    const actionType = item.suggestedAction?.toLowerCase().includes("calendar") ? "calendar" : "reply";
    
    return (
      <Card
        // Different visual treatment for priority cards to reduce scanning effort
        style={[styles.messageCard, isActionable && styles.actionCard]}
        padding={0} // Custom padding handling
      >
        <TouchableOpacity style={styles.cardInner} onPress={() => {}}>
          {/* 1. Header: Quick Context (Who & When) */}
          <View style={styles.messageHeader}>
            <View style={styles.senderInfo}>
              <PlatformIcon platform={'gmail'} size={16} />
              <Text style={styles.sender}>{item.sender}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>

          {/* 2. Content: Focused Subject */}
          <Text style={styles.subject} numberOfLines={1}>
            {item.subject}
          </Text>
          <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: 4, paddingHorizontal: 16 }} numberOfLines={2}>
              {item.snippet}
          </Text>

          {/* 3. DECISION LAYER (The Mental Load Reducer) */}
          {isActionable && suggestedAction ? (
            <View style={styles.actionBlock}>
              <View style={styles.aiReasoning}>
                <Ionicons
                  name={
                    actionType === "calendar"
                      ? "calendar"
                      : "return-up-back"
                  }
                  size={14}
                  color={colors.primary[500]}
                />
                <Text style={styles.aiReasoningText}>{suggestedAction}</Text>
              </View>

              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.actionButtonSecondary}
                  onPress={() =>
                    router.push({
                      pathname: "/edit-action",
                      params: {
                        id: item.id,
                        title: item.subject,
                        description: suggestedAction,
                        platform: 'gmail',
                      },
                    })
                  }
                >
                  <Text style={styles.actionButtonTextSecondary}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButtonPrimary}>
                  <Text style={styles.actionButtonTextPrimary}>
                    {actionType === "reply" ? "Send" : "Approve"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
             <View style={{ marginBottom: 16 }} />
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Decisions</Text>
          <Text style={styles.briefing}>
            <Text style={styles.highlight}>3 high priority</Text> items pending.
            Zero inbox is within reach.
          </Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons
            name="file-tray-full"
            size={24}
            color={colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: isDark ? "#40202a" : "#fff5f5", marginBottom: 12 }}>
          <Text style={{ color: colors.text, marginBottom: 4 }}>Could not load inbox.</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>{error}</Text>
          <TouchableOpacity onPress={fetchInbox} style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="refresh" size={16} color={colors.primary[500]} />
            <Text style={{ color: colors.primary[500], marginLeft: 6 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tab, filter === "high_priority" && styles.activeTab]}
          onPress={() => setFilter("high_priority")}
        >
          <Text
            style={[
              styles.tabText,
              filter === "high_priority" && styles.activeTabText,
            ]}
          >
            Decisions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === "all" && styles.activeTab]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[styles.tabText, filter === "all" && styles.activeTabText]}
          >
            Everything Else
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
        }
        ListEmptyComponent={() => (
            loading ? (
              <ActivityIndicator style={{marginTop: 40}} color={colors.primary[500]} />
            ) : error ? (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Ionicons name="warning" size={48} color={colors.textTertiary} />
                <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Could not load inbox.</Text>
              </View>
            ) : (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                  <Ionicons name="mail-open-outline" size={48} color={colors.textTertiary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No messages found</Text>
              </View>
            )
        )}
      />

      {/* Floating Copilot Bar (Improved for Visual Lightness) */}
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.copilotWrapper}
      >
        <View style={styles.copilotIsland}>
          <View style={styles.copilotInputContainer}>
            <Ionicons
              name="sparkles"
              size={18}
              color={colors.primary[500]}
              style={styles.copilotIcon}
            />
            <TextInput
              style={styles.copilotInput}
              placeholder="Ask Aariv..."
              placeholderTextColor={colors.textTertiary}
            />
            <TouchableOpacity style={styles.micButtonSmall}>
              <Ionicons name="mic" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing[6],
      marginBottom: spacing[6],
      paddingTop: spacing[8], // Matches Home Tab alignment
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing[4],
    },
    greeting: {
      ...typography.textStyles.h2,
      color: colors.text,
      marginBottom: spacing[2],
    },
    briefing: {
      ...typography.textStyles.body,
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    highlight: {
      color: colors.primary[500],
      fontWeight: "600",
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },
    filterTabs: {
      flexDirection: "row",
      paddingHorizontal: spacing[6],
      marginBottom: spacing[4],
      gap: spacing[4],
    },
    tab: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      borderRadius: borderRadius.full,
      backgroundColor: "transparent",
    },
    activeTab: {
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.15)"
        : colors.neutral[100],
    },
    tabText: {
      ...typography.textStyles.button,
      color: colors.textSecondary,
      fontSize: 14,
    },
    activeTabText: {
      color: colors.primary[500],
      fontWeight: "600",
    },
    listContent: {
      paddingHorizontal: spacing[6],
      paddingBottom: 120, // Space for Copilot bar
    },

    // CARD STYLES
    messageCard: {
      marginBottom: spacing[4],
      borderWidth: 1,
      borderColor: "transparent",
      overflow: "hidden", // Contain buttons
    },
    actionCard: {
      borderColor: isDark ? colors.primary[900] : colors.primary[100],
      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
    },
    cardInner: {
      padding: spacing[4],
    },
    messageHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing[2],
      alignItems: "center",
    },
    senderInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[2],
    },
    sender: {
      ...typography.textStyles.bodySmall,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    time: {
      ...typography.textStyles.caption,
      color: colors.textTertiary,
    },
    subject: {
      ...typography.textStyles.h4,
      fontSize: 15,
      color: colors.text,
      marginBottom: spacing[3],
    },
    preview: {
      ...typography.textStyles.bodySmall,
      color: colors.textSecondary,
      lineHeight: 20,
    },

    // DECISION LAYER STYLES (Mental Load Reducers)
    actionBlock: {
      marginTop: spacing[1],
    },
    aiReasoning: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[1.5],
      marginBottom: spacing[3],
    },
    aiReasoningText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text, // Prominent text
    },
    quickActions: {
      flexDirection: "row",
      gap: spacing[2],
    },
    actionButtonPrimary: {
      backgroundColor: colors.primary[500],
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.md,
      flex: 1,
      alignItems: "center",
      minHeight: 44, // Ensure touch target size
    },
    actionButtonSecondary: {
      backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.md,
      flex: 1,
      alignItems: "center",
      minHeight: 44, // Ensure touch target size
    },
    actionTextPrimary: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 13,
    },
    actionTextSecondary: {
      color: colors.text,
      fontWeight: "500",
      fontSize: 13,
    },

    // FLOATING ISLAND STYLES
    copilotWrapper: {
      position: "absolute",
      bottom: 90, // Pushed UP to avoid the new Floating Tab Dock (which is ~64px high + margins)
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 100,
    },
    copilotIsland: {
      width: "90%",
      maxWidth: 400,
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderRadius: 30, // Capsule
      padding: 6,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",

      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    copilotInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing[3],
      height: 44,
    },
    copilotIcon: {
      marginRight: spacing[2],
      opacity: 0.8,
    },
    copilotInput: {
      flex: 1,
      color: colors.text,
      ...typography.textStyles.body,
      fontSize: 15,
    },
    micButtonSmall: {
      padding: spacing[2],
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
      borderRadius: 100,
    },
  });
