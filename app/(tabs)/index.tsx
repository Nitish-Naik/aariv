import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

/* ─── Palette matching the HTML template ─── */
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
  btnSecondaryBg: isDark ? "#1a1a1d" : "#f0efed",
});

const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});
const sans = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

/* ─── Proposal data (will come from backend later) ─── */
const INITIAL_PROPOSALS = [
  {
    id: "1",
    source: "Email from Sarah",
    time: "2h ago",
    message:
      "Sarah asked about the Q4 timeline. Should I let her know we're targeting mid-November?",
    primary: "Yes, do it",
  },
  {
    id: "2",
    source: "Calendar",
    time: "Tomorrow",
    message:
      "You have back-to-back meetings from 9-12. Want me to add a 15-min buffer between them?",
    primary: "Yes, do it",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getSubMessage = () => {
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 6)
    return "Enjoy your evening. I'll let you know if anything comes up.";
  if (hour < 12) return "A fresh start. I'll handle the rest.";
  return "Everything's under control.";
};

export default function HomeTab() {
  const { isDark } = useTheme();
  const p = pal(isDark);
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim]);

  const handleDismiss = useCallback((id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const hasProposals = proposals.length > 0;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: p.bgDeep }]}
      edges={["top", "bottom"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Calm state (no proposals) ── */}
      {!hasProposals && (
        <View style={styles.calmContainer}>
          <Animated.Text
            style={[
              styles.calmIcon,
              { color: p.textMuted, transform: [{ translateY: floatAnim }] },
            ]}
          >
            ✦
          </Animated.Text>
          <Text
            style={[
              styles.calmMessage,
              { color: p.textPrimary, fontFamily: serif },
            ]}
          >
            Nothing needs your attention
          </Text>
          <Text style={[styles.calmSub, { color: p.textMuted }]}>
            {getSubMessage()}
          </Text>
        </View>
      )}

      {/* ── Proposals state ── */}
      {hasProposals && (
        <ScrollView
          contentContainerStyle={styles.proposalsScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.greeting,
                { color: p.textPrimary, fontFamily: serif },
              ]}
            >
              {getGreeting()}
            </Text>
            <Text style={[styles.subGreeting, { color: p.textMuted }]}>
              A few things for you
            </Text>
          </View>

          {/* Cards */}
          {proposals.map((card) => (
            <View
              key={card.id}
              style={[
                styles.card,
                {
                  backgroundColor: p.bgCard,
                  borderColor: p.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardSource, { color: p.textSecondary }]}>
                  {card.source}
                </Text>
                <Text style={[styles.cardTime, { color: p.textMuted }]}>
                  {card.time}
                </Text>
              </View>
              <Text style={[styles.cardMessage, { color: p.textPrimary }]}>
                {card.message}
              </Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    styles.btnDefer,
                    { backgroundColor: p.bgElevated, borderColor: p.border },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleDismiss(card.id)}
                >
                  <Text style={[styles.btnText, { color: p.textSecondary }]}>
                    Later
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    styles.btnAffirm,
                    { backgroundColor: p.accent },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleDismiss(card.id)}
                >
                  <Text style={[styles.btnText, { color: "#fff" }]}>
                    {card.primary}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  /* ── Calm state ── */
  calmContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  calmIcon: {
    fontSize: 48,
    marginBottom: 24,
    opacity: 0.6,
  },
  calmMessage: {
    fontSize: 24,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 12,
  },
  calmSub: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
  },

  /* ── Proposals ── */
  proposalsScroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "400",
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
  },

  /* ── Card ── */
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardSource: { fontSize: 13 },
  cardTime: { fontSize: 12 },
  cardMessage: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDefer: {
    borderWidth: 1,
  },
  btnAffirm: {},
  btnText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
