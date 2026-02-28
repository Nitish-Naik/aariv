"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    // Listen for the auth state change — Supabase JS client will
    // automatically detect the #access_token hash fragment and
    // establish the session, firing this event.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth callback event:", event, !!session);

      if (event === "SIGNED_IN" && session) {
        setStatus("Success! Redirecting...");
        router.replace("/dashboard");
      }

      if (event === "TOKEN_REFRESHED" && session) {
        router.replace("/dashboard");
      }
    });

    // Fallback: if the hash fragment contains tokens, manually extract
    // and set the session (in case auto-detect doesn't fire)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ data, error }) => {
            if (error) {
              console.error("Failed to set session:", error);
              setStatus("Sign-in failed. Redirecting...");
              setTimeout(() => router.replace("/login"), 1500);
            } else if (data.session) {
              setStatus("Success! Redirecting...");
              router.replace("/dashboard");
            }
          });
      }
    }

    // Safety timeout — if nothing happens in 8 seconds, redirect to login
    const timeout = setTimeout(() => {
      setStatus("Something went wrong. Redirecting...");
      router.replace("/login");
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
