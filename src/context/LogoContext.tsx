"use client";

/**
 * LogoContext — fetches app logos from the Composio-backed /integrations
 * endpoint once per session and makes them available to all dashboard pages.
 *
 * Usage:
 *   const { getLogo } = useLogo();
 *   <img src={getLogo("gmail")} />
 */

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { PLATFORM_LOGOS } from "@/lib/platform-logos";
import { createContext, useContext, useEffect, useState } from "react";

type LogoMap = Record<string, string>; // appSlug (lowercase, no dashes) → URL

interface LogoContextValue {
  logoMap: LogoMap;
  getLogo: (slug: string) => string | undefined;
}

const LogoContext = createContext<LogoContextValue>({
  logoMap: {},
  getLogo: () => undefined,
});

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [logoMap, setLogoMap] = useState<LogoMap>({});

  useEffect(() => {
    if (!user?.id) return;
    api.get("/integrations")
      .then((data) => {
        const map: LogoMap = {};
        for (const int of data.integrations || []) {
          if (int.logo && int.appName) {
            const slug = int.appName.toLowerCase().replace(/-/g, "");
            map[slug] = int.logo;
          }
        }
        setLogoMap(map);
      })
      .catch(() => {});
  }, [user?.id]);

  const getLogo = (slug: string): string | undefined => {
    const key = slug.toLowerCase().replace(/-/g, "");
    return logoMap[key] ?? PLATFORM_LOGOS[key];
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
