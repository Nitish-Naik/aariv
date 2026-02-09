import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { deleteAccount, getCurrentUser, signOut } from "../../services/auth";
import type { User } from "../../types";

/* ── colour helper (same pattern as other screens) ── */
const pal = (dark: boolean) => ({
  bg: dark ? "#0c0c0e" : "#f7f6f4",
  card: dark ? "#141416" : "#ffffff",
  elevated: dark ? "#1a1a1d" : "#f0efed",
  accent: dark ? "#8b95b0" : "#6b7490",
  accentSoft: dark ? "rgba(139,149,176,0.12)" : "rgba(107,116,144,0.10)",
  textPri: dark ? "#e4e2df" : "#1a1918",
  textSec: dark ? "#908c88" : "#6a6662",
  textMut: dark ? "#5a5754" : "#9a9794",
  border: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  success: "#7eb88a",
  successSoft: dark ? "rgba(126,184,138,0.12)" : "rgba(126,184,138,0.12)",
  warning: "#c6a27a",
  warningSoft: dark ? "rgba(198,162,122,0.12)" : "rgba(198,162,122,0.12)",
  error: "#c45c5c",
  trackOn: dark ? "#8b95b0" : "#6b7490",
  trackOff: dark ? "#2a2a2d" : "#d4d3d0",
});

const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

/* ── source data ── */
const SOURCES = [
  {
    name: "Google Calendar",
    emoji: "📅",
    badge: "Connected",
    badgeType: "connected",
  },
  { name: "Gmail", emoji: "📧", badge: "Pro", badgeType: "pro" },
  { name: "Slack", emoji: "💬", badge: "+ Add", badgeType: "add" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, setTheme } = useTheme();
  const c = pal(isDark);

  const [user, setUser] = useState<User | null>(null);

  /* toggle states */
  const [onlyNecessary, setOnlyNecessary] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [draftResponses, setDraftResponses] = useState(true);
  const [protectFocus, setProtectFocus] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);
  const loadUser = async () => {
    setUser(await getCurrentUser());
  };

  /* ── auth actions ── */
  const handleSignOut = () =>
    Alert.alert("Sign Out?", "You'll be signed out of Aariv.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);

  const handleDeleteAccount = () =>
    Alert.alert(
      "Delete Account?",
      "This is irreversible. All data will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            try {
              await deleteAccount(user.id);
              router.replace("/login");
            } catch (e: any) {
              Alert.alert("Error", "Failed to delete account: " + e.message);
            }
          },
        },
      ],
    );

  /* ── badge colour ── */
  const badgeStyle = (type: string) => {
    if (type === "connected") return { bg: c.successSoft, text: c.success };
    if (type === "pro") return { bg: c.warningSoft, text: c.warning };
    return { bg: c.accentSoft, text: c.accent };
  };

  /* ── shared switch props ── */
  const sw = (value: boolean, onChange: (v: boolean) => void) => ({
    value,
    onValueChange: onChange,
    trackColor: { true: c.trackOn, false: c.trackOff },
    thumbColor: "#fff",
  });

  const s = styles(c, isDark);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Text style={s.title}>Your Boundaries</Text>
        <Text style={s.subtitle}>Control when Aariv speaks</Text>

        {/* ── Connected Sources ── */}
        <Text style={s.section}>Connected Sources</Text>
        <View style={s.card}>
          {SOURCES.map((src, i) => {
            const b = badgeStyle(src.badgeType);
            return (
              <React.Fragment key={src.name}>
                {i > 0 && <View style={s.divider} />}
                <TouchableOpacity
                  style={s.row}
                  onPress={() => router.push("/connect-platforms")}
                >
                  <View style={s.iconBox}>
                    <Text style={s.iconEmoji}>{src.emoji}</Text>
                  </View>
                  <View style={s.itemContent}>
                    <Text style={s.rowLabel}>{src.name}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: b.bg }]}>
                    <Text style={[s.badgeText, { color: b.text }]}>
                      {src.badge}
                    </Text>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* ── When to Surface ── */}
        <Text style={s.section}>When to Surface</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={s.itemContent}>
              <Text style={s.rowLabel}>Only when necessary</Text>
              <Text style={s.rowSub}>Skip routine updates</Text>
            </View>
            <Switch {...sw(onlyNecessary, setOnlyNecessary)} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={s.itemContent}>
              <Text style={s.rowLabel}>Respect quiet hours</Text>
              <Text style={s.rowSub}>10 PM – 8 AM</Text>
            </View>
            <Switch {...sw(quietHours, setQuietHours)} />
          </View>
        </View>

        {/* ── Copilot Behaviour ── */}
        <Text style={s.section}>Copilot Behaviour</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={s.itemContent}>
              <Text style={s.rowLabel}>Draft responses</Text>
              <Text style={s.rowSub}>Prepare replies for approval</Text>
            </View>
            <Switch {...sw(draftResponses, setDraftResponses)} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={s.itemContent}>
              <Text style={s.rowLabel}>Protect focus time</Text>
              <Text style={s.rowSub}>Block calendar during deep work</Text>
            </View>
            <Switch {...sw(protectFocus, setProtectFocus)} />
          </View>
        </View>

        {/* ── More ── */}
        <Text style={s.section}>More</Text>
        <View style={s.card}>
          <TouchableOpacity
            style={s.row}
            onPress={() => router.push("/toolkits")}
          >
            <View style={s.iconBox}>
              <Text style={s.iconEmoji}>🧩</Text>
            </View>
            <View style={[s.itemContent, { flex: 1 }]}>
              <Text style={s.rowLabel}>Integrations</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Appearance ── */}
        <Text style={s.section}>Appearance</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={s.itemContent}>
              <Text style={s.rowLabel}>Theme</Text>
            </View>
            <View style={s.themeRow}>
              <TouchableOpacity
                style={[s.themeBtn, !isDark && s.themeBtnActive]}
                onPress={() => setTheme("light")}
              >
                <Text style={[s.themeBtnText, !isDark && s.themeBtnTextActive]}>
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.themeBtn, isDark && s.themeBtnActive]}
                onPress={() => setTheme("dark")}
              >
                <Text style={[s.themeBtnText, isDark && s.themeBtnTextActive]}>
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Account ── */}
        <Text style={s.section}>Account</Text>
        <View style={s.card}>
          <TouchableOpacity
            style={s.row}
            onPress={() => router.push("/paywall")}
          >
            <View style={s.iconBox}>
              <Text style={s.iconEmoji}>✦</Text>
            </View>
            <View style={[s.itemContent, { flex: 1 }]}>
              <Text style={s.rowLabel}>Subscription</Text>
              <Text style={s.rowSub}>Free plan · 50 messages/mo</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.row} onPress={handleSignOut}>
            <View style={s.iconBox}>
              <Text style={s.iconEmoji}>👤</Text>
            </View>
            <View style={[s.itemContent, { flex: 1 }]}>
              <Text style={s.rowLabel}>Account</Text>
              <Text style={s.rowSub}>{user?.email ?? "demo@aariv.app"}</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.row} onPress={handleDeleteAccount}>
            <Text style={[s.rowLabel, { flex: 1, color: c.error }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── styles ── */
const styles = (c: ReturnType<typeof pal>, isDark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { paddingHorizontal: 16, paddingTop: 20 },

    title: {
      fontFamily: SERIF,
      fontSize: 28,
      color: c.textPri,
      marginBottom: 4,
      paddingHorizontal: 4,
    },
    subtitle: {
      fontSize: 14,
      color: c.textMut,
      marginBottom: 16,
      paddingHorizontal: 4,
    },

    section: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: c.textMut,
      marginBottom: 12,
      marginTop: 28,
      paddingLeft: 4,
    },

    card: {
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },

    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    iconEmoji: {
      fontSize: 16,
    },

    itemContent: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 15,
      color: c.textPri,
    },
    rowSub: {
      fontSize: 13,
      color: c.textMut,
      marginTop: 2,
    },

    arrow: {
      fontSize: 18,
      color: c.textMut,
    },

    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "500",
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginLeft: 16,
    },

    themeRow: {
      flexDirection: "row",
      gap: 8,
    },
    themeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    themeBtnActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    themeBtnText: {
      fontSize: 13,
      color: c.textSec,
      fontWeight: "500",
    },
    themeBtnTextActive: {
      color: "#fff",
    },
  });
