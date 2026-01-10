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
import { PlatformIcon } from '../../components/PlatformIcon';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';
import { MOCK_ACTIONS, MOCK_CONNECTIONS } from '../../utils/mockData';

export default function HomeTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const connections = MOCK_CONNECTIONS;
  const pendingActions = MOCK_ACTIONS;
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
            onPress={() => {}} // Placeholder for ReviewQueue
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Review Queue</Text>
              <Text style={styles.quickActionCount}>{pendingActions.length}</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { marginRight: spacing[3] }]}
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
                <View style={styles.connectionStatusDot} />
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Text style={styles.manageButtonText}>Manage Connections</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing[4],
    paddingTop: spacing[8],
  },
  header: {
    marginBottom: spacing[6],
  },
  greeting: {
    ...typography.textStyles.h2,
    color: colors.text,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.textStyles.h4,
    color: colors.text,
    marginBottom: spacing[3],
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickAction: {
    flex: 1,
  },
  quickActionCard: {
    padding: spacing[4],
    alignItems: 'center', // Center content
    justifyContent: 'center',
    height: 120, // Uniform height
  },
  quickActionTitle: {
    ...typography.textStyles.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing[1],
    textAlign: 'center',
  },
  quickActionCount: {
    ...typography.textStyles.h2,
    color: colors.primary[500],
  },
  quickActionSubtitle: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  connectionsHeader: {
    marginBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing[2],
  },
  connectionsCount: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  connectionsList: {
    gap: spacing[4],
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  connectionName: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  connectionStatus: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
  },
  connectionStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.success,
  },
  manageButton: {
    marginTop: spacing[4],
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  manageButtonText: {
    ...typography.textStyles.bodySmall,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
});
