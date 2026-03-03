"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Grid3X3,
  LayoutList,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";

interface CategoryInfo {
  id: string;
  name: string;
}

interface Integration {
  id: string;
  appName: string;
  status: string;
  label?: string;
  connectedAt?: string;
  email?: string;
  canDisconnect?: boolean;
  categories?: CategoryInfo[];
}

const PLATFORM_COLORS: Record<string, string> = {
  gmail: "#EA4335",
  googlecalendar: "#4285F4",
  googlesheets: "#34A853",
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
  googlesheets: ["#34A853", "#FBBC05", "#4285F4", "#1E8E3E"],
  slack: ["#36C5F0", "#2EB67D", "#E01E5A", "#ECB22E"],
  discord: ["#5865F2", "#57F287", "#FEE75C", "#EB459E"],
  notion: ["#FFFFFF", "#CCCCCC", "#666666", "#000000"], // monochrome gradient
  linear: ["#5E6AD2", "#7E8AE2", "#3E4AB2", "#5E6AD2"], // purple hues
  github: ["#fafbfc", "#e1e4e8", "#24292e", "#6a737d"], // greyscale github scheme
  twitter: ["#1DA1F2", "#71C9F8", "#1A91DA", "#1DA1F2"], // distinct twitter blues
  composio: ["#8E24AA", "#AB47BC", "#6A1B9A", "#8E24AA"], // violet/purple
  codeinterpreter: ["#4A5568", "#718096", "#2D3748", "#4A5568"], // terminal slate
  hackernews: ["#FF6600", "#FF8533", "#CC5200", "#FF6600"], // Y-combinator orange
};

/**
 * Derive 4 corner colors from a single hex brand color.
 * Shifts hue ±30° and adjusts lightness to create variety.
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
    hslToHex(h - 0.06, s * 1.1, l * 1.15), // top-left
    hslToHex(h + 0.06, s * 0.9, l * 0.85), // top-right
    hslToHex(h + 0.12, s * 1.0, l * 1.1), // bottom-right
    hslToHex(h - 0.12, s * 1.05, l * 0.9), // bottom-left
  ];
}

/** Get corner colors: use manual override for multi-color brands, otherwise auto-derive */
function getCornerColors(
  appSlug: string,
  brandColor: string,
): [string, string, string, string] {
  return PLATFORM_CORNER_COLORS[appSlug] || deriveCornerColors(brandColor);
}

// Map apps to broad categories for filtering (fallback only for apps without API categories)
const APP_CATEGORIES_FALLBACK: Record<string, string> = {
  gmail: "communication",
  googlecalendar: "productivity",
  googlesheets: "productivity",
  slack: "communication",
  notion: "productivity",
  linear: "developer-tools",
  discord: "communication",
  github: "developer-tools",
  twitter: "social-media",
  hackernews: "social-media",
};

// TrustClaw Toolkits style SVG base64 or inline paths
const PLATFORM_LOGOS: Record<string, string> = {
  gmail:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%23f2f2f2' x='2' y='4' width='20' height='16' rx='2'/%3E%3Cpath fill='%23ea4335' d='M2 6l10 7 10-7'/%3E%3Cpath fill='%23ea4335' d='M2 4l10 8 10-8' stroke='%23ea4335' stroke-width='1.5' fill='none'/%3E%3C/svg%3E",
  googlecalendar:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%234285f4' x='2' y='2' width='20' height='20' rx='3'/%3E%3Crect fill='%23fff' x='5' y='7' width='14' height='13' rx='1'/%3E%3Crect fill='%23ea4335' x='5' y='7' width='14' height='3'/%3E%3Crect fill='%234285f4' x='8' y='12' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='13' y='12' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='8' y='16' width='3' height='2' rx='.5'/%3E%3Crect fill='%234285f4' x='13' y='16' width='3' height='2' rx='.5'/%3E%3C/svg%3E",
  googlesheets:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect fill='%230F9D58' x='2' y='2' width='20' height='20' rx='3'/%3E%3Cpath fill='%23fff' d='M7 6h10v2H7zm0 4h10v2H7zm0 4h10v2H7z'/%3E%3C/svg%3E",
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
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<ReactNode | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<
    CategoryInfo[]
  >([]);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<{ id: string, name: string } | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<"all" | "connected">("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    loadIntegrations();
    loadCategories();

    // Check if we returned from a successful connection
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("status") === "success" ||
      params.get("status") === "ACTIVE"
    ) {
      const app = params.get("app") || "App";
      const displayName = app.replace("-", " ");
      // Fire auto-setup for default triggers (server-side also runs this via callback)
      api
        .post("/triggers/auto-setup", { userId: user!.id, appName: app })
        .catch(() => { });
      setToast(
        <span>
          {displayName} connected!{" "}
          <Link
            href="/dashboard/triggers"
            className="underline underline-offset-2 hover:text-white"
          >
            Customize monitoring &rarr;
          </Link>
        </span>,
      );
      // Clean URL
      window.history.replaceState({}, "", "/dashboard/integrations");
      setTimeout(() => setToast(null), 5000);
    }
  }, [user?.id]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/integrations?userId=${user!.id}`);
      const loadedIntegrations: Integration[] = data.integrations || [];
      setIntegrations(loadedIntegrations);

      // Derive categories from loaded integrations as fallback
      if (availableCategories.length === 0) {
        const catMap = new Map<string, string>();
        for (const integration of loadedIntegrations) {
          for (const cat of integration.categories || []) {
            if (cat.id && cat.name) catMap.set(cat.id, cat.name);
          }
        }
        if (catMap.size > 0) {
          setAvailableCategories(
            Array.from(catMap, ([id, name]) => ({ id, name })),
          );
        }
      }
    } catch (e: any) {
      console.error("Failed to load integrations:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.get("/integrations/categories");
      if (data.categories?.length > 0) {
        setAvailableCategories(data.categories);
      }
    } catch (e: any) {
      // Categories will be derived from integrations data as fallback
      console.warn("Categories endpoint unavailable, using inline data");
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

  const handleDisconnect = async (connectionId: string, appName: string) => {
    try {
      setDisconnecting(appName);
      await api.post("/integrations/disconnect", {
        userId: user!.id,
        connectionId,
      });

      setToast(`${appName.replace("-", " ")} disconnected successfully!`);
      setTimeout(() => setToast(null), 4000);
      loadIntegrations();
    } catch (e: any) {
      console.error("Failed to disconnect:", e.message);
      const errorMsg =
        e.response?.data?.detail?.message ||
        e.response?.data?.detail ||
        "Failed to disconnect. Please try again.";
      setErrorToast(errorMsg);
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setDisconnecting(null);
    }
  };

  // Build the dynamic categories list for filter pills
  const CATEGORIES = useMemo(() => {
    const cats: { id: string; label: string }[] = [{ id: "all", label: "All" }];
    for (const cat of availableCategories) {
      cats.push({ id: cat.id, label: cat.name });
    }
    return cats;
  }, [availableCategories]);

  // Filter integrations based on search, tab, and category
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const appSlug = integration.appName.toLowerCase().replace("-", "");
      const displayName = integration.label || integration.appName;

      const matchesSearch = displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isConnected = integration.status === "connected";
      const matchesTab = activeTab === "all" || isConnected;

      // Match by API categories or hardcoded fallback
      let matchesCategory = activeCategory === "all";
      if (!matchesCategory) {
        const apiCats = (integration.categories || []).map((c) => c.id);
        if (apiCats.length > 0) {
          matchesCategory = apiCats.includes(activeCategory);
        } else {
          // Fallback to hardcoded mapping
          const fallback = APP_CATEGORIES_FALLBACK[appSlug];
          matchesCategory = fallback === activeCategory;
        }
      }

      // Filter out unwanted built-in features
      const isBuiltin = !integration.canDisconnect;
      const isBlacklistedBuiltin = isBuiltin
        ? [
          "composio",
          "browsertool",
          "browser",
          "composio_search",
          "",
          "code-interpeter",
          "codeinterpreter",
          "text_to_pdf",
          "text-to-pdf",
          "TEXT_TO_PDF",
          "browser_tool",
          "test_app",
        ].includes(appSlug)
        : false;

      return (
        matchesSearch && matchesTab && matchesCategory && !isBlacklistedBuiltin
      );
    });
  }, [integrations, searchQuery, activeTab, activeCategory]);

  // Group integrations by category for grouped view
  const groupedIntegrations = useMemo(() => {
    if (!groupByCategory) return null;

    const groups = new Map<string, { label: string; items: Integration[] }>();

    for (const integration of filteredIntegrations) {
      const cats = integration.categories || [];
      const appSlug = integration.appName.toLowerCase().replace("-", "");

      if (cats.length > 0) {
        // Add to first category (primary)
        const primary = cats[0];
        if (!groups.has(primary.id)) {
          groups.set(primary.id, { label: primary.name, items: [] });
        }
        groups.get(primary.id)!.items.push(integration);
      } else {
        // Fallback
        const fallbackId = APP_CATEGORIES_FALLBACK[appSlug] || "other";
        const fallbackLabel =
          fallbackId === "other"
            ? "Other"
            : fallbackId
              .split("-")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ");
        if (!groups.has(fallbackId)) {
          groups.set(fallbackId, { label: fallbackLabel, items: [] });
        }
        groups.get(fallbackId)!.items.push(integration);
      }
    }

    // Sort groups alphabetically, but put "Other" at the end
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === "other") return 1;
      if (b === "other") return -1;
      return a.localeCompare(b);
    });
  }, [filteredIntegrations, groupByCategory]);

  const renderIntegrationCard = (integration: Integration) => {
    const appSlug = integration.appName.toLowerCase().replace("-", "");
    const displayName = integration.label || integration.appName;
    const color = PLATFORM_COLORS[appSlug] || "#8b95b0";
    const logoSvg = (integration as any).logo || PLATFORM_LOGOS[appSlug];
    const isConnected = integration.status === "connected";
    const isConnecting = connecting === integration.appName;

    // const syncedMins = integration.id ? (integration.id.charCodeAt(0) % 55) + 1 : 5;
    const cornerColors = getCornerColors(appSlug, color);
    const [tl, tr, br, bl] = cornerColors;
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
        <div
          className={`absolute inset-[-1px] rounded-2xl transition-opacity duration-500 pointer-events-none z-0 ${isConnected ? "opacity-30" : "opacity-0 group-hover:opacity-100"}`}
          style={{ background: cornerGlowBg }}
        />
        <div
          className="absolute inset-[-4px] rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl pointer-events-none z-0"
          style={{ background: cornerGlowBg }}
        />
        <div className="relative flex flex-col p-5 h-full overflow-hidden z-10 rounded-[calc(1rem-1.5px)] bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] min-h-[220px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="flex justify-end w-full relative z-10 mb-2">
            {isConnected ? (
              integration.canDisconnect ? (
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDisconnect({ id: integration.id, name: integration.appName });
                    }}
                    disabled={disconnecting === integration.appName}
                    className="group/btn relative px-3 py-1 bg-emerald-500/10 hover:bg-red-500/10 text-emerald-400 hover:text-red-400 text-xs font-semibold tracking-wide rounded-full border border-emerald-500/20 hover:border-red-500/20 flex items-center gap-1.5 transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.05)] backdrop-blur-sm disabled:opacity-50"
                  >
                    {disconnecting === integration.appName ? (
                      <Loader2
                        size={12}
                        className="animate-spin text-red-500"
                      />
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/btn:bg-red-400 shadow-[0_0_5px_rgba(52,211,153,0.8)] group-hover/btn:shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                        <span className="group-hover/btn:hidden">
                          Connected
                        </span>
                        <span className="hidden group-hover/btn:inline">
                          Disconnect
                        </span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-[#888]">
                    {/* Last synced {syncedMins}m ago */}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.05)] backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                    Connected
                  </div>
                  <span className="text-[10px] text-[#888]">
                    {/* Last synced {syncedMins}m ago */}
                  </span>
                </div>
              )
            ) : (
              <button
                onClick={() => handleConnect(integration.appName, isConnected)}
                disabled={isConnecting}
                className="px-4 py-1.5 bg-[#e8e8e8] hover:bg-white text-black text-xs font-medium rounded-full transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95"
              >
                {isConnecting ? (
                  <Loader2 size={12} className="animate-spin text-black" />
                ) : (
                  "Connect"
                )}
              </button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center flex-1 relative z-10 w-full pointer-events-none mt-2">
            {logoSvg ? (
              <motion.img
                src={logoSvg}
                alt={displayName}
                className="w-14 h-14 object-contain mb-4 drop-shadow-md filter transition-all duration-500"
                whileHover={{ scale: 1.05 }}
                onError={(e: any) => {
                  const parent = e.currentTarget.parentElement;
                  e.currentTarget.style.display = "none";
                  if (parent) {
                    const fb = document.createElement("div");
                    fb.className =
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shrink-0";
                    fb.style.backgroundColor = color;
                    fb.textContent = displayName.charAt(0);
                    parent.prepend(fb);
                  }
                }}
              />
            ) : (
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shrink-0 transition-all duration-500"
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.05 }}
              >
                {displayName.charAt(0)}
              </motion.div>
            )}
            <h3 className="text-[15px] font-medium text-white/90 truncate max-w-full px-2 text-center tracking-wide">
              {displayName}
            </h3>
            {isConnected && (
              <p className="text-xs text-[var(--text-muted)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Click to configure */}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

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
                  className="transition-colors text-[var(--text-muted)] group-focus-within:text-[var(--text-secondary)]"
                />
              </div>
              <input
                type="text"
                placeholder="Search across toolkits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-all duration-200 bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--text-secondary)]"
              />
            </div>
          </div>

          {/* Categories Filter (Only show if 'all' tab is selected) */}
          <AnimatePresence>
            {activeTab === "all" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex flex-wrap items-center gap-2 mt-4"
              >
                <div className="flex items-center flex-1 min-w-0 pr-4">
                  {/* Sticky "All" Pill */}
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`shrink-0 z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 border ${activeCategory === "all"
                        ? "bg-[#e8e8e8] text-black border-[#e8e8e8] shadow-sm"
                        : "bg-[#161616] text-[#888] border-[#2a2a2a] hover:border-[#444] hover:text-white"
                      }`}
                  >
                    All
                  </button>

                  {CATEGORIES.length > 1 && (
                    <>
                      {/* Vertical Divider */}
                      <div className="w-[1px] h-5 bg-white/10 shrink-0 mx-3" />

                      {/* Horizontally scrolling list for the rest */}
                      <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full scroll-smooth pt-1 pb-1">
                        {CATEGORIES.filter((c) => c.id !== "all").map(
                          (category) => (
                            <button
                              key={category.id}
                              onClick={() => setActiveCategory(category.id)}
                              className={`shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 border capitalize ${activeCategory === category.id
                                  ? "bg-[#e8e8e8] text-black border-[#e8e8e8] shadow-sm"
                                  : "bg-[#161616] text-[#888] border-[#2a2a2a] hover:border-[#444] hover:text-white"
                                }`}
                            >
                              {category.label}
                            </button>
                          ),
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Group-by toggle */}
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => setGroupByCategory(false)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${!groupByCategory
                        ? "bg-[#3a3a3a] text-white"
                        : "text-[#666] hover:text-white hover:bg-[#2a2a2a]"
                      }`}
                    title="Grid view"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setGroupByCategory(true)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${groupByCategory
                        ? "bg-[#3a3a3a] text-white"
                        : "text-[#666] hover:text-white hover:bg-[#2a2a2a]"
                      }`}
                    title="Group by category"
                  >
                    <LayoutList size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          /* Staggered Skeleton Loaders */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border)] min-h-[180px] flex flex-col items-center justify-center animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--border)] mb-4" />
                <div className="w-24 h-4 rounded bg-[var(--border)] mb-6" />
                <div className="w-20 h-8 rounded-full bg-[var(--border)]/50 mt-auto ml-auto" />
              </div>
            ))}
          </div>
        ) : /* Toolkit Grid */
          activeTab === "connected" ? (
            <div className="space-y-12">
              <div>
                <h2 className="text-[15px] font-medium uppercase tracking-widest text-[var(--text-muted)] mb-5">
                  Your Connections
                </h2>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-5"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredIntegrations
                      .filter((i) => i.canDisconnect)
                      .map(renderIntegrationCard)}
                  </AnimatePresence>
                </motion.div>
                {filteredIntegrations.filter((i) => i.canDisconnect).length ===
                  0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-10 text-center text-sm text-[#888]"
                    >
                      No manual connections found.
                    </motion.div>
                  )}
              </div>

              <div>
                <h2 className="text-[15px] font-medium uppercase tracking-widest text-[var(--text-muted)] mb-5">
                  Built-in Features
                </h2>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-5"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredIntegrations
                      .filter((i) => !i.canDisconnect)
                      .map(renderIntegrationCard)}
                  </AnimatePresence>
                </motion.div>
                {filteredIntegrations.filter((i) => !i.canDisconnect).length ===
                  0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-10 text-center text-sm text-[#888]"
                    >
                      No built-in features found.
                    </motion.div>
                  )}
              </div>
            </div>
          ) : groupByCategory && groupedIntegrations ? (
            /* Grouped-by-category view */
            <div className="space-y-10">
              {groupedIntegrations.map(([categoryId, group]) => (
                <motion.div
                  key={categoryId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-[15px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
                      {group.label}
                    </h2>
                    <span className="text-xs text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                      {group.items.length}
                    </span>
                  </div>
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-5"
                  >
                    <AnimatePresence mode="popLayout">
                      {group.items.map(renderIntegrationCard)}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))}
              {groupedIntegrations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center text-sm text-[#888]"
                >
                  No toolkits found{" "}
                  {searchQuery ? `matching "${searchQuery}"` : ""}.
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredIntegrations.map(renderIntegrationCard)}
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

      {/* Disconnect Confirmation Modal */}
      <AnimatePresence>
        {confirmDisconnect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmDisconnect(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden p-6"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <AlertCircle size={24} />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Disconnect {confirmDisconnect.name.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}?
                </h3>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                Are you sure you want to disconnect this toolkit? Any active triggers or automations relying on this connection will stop working immediately.
              </p>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setConfirmDisconnect(null)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDisconnect(confirmDisconnect.id, confirmDisconnect.name);
                    setConfirmDisconnect(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors flex items-center gap-2"
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
