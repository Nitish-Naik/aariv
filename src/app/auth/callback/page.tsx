"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const handleCallback = async () => {
      // PKCE flow: Supabase sends ?code=... as a query parameter
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        // Exchange the code for a session
        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Code exchange failed:", error);
          setStatus("Sign-in failed. Redirecting...");
          setTimeout(() => router.replace("/login"), 1500);
          return;
        }
        if (data.session) {
          setStatus("Success! Redirecting...");
          router.replace("/dashboard");
          return;
        }
      }

      // Fallback: implicit flow — hash fragment with #access_token=...
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error("Failed to set session:", error);
            setStatus("Sign-in failed. Redirecting...");
            setTimeout(() => router.replace("/login"), 1500);
            return;
          }
          if (data.session) {
            setStatus("Success! Redirecting...");
            router.replace("/dashboard");
            return;
          }
        }
      }

      // Last resort: check if session already exists
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
        return;
      }

      // Nothing worked — redirect to login after a delay
      setStatus("Something went wrong. Redirecting...");
      setTimeout(() => router.replace("/login"), 2000);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-[var(--text-secondary)]">{status}</p>
      </div>
    </div>
  );
}
