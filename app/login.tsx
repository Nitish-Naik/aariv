import { useRouter } from "expo-router";
import React from "react";
import { LoginScreen } from "../screens/LoginScreen";

export default function LoginRoute() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Navigate strictly to Home (Tabs)
    // We skip the onboarding wizard to get users straight to value
    router.replace("/(tabs)");
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}
