/**
 * Aariv Design System - Typography
 * Thoughtful, readable, calm
 */

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Text styles
  textStyles: {
    h1: {
      fontSize: 36,
      lineHeight: 43.2,
      fontWeight: '700' as const,
    },
    h2: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '700' as const,
    },
    h3: {
      fontSize: 24,
      lineHeight: 28.8,
      fontWeight: '600' as const,
    },
    h4: {
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '400' as const,
    },
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
  },
};

