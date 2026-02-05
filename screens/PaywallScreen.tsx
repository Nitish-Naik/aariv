/**
 * Paywall Screen
 * Calm upgrade screen aligned with brand visuals
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useSubscription } from "../hooks/useSubscription";
import { borderRadius, spacing, typography } from "../theme";

type Period = "monthly" | "annual";

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

interface PaywallProps {
  onClose: () => void;
  onSuccess?: () => void;
  highlightTier?: "pro" | "business";
}

export function PaywallScreen({
  onClose,
  onSuccess,
  highlightTier = "pro",
}: PaywallProps) {
  const { offerings, purchase, restore, isLoading } = useSubscription();
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("annual");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const styles = getStyles(isDark);
  const sparkleColor = isDark ? "#E6D6C6" : "#7C6C5A";
  const featureIconColor = isDark ? "#C9C0B5" : "#7A6A5C";
  const closeIconColor = isDark ? "#CFC8BF" : "#8D8176";

  const packages = useMemo(() => {
    if (!offerings) return null;
    return highlightTier === "business" ? offerings.business : offerings.pro;
  }, [offerings, highlightTier]);

  const monthlyPackage = packages?.find((pkg) => pkg.period === "monthly");
  const annualPackage = packages?.find((pkg) => pkg.period === "annual");
  const selectedPackage =
    selectedPeriod === "monthly" ? monthlyPackage : annualPackage;

  const monthlyPriceLabel = monthlyPackage?.price ?? "$12";
  const annualPriceLabel = annualPackage?.pricePerMonth ?? "$9";
  const annualBilledLabel = annualPackage
    ? `${annualPackage.price} billed yearly`
    : "$108 billed yearly";
  const savingsLabel = annualPackage?.savings ?? "Save 25%";

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert("Unavailable", "Subscription options are not available yet.");
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await purchase(selectedPackage.package);
      if (success) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      Alert.alert("Error", "Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const success = await restore();
      if (success) {
        onSuccess?.();
        onClose();
      } else {
        Alert.alert("No Subscription", "No previous subscription found.");
      }
    } catch (error) {
      Alert.alert("Error", "Restore failed. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDark ? "#F2EDE6" : "#6B7390"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.closeRow}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={16} color={closeIconColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.sparkleWrapper}>
            <Ionicons name="sparkles" size={18} color={sparkleColor} />
          </View>
          <Text style={styles.headline}>EXPAND YOUR{"\n"}CALM</Text>
          <Text style={styles.subHeadline}>
            More sources. More clarity. Same quiet.
          </Text>
        </View>

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
                <Text style={styles.planPrice}>{monthlyPriceLabel}</Text>
                <Text style={styles.planPeriod}>/mo</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPeriod === "annual" && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPeriod("annual")}
            activeOpacity={0.9}
          >
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planTitle}>Annual</Text>
                <Text style={styles.planCaption}>{annualBilledLabel}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{annualPriceLabel}</Text>
                <Text style={styles.planPeriod}>/mo</Text>
              </View>
            </View>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>{savingsLabel}</Text>
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
          style={[styles.ctaButton, isPurchasing && styles.ctaButtonDisabled]}
          onPress={handlePurchase}
          disabled={isPurchasing || !selectedPackage}
          activeOpacity={0.9}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isRestoring}
        >
          <Text style={styles.restoreText}>
            {isRestoring ? "Restoring..." : "Restore purchase"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.cancelText}>
          Cancel anytime. Renews automatically.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0B0B0D" : "#F7F4F1",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#0B0B0D" : "#F7F4F1",
    },
    scrollContent: {
      flexGrow: 1,
      paddingVertical: spacing[8],
      paddingHorizontal: spacing[5],
      alignItems: "center",
    },
    closeRow: {
      width: "100%",
      alignItems: "flex-start",
      marginBottom: spacing[6],
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#EEE7DF",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E6DED3",
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
    ctaButtonDisabled: {
      opacity: 0.7,
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

export default PaywallScreen;
