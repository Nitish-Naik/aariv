/**
 * Login Screen - Google Sign-In
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
// import { signInWithGoogle } from "../services/auth";
import { spacing } from "../theme";

// Google native sign-in removed; only web OAuth supported

// 1. Required for web browser redirect
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const { width } = Dimensions.get("window");

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const styles = getStyles();



  // Animation Refs
  const fadeAnimLogo = useRef(new Animated.Value(0)).current;
  const fadeAnimText = useRef(new Animated.Value(0)).current;
  const fadeAnimButton = useRef(new Animated.Value(0)).current;

  // Native Google Sign-In removed

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnimLogo, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimText, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimButton, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDummyLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1000); // Simulate network delay
  };

  const onSignInPress = async () => {
    await handleDummyLogin();
  };

  const handleLegalPress = (type: "terms" | "privacy") => {
    if (type === "terms") {
      router.push("/legal/terms");
    } else {
      router.push("/legal/privacy");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Main Content Area */}
        <View style={styles.content}>
          {/* Logo / Brand Mark */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnimLogo,
                transform: [
                  {
                    translateY: fadeAnimLogo.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={{
                position: "relative",
                width: 80,
                height: 80,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="infinite"
                size={80}
                color="#6EE7B7"
                style={{ opacity: 0.8, transform: [{ rotate: "-30deg" }] }}
              />
              <Ionicons
                name="scan-outline"
                size={60}
                color="#FFFFFF"
                style={{ position: "absolute" }}
              />
            </View>
          </Animated.View>

          {/* Headlines */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnimText,
                transform: [
                  {
                    translateY: fadeAnimText.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.title}>
              Meet <Text style={styles.brandHighlight}>Aariv</Text>
            </Text>
            <Text style={styles.subtitle}>Where calm meets intelligence.</Text>
          </Animated.View>
        </View>

        {/* 2. Bottom Action Card */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnimButton,
              transform: [
                {
                  translateY: fadeAnimButton.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.actionCard}>
            <Text style={styles.irisVoice}>
              “I’ll prepare the day. You decide.”
            </Text>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={onSignInPress}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.googleButtonText}>Signing in...</Text>
              ) : (
                <Text style={styles.googleButtonText}>Continue (Dummy Sign-In)</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.cardTagline}>
              Private by design.
              {/* You stay in control. */}
            </Text>
          </View>

          <Text style={styles.footerText}>
            By continuing, you agree to our{" "}
            <Text style={styles.link} onPress={() => handleLegalPress("terms")}>
              Terms of Service
            </Text>{" "}
            •{" "}
            <Text
              style={styles.link}
              onPress={() => handleLegalPress("privacy")}
            >
              Privacy Policy
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000", // Deep Black
      justifyContent: "space-between",
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 100, // Visual balance
    },
    logoContainer: {
      marginBottom: spacing[6],
      alignItems: "center",
    },
    titleContainer: {
      alignItems: "center",
      marginBottom: spacing[4],
    },
    title: {
      fontSize: 42,
      fontWeight: "bold",
      color: "#FFFFFF",
      letterSpacing: -1,
      textAlign: "center",
    },
    brandHighlight: {
      color: "#6EE7B7", // Mint/Teal
    },
    subtitle: {
      fontSize: 18,
      color: "#9CA3AF", // Gray-400
      fontWeight: "400",
      marginTop: spacing[2],
    },

    // Bottom Section
    bottomSection: {
      padding: spacing[6],
      paddingBottom: spacing[8],
      alignItems: "center",
    },
    actionCard: {
      width: "100%",
      backgroundColor: "#111827", // Gray-900
      borderRadius: 32,
      padding: spacing[5],
      borderWidth: 1,
      borderColor: "rgba(55, 65, 81, 0.5)", // Gray-700 but softer
      alignItems: "center",
      marginBottom: spacing[4],
    },
    irisVoice: {
      color: "#6EE7B7",
      fontSize: 12,
      fontStyle: "italic",
      opacity: 0.8,
      marginBottom: spacing[4],
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1F2937", // Gray-800
      width: "100%",
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: "rgba(55, 65, 81, 0.5)",
      marginBottom: spacing[4],
    },
    googleButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    cardTagline: {
      color: "#6B7280", // Gray-500, darker for low contrast
      fontSize: 12, // Smaller
      textAlign: "center",
      width: "100%",
      letterSpacing: 0.5,
    },
    footerText: {
      color: "#4B5563", // Gray-600
      fontSize: 11,
      textAlign: "center",
    },
    link: {
      textDecorationLine: "underline",
      color: "#6B7280",
    },
  });
