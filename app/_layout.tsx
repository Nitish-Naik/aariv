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
           <Stack.Screen name="zen-mode" options={{
               presentation: 'fullScreenModal',
               animation: 'slide_from_right'
           }} />
           <Stack.Screen name="voice-mode" options={{
               presentation: 'modal',
               animation: 'fade' // Good for voice overlay feel
           }} />
           <Stack.Screen name="toolkits" options={{
               presentation: 'modal', // Or 'card' depending on preference
               animation: 'slide_from_bottom'
           }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
