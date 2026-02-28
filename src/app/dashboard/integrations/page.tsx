"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Integration {
  id: string;
  appName: string;
  status: "connected" | "disconnected";
  logo?: string;
  description?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  gmail: "#EA4335",
  googlecalendar: "#8b95b0",
  slack: "#ECB22E",
  notion: "#000000",
  linear: "#5E6AD2",
  discord: "#5865F2",
  github: "#24292e",
  twitter: "#1DA1F2",
};

const PLATFORM_DISPLAY: Record<string, string> = {
  gmail: "Gmail",
  googlecalendar: "Google Calendar",
  slack: "Slack",
  notion: "Notion",
  linear: "Linear",
  discord: "Discord",
  github: "GitHub",
  twitter: "Twitter",
};

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadIntegrations();

    // Check if we returned from a successful connection
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("status") === "success" ||
      params.get("status") === "ACTIVE"
    ) {
      const app = params.get("app") || "App";
      setToast(`${app.replace("-", " ")} connected successfully!`);
      // Clean URL
      window.history.replaceState({}, "", "/dashboard/integrations");
      setTimeout(() => setToast(null), 4000);
    }
  }, [user?.id]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/integrations?userId=${user!.id}`);
      setIntegrations(data.integrations || []);
    } catch (e: any) {
      console.error("Failed to load integrations:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (appName: string) => {
    try {
      setConnecting(appName);
      const data = await api.post("/integrations/connect", {
        userId: user!.id,
        appName,
        platform: "web",
      });

      const redirectUrl = data.url || data.redirectUrl;
      if (redirectUrl) {
        // Open Composio OAuth in a popup
        const popup = window.open(
          redirectUrl,
          "composio_connect",
          "width=600,height=700,left=200,top=100",
        );

        // Poll for popup close, then refresh integrations
        const pollTimer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(pollTimer);
            setConnecting(null);
            // Refresh integrations list after OAuth completes
            loadIntegrations();
          }
        }, 1000);
      } else {
        setConnecting(null);
      }
    } catch (e: any) {
      console.error("Failed to connect:", e.message);
      setConnecting(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Success toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-success/90 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300">
          <Check size={16} />
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-[var(--text-primary)]">
          Integrations
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Connect your tools so Aariv can help you across platforms
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => {
            const color =
              PLATFORM_COLORS[integration.appName.toLowerCase()] || "#8b95b0";
            const displayName =
              PLATFORM_DISPLAY[integration.appName.toLowerCase()] ||
              integration.appName;
            const isConnected = integration.status === "connected";
            const isConnecting = connecting === integration.appName;

            return (
              <div
                key={integration.id}
                className="flex items-center gap-3 sm:gap-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 sm:px-5 py-3.5 sm:py-4"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: color }}
                >
                  {displayName.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {displayName}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isConnected ? "Connected" : "Not connected"}
                  </p>
                </div>

                {/* Action */}
                {isConnected ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium">
                    <Check size={14} />
                    Connected
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.appName)}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ExternalLink size={14} />
                    )}
                    Connect
                  </button>
                )}
              </div>
            );
          })}

          {integrations.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <p className="text-3xl">🔗</p>
              <p className="text-sm text-[var(--text-secondary)]">
                No integrations available. Ask Aariv to connect a service!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
