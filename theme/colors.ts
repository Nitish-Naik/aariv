/**
 * Aariv Design System - Colors
 * Calm, thoughtful palette that avoids urgency and distraction
 */

export const colors = {
  // Primary palette - Modern Indigo (Vibrant & Premium)
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Neutral grays - Clean Slate
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Dark theme base - Slate Dark
  dark: {
    background: '#0F172A', // Slate 900
    surface: '#1E293B',     // Slate 800
    surfaceElevated: '#334155', // Slate 700
    border: '#334155',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
  },
  
  // Light theme base
  light: {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceElevated: '#F5F5F5',
    border: '#E5E5E5',
    text: '#171717',
    textSecondary: '#525252',
    textTertiary: '#A3A3A3',
  },
  
  // Semantic colors - muted, never urgent
  semantic: {
    success: '#10B981',
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
  
  // Platform colors (subtle)
  platforms: {
    gmail: '#EA4335',
    calendar: '#4285F4',
    slack: '#4A154B',
    notion: '#000000',
    linear: '#5E6AD2',
    discord: '#5865F2',
    maps: '#34A853',
  },
};

export type ColorScheme = 'light' | 'dark';

