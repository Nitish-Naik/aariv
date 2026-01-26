import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { signInWithGoogle } from "../services/auth";

const { width, height } = Dimensions.get('window');

export default function LoginRoute() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Auth callback will handle the redirect, but safe to redirect if needed
      // router.replace("/(tabs)"); 
    } catch (error: any) {
      if (error.message !== "Sign in cancelled") {
        Alert.alert("Login Failed", error.message || "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[
          isDark ? 'rgba(5, 150, 105, 0.15)' : 'rgba(5, 150, 105, 0.05)',
          'transparent'
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
            <Ionicons name="sparkles" size={32} color={colors.primary[500]} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Aariv</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            A calmer way to stay on top of your day.
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Manage emails, calendar, and tasks — all in one quiet place.
          </Text>
        </View>

        <View style={styles.footer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary[500]} />
          ) : (
            <TouchableOpacity
              style={[styles.googleButton, {
                backgroundColor: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#fff' : '#000',
              }]}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color={isDark ? '#000' : '#fff'} style={{ marginRight: 12 }} />
              <Text style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
            We’ll only sign you in.
            You choose what to connect next.
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
            <TouchableOpacity onPress={() => router.push("/legal/privacy")}>
              <Text style={[styles.privacyTermsLink, { color: colors.textSecondary }]}>
                Privacy
              </Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary, opacity: 0.5 }}>•</Text>
            <TouchableOpacity onPress={() => router.push("/legal/terms")}>
              <Text style={[styles.privacyTermsLink, { color: colors.textSecondary }]}>
                Terms
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 32,
    paddingTop: height * 0.15,
    paddingBottom: height * 0.1,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32, // Increased spacing
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 12, // Increased spacing
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 16, // Added spacing
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 28,
    marginBottom: 24,
    // Removed shadow for a flatter, more dominant look
  },
  buttonText: {
    fontSize: 18, // Slightly larger font for dominance
    fontWeight: '700', // Bolder font
  },
  disclaimer: {
    fontSize: 13, // Slightly larger font for readability
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 20, // Add margin to separate from the button
    lineHeight: 18,
  },
  privacyTermsLink: {
    fontSize: 13,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});
