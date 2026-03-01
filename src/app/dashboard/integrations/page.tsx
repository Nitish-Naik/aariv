"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Integration {
  id: string;
  appName: string;
  status: string;
  label?: string;
  description?: string;
  connectedAt?: string;
  email?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  gmail: "#EA4335",
  googlecalendar: "#4285F4",
  slack: "#E01E5A",
  notion: "#000000",
  linear: "#5E6AD2",
  discord: "#5865F2",
  github: "#24292e",
  twitter: "#1DA1F2",
  composio: "#8E24AA",
  codeinterpreter: "#4A5568",
  hackernews: "#FF6600",
};

// Manual overrides for multi-color brand logos: [topLeft, topRight, bottomRight, bottomLeft]
const PLATFORM_CORNER_COLORS: Record<string, [string, string, string, string]> =
  {
    gmail: ["#EA4335", "#FBBC05", "#34A853", "#4285F4"],
    googlecalendar: ["#4285F4", "#34A853", "#EA4335", "#FBBC05"],
    slack: ["#36C5F0", "#2EB67D", "#E01E5A", "#ECB22E"],
    discord: ["#5865F2", "#57F287", "#FEE75C", "#EB459E"],
  };

/**
 * Derive 4 corner colors from a single hex brand color.
 * Shifts hue ±30° and adjusts lightness to create variety,
 * so each corner gets a distinct but related color.
 */
function deriveCornerColors(hex: string): [string, string, string, string] {
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // RGB → HSL
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  // HSL → hex helper
  const hslToHex = (h: number, s: number, l: number): string => {
    h = ((h % 1) + 1) % 1; // normalize
    l = Math.max(0.15, Math.min(0.85, l));
    s = Math.max(0.2, Math.min(1, s));
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const toHex = (v: number) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(hue2rgb(p, q, h + 1 / 3))}${toHex(hue2rgb(p, q, h))}${toHex(hue2rgb(p, q, h - 1 / 3))}`;
  };

  return [
    hslToHex(h - 0.06, s * 1.1, l * 1.15), // top-left: slightly warmer, brighter
    hslToHex(h + 0.06, s * 0.9, l * 0.85), // top-right: slightly cooler, darker
    hslToHex(h + 0.12, s * 1.0, l * 1.1), // bottom-right: more hue shift
    hslToHex(h - 0.12, s * 1.05, l * 0.9), // bottom-left: opposite hue shift
  ];
}

/** Get corner colors: use manual override for multi-color brands, otherwise auto-derive */
function getCornerColors(
  appSlug: string,
  brandColor: string,
): [string, string, string, string] {
  return PLATFORM_CORNER_COLORS[appSlug] || deriveCornerColors(brandColor);
}

// TrustClaw Toolkits style SVG base64 or inline paths
const PLATFORM_LOGOS: Record<string, string> = {
  gmail:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%23f2f2f2' x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath fill='%23ea4335' d='M2 6l10 7 10-7'/%3E%3Cpath fill='%23ea4335' d='M2 4l10 8 10-8' stroke='%23ea4335' stroke-width='1.5' fill='none'/%3E%3C/svg%3E",
  googlecalendar:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%234285f4' x='2' y='2' width='20' height='20' rx='3'/%3E%3Crect fill='%23fff' x='5' y='7' width='14' height='13' rx='1'/%3E%3Crect fill='%23ea4335' x='5' y='7' width='14' height='3'/%3E%3Crect fill='%234285f4' x='8' y='12' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='13' y='12' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='8' y='16' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='13' y='16' width='3' height='2' rx='.5'/%3E%3C/svg%3E",
  slack:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle fill='%23e01e5a' cx='6' cy='15' r='2'/%3E%3Crect fill='%23e01e5a' x='8' y='13' width='4' height='4' rx='2'/%3E%3Ccircle fill='%2336c5f0' cx='9' cy='6' r='2'/%3E%3Crect fill='%2336c5f0' x='7' y='8' width='4' height='4' rx='2'/%3E%3Ccircle fill='%232eb67d' cx='18' cy='9' r='2'/%3E%3Crect fill='%232eb67d' x='12' y='7' width='4' height='4' rx='2'/%3E%3Ccircle fill='%23ecb22e' cx='15' cy='18' r='2'/%3E%3Crect fill='%23ecb22e' x='13' y='12' width='4' height='4' rx='2'/%3E%3C/svg%3E",
  github:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z'/%3E%3C/svg%3E",
  notion:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M4 3.5C4 2.672 4.56 2 5.25 2h9.792L20.25 7v13.5c0 .828-.56 1.5-1.25 1.5H5.25C4.56 22 4 21.328 4 20.5zM6 5.5v15h12v-11h-4.5a.5.5 0 01-.5-.5V5.5zm9 .707V9h2.793zM7.5 12a.5.5 0 01.5-.5h8a.5.5 0 010 1H8a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h8a.5.5 0 010 1H8a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h5a.5.5 0 010 1H8a.5.5 0 01-.5-.5z'/%3E%3C/svg%3E",
  twitter:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E",
  composio:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle fill='%238E24AA' cx='12' cy='12' r='10'/%3E%3Cpath fill='%23fff' d='M8 8h8v8H8z' rx='2'/%3E%3C/svg%3E",
};

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<"all" | "connected">("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleConnect = async (appName: string, isConnected: boolean) => {
    if (isConnected) {
      // Manage action
      console.log(`Manage ${appName}`);
      return;
    }

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
      // Try to extract the backend's detail message
      const errorMsg =
        e.response?.data?.detail?.message ||
        e.response?.data?.detail ||
        "Failed to initiate connection. Please try again.";
      setErrorToast(errorMsg);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // Filter integrations based on search and tab
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const displayName = integration.label || integration.appName;

      const matchesSearch = displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isConnected = integration.status === "connected";
      const matchesTab = activeTab === "all" || isConnected;
      return matchesSearch && matchesTab;
    });
  }, [integrations, searchQuery, activeTab]);

  return (
    <div className="bg-[#050505] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 text-white/90">
        {/* Success toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300">
            <Check size={16} />
            {toast}
          </div>
        )}

        {/* Error toast */}
        {errorToast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-500/90 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300">
            <AlertCircle size={16} />
            {errorToast}
          </div>
        )}

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Toolkits</h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Segmented Control */}
            <div className="inline-flex p-1 space-x-1 rounded-xl bg-[#2a2a2a]/60 backdrop-blur-sm border border-white/5 shadow-sm">
              {(["all", "connected"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none ${
                    activeTab === tab
                      ? "text-white"
                      : "text-[#a0a0a0] hover:text-white"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 rounded-lg shadow-sm bg-[#3a3a3a]"
                      style={{ zIndex: -1 }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <span className="capitalize">
                    {tab === "all" ? "All" : "Connected"}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  size={16}
                  className="transition-colors text-[#888] group-focus-within:text-[#ccc]"
                />
              </div>
              <input
                type="text"
                placeholder="Search across 500+ toolkits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-all duration-200 bg-[#161616] border border-[#2a2a2a] text-white placeholder:text-[#666] focus:border-[#444] focus:bg-[#1a1a1a]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-[var(--accent)]" />
          </div>
        ) : (
          /* Toolkit Grid */
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredIntegrations.map((integration) => {
                const appSlug = integration.appName
                  .toLowerCase()
                  .replace("-", "");
                const displayName = integration.label || integration.appName;
                const color = PLATFORM_COLORS[appSlug] || "#8b95b0";
                const logoSvg =
                  (integration as any).logo || PLATFORM_LOGOS[appSlug];
                const isConnected = integration.status === "connected";
                const isConnecting = connecting === integration.appName;

                // Get brand corner colors or derive from single brand color
                const cornerColors = getCornerColors(appSlug, color);
                const [tl, tr, br, bl] = cornerColors;

                // Build corner glow background: radial gradients at each corner using brand colors
                const cornerGlowBg = `
                  radial-gradient(circle at 0% 0%, ${tl} 0%, transparent 50%),
                  radial-gradient(circle at 100% 0%, ${tr} 0%, transparent 50%),
                  radial-gradient(circle at 100% 100%, ${br} 0%, transparent 50%),
                  radial-gradient(circle at 0% 100%, ${bl} 0%, transparent 50%)
                `;

                return (
                  <motion.div
                    key={integration.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="group relative rounded-2xl p-[1.5px] hover:-translate-y-1 transition-all duration-500 ease-out min-h-[220px]"
                  >
                    {/* Brand-colored corner border – visible on hover */}
                    <div
                      className="absolute inset-[-1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                      style={{ background: cornerGlowBg }}
                    />

                    {/* Diffused outer glow on hover – brand colors bleeding outward */}
                    <div
                      className="absolute inset-[-4px] rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl pointer-events-none z-0"
                      style={{ background: cornerGlowBg }}
                    />

                    {/* Card content */}
                    <div className="relative flex flex-col p-5 rounded-[calc(1rem-1.5px)] bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] min-h-[220px] overflow-hidden z-10">
                      {/* Subtle inner card bloom */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

                      {/* Persistent subtle green glow for Active state */}
                      {isConnected && (
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
                      )}

                      {/* Top Row: Button & Status */}
                      <div className="flex justify-end w-full relative z-10">
                        {isConnected ? (
                          <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.05)] backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                            Active
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleConnect(integration.appName, isConnected)
                            }
                            disabled={isConnecting}
                            className="px-4 py-1.5 bg-[#e8e8e8] hover:bg-white text-black text-xs font-medium rounded-full transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95"
                          >
                            {isConnecting ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              "Connect"
                            )}
                          </button>
                        )}
                      </div>

                      {/* Center Content: Logo & Name */}
                      <div className="flex flex-col items-center justify-center flex-1 mt-[-10px] relative z-10 w-full pointer-events-none">
                        {logoSvg ? (
                          <motion.img
                            src={logoSvg}
                            alt={displayName}
                            className="w-14 h-14 object-contain mb-5 drop-shadow-md filter transition-all duration-500"
                            whileHover={{ scale: 1.05 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                            onError={(e: any) => {
                              const parent = e.currentTarget.parentElement;
                              e.currentTarget.style.display = "none";
                              if (parent) {
                                const fb = document.createElement("div");
                                fb.className =
                                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-5 shadow-lg shrink-0";
                                fb.style.backgroundColor = color;
                                fb.textContent = displayName.charAt(0);
                                parent.prepend(fb);
                              }
                            }}
                          />
                        ) : (
                          <motion.div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-5 shadow-lg shrink-0 transition-all duration-500"
                            style={{ backgroundColor: color }}
                            whileHover={{ scale: 1.05 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          >
                            {displayName.charAt(0)}
                          </motion.div>
                        )}
                        <h3 className="text-[15px] font-medium text-white/90 truncate max-w-full px-2 text-center tracking-wide">
                          {displayName}
                        </h3>
                      </div>

                      {/* Manage Button Overlay (Connected State Hover) */}
                      {/* {isConnected && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 z-20">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleConnect(integration.appName, isConnected)}
                            className="px-6 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-white text-sm font-medium rounded-full transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
                          >
                            Manage App
                          </motion.button>
                        </div>
                      )} */}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredIntegrations.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center text-sm text-[#888]"
              >
                No toolkits found{" "}
                {searchQuery ? `matching "${searchQuery}"` : ""}.
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
