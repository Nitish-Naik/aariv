import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import {
    mockSubscriptionPlans,
    SubscriptionPlan,
} from "../data/mockSubscriptionPlans";
import { useSubscriptionService } from "../services/subscription";

const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

const pal = (dark: boolean) => ({
  bg: dark ? "#0c0c0e" : "#f7f6f4",
  card: dark ? "#141416" : "#ffffff",
  accent: dark ? "#8b95b0" : "#6b7490",
  accentSoft: dark ? "rgba(139,149,176,0.12)" : "rgba(107,116,144,0.10)",
  textPri: dark ? "#e4e2df" : "#1a1918",
  textSec: dark ? "#908c88" : "#6a6662",
  textMut: dark ? "#5a5754" : "#9a9794",
  border: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
});

type PlanId = "pro" | "business";

const PLANS: { id: PlanId; name: string; price: string; features: string }[] = [
  {
    id: "pro",
    name: "Pro",
    price: "$12/mo",
    features: "500 messages · 5 apps · Voice calls · 30-day history",
  },
  {
    id: "business",
    name: "Business",
    price: "$29/mo",
    features:
      "2000 messages · Unlimited apps · Slack & Teams · Priority support",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = pal(isDark);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");

  const {
    offerings,
    isPro,
    loading: subscriptionLoading,
    error: subscriptionError,
    purchaseSubscription,
    restorePurchases,
    checkProStatus,
  } = useSubscriptionService();

  const purchasablePlans = useMemo(
    () => mockSubscriptionPlans.filter((plan) => plan.priceMonthly !== "Free"),
    [],
  );

  const handleSubscribe = async () => {
    const plan: SubscriptionPlan | undefined =
      purchasablePlans.find((p) => p.isMostPopular) ?? purchasablePlans[0];
    if (!plan || !offerings?.availablePackages) return;

    const pkg = offerings.availablePackages.find(
      (p) =>
        p.product.identifier.includes(plan.id) &&
        p.product.identifier.includes("monthly"),
    );
    if (!pkg) return;

    try {
      const result = await purchaseSubscription(pkg);
      if (result.success) router.back();
    } catch (_) {}
  };

  const handleRestore = async () => {
    try {
      const restored = await restorePurchases();
      if (restored) {
        checkProStatus();
        router.back();
      }
    } catch (_) {}
  };

  const s = styles(c);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Close */}
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
        <Text style={s.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={s.icon}>✦</Text>
        <Text style={s.title}>Upgrade to Pro</Text>
        <Text style={s.subtitle}>
          Unlock voice calls, more messages, and integrations
        </Text>

        {subscriptionError ? (
          <Text style={s.error}>{subscriptionError}</Text>
        ) : null}
        {isPro ? (
          <Text style={s.proMsg}>
            You are currently a Pro subscriber. Thank you!
          </Text>
        ) : null}

        {/* Plan Cards */}
        <View style={s.plans}>
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[s.planCard, active && s.planCardActive]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.8}
              >
                <View style={s.planHeader}>
                  <Text style={s.planName}>{plan.name}</Text>
                  <Text style={s.planPrice}>{plan.price}</Text>
                </View>
                <Text style={s.planFeatures}>{plan.features}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subscribe */}
        <TouchableOpacity
          style={s.subscribeBtn}
          onPress={handleSubscribe}
          disabled={subscriptionLoading || isPro}
          activeOpacity={0.8}
        >
          {subscriptionLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.subscribeBtnText}>
              Continue with {selectedPlan === "pro" ? "Pro" : "Business"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={subscriptionLoading}
        >
          <Text style={s.restoreText}>Restore purchases</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof pal>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    closeBtn: {
      position: "absolute",
      top: Platform.OS === "ios" ? 60 : 16,
      right: 16,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.card,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    closeText: { fontSize: 20, color: c.textMut },

    scroll: {
      paddingTop: 60,
      paddingHorizontal: 24,
      alignItems: "center",
    },

    icon: { fontSize: 48, marginBottom: 20 },
    title: {
      fontFamily: SERIF,
      fontSize: 28,
      color: c.textPri,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: c.textMut,
      textAlign: "center",
      marginBottom: 32,
    },

    error: {
      fontSize: 13,
      color: "#c45c5c",
      textAlign: "center",
      marginBottom: 12,
    },
    proMsg: {
      fontSize: 13,
      color: "#7eb88a",
      textAlign: "center",
      marginBottom: 12,
    },

    plans: { width: "100%", gap: 12, marginBottom: 24 },
    planCard: {
      backgroundColor: c.card,
      borderWidth: 2,
      borderColor: c.border,
      borderRadius: 16,
      padding: 20,
    },
    planCardActive: {
      borderColor: c.accent,
      backgroundColor: c.accentSoft,
    },
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    planName: { fontSize: 18, fontWeight: "600", color: c.textPri },
    planPrice: { fontSize: 18, fontWeight: "600", color: c.accent },
    planFeatures: { fontSize: 13, color: c.textSec, lineHeight: 20 },

    subscribeBtn: {
      width: "100%",
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    subscribeBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    restoreText: { fontSize: 14, color: c.textMut },
  });
