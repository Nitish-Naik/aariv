import { useRouter } from 'expo-router';
import React from 'react';
import { LoginScreen } from '../screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Navigate strictly to tabs, bypassing onboarding for now
    router.replace('/(tabs)');
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
