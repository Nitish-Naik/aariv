"use client";

import { useAuth } from "@/context/AuthContext";
import { useLogo } from "@/context/LogoContext";
import { api } from "@/lib/api";
import { ArrowRight, Calendar, Loader2, Mail, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const WELCOME_KEY = (userId: string) => `calmpilot_welcome_seen_${userId}`;

const APPS = [
  {
    slug: "gmail",
    name: "Gmail",
    tagline: "Read & summarise important emails for you.",
    icon: <Mail strokeWidth={1.5} size={20} />,
    color: "#EA4335",
  },
  {
    slug: "googlecalendar",
    name: "Google Calendar",
    tagline: "Know your day before it starts.",
    icon: <Calendar strokeWidth={1.5} size={20} />,
    color: "#4285F4",
  },
  {
    slug: "slack",
    name: "Slack",
    tagline: "Surface messages that need your reply.",
    icon: <MessageSquare strokeWidth={1.5} size={20} />,
    color: "#E01E5A",
  },
];

export default function WelcomePage() {
  const { user, isLoading } = useAuth();
  const { getLogo } = useLogo();
  const router = useRouter();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Mark welcome as seen and skip if already seen
  useEffect(() => {
    if (!user) return;
    const key = WELCOME_KEY(user.id);
    if (localStorage.getItem(key)) {
      router.replace("/dashboard");
      return;
    }
    localStorage.setItem(key, "1");
    // Track onboarding step 1: welcome screen seen
    api.put("/auth/onboarding-step", { userId: user.id, step: 1 }).catch(() => {});
  }, [user, router]);

  const handleConnect = async (appSlug: string) => {
    if (!user || connecting) return;
    setError(null);
    setConnecting(appSlug);

    try {
      const data = await api.post("/integrations/connect", {
        userId: user.id,
        appName: appSlug,
        platform: "web",
      });

      const redirectUrl = data.url || data.redirectUrl;
      if (!redirectUrl) {
        setConnecting(null);
        return;
      }

      const popup = window.open(
        redirectUrl,
        "composio_connect",
        "width=600,height=700,left=200,top=100",
      );

      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(() => {
        if (!popup || popup.closed) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
          setConnecting(null);
          setConnected(appSlug);
          setTimeout(() => router.replace(`/setup?app=${appSlug}`), 400);
        }
      }, 1000);
    } catch (e: any) {
      setConnecting(null);
      setError("Couldn't start connection. Please try again.");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo mark */}
        <div className="flex justify-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center shadow-xl">
            <span className="text-white text-xl font-bold tracking-tight">A</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
            Welcome, {firstName}.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
            CalmPilot watches your apps 24/7 so you don&apos;t have to. Connect one app to get started.
          </p>
        </div>

        {/* App list */}
        <div className="space-y-2.5 mb-6">
          {APPS.map((app) => {
            const isConnecting = connecting === app.slug;
            const isConnected = connected === app.slug;

            return (
              <button
                key={app.slug}
                onClick={() => handleConnect(app.slug)}
                disabled={!!connecting || !!connected}
                className="w-full flex items-center gap-4 bg-neutral-950 border border-white/8 rounded-2xl px-4 py-4 hover:border-white/20 hover:bg-neutral-900 transition-all text-left group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 relative overflow-hidden"
                  style={{ backgroundColor: app.color }}
                >
                  <span className="absolute inset-0 flex items-center justify-center">
                    {app.icon}
                  </span>
                  {getLogo(app.slug) && (
                    <img
                      src={getLogo(app.slug)}
                      alt={app.name}
                      className="absolute inset-0 w-full h-full object-contain p-1.5 bg-[#111319] rounded-xl opacity-0 transition-opacity duration-200"
                      loading="lazy"
                      onLoad={(e) => { e.currentTarget.style.opacity = "1"; }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{app.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{app.tagline}</p>
                </div>
                <div className="shrink-0 text-neutral-600 group-hover:text-white transition-colors">
                  {isConnecting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isConnected ? (
                    <span className="text-emerald-500 text-xs font-semibold">Connected</span>
                  ) : (
                    <ArrowRight strokeWidth={1.5} size={16} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center mb-4">{error}</p>
        )}

        {/* Explore first */}
        <div className="text-center">
          <button
            onClick={() => router.replace("/dashboard")}
            className="text-neutral-600 hover:text-neutral-400 text-xs transition-colors"
          >
            Explore first →
          </button>
        </div>
      </div>
    </div>
  );
}
