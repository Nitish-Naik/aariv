import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/Card";
import { HighlightCard } from "../../components/HighlightCard";
import { WebContainer } from "../../components/WebContainer";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { borderRadius, spacing, typography } from "../../theme";
import { inferSeverity } from "../../utils/severityMapping";

import { useIntegrations } from "../../hooks/useIntegrations";
import { analytics } from "../../services/analytics";
// ... imports

export default function HomeTab() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [user, setUser] = useState<any>(null);

  // Recovery State Hook
  const { shouldShowRecoveryState } = useIntegrations();
  const hasLoggedRecoveryRef = React.useRef(false);

  useEffect(() => {
    // Track recovery state shown (once per mount)
    if (shouldShowRecoveryState && !hasLoggedRecoveryRef.current) {
      analytics.trackRecoveryStateShown("home", user?.id);
      hasLoggedRecoveryRef.current = true;
    }
  }, [shouldShowRecoveryState, user]);

  const [events, setEvents] = useState<any[]>([]);
  const [briefing, setBriefing] = useState<{
    greeting: string;
    summary: string;
    counts: { meetings: number; emails: number };
    highlights?: string[];
  } | null>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [missingConnections, setMissingConnections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    (async () => {
      setUser(await getCurrentUser());
      // Load zen mode preference
      const savedZenMode = await AsyncStorage.getItem('zenMode');
      if (savedZenMode) setZenMode(JSON.parse(savedZenMode));
    })();
  }, []);

  // Helper function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Personalized greeting with user name
  const personalizedGreeting = user?.user_metadata?.name
    ? `${getGreeting()}, ${user.user_metadata.name}`
    : user?.email
      ? `${getGreeting()}, ${user.email.split('@')[0]}`
      : getGreeting();

  const checkConnections = useCallback(async (userId: string) => {
    try {
      const res = await api.get(`/integrations?userId=${userId}`);
      const connectedApps = (res.integrations || [])
        .filter((i: any) => i.status === "ACTIVE" || i.status === "CONNECTED")
        .map((i: any) => i.appName.toLowerCase());

      const missing = [];
      if (!connectedApps.some((a: string) => a.includes("gmail")))
        missing.push("Gmail");
      if (!connectedApps.some((a: string) => a.includes("calendar")))
        missing.push("Google Calendar");
      setMissingConnections(missing);
    } catch (e) {
      console.log("Failed to check connections", e);
    }
  }, []);

  const fetchBriefing = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("You are signed out. Please log in again.");
      }
      checkConnections(currentUser.id);
      const data = await api.get(`/dashboard/briefing?userId=${currentUser.id}`);
      setBriefing(data);

      if (data.actions && Array.isArray(data.actions)) {
        setActions(
          data.actions.map((a: any) => ({
            id: a.id,
            title: a.title,
            subtitle: a.subtitle,
            type: a.type,
            status: "pending",
            priority: a.priority || "medium",
            data: a.data,
          })),
        );
      } else {
        setActions([]);
      }

      if (data.events && Array.isArray(data.events)) {
        setEvents(
          data.events.map((e: any) => ({
            ...e,
            startTime: new Date(e.startTime),
            endTime: new Date(e.endTime),
          })),
        );
      } else {
        setEvents([]);
      }
    } catch (e: any) {
      console.log("Failed to fetch briefing", e);
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [user, checkConnections]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchBriefing();
      }
    }, [fetchBriefing, user]),
  );

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchBriefing();
    setRefreshing(false);
  }, [fetchBriefing, user]);

  const toggleZenMode = async () => {
    const newZenMode = !zenMode;
    setZenMode(newZenMode);
    await AsyncStorage.setItem('zenMode', JSON.stringify(newZenMode));
  };

  const stats = {
    pendingActions: actions.filter((a) => a.status === "pending").length,
    unreadMessages: briefing?.counts?.emails || 0,
    todayMeetings: events.length,
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        <WebContainer>
          {error && (
            <View
              style={{
                backgroundColor: isDark ? "#40202a" : "#fff5f5",
                borderRadius: 14,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.text, marginBottom: 4 }}>
                Could not load your briefing.
              </Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
                {error}
              </Text>
              <TouchableOpacity
                onPress={fetchBriefing}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={colors.primary[500]}
                />
                <Text style={{ color: colors.primary[500], marginLeft: 6 }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Header with Personalized Greeting */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{personalizedGreeting}</Text>
              <Text style={styles.briefing}>
                {actions.length > 0 ? (
                  <Text>Here&apos;s what&apos;s waiting for you</Text>
                ) : (
                  <Text>You&apos;re all caught up 🎉</Text>
                )}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              {/* Zen Mode Toggle */}
              <TouchableOpacity
                onPress={toggleZenMode}
                style={[styles.iconButton, zenMode && { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}
              >
                <Ionicons
                  name="leaf-outline"
                  size={20}
                  color={zenMode ? "#059669" : colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Voice Mode Button */}
              <TouchableOpacity
                onPress={() => router.push("/voice-mode")}
                style={styles.iconButton}
              >
                <Ionicons name="mic" size={20} color={colors.primary[500]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Empty State - All Caught Up */}
          {!loading && actions.length === 0 && events.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={64} color={colors.semantic.success} />
              <Text style={styles.emptyTitle}>All Caught Up</Text>
              <Text style={styles.emptySubtitle}>
                You&apos;ve reviewed everything for today.{'\n'}Nice work!
              </Text>
            </View>
          )}

          {/* Missing Connections CTA */}
          {missingConnections.length > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: isDark ? "#1F2937" : "#FFF5F5",
                borderRadius: 16,
                padding: 16,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: isDark ? "#374151" : "#FED7D7",
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              onPress={() => router.push("/connect-platforms")}
              activeOpacity={0.9}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isDark
                    ? "rgba(239, 68, 68, 0.2)"
                    : "#FFF5F5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Ionicons
                  name="alert-circle"
                  size={28}
                  color={isDark ? "#F87171" : "#F56565"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: isDark ? "#F3F4F6" : "#C53030",
                    marginBottom: 4,
                  }}
                >
                  Setup Required
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9CA3AF" : "#718096",
                    lineHeight: 20,
                  }}
                >
                  Connect {missingConnections[0]} to activate your assistant.
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#6B7280" : "#A0AEC0"}
              />
            </TouchableOpacity>
          )}

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/zen-mode")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "#EFF6FF",
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={colors.primary[500]}
                />
              </View>
              <Text style={styles.statValue}>{stats.pendingActions}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/(tabs)/inbox")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(239, 68, 68, 0.15)"
                      : "#FEE2E2",
                  },
                ]}
              >
                <Ionicons
                  name="mail-unread-outline"
                  size={24}
                  color={colors.semantic.error}
                />
              </View>
              <Text style={styles.statValue}>{stats.unreadMessages}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/(tabs)/calendar")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(16, 185, 129, 0.15)"
                      : "#D1FAE5",
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={colors.semantic.success}
                />
              </View>
              <Text style={styles.statValue}>{stats.todayMeetings}</Text>
              <Text style={styles.statLabel}>Meetings</Text>
            </TouchableOpacity>
          </View>

          {/* Zen Mode / Review Queue Main CTA */}
          <TouchableOpacity
            style={styles.zenModeCard}
            onPress={() => router.push("/zen-mode")}
            activeOpacity={0.9}
          >
            <View style={styles.zenContent}>
              <View style={styles.zenIconContainer}>
                <Ionicons
                  name="documents-outline"
                  size={32}
                  color={colors.primary[500]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.zenTitle}>Daily Review</Text>
                <Text style={styles.zenSubtitle}>
                  {actions.length} decisions waiting for your approval
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textTertiary}
              style={styles.zenArrow}
            />
          </TouchableOpacity>

          {/* Today's Schedule */}
          {(events.length > 0 || loading) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/calendar")}>
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <Card style={styles.scheduleCard}>
                {loading ? (
                  <ActivityIndicator
                    color={colors.primary[500]}
                    style={{ padding: spacing[4] }}
                  />
                ) : (
                  events.slice(0, 3).map((event, index) => (
                    <View key={event.id}>
                      <View style={styles.eventItem}>
                        <View
                          style={[
                            styles.eventDot,
                            {
                              backgroundColor:
                                event.color || colors.primary[500],
                            },
                          ]}
                        />
                        <View style={styles.eventContent}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventTime}>
                            {format(event.startTime, "h:mm a")} -{" "}
                            {format(event.endTime, "h:mm a")}
                          </Text>
                        </View>
                      </View>
                      {index < events.slice(0, 3).length - 1 && (
                        <View style={styles.divider} />
                      )}
                    </View>
                  ))
                )}
                {!loading && events.length === 0 && (
                  <Text
                    style={{
                      textAlign: "center",
                      color: colors.textSecondary,
                      padding: spacing[4],
                    }}
                  >
                    No events scheduled
                  </Text>
                )}
              </Card>
            </View>
          )}

          {/* Secondary Sections - Hidden in Zen Mode */}
          {!zenMode && (
            <>
              {/* Integration Status Hub */}
              <View style={styles.section}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[2],
                  }}
                >
                  <Text style={styles.sectionTitle}>System Status</Text>
                  <TouchableOpacity onPress={() => router.push("/toolkits")}>
                    <Text
                      style={{
                        color: colors.primary[500],
                        fontSize: 13,
                        fontWeight: "600",
                        marginBottom: spacing[4],
                      }}
                    >
                      + Add Toolkit
                    </Text>
                  </TouchableOpacity>
                </View>
                <Card style={styles.statusCard}>
                  <View style={styles.statusItem}>
                    <View style={styles.statusLeft}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.statusText}>Gmail Indexing</Text>
                    </View>
                    <Text style={styles.statusValue}>Complete</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statusItem}>
                    <View style={styles.statusLeft}>
                      <Ionicons
                        name="logo-slack"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.statusText}>Slack Channels</Text>
                    </View>
                    <View style={styles.statusRight}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: colors.semantic.warning },
                        ]}
                      />
                      <Text style={styles.statusValue}>Reading...</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statusItem}>
                    <View style={styles.statusLeft}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.statusText}>Calendar Optimize</Text>
                    </View>
                    <Text style={styles.statusValue}>Active</Text>
                  </View>
                </Card>
              </View>

              {/* Highlights / Insights */}
              {((briefing?.highlights && briefing.highlights.length > 0) ||
                loading) && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginBottom: spacing[4] }]}>Highlights</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.nudgeScroll}
                      contentContainerStyle={{ paddingRight: 24 }}
                    >
                      {loading ? (
                        <Card
                          style={[
                            styles.nudgeCard,
                            { width: 280, justifyContent: "center", height: 140 },
                          ]}
                        >
                          <ActivityIndicator color={colors.primary[500]} />
                        </Card>
                      ) : (
                        briefing?.highlights?.map((highlight, index) => {
                          // Parse Title vs Body
                          const parts = highlight.includes(': ') ? highlight.split(': ') : ['Insight', highlight];
                          const title = parts[0];
                          const description = parts.slice(1).join(': ');

                          // Deterministic Severity Inference
                          const severity = inferSeverity(highlight);

                          // Determine Actions based on Severity
                          let actionLabel = undefined;
                          let onActionPress = undefined;

                          if (severity === 'urgent' || severity === 'attention') {
                            actionLabel = 'Review Activity';
                            onActionPress = () => router.push('/(tabs)/settings');
                          }

                          return (
                            <HighlightCard
                              key={index}
                              id={highlight} // Use content as ID for analytics consistency
                              title={title}
                              description={description}
                              severity={severity}
                              actionLabel={actionLabel}
                              onActionPress={onActionPress}
                              alertType="briefing_highlight"
                              screenName="HomeTab"
                              userId={user?.id}
                            />
                          );
                        })
                      )}
                    </ScrollView>
                  </View>
                )}
            </>
          )}

          <View style={{ height: 120 }} />
        </WebContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing[6],
      paddingTop: spacing[12],
      paddingBottom: 100,
    },
    header: {
      marginBottom: spacing[8],
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing[4],
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
      alignItems: "center",
      justifyContent: "center",
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

    // Recovery Card
    recoveryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing[5],
      marginBottom: spacing[6],
      borderWidth: 1,
      borderColor: colors.primary[500],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      gap: spacing[4],
    },
    recoveryIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    recoveryTitle: {
      ...typography.textStyles.h3,
      fontWeight: '700',
    },
    recoverySubtitle: {
      fontSize: 14,
    },
    recoveryCta: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 4,
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing[12],
      marginBottom: spacing[6],
    },
    emptyTitle: {
      ...typography.textStyles.h3,
      color: colors.text,
      marginTop: spacing[4],
      marginBottom: spacing[2],
    },
    emptySubtitle: {
      ...typography.textStyles.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },

    // Today Prepared Card
    todayPreparedCard: {
      backgroundColor: isDark ? 'rgba(5, 150, 105, 0.05)' : 'rgba(5, 150, 105, 0.03)',
      borderRadius: borderRadius.xl,
      padding: spacing[5],
      marginBottom: spacing[6],
      borderWidth: 1,
      borderColor: isDark ? 'rgba(5, 150, 105, 0.2)' : 'rgba(5, 150, 105, 0.1)',
    },
    todayPreparedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    todayPreparedDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#059669',
      marginRight: spacing[2],
    },
    todayPreparedTitle: {
      ...typography.textStyles.h4,
      color: colors.text,
      fontSize: 15,
      fontWeight: '500',
    },
    todayPreparedStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    todayPreparedStat: {
      alignItems: 'center',
      flex: 1,
    },
    todayPreparedValue: {
      ...typography.textStyles.h2,
      color: colors.text,
      fontSize: 28,
      marginBottom: spacing[1],
    },
    todayPreparedLabel: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    todayPreparedDivider: {
      width: 1,
      height: 32,
      backgroundColor: isDark ? 'rgba(5, 150, 105, 0.2)' : 'rgba(5, 150, 105, 0.15)',
    },
    todayPreparedZenHint: {
      ...typography.textStyles.caption,
      color: '#059669',
      textAlign: 'center',
      marginTop: spacing[3],
      fontSize: 11,
    },

    // Zen Mode Card
    zenModeCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing[5],
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[8],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 16,
      elevation: 4,
    },
    zenContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[4],
      flex: 1,
    },
    zenIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },
    zenTitle: {
      ...typography.textStyles.h4,
      color: colors.text,
      marginBottom: 2,
    },
    zenSubtitle: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
    },
    zenArrow: {
      marginLeft: spacing[0],
    },

    // Quick Stats
    statsContainer: {
      flexDirection: "row",
      gap: spacing[3],
      marginBottom: spacing[6],
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing[2],
    },
    statValue: {
      ...typography.textStyles.h3,
      color: colors.text,
      marginBottom: spacing[1],
    },
    statLabel: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
    },

    // Integration Status
    section: {
      marginBottom: spacing[8],
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing[4],
    },
    sectionTitle: {
      ...typography.textStyles.h4,
      color: colors.text,
    },
    seeAllText: {
      ...typography.textStyles.bodySmall,
      color: colors.primary[500],
      fontWeight: "600",
    },
    statusCard: {
      padding: 0,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    statusItem: {
      padding: spacing[4],
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[3],
    },
    statusText: {
      ...typography.textStyles.bodySmall,
      color: colors.text,
      fontWeight: "500",
    },
    statusRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing[2],
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusValue: {
      ...typography.textStyles.caption,
      color: colors.textTertiary,
      fontWeight: "600",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing[4],
    },

    // Schedule
    scheduleCard: {
      padding: 0,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    eventItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing[4],
    },
    eventDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: spacing[3],
    },
    eventContent: {
      flex: 1,
    },
    eventTitle: {
      ...typography.textStyles.body,
      color: colors.text,
      fontWeight: "500",
      marginBottom: spacing[1],
    },
    eventTime: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
    },

    // Nudges
    nudgeScroll: {
      marginHorizontal: -spacing[6],
      paddingHorizontal: spacing[6],
    },
    nudgeCard: {
      width: 280,
      marginRight: spacing[4],
      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      borderWidth: 1,
      padding: spacing[5],
      borderRadius: borderRadius.xl,
      justifyContent: 'center',
      minHeight: 140,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
  });
