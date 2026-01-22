import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { supabase } from "../../services/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    async function finalizeAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          router.replace("/LoginScreen");
          return;
        }
        if (data?.session?.user) {
          // Optionally: fetch user profile, onboarding, etc.
          router.replace("/HomeDashboard");
        } else {
          router.replace("/LoginScreen");
        }
      } catch (err) {
        router.replace("/LoginScreen");
      }
    }
    finalizeAuth();
  }, [router]);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Finalizing authentication...</Text>
    </View>
  );
}
