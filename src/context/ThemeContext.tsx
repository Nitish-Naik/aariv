"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
});

/**
 * Hook to access the current theme and toggle it from any component.
 *
 * @returns `theme` (`"light"` | `"dark"`), `isDark` boolean shorthand,
 *   and `toggleTheme` to flip between the two.
 *
 * @example
 * ```tsx
 * const { isDark, toggleTheme } = useTheme();
 * ```
 */
export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("dark");

  useEffect(() => {
    // Migrate old key if it exists
    const legacy = localStorage.getItem("aariv-theme") as ThemeType | null;
    if (legacy) {
      localStorage.setItem("calmpilot-theme", legacy);
      localStorage.removeItem("aariv-theme");
    }

    const stored = localStorage.getItem("calmpilot-theme") as ThemeType | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("calmpilot-theme", theme);
  }, [theme]);

  /**
   * Flips between `"light"` and `"dark"`, persisting the preference to
   * `localStorage` under the key `calmpilot-theme` and applying the
   * `dark` class to `document.documentElement` accordingly.
   */
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === "dark", toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
