import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { borderRadius, spacing, typography } from "../theme";

type Period = "monthly" | "annually";

const FEATURE_LIST = [
  {
    id: "feat-email",
    icon: "mail-outline" as const,
    text: "Connect email & more sources",
  },
  {
    id: "feat-calendar",
    icon: "calendar-outline" as const,
    text: "All calendar providers",
  },
  {
    id: "feat-conversations",
    icon: "chatbubble-ellipses-outline" as const,
    text: "Longer conversations",
  },
  {
    id: "feat-calls",
    icon: "call-outline" as const,
    text: "Voice calls",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("annually");
  const { colors, isDark } = useTheme();

  const {
    offerings,
    isPro,
    loading: subscriptionLoading,
    error: subscriptionError,
    purchaseSubscription,
    restorePurchases,
    checkProStatus,
  } = useSubscriptionService();

  const styles = getStyles(colors, isDark);
  const sparkleColor = isDark ? "#E6D6C6" : "#7C6C5A";
  const featureIconColor = isDark ? "#C9C0B5" : "#7A6A5C";
  const ctaTextColor = "#FFFFFF";

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!offerings?.availablePackages) {
      console.error("Subscription offerings not available.");
      return;
    }

    const packageToPurchase = offerings.availablePackages.find((pkg) => {
      const periodSuffix = selectedPeriod === "monthly" ? "monthly" : "annual";
      return (
        pkg.product.identifier.includes(plan.id) &&
        pkg.product.identifier.includes(periodSuffix)
      );
    });

    if (!packageToPurchase) {
      console.error(
        `Could not find RevenueCat package for ${plan.name} (${selectedPeriod})`,
      );
      return;
    }

    try {
      const purchaseResult = await purchaseSubscription(packageToPurchase);
      if (purchaseResult.success) {
        console.log(`Successfully subscribed to ${plan.name}`);
        router.back();
      } else {
        console.log("Purchase was cancelled or unsuccessful.");
      }
    } catch (error) {
      // Error already logged by useSubscriptionService
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const restored = await restorePurchases();
      if (restored) {
        console.log("Purchases restored successfully.");
        checkProStatus();
        router.back();
      } else {
        console.log("No purchases to restore or restore failed.");
      }
    } catch (error) {
      // Error already logged by useSubscriptionService
    }
  };

  const purchasablePlans = useMemo(
    () => mockSubscriptionPlans.filter((plan) => plan.priceMonthly !== "Free"),
    [],
  );
  const selectedPlan: SubscriptionPlan | undefined =
    purchasablePlans.find((plan) => plan.isMostPopular) ?? purchasablePlans[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.sparkleWrapper}>
            <Ionicons name="sparkles" size={18} color={sparkleColor} />
          </View>
          <Text style={styles.headline}>EXPAND YOUR{"\n"}CALM</Text>
          <Text style={styles.subHeadline}>
            More sources. More clarity. Same quiet.
          </Text>
        </View>

        {subscriptionError && (
          <Text style={styles.errorMessage}>{subscriptionError}</Text>
        )}

        {isPro && (
          <Text style={styles.proStatusMessage}>
            You are currently a Pro subscriber. Thank you!
          </Text>
        )}

        <View style={styles.planStack}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPeriod === "monthly" && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPeriod("monthly")}
            activeOpacity={0.9}
          >
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planTitle}>Monthly</Text>
                <Text style={styles.planCaption}>Cancel anytime</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>$12</Text>
                <Text style={styles.planPeriod}>/mo</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPeriod === "annually" && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPeriod("annually")}
            activeOpacity={0.9}
          >
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planTitle}>Annual</Text>
                <Text style={styles.planCaption}>$108 billed yearly</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>$9</Text>
                <Text style={styles.planPeriod}>/mo</Text>
              </View>
            </View>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 25%</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>WHAT OPENS UP</Text>
          {FEATURE_LIST.map((item) => (
            <View key={item.id} style={styles.featureRow}>
              <Ionicons
                name={item.icon}
                size={18}
                color={featureIconColor}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => selectedPlan && handleSelectPlan(selectedPlan)}
          disabled={subscriptionLoading || isPro || !selectedPlan}
          activeOpacity={0.9}
        >
          {subscriptionLoading ? (
            <ActivityIndicator color={ctaTextColor} />
          ) : (
            <Text style={styles.ctaText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
          disabled={subscriptionLoading}
        >
          <Text style={styles.restoreText}>Restore purchase</Text>
        </TouchableOpacity>

        <Text style={styles.cancelText}>
          Cancel anytime. Renews automatically.
        </Text>

        <View style={{ height: spacing[10] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0B0B0D" : "#F7F4F1",
    },
    scrollContent: {
      flexGrow: 1,
      paddingVertical: spacing[8],
      paddingHorizontal: spacing[5],
      alignItems: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: spacing[7],
      width: "100%",
    },
    sparkleWrapper: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing[4],
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#EEE7DF",
    },
    sparkle: {
      color: isDark ? "#E6D6C6" : "#7C6C5A",
    },
    headline: {
      ...typography.textStyles.h1,
      color: isDark ? "#F2EDE6" : "#2E2620",
      textAlign: "center",
      marginBottom: spacing[2],
      letterSpacing: 2.5,
      maxWidth: 320,
    },
    subHeadline: {
      ...typography.textStyles.body,
      fontSize: typography.fontSize.md,
      color: isDark ? "rgba(255,255,255,0.6)" : "#6E6258",
      textAlign: "center",
      marginBottom: spacing[4],
      maxWidth: 320,
    },
    errorMessage: {
      ...typography.textStyles.bodySmall,
      color: colors.semantic.error,
      textAlign: "center",
      marginBottom: spacing[4],
    },
    proStatusMessage: {
      ...typography.textStyles.bodySmall,
      color: colors.semantic.success,
      textAlign: "center",
      marginBottom: spacing[4],
    },
    planStack: {
      width: "100%",
      maxWidth: 360,
      gap: spacing[4],
      marginBottom: spacing[6],
    },
    planCard: {
      backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
      borderRadius: borderRadius.xl,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[5],
      borderWidth: 1,
      borderColor: isDark ? "#2A2A2F" : "#E9E1D7",
    },
    planCardSelected: {
      borderColor: isDark ? "#6B778D" : "#8B91A8",
      backgroundColor: isDark ? "#1D1F24" : "#F5F2EE",
    },
    planRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    planTitle: {
      ...typography.textStyles.body,
      fontWeight: typography.fontWeight.semibold,
      color: isDark ? "#F2EDE6" : "#2E2620",
    },
    planCaption: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.55)" : "#7B6F65",
      marginTop: spacing[1],
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
    },
    planPrice: {
      ...typography.textStyles.h3,
      color: isDark ? "#F2EDE6" : "#2E2620",
    },
    planPeriod: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.6)" : "#7B6F65",
      marginBottom: 2,
    },
    saveBadge: {
      position: "absolute",
      right: spacing[4],
      top: -spacing[2],
      paddingHorizontal: spacing[2],
      paddingVertical: 2,
      borderRadius: borderRadius.md,
      backgroundColor: "#78A46A",
    },
    saveBadgeText: {
      ...typography.textStyles.caption,
      color: "#FFFFFF",
      fontWeight: typography.fontWeight.semibold,
    },
    featuresCard: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: isDark ? "#141418" : "#FFFFFF",
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[5],
      borderWidth: 1,
      borderColor: isDark ? "#222228" : "#EFE6DC",
      marginBottom: spacing[7],
    },
    featuresTitle: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.4)" : "#A39487",
      letterSpacing: 1.2,
      marginBottom: spacing[4],
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing[3],
    },
    featureIcon: {
      marginRight: spacing[2],
      color: isDark ? "#C9C0B5" : "#7A6A5C",
    },
    featureText: {
      ...typography.textStyles.body,
      color: isDark ? "#E7DFD5" : "#2E2620",
      flexShrink: 1,
    },
    ctaButton: {
      width: "100%",
      maxWidth: 360,
      paddingVertical: spacing[4],
      borderRadius: borderRadius.xl,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 52,
      backgroundColor: isDark ? "#6B7390" : "#69708A",
      marginBottom: spacing[4],
    },
    ctaText: {
      ...typography.textStyles.button,
      color: "#FFFFFF",
    },
    restoreButton: {
      paddingVertical: spacing[2],
    },
    restoreText: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.65)" : "#8A7E74",
      textDecorationLine: "underline",
    },
    cancelText: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.4)" : "#A39487",
      textAlign: "center",
      marginBottom: spacing[6],
    },
  });
