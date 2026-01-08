/**
 * Home Dashboard - Main screen after login
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { PlatformIcon } from '../components/PlatformIcon';
import type { PlatformConnection, ActionItem } from '../types';

interface HomeDashboardProps {
  connections: PlatformConnection[];
  pendingActions: ActionItem[];
  onNavigateToQueue: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToInbox: () => void;
  onNavigateToSettings: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  connections,
  pendingActions,
  onNavigateToQueue,
  onNavigateToCalendar,
  onNavigateToInbox,
  onNavigateToSettings,
}) => {
  const connectedCount = connections.filter(c => c.connected).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.subtitle}>
          {pendingActions.length} actions waiting for your approval
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { marginRight: spacing[3] }]}
            onPress={onNavigateToQueue}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Review Queue</Text>
              <Text style={styles.quickActionCount}>{pendingActions.length}</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { marginRight: spacing[3] }]}
            onPress={onNavigateToCalendar}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Calendar</Text>
              <Text style={styles.quickActionSubtitle}>View schedule</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={onNavigateToInbox}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Inbox</Text>
              <Text style={styles.quickActionSubtitle}>Unified messages</Text>
            </Card>
          </TouchableOpacity>
        </View>
      </View>

      {/* Connected Platforms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Platforms</Text>
        <Card>
          <View style={styles.connectionsHeader}>
            <Text style={styles.connectionsCount}>
              {connectedCount} of {connections.length} connected
            </Text>
          </View>
          <View style={styles.connectionsList}>
            {connections.map((connection) => (
              <View key={connection.id} style={styles.connectionItem}>
                <PlatformIcon platform={connection.platform} size={32} />
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>{connection.name}</Text>
                  <Text style={styles.connectionStatus}>
                    {connection.connected ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Assistant Message */}
      <View style={styles.section}>
        <Card style={styles.assistantCard}>
          <Text style={styles.assistantName}>aariv</Text>
          <Text style={styles.assistantMessage}>
            I've prepared a few options for you. Swipe to delegate when you're ready.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
  },
  greeting: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
  },
  quickActionCard: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  quickActionCount: {
    ...typography.textStyles.h3,
    color: colors.primary[500],
  },
  quickActionSubtitle: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  connectionsHeader: {
    marginBottom: spacing[3],
  },
  connectionsCount: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
  },
  connectionsList: {
    // gap handled with marginBottom in connectionItem
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
  },
  connectionStatus: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  assistantCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  assistantName: {
    ...typography.textStyles.bodySmall,
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing[2],
  },
  assistantMessage: {
    ...typography.textStyles.body,
    color: colors.neutral[700],
    fontStyle: 'italic',
  },
});

