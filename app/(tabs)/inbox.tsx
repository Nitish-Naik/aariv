import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function InboxTab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Your unified inbox will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50], // Was #f5f5f5
  },
  header: {
    padding: spacing[4], // Was 16
    backgroundColor: colors.light.surface, // Was #fff
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200], // Was #e0e0e0
  },
  title: {
    fontSize: typography.fontSize['2xl'], // Was 24
    fontWeight: 'bold',
    color: colors.neutral[900], // Was #000
  },
  content: {
    padding: spacing[4], // Was 16
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  placeholder: {
    fontSize: typography.fontSize.base, // Was 16
    color: colors.neutral[500], // Was #666
    textAlign: 'center',
  },
});

