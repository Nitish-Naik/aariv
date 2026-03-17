"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Grid3X3, LayoutList, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

import { useLogo } from "@/context/LogoContext";
import { PLATFORM_LOGOS } from "@/lib/platform-logos";

// What CalmPilot can do after connecting each app
const APP_CONNECT_EXPLANATIONS: Record<
  string,
  { title: string; bullets: string[] }
> = {
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
  const { getLogo } = useLogo();
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();
  const [availableCategories, setAvailableCategories] = useState<
    CategoryInfo[]
  >([]);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<{
    id: string;
    name: string;
  } | null>(null);
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
        .catch(() => {});
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
                (i) =>
                  i.appName.toLowerCase().replace(/-/g, "") === slug &&
                  i.status === "connected",
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
      toastError(errorMsg);
    }
  };

  const handleDisconnect = async (connectionId: string, appName: string) => {
    try {
      setDisconnecting(appName);
      await api.post("/integrations/disconnect", {
        userId: user!.id,
        connectionId,
      });

      toastSuccess(`${appName.replace("-", " ")} disconnected successfully!`);
      loadIntegrations();
    } catch (e: any) {
      const errorMsg =
        e.response?.data?.detail?.message ||
        e.response?.data?.detail ||
        "Failed to disconnect. Please try again.";
      toastError(errorMsg);
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
      const appSlug = integration.appName.toLowerCase().replace(/[-_]/g, "");
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

      // Filter out unwanted built-in/no-auth apps entirely
      const isHidden =
        !integration.canDisconnect &&
        [
          "composio",
          "browsertool",
          "browser",
          "browser_tool",
          "code-interpeter",
          "codeinterpreter",
          "composiosearch",
          "composio_search",
          "texttopdf",
          "text_to_pdf",
          "testapp",
          "test_app",
          "",
        ].includes(appSlug);

      return matchesSearch && matchesTab && matchesCategory && !isHidden;
    });
  }, [integrations, searchQuery, activeTab, activeCategory]);

  // Popular apps shown at the top — order matters (most popular first)
  const POPULAR_SLUGS = [
    "gmail",
    "slack",
    "github",
    "notion",
    "googlesheets",
    "googledrive",
    "discord",
    "googlecalendar",
    "googledocs",
    "googlemaps",
    "googlemeet",
    "googleslides",
    "googletasks",
    "jira",
    "atlassian",
    "hubspot",
    "box",
    "coda",
    "confluence",
    "mailchimp",
    "outlook",
    "pipedrive",
    "salesforce",
    "slackbot",
    "spotify",
    "stripe",
    "todoist",
    "youtube",
    "zendesk",
    "zoom",
  ];
  const popularApps = useMemo(() => {
    return POPULAR_SLUGS.map((slug) =>
      integrations.find(
        (i) => i.appName.toLowerCase().replace(/[-_]/g, "") === slug,
      ),
    ).filter(Boolean) as Integration[];
  }, [integrations]);

  // Sort: connected apps first, then alphabetical
  const sortedFilteredIntegrations = useMemo(() => {
    return [...filteredIntegrations].sort((a, b) => {
      const aConnected = a.status === "connected" ? 0 : 1;
      const bConnected = b.status === "connected" ? 0 : 1;
      if (aConnected !== bConnected) return aConnected - bConnected;
      const aName = a.label || a.appName;
      const bName = b.label || b.appName;
      return aName.localeCompare(bName);
    });
  }, [filteredIntegrations]);

  // Group integrations by category for grouped view
  const groupedIntegrations = useMemo(() => {
    if (!groupByCategory) return null;

    const groups = new Map<string, { label: string; items: Integration[] }>();

    for (const integration of filteredIntegrations) {
      const cats = integration.categories || [];
      const appSlug = integration.appName.toLowerCase().replace(/[-_]/g, "");

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

  const COMPOSIO_CDN = "https://logos.composio.dev/api";

  const renderIntegrationCard = (integration: Integration) => {
    const appSlug = integration.appName.toLowerCase().replace(/[-_]/g, "");
    const displayName = integration.label || integration.appName;
    const color = PLATFORM_COLORS[appSlug] || "#8b95b0";
    const logoSvg = getLogo(appSlug) || PLATFORM_LOGOS[appSlug];
    // CDN fallback: use the original Composio slug (appName from backend)
    const composioSlug = integration.appName.toLowerCase();
    const cdnFallback = `${COMPOSIO_CDN}/${composioSlug}`;
    const isConnected = integration.status === "connected";
    const isExpired =
      !isConnected &&
      ["expired", "inactive", "error", "failed"].includes(integration.status);
    const isConnecting = connecting === integration.appName;

    return (
      <motion.div
        key={integration.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group relative rounded-[1rem] sm:rounded-[1.25rem] p-[1.5px] lift pressable h-[180px] sm:h-[220px] md:h-[260px]"
      >
        {/* Neutral border only; no brand-color hover wash */}
        <div className="absolute inset-0 rounded-[1rem] sm:rounded-[1.25rem] z-0 overflow-hidden pointer-events-none border border-border/70 bg-muted/20 transition-colors duration-300 group-hover:border-foreground/20" />

        <div className="relative flex flex-col p-3 sm:p-4 md:p-5 h-full overflow-hidden z-10 rounded-[calc(1rem-1.5px)] sm:rounded-[calc(1.25rem-1.5px)] bg-card w-full shadow-xl">
          <div className="flex justify-end w-full relative z-20">
            {isConnected ? (
              integration.canDisconnect ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDisconnect({
                      id: integration.id,
                      name: integration.appName,
                    });
                  }}
                  disabled={disconnecting === integration.appName}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:text-red-400 rounded-full border border-emerald-500/20 hover:border-red-500/30 bg-emerald-500/5 hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50"
                >
                  {disconnecting === integration.appName ? (
                    <Loader2
                      strokeWidth={1.5}
                      size={11}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Connected
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-400 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Connected
                </div>
              )
            ) : isExpired ? (
              <button
                onClick={() => handleConnect(integration.appName, false)}
                disabled={isConnecting}
                className="px-2.5 py-1 text-[11px] font-medium text-amber-400 rounded-full border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-300 disabled:opacity-50"
                title="This connection has expired. Click to reconnect."
              >
                {isConnecting ? (
                  <Loader2
                    strokeWidth={1.5}
                    size={11}
                    className="animate-spin"
                  />
                ) : (
                  "Reconnect"
                )}
              </button>
            ) : (
              <button
                onClick={() => handleConnect(integration.appName, isConnected)}
                disabled={isConnecting}
                className="px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground rounded-full border border-border hover:border-foreground/20 bg-muted/30 hover:bg-muted transition-all duration-300 disabled:opacity-50"
              >
                {isConnecting ? (
                  <Loader2
                    strokeWidth={1.5}
                    size={11}
                    className="animate-spin"
                  />
                ) : (
                  "Connect"
                )}
              </button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center flex-1 relative z-10 w-full pointer-events-none pb-2 sm:pb-4">
            {logoSvg ? (
              <motion.img
                src={logoSvg}
                alt={displayName}
                className="w-10 h-10 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] object-contain mb-2 sm:mb-4 md:mb-5 drop-shadow-md filter transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e: any) => {
                  const img = e.currentTarget;
                  // If the current src isn't the CDN fallback yet, try it
                  if (!img.src.includes("logos.composio.dev")) {
                    img.src = cdnFallback;
                    return;
                  }
                  // CDN also failed — show letter fallback
                  const parent = img.parentElement;
                  img.style.display = "none";
                  if (parent && !parent.querySelector(".fallback-logo")) {
                    const fb = document.createElement("div");
                    fb.className =
                      "fallback-logo w-10 h-10 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] rounded-lg sm:rounded-xl flex items-center justify-center text-foreground font-bold text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-4 md:mb-5 shadow-lg shrink-0";
                    fb.style.backgroundColor = color;
                    fb.textContent = displayName.charAt(0);
                    parent.prepend(fb);
                  }
                }}
              />
            ) : (
              <motion.div
                className="w-10 h-10 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] rounded-lg sm:rounded-xl flex items-center justify-center text-foreground font-bold text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-4 md:mb-5 shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-[1.03]"
                style={{ backgroundColor: color }}
              >
                {displayName.charAt(0)}
              </motion.div>
            )}
            <h3 className="text-sm sm:text-base md:text-lg lg:text-[22px] leading-tight font-bold text-foreground truncate max-w-full px-1 sm:px-2 text-center tracking-tight">
              {displayName}
            </h3>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <Breadcrumb />
          <h1 className="text-sm font-semibold text-foreground">
            Integrations
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            {!loading && integrations.length > 0 ? (
              <>
                <span className="text-emerald-400 font-medium">
                  {integrations.filter((i) => i.status === "connected").length}{" "}
                  connected
                </span>
                {" · "}
                {
                  integrations.filter(
                    (i) =>
                      i.status !== "connected" && i.canDisconnect !== false,
                  ).length
                }{" "}
                available to connect
              </>
            ) : (
              "Connect your apps to unlock automations"
            )}
          </p>
        </div>
        <div className="relative group w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              strokeWidth={1.5}
              size={14}
              className="text-muted-foreground group-focus-within:text-muted-foreground transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Search integrations..."
            aria-label="Search integrations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-md outline-none bg-muted/50 border border-border text-foreground placeholder-muted-foreground focus:border-ring transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 border-b border-border flex items-center gap-1">
        {(["all", "connected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-3 text-xs font-medium transition-colors capitalize border-b-2 -mb-px ${
              activeTab === tab
                ? "text-foreground border-foreground"
                : "text-muted-foreground hover:text-foreground/80 border-transparent"
            }`}
          >
            {tab === "all" ? "All" : "Connected"}
          </button>
        ))}
      </div>

      <div className="flex-1 px-3 sm:px-4 md:px-6 py-4 sm:py-6 text-foreground">
        {/* Categories Filter (Only show if 'all' tab is selected) */}
        <AnimatePresence>
          {activeTab === "all" && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="flex flex-wrap items-center gap-2 mt-2 sm:mt-4"
            >
              <div className="flex items-center flex-1 min-w-0 pr-2 sm:pr-4">
                {/* Sticky "All" Pill */}
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`shrink-0 z-10 px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-full transition-all duration-300 border ${
                    activeCategory === "all"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  All
                </button>

                {CATEGORIES.length > 1 && (
                  <>
                    {/* Vertical Divider */}
                    <div className="w-[1px] h-4 sm:h-5 bg-muted shrink-0 mx-2 sm:mx-3" />

                    {/* Horizontally scrolling list for the rest */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full scroll-smooth pt-1 pb-1">
                      {CATEGORIES.filter((c) => c.id !== "all").map(
                        (category) => (
                          <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-full transition-all duration-300 border capitalize ${
                              activeCategory === category.id
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-muted text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
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

              {/* Group-by toggle — hide on very small screens */}
              <div className="hidden sm:flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setGroupByCategory(false)}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    !groupByCategory
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  title="Grid view"
                  aria-label="Grid view"
                  aria-pressed={!groupByCategory}
                >
                  <Grid3X3 strokeWidth={1.5} size={16} />
                </button>
                <button
                  onClick={() => setGroupByCategory(true)}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    groupByCategory
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-[1rem] sm:rounded-[1.25rem] h-[180px] sm:h-[220px] md:h-[260px] bg-card border border-border animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-full p-3 sm:p-4 md:p-5 flex flex-col">
                  <div className="flex justify-end">
                    <div className="h-6 w-16 sm:h-8 sm:w-20 rounded-lg sm:rounded-xl bg-muted" />
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center pb-2 sm:pb-4 gap-2 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] rounded-lg sm:rounded-xl bg-muted" />
                    <div className="h-4 sm:h-5 w-20 sm:w-28 rounded-lg bg-muted/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Popular apps — shown at the top on the flat "All" view */}
            {activeTab === "all" &&
              !searchQuery &&
              activeCategory === "all" &&
              popularApps.length > 0 && (
                <div className="mb-6 sm:mb-10 mt-4 sm:mt-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5 flex-wrap">
                    {/* <h2 className="text-xs sm:text-[15px] font-medium uppercase tracking-widest text-muted-foreground">
                      Popular
                    </h2> */}
                    <span className="text-[10px] sm:text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 sm:px-2.5 py-0.5 rounded-full">
                      ★ Most popular
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground/60 ml-1">
                      {
                        popularApps.filter((a) => a.status === "connected")
                          .length
                      }
                      /{popularApps.length} connected
                    </span>
                  </div>
                  <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5"
                  >
                    <AnimatePresence mode="popLayout">
                      {popularApps.map(renderIntegrationCard)}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}

            {/* Toolkit Grid */}
            {activeTab === "connected" ? (
              <div className="space-y-12">
                <div>
                  <h2 className="text-[15px] font-medium uppercase tracking-widest text-muted-foreground mb-5">
                    Your Connections
                  </h2>
                  <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredIntegrations
                        .filter((i) => i.canDisconnect)
                        .map(renderIntegrationCard)}
                    </AnimatePresence>
                  </motion.div>
                  {filteredIntegrations.filter((i) => i.canDisconnect)
                    .length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full py-16 flex flex-col items-center gap-4 text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
                        <Grid3X3
                          strokeWidth={1.5}
                          size={22}
                          className="text-muted-foreground/60"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground/80 mb-1">
                          No apps connected yet
                        </p>
                        <p className="text-xs text-muted-foreground/60 max-w-xs">
                          Connect Gmail, Calendar, Slack or GitHub to let
                          CalmPilot monitor and act on your behalf.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("all")}
                        className="mt-1 px-5 py-2 bg-primary hover:bg-primary/80 text-primary-foreground text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm"
                      >
                        Browse apps
                      </button>
                    </motion.div>
                  )}
                </div>

                <div>
                  <h2 className="text-[15px] font-medium uppercase tracking-widest text-muted-foreground mb-5">
                    Built-in Features
                  </h2>
                  <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredIntegrations
                        .filter((i) => !i.canDisconnect)
                        .map(renderIntegrationCard)}
                    </AnimatePresence>
                  </motion.div>
                  {filteredIntegrations.filter((i) => !i.canDisconnect)
                    .length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-10 text-center text-sm text-muted-foreground"
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
                      <h2 className="text-[15px] font-medium uppercase tracking-widest text-muted-foreground">
                        {group.label}
                      </h2>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {group.items.length}
                      </span>
                    </div>
                    <motion.div
                      layout
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5"
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
                    className="py-20 text-center text-sm text-muted-foreground"
                  >
                    No toolkits found{" "}
                    {searchQuery ? `matching "${searchQuery}"` : ""}.
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {sortedFilteredIntegrations.map(renderIntegrationCard)}
                </AnimatePresence>

                {sortedFilteredIntegrations.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center text-sm text-muted-foreground"
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
        {postConnectApp &&
          (() => {
            const appSlug = postConnectApp;
            const connectedIntegration = integrations.find(
              (i) => i.appName.toLowerCase().replace(/-/g, "") === appSlug,
            );
            const displayName =
              connectedIntegration?.label ||
              appSlug.charAt(0).toUpperCase() + appSlug.slice(1);
            const explanation = APP_CONNECT_EXPLANATIONS[appSlug] ?? {
              title: `${displayName} is connected`,
              bullets: [
                "Use it as a tool when you chat with CalmPilot",
                "CalmPilot can read and act on data in this app",
                "Set up triggers to monitor it for events",
              ],
            };
            const logoSvg = getLogo(appSlug) || PLATFORM_LOGOS[appSlug];
            const color = PLATFORM_COLORS[appSlug] || "#8b95b0";
            return (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/70 backdrop-blur-sm"
                  onClick={() => setPostConnectApp(null)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.97 }}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
                  className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                  {/* Subtle brand glow behind header */}
                  <div
                    className="absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${color} 0%, transparent 70%)`,
                    }}
                  />

                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                      {logoSvg ? (
                        <img
                          src={logoSvg}
                          alt={appSlug}
                          className="w-9 h-9 object-contain shrink-0"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground font-bold text-lg shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {appSlug[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-[17px] font-semibold text-foreground leading-tight">
                          {explanation.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Here's what CalmPilot can now do for you
                        </p>
                      </div>
                    </div>

                    {/* Bullet list */}
                    <ul className="space-y-3 mb-6">
                      {explanation.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <Check
                              strokeWidth={2.5}
                              size={11}
                              className="text-emerald-400"
                            />
                          </span>
                          <span className="text-sm text-foreground/80 leading-snug">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link
                        href="/dashboard/triggers"
                        onClick={() => setPostConnectApp(null)}
                        className="flex-1 text-center px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/80 transition-colors"
                      >
                        Set up triggers →
                      </Link>
                      <button
                        onClick={() => setPostConnectApp(null)}
                        className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
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
        title={`Disconnect ${confirmDisconnect?.name.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? ""}?`}
        description="Any active triggers or automations relying on this connection will stop working immediately."
        confirmLabel="Disconnect"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (confirmDisconnect)
            handleDisconnect(confirmDisconnect.id, confirmDisconnect.name);
          setConfirmDisconnect(null);
        }}
        onCancel={() => setConfirmDisconnect(null)}
      />
    </div>
  );
}
