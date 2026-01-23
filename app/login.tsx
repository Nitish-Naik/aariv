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
            Your Neural Companion
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
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
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
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'System', // Use default system font
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
