import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="paywall" options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true
           }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
