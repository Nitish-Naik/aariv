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
const PLATFORM_CORNER_COLORS: Record<string, [string, string, string, string]> = {
  gmail:           ["#EA4335", "#FBBC05", "#34A853", "#4285F4"],
  googlecalendar:  ["#4285F4", "#34A853", "#EA4335", "#FBBC05"],
  slack:           ["#36C5F0", "#2EB67D", "#E01E5A", "#ECB22E"],
  discord:         ["#5865F2", "#57F287", "#FEE75C", "#EB459E"],
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
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
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
    const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
    return `#${toHex(hue2rgb(p, q, h + 1 / 3))}${toHex(hue2rgb(p, q, h))}${toHex(hue2rgb(p, q, h - 1 / 3))}`;
  };

  return [
    hslToHex(h - 0.06, s * 1.1, l * 1.15),   // top-left: slightly warmer, brighter
    hslToHex(h + 0.06, s * 0.9, l * 0.85),    // top-right: slightly cooler, darker
    hslToHex(h + 0.12, s * 1.0, l * 1.1),     // bottom-right: more hue shift
    hslToHex(h - 0.12, s * 1.05, l * 0.9),    // bottom-left: opposite hue shift
  ];
}

/** Get corner colors: use manual override for multi-color brands, otherwise auto-derive */
function getCornerColors(appSlug: string, brandColor: string): [string, string, string, string] {
  return PLATFORM_CORNER_COLORS[appSlug] || deriveCornerColors(brandColor);
}

// TrustClaw Toolkits style SVG base64 or inline paths
const PLATFORM_LOGOS: Record<string, string> = {
  gmail: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2YyYTIwYyIgZD0iTTE4Ljc1LDExLjI1TDEyLDE1TDUuMjUsMTEuMjVDNS4yNSwxMS4yNSw1LjI1LDUuMjUsNS4yNSw1LjI1QzUsNSw1LjI1LDQsNi43NSw0SDcuNUwxMiw4LjI1TDE2LjUsNEgxNy4yNUMxOC43NSw0LDE5LDUsMTguNzUsNS4yNVYxMS4yNVoiLz48cGF0aCBmaWxsPSIjZWE0MzM1IiBkPSJNMTYuNSw0TDEyLDguMjVMNy41LDRINi43NUM1LjI1LDQsNSw1LDUuMjUsNS4yNVYyMENNS4yNSwyMCwyMCwyMCwyMCwyMFY1LjI1QzE5LDUsMTguNzUsNCwxNy4yNSw0SDE2LjVaIi8+PHBhdGggZmlsbD0iIzM0YThmZSIgZD0iTTE4Ljc1LDIwQzE5LDIwLDIwLDE5LjI1LDIwLDE4Ljc1VjExLjI1TDE2LjUsMTNWMTguNzVDMTYuNSwxOS4yNSwxNy4yNSwyMCwxOC43NSwyMFoiLz48cGF0aCBmaWxsPSIjMzRkZTUwIiBkPSJNNi43NSwyMEM1LDIwLDQsMTkuMjUsNCwxOC43NVYxMS4yNUw3LjUsMTNWMTguNzVDNy41LDE5LjI1LDYuNzUsMjAsNi43NSwyMFoiLz48cGF0aCBmaWxsPSIjZjNhNTEwIiBkPSJNNi43NSw0SDcuNUwxMiw4LjI1TDE2LjUsNEgxNy4yNUMxOC43NSw0LDE5LDUsMTguNzUsNS4yNVYxMS4yNUwwLjUsMjBWNS4yNUMwLjUsNSwxLDQsMi41LDRINi43NVoiLz48L3N2Zz4=",
  googlecalendar: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzQyODVmNCIgZD0iTTIuNyAxMkwyLjcgMTloNy44TDE1LjUgMi4ybC0yLjctMi4ySDYuM2MtMS45IDAtMy42IDEuNi0zLjYgMy42djguNEgyLjd6Ii8+PHBhdGggZmlsbD0iIzM0YThmZSIgZD0iTTIuNyAxMnY3YzAgMS45IDEuNiAzLjYgMy42IDMuNmg0LjJWMTJMNS4yIDVMMi43IDEyeiIvPjxwYXRoIGZpbGw9IiNmYmJjMDUiIGQ9Ik0xOC40IDIyLjZoMy4ydjBoLTEwLjZ2MGgtLjV2MGgxMS4xcS4wOCAwIC4xNS0uMDEuMTIgMCAuMjEtLjAyYTMuMSAzLjEgMCAwIDAtLjk4LS43NWwtLTA1LS4wMy0xLjgtMS41Ljg5Ljg5LTYuNyA2LjdWMTIuN2wxLjUtMS41djEwLjN6Ii8+PHBhdGggZmlsbD0iI2VhNDMzNSIgZD0iTTEwLjUgMTJsMi43LTIuMnYxMGgyLjN2MGguNXYwSDE4LjRjMS45IDAgMy42LTEuNiAzLjYtMy42VjcuOEwxOS44IDVMMTAuNSAxMnoiLz48cGF0aCBmaWxsPSIjMzRkZTUwIiBkPSJNMTEuOSAxLjNsLTA1LS4wMy0xLjQtMS4ydjEwLjNsNC0zaDMuMlYzLjZDMjEuNiAxLjYgMjAgMCAxOC4xIDBINi4ydjBsNC0xbC40LjR6Ii8+PC9zdmc+",
  slack: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2UwMWU1YSIgZD0iTTcuMywxMkExLjksMS45LDAsMSwxLDUuNCwxMC4xSDcuM1oiLz48cGF0aCBmaWxsPSIjZTAxZTVhIiBkPSJNOC4zLDEyQTEuOSwxLjksMCwxLDEsMTIsMTMuOEg4LjNaIi8+PHBhdGggZmlsbD0iIzM2YzVmMCIgZD0iTTEyLDcuM0ExLjksMS45LDAsMSwxLDEzLjksNS40VjcuM1oiLz48cGF0aCBmaWxsPSIjMzZjNWYwIiBkPSJNMTIsOC4zQTEuOSwxLjksMCwxLDEsMTAuMiwxMlY4LjNaIi8+PHBhdGggZmlsbD0iIzJiYWM3NiIgZD0iTTE2LjcsMTJBMS45LDEuOSwwLDEsMSwxOC42LDEzLjlIMTYuN1oiLz48cGF0aCBmaWxsPSIjMmJhYzc2IiBkPSJNMTUuNywxMkExLjksMS45LDAsMSwxLDEyLDEwLjJIMTguMloiLz48cGF0aCBmaWxsPSIjZWNkYTMyIiBkPSJNMTIsMTYuN0ExLjksMS45LDAsMSwxLDEwLjEsMTguNlYxNi43WiIvPjxwYXRoIGZpbGw9IiNlY2RhMzIiIGQ9Ik0xMiwxNS43QTEuOSwxLjksMCwxLDEsMTMuOCwxMlYxNS43WiIvPjwvc3ZnPg==",
  github: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIC4yOTdjLTYuNjMgMC0xMiA1LjM3My0xMiAxMiAwIDUuMzAzIDMuNDM4IDkuOCA4LjIwNSAxMS4zODUuNi4xMTMuODItLjI1OC44Mi0uNTc3IDAtLjI4NS0uMDExLTEuMDQtLjAxNS0yLjA0LTMuMzM4LjcyNC00LjA0Mi0xLjYxLTQuMDQyLTEuNjFDNC40MjIgMTguMDcgMy42MzMgMTcuNyAzLjYzMyAxNy43Yy0xLjA4Ny0uNzQ0LjA4NC0uNzI5LjA4NC0uNzI5IDEuMjA1LjA4NCAxLjgzOCAxLjIzNiAxLjgzOCAxLjIzNiAxLjA3IDEuODM1IDIuODA5IDEuMzA1IDMuNDk1Ljk5OC4xMDgtLjc3Ni40MTgtMS4zMDUuNzYtMS42MDUtMi42NjUtLjMwMy01LjQ2Ni0xLjMzMi01LjQ2Ni01LjkzIDAtMS4zMS40NjUtMi4zOCAxLjIzNS0zLjIyLS4xMzUtLjMwMy0uNTQtMS41MjMuMTA1LTMuMTc2IDAgMCAxLjAwNS0uMzIyIDMuMyAxLjIzLjk2LS4yNjcgOS45OC0uMjc21Ni4yNiAzLjItLTIuMjkyLTMuMy0yLjI5MiAzLjMtLjAwOC42NTIuMTA0IDEuODc1IDEuMjM0IDAuMjA0IDEuOTEyLjU2IDIuMzY0LjEyMiAyLjY2Ny4zLjM0My44MjguODI1LjgzIDItLjAwOC0xLjA0LjAyLTIuMjMuMDIuNjYuMzE3Ljk0NS42MTMuOTQ1一点六1.2z\"/>PC9zdmc+",
  notion: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE0LjM4IDcuMGE2LjAgNi4wIDAgMCAxLTIuNiA1LjdWNTBjLTMuNC0zLjAtNy4yLTUuMi0xMS41LTcuMWwtNC40LS4xeiIvPjwvc3ZnPg==",
  twitter: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE4LjI0NCAyLjI1aDMuMzA4bC03LjIyNyA4LjI2IDguNTAyIDExLjI0SDE2LjE3bC01LjIxNC02LjgybC02LjYxMSA2LjE4SDguMTI2bDcuODkxLTkuMDI2TDcuNjk4IDIuMjVoMjk1LjU5M2wyLjM0IDYuMDQybDQuMjk0LTRtLjcxMy4yMTVzLjc4LjQyLTEuNigxMGMudzc0LjUuNC42LjcuMTA4KWMtNDYuOEEuOS44IDAgMCAxIDEzLjQ5NyAyMmw0LjM4LTIuOTU2LTMuNjMtMi45NiAyLTEuNDZMODQuNSAxMC4yeiIvPjwvc3ZnPg==",
  composio: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzhFMjRBQSIgZD0iTTEwLjggMy42YzAgMS41IDEuNiAzIDMuMiAzczMuMi0xLjUgMy4yLTN6TTguNSAxMmMtMS42IDAtMy0xLjQtMy0zczEuNC0zIDMtMyAzIDEuNCAzIDMtMS40IDMtMyAzem02LjUgMGMwIDEuNiAxLjQgMyAzIDNzMy0xLjQgMy0zLTEuNC0zLTMtM3ptLTguNS0yem8yIi8+PC9zdmc+",
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
      const errorMsg = e.response?.data?.detail?.message || e.response?.data?.detail || "Failed to initiate connection. Please try again.";
      setErrorToast(errorMsg);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // Filter integrations based on search and tab
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const displayName =
        integration.label ||
        integration.appName;

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
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Toolkits
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Segmented Control */}
            <div className="inline-flex p-1 space-x-1 rounded-xl bg-[#2a2a2a]/60 backdrop-blur-sm border border-white/5 shadow-sm">
              {(["all", "connected"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none ${activeTab === tab
                    ? "text-white"
                    : "text-[#a0a0a0] hover:text-white"
                    }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 rounded-lg shadow-sm bg-[#3a3a3a]"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="capitalize">{tab === "all" ? "All" : "Connected"}</span>
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
                const appSlug = integration.appName.toLowerCase().replace("-", "");
                const displayName = integration.label || integration.appName;
                const color = PLATFORM_COLORS[appSlug] || "#8b95b0";
                const logoSvg = (integration as any).logo || PLATFORM_LOGOS[appSlug];
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
                            onClick={() => handleConnect(integration.appName, isConnected)}
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
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        ) : (
                          <motion.div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-5 shadow-lg shrink-0 transition-all duration-500"
                            style={{ backgroundColor: color }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          >
                            {displayName.charAt(0)}
                          </motion.div>
                        )}
                        <h3 className="text-[15px] font-medium text-white/90 truncate max-w-full px-2 text-center tracking-wide">
                          {displayName}
                        </h3>
                      </div>

                      {/* Manage Button Overlay (Connected State Hover) */}
                      {isConnected && (
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
                      )}
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
                No toolkits found {searchQuery ? `matching "${searchQuery}"` : ""}.
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
