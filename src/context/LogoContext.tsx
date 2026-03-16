"use client";

/**
 * LogoContext — fetches app logos from the Composio-backed /integrations
 * endpoint once per session and makes them available to all dashboard pages.
 *
 * Fallback chain:
 *   1. Backend-returned logo URL (from /integrations API)
 *   2. Inline SVG data-URI (from PLATFORM_LOGOS)
 *   3. Composio CDN: https://logos.composio.dev/api/{slug}
 *
 * Usage:
 *   const { getLogo } = useLogo();
 *   <img src={getLogo("gmail")} />
 */

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { PLATFORM_LOGOS } from "@/lib/platform-logos";
import { createContext, useContext, useEffect, useState } from "react";

const COMPOSIO_LOGO_CDN = "https://logos.composio.dev/api";

type LogoMap = Record<string, string>; // appSlug (lowercase, no dashes) → URL

interface LogoContextValue {
  logoMap: LogoMap;
  getLogo: (slug: string) => string | undefined;
}

const LogoContext = createContext<LogoContextValue>({
  logoMap: {},
  getLogo: () => undefined,
});

/**
 * Map normalized slug (lowercase, no dashes) to the exact Composio toolkit slug
 * used in the CDN URL. Most slugs are already camelCase (googlemeet, googlesheets).
 * Only add entries here for slugs that differ after normalization.
 */
const SLUG_TO_COMPOSIO: Record<string, string> = {
  googlemaps: "google_maps",
};

function composioCdnUrl(normalizedSlug: string): string {
  const composioSlug = SLUG_TO_COMPOSIO[normalizedSlug] || normalizedSlug;
  return `${COMPOSIO_LOGO_CDN}/${composioSlug}`;
}

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [logoMap, setLogoMap] = useState<LogoMap>({});

  useEffect(() => {
    if (!user?.id) return;
    api.get("/integrations")
      .then((data) => {
        const map: LogoMap = {};
        for (const int of data.integrations || []) {
          if (int.appName) {
            const slug = int.appName.toLowerCase().replace(/[-_]/g, "");
            // Use backend logo if provided, otherwise fall back to Composio CDN
            map[slug] = int.logo || composioCdnUrl(slug);
          }
        }
        setLogoMap(map);
      })
      .catch(() => {});
  }, [user?.id]);

  const getLogo = (slug: string): string | undefined => {
    const key = slug.toLowerCase().replace(/[-_]/g, "");
    // 1. Backend logo  2. Inline SVG  3. Composio CDN
    return logoMap[key] ?? PLATFORM_LOGOS[key] ?? composioCdnUrl(key);
  };

  return (
    <LogoContext.Provider value={{ logoMap, getLogo }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  return useContext(LogoContext);
}
