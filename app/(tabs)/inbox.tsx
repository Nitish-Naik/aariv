import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
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
           const data = await api.get(`/inbox?userId=${user.id}`);
           setMessages(Array.isArray(data.messages) ? data.messages : []);
         } catch (e: any) {
           console.log("Failed to fetch inbox", e);
           setError(e?.message || "Failed to load inbox");
         } finally {
           setLoading(false);
         }
  }, []);

  useEffect(() => {
      fetchInbox();
  }, [fetchInbox]);

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchInbox();
      setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Inbox</Text>
          <Text style={styles.briefing}>
            Items prepared for your review.
          </Text>
        </View>
      </View>

      {error && (
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: isDark ? "#40202a" : "#fff5f5", marginBottom: 12, marginHorizontal: spacing[6] }}>
          <Text style={{ color: colors.text, marginBottom: 4 }}>Could not load inbox.</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>{error}</Text>
          <TouchableOpacity onPress={fetchInbox} style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="refresh" size={16} color={colors.primary[500]} />
            <Text style={{ color: colors.primary[500], marginLeft: 6 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
        }
      >
        {loading ? (
          <ActivityIndicator style={{marginTop: 40}} color={colors.primary[500]} />
        ) : error ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="warning" size={48} color={colors.textTertiary} />
            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Could not load inbox.</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 40 }}>
              <Ionicons name="mail-open-outline" size={48} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No messages found</Text>
          </View>
        ) : (
          messages.map((item, index) => (
            <Card
              key={item.id}
              style={styles.messageCard}
              padding={0}
            >
              <TouchableOpacity style={styles.cardInner} onPress={() => {}}>
                <View style={styles.messageHeader}>
                  <View style={styles.senderInfo}>
                    <PlatformIcon platform={'gmail'} size={16} />
                    <Text style={styles.sender}>{item.sender}</Text>
                  </View>
                  <Text style={styles.time}>{item.time}</Text>
                </View>

                <Text style={styles.subject} numberOfLines={2}>
                  {item.subject}
                </Text>
                <Text style={styles.preview} numberOfLines={2}>
                    {item.snippet}
                </Text>
              </TouchableOpacity>
            </Card>
          ))
        )}
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
    listContent: {
      paddingHorizontal: spacing[6],
      paddingBottom: 120, // Space for Copilot bar
      flexGrow: 1,
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
  });