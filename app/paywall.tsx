import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, spacing, typography } from "../theme";



const TIERS = [
  {
    id: "free",
    name: "Viewer",
    price: "$0",
    period: "forever",
    description: "Insight only",
    cta: "Continue Free",
    features: [
      "2 Connected Apps",
      "Read-Only Inbox",
      "Basic Insights",
      "Manual Actions",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Aariv Pro",
    price: "$19.99",
    period: "mo",
    description: "Your Executive Assistant",
    cta: "Upgrade to Pro",
    features: [
      "Unlimited Apps",
      "AI Auto-Drafts",
      "Full Knowledge Graph",
      "Zen Mode & Voice",
    ],
    highlight: true,
  },
];

const BENEFITS = [
  "Save 5+ hours/week on email",
  "Deep Work protection",
  "AI that learns your style",
  "Private & Encrypted",
];

export default function PaywallScreen() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const { colors, isDark } = useTheme();

  // Iris Animation (Breathing Orb)
  const fadeAnim = useRef(new Animated.Value(0.6)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Generate dynamic styles based on theme
  const styles = getStyles(colors, isDark);

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.6,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    breathe.start();
  }, [fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Iris */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.irisContainer}>
            <Animated.View
              style={[
                styles.irisOrb,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
            />
            <View style={styles.irisCore} />
          </View>

          <Text style={styles.headline}>Let Aariv run ahead, quietly.</Text>
          <Text style={styles.subHeadline}>
            No more notifications. More clarity.
          </Text>

          <View style={styles.irisIntroContainer}>
            <Text style={styles.irisIntro}>
              `&ldquo;`I prepared the next steps. You decide when to
              delegate.`&ldquo;`
            </Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={colors.primary[500]}
              />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, !isYearly && styles.activeLabel]}>
            Monthly
          </Text>
          <Switch
            value={isYearly}
            onValueChange={setIsYearly}
            trackColor={{
              false: isDark ? colors.neutral[700] : colors.neutral[300],
              true: colors.primary[500],
            }}
            thumbColor={colors.neutral[100]}
            ios_backgroundColor={
              isDark ? colors.neutral[700] : colors.neutral[300]
            }
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
          <Text style={[styles.toggleLabel, isYearly && styles.activeLabel]}>
            Yearly <Text style={styles.saveTag}>(Save 20%)</Text>
          </Text>
        </View>

        {/* Tiers Layer */}
        <View style={styles.tiersContainer}>
          {TIERS.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                tier.highlight && styles.tierCardHighlighted,
              ]}
              activeOpacity={0.9}
            >
              <View style={styles.tierHeader}>
                <View>
                  <Text
                    style={[
                      styles.tierName,
                      tier.highlight && styles.textHighlighted,
                    ]}
                  >
                    {tier.name}
                  </Text>
                  <Text
                    style={[
                      styles.tierDesc,
                      tier.highlight && styles.textHighlightedDim,
                    ]}
                  >
                    {tier.description}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.tierPrice,
                      tier.highlight && styles.textHighlighted,
                    ]}
                  >
                    {isYearly && tier.price !== "$0"
                      ? `$${(parseFloat(tier.price.replace("$", "")) * 10).toFixed(0)}`
                      : tier.price}
                  </Text>
                  <Text
                    style={[
                      styles.tierPeriod,
                      tier.highlight && styles.textHighlightedDim,
                    ]}
                  >
                    {isYearly && tier.price !== "$0"
                      ? "/yr"
                      : `/${tier.period}`}
                  </Text>
                </View>
              </View>

              <View style={styles.tierDivider} />

              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  tier.highlight
                    ? styles.ctaButtonHighlighted
                    : styles.ctaButtonOutline,
                ]}
              >
                <Text
                  style={[
                    styles.ctaText,
                    tier.highlight
                      ? styles.ctaTextHighlighted
                      : styles.ctaTextOutline,
                  ]}
                >
                  {tier.cta}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Restore Purchase</Text>
          </TouchableOpacity>
          <Text style={styles.footerPipe}>|</Text>
          <TouchableOpacity style={styles.footerLink}>
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
      padding: spacing[6],
    },
    header: {
      alignItems: "center",
      marginBottom: spacing[8],
      paddingTop: spacing[8],
    },
    closeButton: {
      position: "absolute",
      top: 0,
      right: 0,
      padding: spacing[2],
      zIndex: 10,
      minWidth: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    irisContainer: {
      width: 80,
      height: 80,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing[6],
      position: "relative",
    },
    irisOrb: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.xxl,
      backgroundColor: colors.primary[500],
      shadowColor: colors.primary[400],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 20,
      elevation: 10,
    },
    irisCore: {
      position: "absolute",
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#FFF",
      opacity: 0.9,
    },
    headline: {
      ...typography.textStyles.h2,
      color: colors.text,
      textAlign: "center",
      marginBottom: spacing[2],
      letterSpacing: -0.5,
    },
    subHeadline: {
      ...typography.textStyles.body,
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing[6],
      letterSpacing: 0.5,
    },
    irisIntroContainer: {
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.5)" : colors.neutral[100],
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: isDark ? "transparent" : colors.neutral[200],
    },
    irisIntro: {
      ...typography.textStyles.bodySmall,
      color: isDark ? colors.primary[200] : colors.primary[700],
      fontStyle: "italic",
      textAlign: "center",
    },
    benefitsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: spacing[3],
      marginBottom: spacing[8],
    },
    benefitItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(30, 41, 59, 0.3)" : "#FFFFFF",
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(148, 163, 184, 0.1)" : colors.neutral[200],
    },
    benefitText: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
      marginLeft: spacing[1],
    },
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing[6],
      gap: spacing[3],
    },
    toggleLabel: {
      ...typography.textStyles.bodySmall,
      color: colors.textTertiary,
      fontWeight: "600",
    },
    activeLabel: {
      color: colors.text,
    },
    saveTag: {
      color: colors.semantic.success,
      fontSize: 10,
    },
    tiersContainer: {
      gap: spacing[4],
      marginBottom: spacing[8],
    },
    tierCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
    },
    tierCardHighlighted: {
      backgroundColor: isDark ? "#0F172A" : "#F0F9FF", // Slate 900 or Light Blue
      borderColor: colors.primary[500],
      borderWidth: 1.5,
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    tierHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing[4],
    },
    tierName: {
      ...typography.textStyles.h4,
      color: colors.text,
      marginBottom: 2,
    },
    tierDesc: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
    },
    tierPrice: {
      ...typography.textStyles.h3,
      color: colors.text,
    },
    tierPeriod: {
      ...typography.textStyles.caption,
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
      marginBottom: spacing[4],
    },
    ctaButton: {
      paddingVertical: spacing[3],
      borderRadius: 10,
      alignItems: "center",
    },
    ctaButtonOutline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.neutral[500],
    },
    ctaButtonHighlighted: {
      backgroundColor: colors.primary[600],
    },
    ctaText: {
      ...typography.textStyles.bodySmall,
      fontWeight: "bold",
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
      marginBottom: spacing[2],
      gap: spacing[2],
    },
    footerLink: {
      padding: spacing[1],
    },
    footerLinkText: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
      textDecorationLine: "underline",
    },
    footerPipe: {
      color: colors.textSecondary,
      marginTop: spacing[1],
    },
    cancelText: {
      ...typography.textStyles.caption,
      color: colors.textTertiary,
      textAlign: "center",
      marginBottom: spacing[4],
    },
    legalText: {
      ...typography.textStyles.caption,
      fontSize: 10,
      color: colors.textTertiary,
      textAlign: "center",
      paddingHorizontal: spacing[8],
      lineHeight: 14,
    },
  });
