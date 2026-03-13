"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginContent() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Capture referral code from ?ref=CODE and persist in localStorage
  // Only store alphanumeric codes up to 20 chars to prevent injection
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && /^[A-Z0-9]{1,20}$/i.test(ref)) {
      localStorage.setItem("aariv_referral_code", ref.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-[340px] flex flex-col items-center gap-8 px-4">

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <img src="/icons/icon-192.svg" alt="CalmPilot logo" className="w-5 h-5" />
          </div>
          <div className="text-center">
            <h1 className="text-sm font-semibold text-white">CalmPilot</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Your AI handles the work, you just review.</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-[#080808] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-5">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-white">Sign in to continue</h2>
            <p className="text-xs text-neutral-500 mt-1">Connect your apps and let CalmPilot handle the rest.</p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg bg-white hover:bg-neutral-100 text-black text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-[11px] text-neutral-600 text-center leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-neutral-500 hover:text-white transition-colors underline underline-offset-2">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="text-neutral-500 hover:text-white transition-colors underline underline-offset-2">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
