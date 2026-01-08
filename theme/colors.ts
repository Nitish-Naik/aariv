/**
 * Aariv Design System - Colors
 * Calm, thoughtful palette that avoids urgency and distraction
 */

export const colors = {
  // Primary palette - Corporate Navy (Trust & Professionalism)
  primary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9', // Sky Blue for accents (Modern Tech)
    600: '#0284C7',
    700: '#0369A1', // Main Corporate Blue
    800: '#075985',
    900: '#0C4A6E', // Deep Navy
  },
  
  // Neutral grays - Cool Gray (Professional)
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Dark theme base - Deep Navy
  dark: {
    background: '#0B1120',
    surface: '#1E293B',
    surfaceElevated: '#334155',
    border: '#334155',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
  },
  
  // Light theme base
  light: {
    background: '#F9FAFB', // Slight off-white for reduced eye strain
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E5E7EB',     // Subtle borders
    text: '#111827',       // Almost black for sharpness
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
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

