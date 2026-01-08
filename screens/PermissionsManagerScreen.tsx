/**
 * Permissions Manager Screen - Manage platform permissions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { PlatformIcon } from '../components/PlatformIcon';
import type { PlatformConnection } from '../types';

interface PermissionsManagerScreenProps {
  connections: PlatformConnection[];
  onUpdatePermissions: (
    platformId: string,
    permissions: string[]
  ) => Promise<void>;
  onBack: () => void;
}

export const PermissionsManagerScreen: React.FC<PermissionsManagerScreenProps> = ({
  connections,
  onUpdatePermissions,
  onBack,
}) => {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleTogglePermission = async (
    connectionId: string,
    permission: string,
    enabled: boolean
  ) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    setUpdating(connectionId);
    try {
      const updatedPermissions = enabled
        ? [...connection.permissions, permission]
        : connection.permissions.filter(p => p !== permission);
      await onUpdatePermissions(connectionId, updatedPermissions);
    } finally {
      setUpdating(null);
    }
  };

  const getPermissionDescription = (permission: string) => {
    const descriptions: Record<string, string> = {
      read: 'Read data from this platform',
      write: 'Create and modify data',
      delete: 'Delete data',
      'read:email': 'Read emails',
      'write:email': 'Send emails',
      'read:calendar': 'Read calendar events',
      'write:calendar': 'Create and modify events',
      'read:messages': 'Read messages',
      'write:messages': 'Send messages',
    };
    return descriptions[permission] || permission;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Permissions</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.description}>
          Manage what aariv can access on each platform. All permissions require
          your approval before any action is taken.
        </Text>

        {connections
          .filter(c => c.connected)
          .map((connection) => (
            <Card key={connection.id} style={styles.platformCard}>
              <View style={styles.platformHeader}>
                <PlatformIcon platform={connection.platform} size={40} />
                <Text style={styles.platformName}>{connection.name}</Text>
              </View>

              <View style={styles.permissionsList}>
                {connection.permissions.map((permission) => (
                  <View key={permission} style={styles.permissionRow}>
                    <View style={styles.permissionInfo}>
                      <Text style={styles.permissionName}>{permission}</Text>
                      <Text style={styles.permissionDescription}>
                        {getPermissionDescription(permission)}
                      </Text>
                    </View>
                    <Switch
                      value={true}
                      onValueChange={(enabled) =>
                        handleTogglePermission(
                          connection.id,
                          permission,
                          enabled
                        )
                      }
                      disabled={updating === connection.id}
                      trackColor={{
                        false: colors.neutral[300],
                        true: colors.primary[500],
                      }}
                    />
                  </View>
                ))}
              </View>
            </Card>
          ))}

        {connections.filter(c => c.connected).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No connected platforms. Connect a platform first to manage permissions.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  backButton: {
    marginBottom: spacing[2],
  },
  backButtonText: {
    ...typography.textStyles.body,
    color: colors.primary[500],
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
  },
  description: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
    marginBottom: spacing[6],
    lineHeight: 24,
  },
  platformCard: {
    marginBottom: spacing[4],
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  platformName: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
  },
  permissionsList: {
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  permissionInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  permissionName: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing[1],
  },
  permissionDescription: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
  },
  emptyContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});

