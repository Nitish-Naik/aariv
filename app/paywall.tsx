import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { borderRadius, spacing, typography } from "../theme";
import {
  useSubscriptionService,
  ENTITLEMENT_ID,
} from "../services/subscription";
import {
  mockSubscriptionPlans,
  SubscriptionPlan,
} from "../data/mockSubscriptionPlans";

type Period = "monthly" | "annually";

export default function PaywallScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("monthly");
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

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!offerings?.availablePackages) {
      // Handle case where offerings are not loaded
      console.error("Subscription offerings not available.");
      return;
    }

    const packageToPurchase = offerings.availablePackages.find((pkg) => {
      // RevenueCat package IDs often follow a pattern like 'rc_monthly_planId' or 'rc_annual_planId'
      // This is a simplified lookup; real-world might need more robust mapping
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
        // Optionally navigate away or show a success message
        router.back();
      } else {
        // Purchase was cancelled or failed without throwing
        console.log("Purchase was cancelled or unsuccessful.");
      }
    } catch (error) {
      // Error already logged by useSubscriptionService
      // Display a calm error message to the user if needed
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const restored = await restorePurchases();
      if (restored) {
        console.log("Purchases restored successfully.");
        checkProStatus(); // Refresh pro status
        // Optionally navigate away or show a success message
        router.back();
      } else {
        console.log("No purchases to restore or restore failed.");
      }
    } catch (error) {
      // Error already logged by useSubscriptionService
    }
  };

  // Filter out the 'free' plan from mock data for display, as it's not purchased
  const purchasablePlans = mockSubscriptionPlans.filter(
    (plan) => plan.priceMonthly !== "Free",
  );
  const freePlan = mockSubscriptionPlans.find(
    (plan) => plan.priceMonthly === "Free",
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.headline}>Choose Your Path to Calm</Text>
          <Text style={styles.subHeadline}>
            You don't need to manage everything. We've prepared it. You decide.
          </Text>

          {subscriptionError && (
            <Text style={styles.errorMessage}>{subscriptionError}</Text>
          )}

          {isPro && (
            <Text style={styles.proStatusMessage}>
              You are currently a Pro subscriber. Thank you!
            </Text>
          )}
        </View>

        {/* Toggle for Monthly/Annually */}
        <View style={styles.periodToggleContainer}>
          <TouchableOpacity
            style={[
              styles.periodToggleButton,
              selectedPeriod === "monthly" && styles.periodToggleButtonActive,
            ]}
            onPress={() => setSelectedPeriod("monthly")}
          >
            <Text
              style={[
                styles.periodToggleButtonText,
                selectedPeriod === "monthly" &&
                  styles.periodToggleButtonTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodToggleButton,
              selectedPeriod === "annually" && styles.periodToggleButtonActive,
            ]}
            onPress={() => setSelectedPeriod("annually")}
          >
            <Text
              style={[
                styles.periodToggleButtonText,
                selectedPeriod === "annually" &&
                  styles.periodToggleButtonTextActive,
              ]}
            >
              Yearly (Save 20%)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tiers Layer */}
        <View style={styles.tiersContainer}>
          {freePlan && (
            <View key={freePlan.id} style={[styles.tierCard, styles.freeTierCard]}>
              <View style={styles.tierHeader}>
                <View>
                  <Text style={styles.tierName}>{freePlan.name}</Text>
                  <Text style={styles.tierDesc}>{freePlan.tagline}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.tierPrice}>
                    {freePlan.priceMonthly === "Free" ? "$0" : freePlan.priceMonthly}
                  </Text>
                  <Text style={styles.tierPeriod}>
                    {freePlan.priceMonthly === "Free" ? "" : "/mo"}
                  </Text>
                </View>
              </View>

              <View style={styles.tierDivider} />

              <View style={styles.featuresList}>
                {freePlan.features.map((feature) => (
                  <View key={feature.id} style={styles.featureRow}>
                    {feature.isIncluded ? (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color={colors.primary[500]}
                        style={styles.featureIcon}
                      />
                    ) : (
                      <Ionicons
                        name="remove-circle-outline"
                        size={18}
                        color={colors.neutral[500]}
                        style={styles.featureIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.featureText,
                        !feature.isIncluded && styles.featureTextExcluded,
                      ]}
                    >
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.ctaButton, styles.ctaButtonOutline]}
                onPress={() => router.back()} // Go back for free plan
                disabled={subscriptionLoading}
              >
                {subscriptionLoading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.ctaTextOutline}>{freePlan.callToAction}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {purchasablePlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.tierCard,
                plan.isMostPopular && styles.tierCardHighlighted,
              ]}
              onPress={() => handleSelectPlan(plan)}
              disabled={subscriptionLoading || isPro} // Disable if loading or already pro
              activeOpacity={0.9}
            >
              {plan.isMostPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              <View style={styles.tierHeader}>
                <View>
                  <Text
                    style={[
                      styles.tierName,
                      plan.isMostPopular && styles.textHighlighted,
                    ]}
                  >
                    {plan.name}
                  </Text>
                  <Text
                    style={[
                      styles.tierDesc,
                      plan.isMostPopular && styles.textHighlightedDim,
                    ]}
                  >
                    {plan.tagline}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.tierPrice,
                      plan.isMostPopular && styles.textHighlighted,
                    ]}
                  >
                    {plan.currency}
                    {selectedPeriod === "monthly"
                      ? plan.priceMonthly
                      : plan.priceAnnually}
                  </Text>
                  <Text
                    style={[
                      styles.tierPeriod,
                      plan.isMostPopular && styles.textHighlightedDim,
                    ]}
                  >
                    {selectedPeriod === "monthly" ? "/mo" : "/yr"}
                  </Text>
                </View>
              </View>

              <View style={styles.tierDivider} />

              <View style={styles.featuresList}>
                {plan.features.map((feature) => (
                  <View key={feature.id} style={styles.featureRow}>
                    {feature.isIncluded ? (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color={colors.primary[500]}
                        style={styles.featureIcon}
                      />
                    ) : (
                      <Ionicons
                        name="remove-circle-outline"
                        size={18}
                        color={colors.neutral[500]}
                        style={styles.featureIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.featureText,
                        !feature.isIncluded && styles.featureTextExcluded,
                      ]}
                    >
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  plan.isMostPopular
                    ? styles.ctaButtonHighlighted
                    : styles.ctaButtonOutline,
                ]}
                onPress={() => handleSelectPlan(plan)}
                disabled={subscriptionLoading || isPro}
              >
                {subscriptionLoading ? (
                  <ActivityIndicator
                    color={plan.isMostPopular ? "#FFFFFF" : colors.text}
                  />
                ) : (
                  <Text
                    style={[
                      styles.ctaText,
                      plan.isMostPopular
                        ? styles.ctaTextHighlighted
                        : styles.ctaTextOutline,
                    ]}
                  >
                    {plan.callToAction}
                  </Text>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerLink}
            onPress={handleRestorePurchases}
            disabled={subscriptionLoading}
          >
            <Text style={styles.footerLinkText}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.footerPipe}>|</Text>
          <TouchableOpacity style={styles.footerLink}>
            {/* This would typically open a webview to RevenueCat's customer portal or similar */}
            <Text style={styles.footerLinkText}>Manage Subscription</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cancelText}>
          Cancel anytime, no questions asked.
        </Text>

        <Text style={styles.legalText}>
          By continuing, you agree to Terms & Privacy. You stay in control.
          Always.
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
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingVertical: spacing[6],
      paddingHorizontal: spacing[4],
      alignItems: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: spacing[8],
      paddingTop: spacing[4],
      width: "100%",
    },
    closeButton: {
      position: "absolute",
      top: spacing[2],
      right: 0,
      padding: spacing[2],
      zIndex: 10,
      minWidth: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    headline: {
      ...typography.textStyles.h2,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing[2],
      letterSpacing: -0.5,
      maxWidth: 300,
    },
    subHeadline: {
      ...typography.textStyles.body,
      fontSize: typography.fontSize.lg,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing[6],
      letterSpacing: 0.5,
      maxWidth: 350,
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
    periodToggleContainer: {
      flexDirection: "row",
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
      borderRadius: borderRadius.xxl,
      padding: spacing[1],
      marginBottom: spacing[8],
      alignSelf: "center", // Center the toggle
    },
    periodToggleButton: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.xl,
    },
    periodToggleButtonActive: {
      backgroundColor: colors.primary[500],
    },
    periodToggleButtonText: {
      ...typography.textStyles.bodySmall,
      color: colors.textSecondary,
      fontWeight: typography.fontWeight.semibold,
    },
    periodToggleButtonTextActive: {
      color: "#FFFFFF", // White text for active button
    },
    tiersContainer: {
      gap: spacing[6], // More space between cards
      marginBottom: spacing[8],
      width: "100%", // Take full width
      maxWidth: 400, // Max width for content
    },
    tierCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius["2xl"], // More rounded
      padding: spacing[6], // More padding
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    freeTierCard: {
        opacity: isPro ? 0.6 : 1, // Dim if already pro
    },
    tierCardHighlighted: {
      backgroundColor: isDark ? colors.dark.surfaceElevated : colors.light.surface, // Subtle highlight
      borderColor: colors.primary[500],
      borderWidth: 1.5,
      // No aggressive shadows, subtle elevation if needed
      shadowColor: isDark ? colors.primary[900] : colors.primary[100],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    popularBadge: {
      position: "absolute",
      top: -spacing[3],
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[3],
      backgroundColor: colors.semantic.success, // Use success color for "Most Popular"
      borderRadius: borderRadius.md,
      zIndex: 1,
    },
    popularBadgeText: {
      ...typography.textStyles.caption,
      color: "#FFFFFF",
      fontWeight: typography.fontWeight.bold,
    },
    tierHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing[4],
      width: "100%",
    },
    tierName: {
      ...typography.textStyles.h3,
      color: colors.text,
      marginBottom: spacing[1],
    },
    tierDesc: {
      ...typography.textStyles.bodySmall,
      color: colors.textSecondary,
    },
    tierPrice: {
      ...typography.textStyles.h2, // Larger price
      color: colors.text,
    },
    tierPeriod: {
      ...typography.textStyles.bodySmall,
      color: colors.textTertiary,
      textAlign: "right",
    },
    textHighlighted: {
      color: colors.primary[500],
    },
    textHighlightedDim: {
      color: colors.primary[400],
    },
    tierDivider: {
      height: 1,
      backgroundColor: colors.border,
      width: "100%",
      marginVertical: spacing[4],
    },
    featuresList: {
      width: "100%",
      marginBottom: spacing[6],
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing[2],
    },
    featureIcon: {
      marginRight: spacing[2],
    },
    featureText: {
      ...typography.textStyles.bodySmall,
      color: colors.text,
      flexShrink: 1,
    },
    featureTextExcluded: {
      color: colors.textTertiary,
      opacity: 0.7,
      textDecorationLine: "line-through",
    },
    ctaButton: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: 48,
    },
    ctaButtonOutline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.neutral[500],
    },
    ctaButtonHighlighted: {
      backgroundColor: colors.primary[600],
      borderWidth: 1,
      borderColor: colors.primary[600],
    },
    ctaText: {
      ...typography.textStyles.button,
    },
    ctaTextOutline: {
      color: colors.text,
    },
    ctaTextHighlighted: {
      color: "#FFFFFF",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: spacing[4],
      gap: spacing[4],
    },
    footerLink: {
      paddingVertical: spacing[1],
    },
    footerLinkText: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
      textDecorationLine: "underline",
    },
    footerPipe: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
    },
    cancelText: {
      ...typography.textStyles.caption,
      color: colors.textTertiary,
      textAlign: "center",
      marginBottom: spacing[4],
    },
    legalText: {
      ...typography.textStyles.caption,
      fontSize: typography.fontSize.xs,
      color: colors.textTertiary,
      textAlign: "center",
      paddingHorizontal: spacing[8],
      lineHeight: typography.lineHeight.tight,
    },
  });