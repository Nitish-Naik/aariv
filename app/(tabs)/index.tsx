import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../components/Card';
import { colors, spacing, typography } from '../../theme';

export default function HomeTab() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome to Aariv</Text>
        <Text style={styles.subtitle}>
          Your AI-powered productivity assistant
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Review Queue</Text>
              <Text style={styles.quickActionCount}>0</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/calendar')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Calendar</Text>
              <Text style={styles.quickActionSubtitle}>View schedule</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/inbox')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Inbox</Text>
              <Text style={styles.quickActionSubtitle}>Messages</Text>
            </Card>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Card>
          <Text style={styles.cardText}>
            Connect your platforms to start managing your workflow with AI assistance.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Text style={styles.buttonText}>Go to Settings</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[500],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  quickAction: {
    flex: 1,
  },
  quickActionCard: {
    padding: spacing[4],
  },
  quickActionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  quickActionCount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.primary[500],
  },
  quickActionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
  },
  cardText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    marginBottom: spacing[4],
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  button: {
    backgroundColor: colors.primary[500],
    padding: spacing[3],
    borderRadius: spacing[2],
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
});
