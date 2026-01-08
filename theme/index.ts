/**
 * Aariv Design System - Main Theme Export
 */

import { colors, ColorScheme } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;

export { colors, typography, spacing, borderRadius, shadows, ColorScheme };

