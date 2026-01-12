import { useRouter } from 'expo-router';
import React from 'react';
import { LoginScreen } from '../screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Navigate to onboarding first
    router.replace('/onboarding');
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
