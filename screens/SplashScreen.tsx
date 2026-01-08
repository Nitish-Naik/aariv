/**
 * Splash Screen - First screen users see
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { colors, spacing, typography } from '../theme';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Aariv</Text>
        <Text style={styles.tagline}>Your privacy-first productivity copilot</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primary[500]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  logo: {
    ...typography.textStyles.h1,
    color: colors.light.text,
    marginBottom: spacing[3],
  },
  tagline: {
    ...typography.textStyles.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
});

