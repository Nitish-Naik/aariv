import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function ThemedStack() {
  const { colors, isDark } = useTheme();
  
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
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
