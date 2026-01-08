/**
 * Connect Platforms Screen - Manage platform connections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { PlatformIcon } from '../components/PlatformIcon';
import { Button } from '../components/Button';
import type { PlatformConnection, Platform } from '../types';

interface ConnectPlatformsScreenProps {
  connections: PlatformConnection[];
  onConnect: (platform: Platform) => Promise<void>;
  onDisconnect: (platform: Platform) => Promise<void>;
  onBack: () => void;
}

export const ConnectPlatformsScreen: React.FC<ConnectPlatformsScreenProps> = ({
  connections,
  onConnect,
  onDisconnect,
  onBack,
}) => {
  const [connecting, setConnecting] = useState<Platform | null>(null);

  const handleConnect = async (platform: Platform) => {
    try {
      setConnecting(platform);
      await onConnect(platform);
      Alert.alert('Success', `${platform} connected successfully`);
    } catch (error: any) {
      Alert.alert('Connection Error', error.message || 'Failed to connect');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    Alert.alert(
      'Disconnect',
      `Are you sure you want to disconnect ${platform}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDisconnect(platform);
              Alert.alert('Success', `${platform} disconnected`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to disconnect');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Connect Platforms</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.description}>
          Connect your platforms to unify context and enable actions. All connections
          are encrypted and stored securely.
        </Text>

        {connections.map((connection) => (
          <Card key={connection.id} style={styles.platformCard}>
            <View style={styles.platformHeader}>
              <PlatformIcon platform={connection.platform} size={48} />
              <View style={styles.platformInfo}>
                <Text style={styles.platformName}>{connection.name}</Text>
                <Text style={styles.platformStatus}>
                  {connection.connected ? 'Connected' : 'Not connected'}
                </Text>
              </View>
            </View>

            {connection.connected && (
              <View style={styles.permissions}>
                <Text style={styles.permissionsTitle}>Permissions:</Text>
                {connection.permissions.map((perm, idx) => (
                  <Text key={idx} style={styles.permission}>
                    • {perm}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.actions}>
              {connection.connected ? (
                <Button
                  title="Disconnect"
                  onPress={() => handleDisconnect(connection.platform)}
                  variant="outline"
                  size="medium"
                />
              ) : (
                <Button
                  title={
                    connecting === connection.platform
                      ? 'Connecting...'
                      : 'Connect'
                  }
                  onPress={() => handleConnect(connection.platform)}
                  loading={connecting === connection.platform}
                  size="medium"
                />
              )}
            </View>
          </Card>
        ))}
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
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  platformStatus: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[500],
  },
  permissions: {
    marginBottom: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  permissionsTitle: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[700],
    marginBottom: spacing[2],
    fontWeight: typography.fontWeight.semibold,
  },
  permission: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
    marginBottom: spacing[1],
  },
  actions: {
    marginTop: spacing[2],
  },
});

