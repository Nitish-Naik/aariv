"use client";

import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Logo } from "@/components/secure-agent/Logo";

function LoginContent() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const router = useRouter();

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

  const handleGoogleSignIn = () => {
    trackEvent("login_google_clicked");
    signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-indigo-500/[0.05] rounded-[100%] blur-[120px] pointer-events-none"
      />

      <div className="w-full max-w-[380px] flex flex-col items-center gap-8 px-5 relative z-10">
        {/* Logo + Wordmark */}
        <div className="flex flex-col items-center gap-4">
          <Logo className="w-10 h-10" />
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white tracking-[-0.01em]">
              CalmPilot
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Your AI works overnight. You just review.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm rounded-2xl p-7 flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-[15px] font-semibold text-white tracking-[-0.01em]">
              Sign in to continue
            </h2>
            <p className="text-sm text-zinc-500 mt-1.5">
              Connect your apps and get your first morning brief.
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-full bg-white hover:bg-zinc-100 text-black text-sm font-semibold transition-all duration-200 active:scale-[0.97] whitespace-nowrap"
          >
            <img
              src="/icons/google.svg"
              alt="Google"
              className="w-5 h-5 shrink-0"
            />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-zinc-600 font-medium">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-[13px] text-zinc-400">
              Free plan — no credit card required
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-600">
              <span>✓ Gmail</span>
              <span>✓ Calendar</span>
              <span>✓ Slack</span>
            </div>
          </div>
        </div>

        {/* Legal */}
        <p className="text-[11px] text-zinc-600 text-center leading-relaxed max-w-[280px]">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="text-zinc-500 hover:text-white transition-colors duration-200 underline underline-offset-2"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-zinc-500 hover:text-white transition-colors duration-200 underline underline-offset-2"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
