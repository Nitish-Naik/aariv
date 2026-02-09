/**
 * Aariv Design System - Colors
 * Calm, muted aesthetic — warm neutrals with slate-blue accent
 */

export const colors = {
  // Primary/Accent palette — Slate-blue (calm & understated)
  primary: {
    50: "#f0f1f5",
    100: "#dfe1ea",
    200: "#c4c8d6",
    300: "#a8aec2",
    400: "#99a0b9",
    500: "#8b95b0", // Main accent (from template)
    600: "#7b84a0",
    700: "#6b7490", // Light-theme accent
    800: "#545c73",
    900: "#3d4356",
  },

  // Neutral grays — warm-toned
  neutral: {
    50: "#f7f6f4",
    100: "#f0efed",
    200: "#e4e2df",
    300: "#d4d1cd",
    400: "#a5a19d",
    500: "#908c88",
    600: "#6a6662",
    700: "#5a5754",
    800: "#3a3836",
    900: "#1a1918",
  },

  // Dark theme — deep charcoal (NOT pure black, warm & calm)
  dark: {
    background: "#0c0c0e",
    surface: "#141416",
    surfaceElevated: "#1a1a1d",
    border: "rgba(255, 255, 255, 0.06)",
    text: "#e4e2df",
    textSecondary: "#908c88",
    textTertiary: "#5a5754",
  },

  // Light theme
  light: {
    background: "#f7f6f4",
    surface: "#ffffff",
    surfaceElevated: "#ffffff",
    border: "rgba(0, 0, 0, 0.06)",
    text: "#1a1918",
    textSecondary: "#6a6662",
    textTertiary: "#9a9794",
  },

  // Semantic colors — soft, muted tones
  semantic: {
    success: "#7eb88a",
    warning: "#c6a27a",
    error: "#c45c5c",
    info: "#8b95b0",
  },

  // Action states
  action: {
    approve: "#7eb88a",
    reject: "#c45c5c",
    pending: "#c6a27a",
    neutral: "#908c88",
  },

  // Platform colors
  platforms: {
    gmail: "#EA4335",
    calendar: "#8b95b0",
    slack: "#ECB22E",
    notion: "#FFFFFF",
    linear: "#5E6AD2",
    discord: "#5865F2",
    maps: "#34A853",
    github: "#24292e",
    twitter: "#1DA1F2",
  },
};

export type ColorScheme = "light" | "dark";
