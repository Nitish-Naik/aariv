import React, { useCallback, useState } from "react";
import {
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

/* ─── Palette ─── */
const pal = (isDark: boolean) => ({
  bgDeep: isDark ? "#0c0c0e" : "#f7f6f4",
  bgCard: isDark ? "#141416" : "#ffffff",
  bgElevated: isDark ? "#1a1a1d" : "#ffffff",
  accent: isDark ? "#8b95b0" : "#6b7490",
  accentSoft: isDark ? "rgba(139,149,176,0.12)" : "rgba(107,116,144,0.1)",
  textPrimary: isDark ? "#e4e2df" : "#1a1918",
  textSecondary: isDark ? "#908c88" : "#6a6662",
  textMuted: isDark ? "#5a5754" : "#9a9794",
  border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
});

const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

interface ReviewItem {
  id: string;
  icon: string;
  source: string;
  context: string;
  summary: string;
  question: string;
}

const MOCK_REVIEW_ITEMS: ReviewItem[] = [
  {
    id: "1",
    icon: "📧",
    source: "Email from Mike",
    context: "Waiting 2 days",
    summary: "Asked about the budget proposal",
    question: "Should I draft a response?",
  },
  {
    id: "2",
    icon: "📅",
    source: "Calendar",
    context: "Tomorrow",
    summary: "Design review meeting needs attendees confirmed",
    question: "Want me to send reminders?",
  },
];

export default function ReviewTab() {
  const { isDark } = useTheme();
  const p = pal(isDark);
  const [items, setItems] = useState<ReviewItem[]>(MOCK_REVIEW_ITEMS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleAction = useCallback((id: string, action: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // In production, fetch from backend
    setTimeout(() => {
      setItems(MOCK_REVIEW_ITEMS);
      setRefreshing(false);
    }, 800);
  };

  const hasItems = items.length > 0;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: p.bgDeep }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[styles.title, { color: p.textPrimary, fontFamily: serif }]}
        >
          Review
        </Text>
        <Text style={[styles.subtitle, { color: p.textMuted }]}>
          Items that may need your judgment
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={p.accent}
          />
        }
      >
        {/* Empty state */}
        {!hasItems && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>☁️</Text>
            <Text
              style={[
                styles.emptyTitle,
                { color: p.textPrimary, fontFamily: serif },
              ]}
            >
              Nothing needs your judgment
            </Text>
            <Text style={[styles.emptyText, { color: p.textMuted }]}>
              I've processed everything for now.
            </Text>
          </View>
        )}

        {/* Review cards */}
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: p.bgCard, borderColor: p.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={[styles.cardSource, { color: p.textSecondary }]}>
                {item.source}
              </Text>
              <Text style={[styles.cardContext, { color: p.textMuted }]}>
                {item.context}
              </Text>
            </View>
            <Text style={[styles.cardSummary, { color: p.textPrimary }]}>
              {item.summary}
            </Text>
            <Text style={[styles.cardQuestion, { color: p.accent }]}>
              {item.question}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: p.bgElevated, borderColor: p.border },
                ]}
                activeOpacity={0.8}
                onPress={() => handleAction(item.id, "dismiss")}
              >
                <Text
                  style={[styles.actionBtnText, { color: p.textSecondary }]}
                >
                  Dismiss
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: p.bgElevated, borderColor: p.border },
                ]}
                activeOpacity={0.8}
                onPress={() => handleAction(item.id, "defer")}
              >
                <Text
                  style={[styles.actionBtnText, { color: p.textSecondary }]}
                >
                  Later
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.primaryBtn,
                  { backgroundColor: p.accent },
                ]}
                activeOpacity={0.8}
                onPress={() => handleAction(item.id, "affirm")}
              >
                <Text style={[styles.actionBtnText, { color: "#fff" }]}>
                  Yes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "400",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  /* Empty */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },

  /* Card */
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardIcon: { fontSize: 18 },
  cardSource: { fontSize: 13 },
  cardContext: { fontSize: 12, marginLeft: "auto" },
  cardSummary: {
    fontSize: 15,
    marginBottom: 8,
  },
  cardQuestion: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 16,
  },

  /* Actions */
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  primaryBtn: {
    borderWidth: 0,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
