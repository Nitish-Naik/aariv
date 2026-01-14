/**
 * Aariv Design System - Colors
 * Updated to "True Black" & "Electric Blue" Aesthetic (OLED Friendly)
 */

export const colors = {
  // Primary palette - Electric Blue (Vibrant & High Energy)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Vibrant Blue (Main Brand)
    600: '#2563EB', // Hover/Active
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Neutral grays - Zinc (Neutral & Sharp)
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
  
  // Dark theme base - OLED True Black
  dark: {
    background: '#000000', // True Black for OLED
    surface: '#121212',    // Subtle surface separation
    surfaceElevated: '#1C1C1E', // Apple-style elevated surface
    border: '#27272A',     // Subtle border (Zinc-800)
    text: '#FFFFFF',       // Pure white for max contrast
    textSecondary: '#A1A1AA', // Zinc-400
    textTertiary: '#71717A',  // Zinc-500
  },
  
  // Light theme base
  light: {
    background: '#FFFFFF',
    surface: '#F4F4F5',    // Slight off-white container
    surfaceElevated: '#FFFFFF',
    border: '#E4E4E7',     // Zinc-200
    text: '#09090B',       // Zinc-950 (Almost Black)
    textSecondary: '#52525B',
    textTertiary: '#71717A',
  },
  
  // Semantic colors
  semantic: {
    success: '#10B981', // Emerald
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Action states
  action: {
    approve: '#10B981',
    reject: '#EF4444',
    pending: '#F59E0B',
    neutral: '#737373',
  },
  
  // Platform colors
  platforms: {
    gmail: '#EA4335',
    calendar: '#3B82F6', // Aligned with primary
    slack: '#ECB22E',    // Using the yellow/gold from Slack logo for contrast
    notion: '#FFFFFF',   // White for dark mode visibility
    linear: '#5E6AD2',
    discord: '#5865F2',
    maps: '#34A853',
    github: '#24292e',
  },
};

export type ColorScheme = 'light' | 'dark';

