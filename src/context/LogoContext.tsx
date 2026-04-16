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

import { getAppLogo, normalizeAppSlug } from "@/lib/platform-logos";
import { createContext, useContext, useEffect, useState } from "react";

const LOGO_CACHE_KEY = "calmpilot_logo_map_v1";

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
 * Fetches and caches platform logo URLs for the entire session.
 * Logos are resolved locally via `getAppLogo()` — no API call is made.
 * The resulting logo map is persisted in `sessionStorage` under the key
 * `calmpilot_logo_map_v1` to avoid redundant lookups across renders.
 *
 * @example
 * ```tsx
 * <LogoProvider>
 *   <App />
 * </LogoProvider>
 * ```
 */
export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [logoMap, setLogoMap] = useState<LogoMap>(() => {
    if (typeof window === "undefined") return {};
    try {
      const cached = window.sessionStorage.getItem(LOGO_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(LOGO_CACHE_KEY, JSON.stringify(logoMap));
    } catch {}
  }, [logoMap]);

  // Logos are resolved locally via getAppLogo() in getLogo() — no API call needed.
  // This eliminates a redundant /integrations fetch on every dashboard page load.

  /**
   * Resolves a platform logo URL for the given app slug.
   * Applies the fallback chain described at the top of this file:
   * cached map → inline SVG data-URI → Composio CDN.
   *
   * @param slug - The app identifier (e.g. `"gmail"`, `"GOOGLECALENDAR"`).
   *   Normalised internally, so casing and dashes do not matter.
   * @returns A URL string, or `undefined` if no logo is available.
   */
  const getLogo = (slug: string): string | undefined => {
    const key = normalizeAppSlug(slug);
    return logoMap[key] ?? getAppLogo(key);
  };

  return (
    <LogoContext.Provider value={{ logoMap, getLogo }}>
      {children}
    </LogoContext.Provider>
  );
}

/**
 * Hook to access the `getLogo` helper from any component.
 *
 * @returns `{ logoMap, getLogo }` — `getLogo(slug)` returns a resolved logo
 *   URL or `undefined`.
 *
 * @example
 * ```tsx
 * const { getLogo } = useLogo();
 * <img src={getLogo("gmail")} alt="Gmail" />
 * ```
 */
export function useLogo() {
  return useContext(LogoContext);
}
