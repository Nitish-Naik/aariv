import { Ionicons } from "@expo/vector-icons";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useFonts } from "expo-font";
import { useRouter, useSegments, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { SubscriptionProvider } from "../hooks/useSubscription";
import {
  registerForPushNotifications,
  scheduleDailyBriefing,
  useNotificationHandler,
} from "../services/notifications";
import { initSubscription } from "../services/subscription";
import { hasCompletedOnboarding } from "../utils/onboarding";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<{ loading: boolean, complete: boolean }>({ loading: true, complete: false });
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkOnboarding = async () => {
      const complete = await hasCompletedOnboarding();
      setOnboardingStatus({ loading: false, complete });
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    // Wait until auth and onboarding status are loaded
    if (isAuthLoading || onboardingStatus.loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';

    // This effect should only re-run when auth or onboarding status changes,
    // not when the router segments change.
    if (!isAuthenticated) {
      // If the user is not signed in and not in the auth group,
      // redirect them to the login page.
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else if (!onboardingStatus.complete) {
      // If the user is signed in but hasn't completed onboarding,
      // send them to the onboarding screen.
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
    } else {
      // If the user is signed in and has completed onboarding,
      // ensure they are in the main app group.
      if (!inAppGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isAuthLoading, onboardingStatus.loading, onboardingStatus.complete]);

  return <ThemedStack />;
}


function ThemedStack() {
  const { colors } = useTheme();
  const { isLoading: isAuthLoading } = useAuth();

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded, fontError]);

  if (isAuthLoading || (!fontsLoaded && !fontError)) {
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
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
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
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const setup = async () => {
      try {
        await registerForPushNotifications();
        await scheduleDailyBriefing(8, 0);
        const bg = await import("../services/backgroundSync");
        if (bg && typeof bg.registerBackgroundSync === "function") {
          await bg.registerBackgroundSync();
        }
        await initSubscription();
      } catch (e: any) {
        console.log("Background setup failed:", e?.message || e);
      }
    };
    setup();
  }, []);

  useNotificationHandler();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <ThemeProvider>
              <RootNavigation />
              {Platform.OS === 'web' && <SpeedInsights />}
            </ThemeProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
