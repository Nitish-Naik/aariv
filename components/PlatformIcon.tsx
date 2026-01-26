import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { Platform } from '../types';

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  logo?: string;
}

const platformConfig: Record<string, { color: string; label: string }> = {
  gmail: { color: colors.platforms.gmail, label: 'G' },
  'google-calendar': { color: colors.platforms.calendar, label: 'C' },
  'googlecalendar': { color: colors.platforms.calendar, label: 'C' },
  slack: { color: colors.platforms.slack, label: 'S' },
  notion: { color: colors.platforms.notion, label: 'N' },
  linear: { color: colors.platforms.linear, label: 'L' },
  discord: { color: colors.platforms.discord, label: 'D' },
  maps: { color: colors.platforms.maps, label: 'M' },
  github: { color: colors.platforms.github, label: 'GH' },
};

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  size = 40,
  logo,
}) => {
  // If we have a logo URL, render it
  if (logo) {
    return (
      <Image
        source={{ uri: logo }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 4, // Slightly rounded for square icons
        }}
        contentFit="contain"
      />
    );
  }

  const slug = platform.toLowerCase().replace(/[-_]/g, '');
  const config = platformConfig[slug] || platformConfig[platform] || {
    color: colors.neutral[500],
    label: platform.charAt(0).toUpperCase()
  };

  return (
    <View
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.color,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: size * 0.4,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

