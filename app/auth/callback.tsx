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
          router.replace("/login");
          return;
        }
        if (data?.session?.user) {
          // Optionally: fetch user profile, onboarding, etc.
          router.replace("/");
        } else {
          router.replace("/login");
        }
      } catch (err) {
        router.replace("/login");
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
