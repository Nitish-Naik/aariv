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

import { PLATFORM_LOGOS } from "@/lib/platform-logos";

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
    if (isConnected) return;

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
    const isExpired = !isConnected && ["expired", "inactive", "error", "failed"].includes(integration.status);
    const isConnecting = connecting === integration.appName;

    return (
      <motion.div
        key={integration.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group relative rounded-[1.25rem] p-[1.5px] hover:-translate-y-1 transition-all duration-500 ease-out h-[260px]"
      >
        {/* Glow layer that bleeds outside the card (drop shadow effect) */}
        <div className={`absolute inset-0 rounded-[1.25rem] z-0 blur-2xl transition-opacity duration-500 pointer-events-none flex items-center justify-center ${isConnected ? "opacity-30" : "opacity-0 group-hover:opacity-60"}`}>
          {logoSvg ? (
            <img src={logoSvg} alt="" className="w-[120%] h-[120%] object-cover saturate-[1.5]" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: color }} />
          )}
        </div>

        {/* Border layer (Cut off by overflow-hidden, shines through the 1.5px padding) */}
        <div className={`absolute inset-0 rounded-[1.25rem] z-0 overflow-hidden transition-all duration-500 pointer-events-none flex items-center justify-center ${isConnected ? "opacity-80 border border-white/10" : "opacity-10 group-hover:opacity-100 bg-white/5 border border-white/5 group-hover:border-transparent"}`}>
          {logoSvg ? (
            <img src={logoSvg} alt="" className="w-[150%] h-[150%] object-cover blur-[16px] saturate-[1.5]" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: color }} />
          )}
        </div>

        <div className="relative flex flex-col p-5 h-full overflow-hidden z-10 rounded-[calc(1.25rem-1.5px)] bg-[#111319] dark:bg-[#111319] w-full shadow-xl">
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-[0.10] transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)` }}
          />

          <div className="flex justify-end w-full relative z-20">
            {isConnected ? (
              integration.canDisconnect ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDisconnect({ id: integration.id, name: integration.appName });
                  }}
                  disabled={disconnecting === integration.appName}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-red-500/20 text-emerald-400 hover:text-red-400 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {disconnecting === integration.appName ? (
                    <Loader2 strokeWidth={1.5} size={14} className="animate-spin" />
                  ) : (
                    "Connected"
                  )}
                </button>
              ) : (
                <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-sm font-semibold rounded-xl">
                  Connected
                </div>
              )
            ) : isExpired ? (
              <button
                onClick={() => handleConnect(integration.appName, false)}
                disabled={isConnecting}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 border border-amber-500/20"
                title="This connection has expired. Click to reconnect."
              >
                {isConnecting ? (
                  <Loader2 strokeWidth={1.5} size={14} className="animate-spin" />
                ) : (
                  "Reconnect"
                )}
              </button>
            ) : (
              <button
                onClick={() => handleConnect(integration.appName, isConnected)}
                disabled={isConnecting}
                className="px-5 py-2 bg-[#e2e2e2] hover:bg-white text-black text-[15px] font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 shadow-sm"
              >
                {isConnecting ? (
                  <Loader2 strokeWidth={1.5} size={16} className="animate-spin" />
                ) : (
                  "Connect"
                )}
              </button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center flex-1 relative z-10 w-full pointer-events-none pb-4">
            {logoSvg ? (
              <motion.img
                src={logoSvg}
                alt={displayName}
                className="w-[72px] h-[72px] object-contain mb-5 drop-shadow-md filter transition-all duration-500"
                whileHover={{ scale: 1.05 }}
                onError={(e: any) => {
                  const parent = e.currentTarget.parentElement;
                  e.currentTarget.style.display = "none";
                  if (parent && !parent.querySelector('.fallback-logo')) {
                    const fb = document.createElement("div");
                    fb.className =
                      "fallback-logo w-[72px] h-[72px] rounded-xl flex items-center justify-center text-white font-bold text-3xl mb-5 shadow-lg shrink-0";
                    fb.style.backgroundColor = color;
                    fb.textContent = displayName.charAt(0);
                    parent.prepend(fb);
                  }
                }}
              />
            ) : (
              <motion.div
                className="w-[72px] h-[72px] rounded-xl flex items-center justify-center text-white font-bold text-3xl mb-5 shadow-lg shrink-0 transition-all duration-500"
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.05 }}
              >
                {displayName.charAt(0)}
              </motion.div>
            )}
            <h3 className="text-[22px] leading-tight font-bold text-white truncate max-w-full px-2 text-center tracking-tight">
              {displayName}
            </h3>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-white">
        {/* Success toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300">
            <Check strokeWidth={1.5} size={16} />
            {toast}
          </div>
        )}

        {/* Error toast */}
        {errorToast && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-500/90 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top fade-in duration-300">
            <AlertCircle strokeWidth={1.5} size={16} />
            {errorToast}
          </div>
        )}

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Toolkits</h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Segmented Control */}
            <div className="inline-flex p-1 space-x-1 rounded-xl bg-neutral-900 backdrop-blur-sm border border-white/10 shadow-sm">
              {(["all", "connected"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none ${activeTab === tab
                    ? "text-white"
                    : "text-neutral-500 hover:text-white"
                    }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 rounded-lg shadow-sm bg-white/10"
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
                <Search strokeWidth={1.5}
                  size={16}
                  className="transition-colors text-neutral-500 group-focus-within:text-neutral-400"
                />
              </div>
              <input
                type="text"
                placeholder="Search across toolkits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-all duration-200 bg-black border border-white/10 text-white placeholder-neutral-600 focus:border-white/20 focus:ring-1 focus:ring-white/20"
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
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/20 hover:text-white"
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
                                ? "bg-white text-black border-white shadow-sm"
                                : "bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/20 hover:text-white"
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
                      ? "bg-white/10 text-white"
                      : "text-neutral-500 hover:text-white hover:bg-neutral-900"
                      }`}
                    title="Grid view"
                  >
                    <Grid3X3 strokeWidth={1.5} size={16} />
                  </button>
                  <button
                    onClick={() => setGroupByCategory(true)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${groupByCategory
                      ? "bg-white/10 text-white"
                      : "text-neutral-500 hover:text-white hover:bg-neutral-900"
                      }`}
                    title="Group by category"
                  >
                    <LayoutList strokeWidth={1.5} size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          /* Staggered Skeleton Loaders — match actual card shape */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-[1.25rem] h-[260px] bg-[#111319] border border-white/[0.06] animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-full p-5 flex flex-col">
                  {/* top-right: button stub */}
                  <div className="flex justify-end">
                    <div className="h-8 w-20 rounded-xl bg-white/[0.07]" />
                  </div>
                  {/* center: logo + name */}
                  <div className="flex-1 flex flex-col items-center justify-center pb-4 gap-4">
                    <div className="w-[72px] h-[72px] rounded-xl bg-white/[0.07]" />
                    <div className="h-5 w-28 rounded-lg bg-white/[0.05]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : /* Toolkit Grid */
          activeTab === "connected" ? (
            <div className="space-y-12">
              <div>
                <h2 className="text-[15px] font-medium uppercase tracking-widest text-neutral-500 mb-5">
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full py-16 flex flex-col items-center gap-4 text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/[0.06] flex items-center justify-center">
                        <Grid3X3 strokeWidth={1.5} size={22} className="text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-300 mb-1">No apps connected yet</p>
                        <p className="text-xs text-neutral-600 max-w-xs">
                          Connect Gmail, Calendar, Slack or GitHub to let Aariv monitor and act on your behalf.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("all")}
                        className="mt-1 px-5 py-2 bg-white hover:bg-neutral-100 text-black text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm"
                      >
                        Browse apps
                      </button>
                    </motion.div>
                  )}
              </div>

              <div>
                <h2 className="text-[15px] font-medium uppercase tracking-widest text-neutral-500 mb-5">
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
                    <h2 className="text-[15px] font-medium uppercase tracking-widest text-neutral-500">
                      {group.label}
                    </h2>
                    <span className="text-xs text-neutral-400 bg-black/5 dark:bg-[#1a1a1a] px-2 py-0.5 rounded-full">
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
              className="relative w-full max-w-sm bg-black border border-white/10 rounded-xl shadow-xl overflow-hidden p-6"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <AlertCircle strokeWidth={1.5} size={24} />
                <h3 className="text-lg font-semibold text-white">
                  Disconnect {confirmDisconnect.name.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}?
                </h3>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                Are you sure you want to disconnect this toolkit? Any active triggers or automations relying on this connection will stop working immediately.
              </p>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setConfirmDisconnect(null)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
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
