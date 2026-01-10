/**
 * Reusable Card Component
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, shadows, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevated?: boolean;
  padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = false,
  padding = 4,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevated ? shadows.md : undefined,
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
};

