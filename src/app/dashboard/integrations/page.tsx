"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { trackEvent } from "@/lib/analytics";
import { api } from "@/lib/api";
import { usePromptStore } from "@/lib/prompt-store";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2, Loader2, Mail, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from 'next/link';
import { PLATFORM_LOGOS } from "@/lib/platform-logos";

interface Integration {
  id: string;
  appName: string;
  status: string;
  label?: string;
  connectedAt?: string;
  canDisconnect?: boolean;
}

// ── Core 3 apps for launch ──
const CORE_APPS = [
  {
    slug: "gmail",
    name: "Gmail",
    description: "Monitor your inbox, draft replies, summarize threads, and extract action items.",
    icon: Mail,
    color: "#EA4335",
    free: true,
  },
  {
    slug: "googlecalendar",
    name: "Google Calendar",
    description: "Watch for meetings, detect conflicts, create events, and brief you before calls.",
    icon: Calendar,
    color: "#4285F4",
    free: true,
  },
  {
    slug: "slack",
    name: "Slack",
    description: "Monitor channels and DMs, send messages, and summarize threads you've missed.",
    icon: MessageSquare,
    color: "#E01E5A",
    free: true,
  },
];


// App-specific prompts for the aha moment
const APP_PROMPTS: Record<string, { cta: string; prompt: string }> = {
  gmail: {
    cta: "See what's in my inbox →",
    prompt: "Summarize my 10 most recent inbox emails. For each, show the sender name, subject, and whether it looks urgent. Group them by priority.",
  },
  googlecalendar: {
    cta: "See my schedule →",
    prompt: "What's on my calendar today? Show me all meetings with times, and flag any conflicts.",
  },
  slack: {
    cta: "See my messages →",
    prompt: "Check my Slack for any unread direct messages and summarize recent activity in my most active channels.",
  },
};

function PostConnectModal({
  appSlug,
  appName,
  logoSvg,
  color,
  onClose,
}: {
  appSlug: string;
  appName: string;
  logoSvg?: string;
  color: string;
  userId: string;
  onClose: () => void;
}) {
  const setPendingPrompt = usePromptStore((s) => s.setPendingPrompt);
  const appPrompt = APP_PROMPTS[appSlug] || { cta: "Ask CalmPilot anything →", prompt: "What can you help me with?" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
        className="relative w-full max-w-sm rounded-2xl bg-zinc-950 border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 right-0 h-24 opacity-15 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${color} 0%, transparent 70%)` }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {logoSvg ? (
              <img src={logoSvg} alt={appName} className="w-9 h-9 object-contain shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: color }}>
                {appName[0].toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-[15px] font-semibold text-white">{appName} is connected</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">CalmPilot can now access your {appName}</p>
            </div>
          </div>

          {/* Confirmation */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 mb-5">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span className="text-[13px] text-emerald-300">Triggers are now monitoring your {appName}</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard?bootstrap=true"
              onClick={() => onClose()}
              className="w-full text-center px-4 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-100 active:scale-[0.97] transition-all duration-200"
            >
              See your briefing →
            </Link>
            <Link
              href="/dashboard/assistant"
              onClick={() => {
                setPendingPrompt(appPrompt.prompt);
                onClose();
              }}
              className="w-full text-center px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-white rounded-full hover:bg-white/[0.05] transition-all duration-200"
            >
              {appPrompt.cta}
            </Link>
            <button
              onClick={onClose}
              className="w-full text-center px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white rounded-full hover:bg-white/[0.03] transition-all duration-200"
            >
              Connect another app
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { user } = useAuth();
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();
  const [confirmDisconnect, setConfirmDisconnect] = useState<{ id: string; name: string } | null>(null);
  const [postConnectApp, setPostConnectApp] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    loadIntegrations();

    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success" || params.get("status") === "ACTIVE") {
      const app = params.get("app") || "App";
      const appSlug = app.toLowerCase().replace(/-/g, "");
      api.post("/triggers/auto-setup", { userId: user!.id, appName: app }).catch(() => {});

      // If running inside a popup (opened by window.open), close it and let the main tab handle the UI
      if (window.opener) {
        try { window.close(); } catch {}
        return;
      }

      setPostConnectApp(appSlug);
      window.history.replaceState({}, "", "/dashboard/integrations");
    }
  }, [user?.id]);

  const loadIntegrations = async (): Promise<Integration[]> => {
    try {
      setLoading(true);
      const data = await api.get(`/integrations`);
      const list = data.integrations || [];
      setIntegrations(list);
      return list;
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (appName: string) => {
    trackEvent("integration_connect_started", { app: appName });
    try {
      setConnecting(appName);
      const data = await api.post("/integrations/connect", {
        userId: user!.id,
        appName,
        platform: "web",
      });

      const redirectUrl = data.url || data.redirectUrl;
      if (redirectUrl) {
        const popup = window.open(redirectUrl, "composio_connect", "width=600,height=700,left=200,top=100");
        const connectedAppName = appName;
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(() => {
          if (!popup || popup.closed) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setConnecting(null);
            // Poll until connection confirmed, then auto-setup triggers
            const setupPoll = setInterval(async () => {
              try {
                const data = await api.get("/integrations");
                const apps = data?.integrations || [];
                const connected = apps.find(
                  (a: any) => a.appName?.toLowerCase().replace(/[-_]/g, "") === connectedAppName.toLowerCase().replace(/[-_]/g, "") && a.status === "connected"
                );
                if (connected) {
                  clearInterval(setupPoll);
                  api.post("/triggers/auto-setup", { userId: user!.id, appName: connectedAppName }).catch(() => {});
                }
              } catch {}
            }, 5000);
            setTimeout(() => clearInterval(setupPoll), 30000);
            // Show modal immediately — don't wait for polling confirmation
            const slug = connectedAppName.toLowerCase().replace(/-/g, "");
            setPostConnectApp(slug);
            loadIntegrations();
          }
        }, 1000);
      } else {
        setConnecting(null);
      }
    } catch (e: any) {
      setConnecting(null);
      toastError(e.response?.data?.detail?.message || e.response?.data?.detail || "Failed to connect. Please try again.");
    }
  };

  const handleDisconnect = async (connectionId: string, appName: string) => {
    try {
      setDisconnecting(appName);
      await api.post("/integrations/disconnect", { userId: user!.id, connectionId, appName });
      toastSuccess(`${appName} disconnected`);
      loadIntegrations();
    } catch (e: any) {
      toastError(e.response?.data?.detail?.message || "Failed to disconnect.");
    } finally {
      setDisconnecting(null);
    }
  };

  const getConnectionStatus = (slug: string) => {
    const match = integrations.find(
      (i) => i.appName.toLowerCase().replace(/[-_]/g, "") === slug
    );
    if (!match) return { connected: false, integration: null };
    return {
      connected: match.status === "connected",
      expired: ["expired", "inactive", "error", "failed"].includes(match.status),
      integration: match,
    };
  };

  const connectedCount = CORE_APPS.filter((app) => getConnectionStatus(app.slug).connected).length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/[0.06]">
        <h1 className="text-base font-semibold text-white tracking-[-0.01em]">
          Apps
        </h1>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          {loading ? "Loading..." : (
            <>
              <span className="text-emerald-400 font-medium">{connectedCount}</span> of {CORE_APPS.length} connected
            </>
          )}
        </p>
      </div>

      {/* App cards */}
      <div className="flex-1 px-5 sm:px-6 py-6 sm:py-8">
        <div className="max-w-xl mx-auto space-y-3">
          {loading ? (
            // Skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 h-[120px] animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))
          ) : (
            CORE_APPS.map((app, i) => {
              const status = getConnectionStatus(app.slug);
              const isConnecting = connecting === app.slug;
              const isDisconnecting = disconnecting === app.slug;
              const Icon = app.icon;
              const logoSvg = PLATFORM_LOGOS[app.slug];

              return (
                <motion.div
                  key={app.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.1] transition-all duration-300 p-5"
                >
                  <div className="flex items-start gap-4">
                    {/* App icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${app.color}15` }}
                    >
                      {logoSvg ? (
                        <img src={logoSvg} alt={app.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <Icon strokeWidth={1.5} size={20} style={{ color: app.color }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white tracking-[-0.01em]">
                          {app.name}
                        </h3>
                        <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Free
                          </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 pt-0.5">
                      {status.connected ? (
                        status.integration?.canDisconnect ? (
                          <button
                            onClick={() => setConfirmDisconnect({ id: status.integration!.id, name: app.slug })}
                            disabled={isDisconnecting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-emerald-400 hover:text-red-400 rounded-full border border-emerald-500/20 hover:border-red-500/20 bg-emerald-500/5 hover:bg-red-500/5 transition-all duration-200"
                          >
                            {isDisconnecting ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 size={12} strokeWidth={2} />
                                Connected
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-emerald-400 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                            <CheckCircle2 size={12} strokeWidth={2} />
                            Active
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => handleConnect(app.slug)}
                          disabled={isConnecting}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-white rounded-full border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200"
                        >
                          {isConnecting ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <>
                              Connect
                              <ArrowRight size={11} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* More coming soon */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto mt-6 rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01] p-5 text-center"
          >
            <p className="text-sm font-medium text-zinc-400">More integrations coming soon</p>
            <p className="text-[12px] text-zinc-600 mt-1 mb-3">We add integrations based on user demand.</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-feedback", { detail: { category: "integration" } }))}
              className="inline-flex items-center gap-1.5 text-[12px] text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
            >
              Request an integration <ArrowRight size={11} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Post-connect modal with live scanning */}
      <AnimatePresence>
        {postConnectApp && (() => {
          const appInfo = CORE_APPS.find((a) => a.slug === postConnectApp);
          const logoSvg = PLATFORM_LOGOS[postConnectApp];
          const color = appInfo?.color || "#8b95b0";
          const appDisplayName = appInfo?.name || postConnectApp;

          return (
            <PostConnectModal
              key={postConnectApp}
              appSlug={postConnectApp}
              appName={appDisplayName}
              logoSvg={logoSvg}
              color={color}
              userId={user?.id || ""}
              onClose={() => setPostConnectApp(null)}
            />
          );
        })()}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDisconnect}
        title={`Disconnect ${confirmDisconnect?.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? ""}?`}
        description="Active triggers for this app will stop working immediately."
        confirmLabel="Disconnect"
        loadingLabel="Disconnecting…"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={async () => {
          if (confirmDisconnect) await handleDisconnect(confirmDisconnect.id, confirmDisconnect.name);
          setConfirmDisconnect(null);
        }}
        onCancel={() => setConfirmDisconnect(null)}
      />
    </div>
  );
}
