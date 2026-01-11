import { useRouter } from 'expo-router';
import React from 'react';
import { LoginScreen } from '../screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Navigate to the main app tabs on success
    router.replace('/(tabs)');
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
