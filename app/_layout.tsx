import { SpeedInsights } from "@vercel/speed-insights/react";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import {
  registerForPushNotifications,
  scheduleDailyBriefing,
  useNotificationHandler,
} from "../services/notifications";



function ThemedStack() {
  const { colors } = useTheme();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: "default",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="knowledge-graph"
          options={{
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        <Stack.Screen
          name="connect-platforms"
          options={{
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        <Stack.Screen
          name="edit-action"
          options={{
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        <Stack.Screen
          name="zen-mode"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_right",
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        <Stack.Screen
          name="voice-mode"
          options={{
            presentation: "modal",
            animation: "fade",
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        <Stack.Screen
          name="toolkits"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
      </Stack>

      {/* Global Floating Copilot Bar - Always Available */}
      {/* <FloatingCopilotBar /> */}
    </View>
  );
}

export default function RootLayout() {
  // Set up notifications and background sync on app start
  useEffect(() => {
    const setup = async () => {
      // Request notification permissions and register for push
      await registerForPushNotifications();

      // Schedule daily briefing notification (8 AM)
      await scheduleDailyBriefing(8, 0);

      // Register background sync task (lazy import to avoid native module errors in dev clients)
      try {
        const bg = await import("../services/backgroundSync");
        if (bg && typeof bg.registerBackgroundSync === "function") {
          await bg.registerBackgroundSync();
        }
      } catch (e: any) {
        console.log("Background sync module not available:", e?.message || e);
      }
    };
    setup();
  }, []);

  // Handle notification taps
  useNotificationHandler();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <ThemedStack />
            {Platform.OS === 'web' && <SpeedInsights />}
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
