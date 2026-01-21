import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { registerBackgroundSync } from '../services/backgroundSync';
import { registerForPushNotifications, scheduleDailyBriefing, useNotificationHandler } from '../services/notifications';

function ThemedStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'default',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="knowledge-graph" options={{
        contentStyle: {
          backgroundColor: colors.background,
        },
      }} />
      <Stack.Screen name="connect-platforms" options={{
        contentStyle: {
          backgroundColor: colors.background,
        },
      }} />
      <Stack.Screen name="edit-action" options={{
        contentStyle: {
          backgroundColor: colors.background,
        },
      }} />
      <Stack.Screen name="paywall" options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }} />
      <Stack.Screen name="zen-mode" options={{
        presentation: 'fullScreenModal',
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }} />
      <Stack.Screen name="voice-mode" options={{
        presentation: 'modal',
        animation: 'fade',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }} />
      <Stack.Screen name="toolkits" options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }} />
    </Stack>
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

      // Register background sync task
      await registerBackgroundSync();
    };
    setup();
  }, []);

  // Handle notification taps
  useNotificationHandler();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
