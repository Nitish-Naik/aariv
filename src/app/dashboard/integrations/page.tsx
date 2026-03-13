"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
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
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

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

// What Aariv can do after connecting each app
const APP_CONNECT_EXPLANATIONS: Record<string, { title: string; bullets: string[] }> = {
  gmail: {
    title: "Gmail is connected",
    bullets: [
      "Monitor your inbox for emails matching your rules",
      "Draft replies and send messages on your behalf",
      "Summarize long threads and extract action items",
    ],
  },
  googlecalendar: {
    title: "Google Calendar is connected",
    bullets: [
      "Watch for new meetings and schedule changes",
      "Create events and send invites automatically",
      "Brief you before upcoming calls",
    ],
  },
  slack: {
    title: "Slack is connected",
    bullets: [
      "Monitor channels and DMs for key mentions",
      "Send messages and post to channels for you",
      "Summarize threads you've missed",
    ],
  },
  github: {
    title: "GitHub is connected",
    bullets: [
      "Watch for new issues, pull requests, and reviews",
      "Create issues and leave comments on PRs",
      "Summarize changes across your repositories",
    ],
  },
  linear: {
    title: "Linear is connected",
    bullets: [
      "Track issue status changes and assignments",
      "Create and update tickets from your instructions",
      "Summarize sprint progress and blockers",
    ],
  },
  notion: {
    title: "Notion is connected",
    bullets: [
      "Read and update pages in your workspace",
      "Create new notes, databases, and pages",
      "Search across your entire Notion workspace",
    ],
  },
  discord: {
    title: "Discord is connected",
    bullets: [
      "Monitor server channels for key messages",
      "Send messages and replies on your behalf",
      "Summarize activity in your servers",
    ],
  },
  hubspot: {
    title: "HubSpot is connected",
    bullets: [
      "Track contact and deal activity changes",
      "Create contacts, deals, and log interactions",
      "Alert you to pipeline changes and open tasks",
    ],
  },
  stripe: {
    title: "Stripe is connected",
    bullets: [
      "Monitor payments, refunds, and disputes",
      "Look up customer and subscription details",
      "Alert you to failed charges or unusual activity",
    ],
  },
};

export default function IntegrationsPage() {
  const { user } = useAuth();
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
  const [postConnectApp, setPostConnectApp] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<"all" | "connected">("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cleanup popup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

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
      const appSlug = app.toLowerCase().replace(/-/g, "");
      // Fire auto-setup for default triggers (server-side also runs this via callback)
      api
        .post("/triggers/auto-setup", { userId: user!.id, appName: app })
        .catch(() => { });
      // Show post-connect explanation panel for all apps
      setPostConnectApp(appSlug);
      // Clean URL
      window.history.replaceState({}, "", "/dashboard/integrations");
    }
  }, [user?.id]);

  const loadIntegrations = async (): Promise<Integration[]> => {
    try {
      setLoading(true);
      const data = await api.get(`/integrations`);
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
      return loadedIntegrations;
    } catch {
      return [];
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
    } catch {
      // Categories will be derived from integrations data as fallback
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
        const connectedAppName = appName;
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(() => {
          if (!popup || popup.closed) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setConnecting(null);
            loadIntegrations().then((loaded) => {
              const slug = connectedAppName.toLowerCase().replace(/-/g, "");
              const isNowConnected = loaded.find(
                (i) => i.appName.toLowerCase().replace(/-/g, "") === slug && i.status === "connected",
              );
              if (isNowConnected) setPostConnectApp(slug);
            });
          }
        }, 1000);
      } else {
        setConnecting(null);
      }
    } catch (e: any) {
      setConnecting(null);
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

  // Top 4 "Start here" apps shown above the grid
  const START_HERE_SLUGS = ["gmail", "googlecalendar", "slack", "github"];
  const startHereApps = useMemo(() => {
    return START_HERE_SLUGS
      .map((slug) => integrations.find((i) => i.appName.toLowerCase().replace(/-/g, "") === slug))
      .filter(Boolean) as Integration[];
  }, [integrations]);

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
    const logoSvg = PLATFORM_LOGOS[appSlug];
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
        {/* Border layer (Cut off by overflow-hidden, shines through the 1.5px padding) */}
        <div className="absolute inset-0 rounded-[1.25rem] z-0 overflow-hidden transition-all duration-500 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/5 border border-white/5 group-hover:border-transparent">
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
    <div className="flex flex-col min-h-screen">
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

      {/* Page header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-white">Integrations</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Connect your apps to unlock automations</p>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search strokeWidth={1.5} size={14} className="text-neutral-500 group-focus-within:text-neutral-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search integrations..."
            aria-label="Search integrations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 pl-8 pr-3 py-1.5 text-xs rounded-md outline-none bg-white/[0.04] border border-white/[0.06] text-white placeholder-neutral-600 focus:border-white/20 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-white/[0.06] flex items-center gap-1">
        {(["all", "connected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-3 text-xs font-medium transition-colors capitalize border-b-2 -mb-px ${
              activeTab === tab
                ? "text-white border-white"
                : "text-neutral-500 hover:text-neutral-300 border-transparent"
            }`}
          >
            {tab === "all" ? "All" : "Connected"}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 py-6 text-white">

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
                    aria-label="Grid view"
                    aria-pressed={!groupByCategory}
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
                    aria-label="Group by category"
                    aria-pressed={groupByCategory}
                  >
                    <LayoutList strokeWidth={1.5} size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
        ) : (
          <>
            {/* Start Here — top 4 apps, only on the flat "All" view */}
            {activeTab === "all" && !searchQuery && activeCategory === "all" && startHereApps.length > 0 && (
              <div className="mb-10 mt-8">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-[15px] font-medium uppercase tracking-widest text-neutral-500">
                    Start here
                  </h2>
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                    ★ Most popular
                  </span>
                </div>
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:gap-5"
                >
                  <AnimatePresence mode="popLayout">
                    {startHereApps.map(renderIntegrationCard)}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Toolkit Grid */}
            {activeTab === "connected" ? (
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
                          Connect Gmail, Calendar, Slack or GitHub to let CalmPilot monitor and act on your behalf.
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
          </>
        )}
      </div>

      {/* Post-connect Explanation Panel */}
      <AnimatePresence>
        {postConnectApp && (() => {
          const appSlug = postConnectApp;
          const connectedIntegration = integrations.find(
            (i) => i.appName.toLowerCase().replace(/-/g, "") === appSlug,
          );
          const displayName = connectedIntegration?.label || appSlug.charAt(0).toUpperCase() + appSlug.slice(1);
          const explanation = APP_CONNECT_EXPLANATIONS[appSlug] ?? {
            title: `${displayName} is connected`,
            bullets: [
              "Use it as a tool when you chat with CalmPilot",
              "CalmPilot can read and act on data in this app",
              "Set up triggers to monitor it for events",
            ],
          };
          const logoSvg = PLATFORM_LOGOS[appSlug];
          const color = PLATFORM_COLORS[appSlug] || "#8b95b0";
          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setPostConnectApp(null)}
              />
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.97 }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
                className="relative w-full max-w-md bg-[#111319] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Subtle brand glow behind header */}
                <div
                  className="absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${color} 0%, transparent 70%)` }}
                />

                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5">
                    {logoSvg ? (
                      <img src={logoSvg} alt={appSlug} className="w-9 h-9 object-contain shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ backgroundColor: color }}>
                        {appSlug[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-[17px] font-semibold text-white leading-tight">
                        {explanation.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Here's what CalmPilot can now do for you
                      </p>
                    </div>
                  </div>

                  {/* Bullet list */}
                  <ul className="space-y-3 mb-6">
                    {explanation.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                          <Check strokeWidth={2.5} size={11} className="text-emerald-400" />
                        </span>
                        <span className="text-sm text-neutral-300 leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard/triggers"
                      onClick={() => setPostConnectApp(null)}
                      className="flex-1 text-center px-4 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      Set up triggers →
                    </Link>
                    <button
                      onClick={() => setPostConnectApp(null)}
                      className="px-4 py-2.5 text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDisconnect}
        title={`Disconnect ${confirmDisconnect?.name.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()) ?? ""}?`}
        description="Any active triggers or automations relying on this connection will stop working immediately."
        confirmLabel="Disconnect"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => { if (confirmDisconnect) handleDisconnect(confirmDisconnect.id, confirmDisconnect.name); setConfirmDisconnect(null); }}
        onCancel={() => setConfirmDisconnect(null)}
      />
    </div>
  );
}
