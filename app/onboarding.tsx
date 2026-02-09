import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useIntegrations } from "../hooks/useIntegrations";
import { api } from "../services/api";
import { getCurrentUser } from "../services/auth";
import { setOnboardingComplete } from "../utils/onboarding";

const DEEP_LINK_SCHEME = "aariv://";
const { width: SCREEN_W } = Dimensions.get("window");
const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

const pal = (dark: boolean) => ({
  bg: dark ? "#0c0c0e" : "#f7f6f4",
  accent: dark ? "#8b95b0" : "#6b7490",
  textPri: dark ? "#e4e2df" : "#1a1918",
  textSec: dark ? "#908c88" : "#6a6662",
  textMut: dark ? "#5a5754" : "#9a9794",
});

const SLIDES = [
  {
    icon: "✦",
    title: "Welcome to Aariv",
    subtitle: "Your calm companion",
    desc: "Aariv quietly handles life's logistics so you don't have to. No notifications. No pressure. Just calm.",
  },
  {
    icon: "🌙",
    title: "Nothing unless necessary",
    subtitle: "We respect your attention",
    desc: "Aariv only surfaces what truly needs you. When nothing needs your attention, you'll see exactly that.",
  },
  {
    icon: "💬",
    title: "Here when you need",
    subtitle: "Your copilot awaits",
    desc: "Ask anything. Get help thinking through decisions. Or just chat. Aariv is here, not demanding — just present.",
  },
  {
    icon: "📅",
    title: "Let's get started",
    subtitle: "Connect your calendar",
    desc: "Connect Google Calendar so Aariv can help you stay prepared. You can add more sources later.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = pal(isDark);

  const [userId, setUserId] = useState<string | null>(null);
  const { refetch } = useIntegrations(userId || undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLast = currentIndex === SLIDES.length - 1;

  /* ── get user ── */
  React.useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setUserId(user.id);
    });
  }, []);

  /* ── poll for Gmail connection ── */
  useFocusEffect(
    useCallback(() => {
      const poll = async () => {
        const fetchedIntegrations = await refetch();
        const hasGmail = fetchedIntegrations?.some((i) => {
          const appNameLower = i.appName?.toLowerCase() || "";
          return (
            (appNameLower.includes("gmail") || appNameLower === "googlemail") &&
            i.status === "ACTIVE"
          );
        });
        if (hasGmail) {
          await setOnboardingComplete();
          router.replace("/(tabs)");
        }
      };
      poll();
    }, [refetch, router]),
  );

  /* ── connect Gmail ── */
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;
      const response = await api.post("/integrations/connect", {
        userId: user.id,
        appName: "gmail",
        platform: Platform.OS === "web" ? "web" : "mobile",
      });
      if (response.url) {
        if (Platform.OS === "web") {
          Linking.openURL(response.url);
        } else {
          await WebBrowser.openAuthSessionAsync(response.url, DEEP_LINK_SCHEME);
        }
      }
    } catch (error) {
      console.error("Connect failed", error);
    } finally {
      setIsConnecting(false);
    }
  };

  /* ── navigation ── */
  const handleContinue = () => {
    if (isLast) {
      handleConnect();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    await setOnboardingComplete();
    router.replace("/(tabs)");
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
      {/* Skip */}
      <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
        <Text style={[s.skipText, { color: c.textMut }]}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={[s.slide, { width: SCREEN_W }]}>
            <Text style={s.slideIcon}>{item.icon}</Text>
            <Text style={[s.slideTitle, { color: c.textPri }]}>
              {item.title}
            </Text>
            <Text style={[s.slideSub, { color: c.accent }]}>
              {item.subtitle}
            </Text>
            <Text style={[s.slideDesc, { color: c.textSec }]}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              { backgroundColor: i === currentIndex ? c.accent : c.textMut },
              i === currentIndex && s.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Bottom */}
      <View style={s.bottom}>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: c.accent }]}
          onPress={handleContinue}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>
              {isLast ? "Connect Google" : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
        {isLast && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[s.laterText, { color: c.textMut }]}>
              I'll do this later
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  skipBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 16,
    right: 20,
    zIndex: 10,
  },
  skipText: { fontSize: 15 },

  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  slideIcon: { fontSize: 64, marginBottom: 32 },
  slideTitle: {
    fontFamily: SERIF,
    fontSize: 26,
    textAlign: "center",
    marginBottom: 8,
  },
  slideSub: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  slideDesc: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 26,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
  },

  bottom: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
  },
  btn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  laterText: {
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 12,
  },
});
