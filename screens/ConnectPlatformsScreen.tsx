/**
 * Connect Platforms Screen - Manage platform connections
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformIcon } from '../components/PlatformIcon';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing } from '../theme'; // Import colors here for types if needed, but we use usage
import type { Platform, PlatformConnection } from '../types';

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
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [connecting, setConnecting] = useState<Platform | null>(null);

  const handleConnect = async (platform: Platform) => {
    try {
      setConnecting(platform);
      await onConnect(platform);
      // Alert handled by caller usually
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
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to disconnect');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Connect Platforms</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.description}>
          Connect your platforms to unify context and enable actions. 
          All connections are encrypted and stored securely.
        </Text>

        <View style={styles.grid}>
            {connections.map((connection) => {
              const isConnected = connection.connected;
              const isLoading = connecting === connection.platform;
              
              return (
                <View key={connection.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                     <PlatformIcon platform={connection.platform} size={40} />
                     <View style={styles.cardInfo}>
                         <Text style={styles.cardTitle}>{connection.name}</Text>
                         <View style={styles.statusRow}>
                             <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.semantic.success : colors.neutral[400] }]} />
                             <Text style={styles.statusText}>
                                 {isConnected ? 'Sync Active' : 'Not Connected'}
                             </Text>
                         </View>
                     </View>
                  </View>

                  <TouchableOpacity 
                    style={[
                        styles.actionButton, 
                        isConnected ? styles.actionButtonOutline : styles.actionButtonPrimary,
                        isLoading && { opacity: 0.7 }
                    ]}
                    onPress={() => isConnected ? handleDisconnect(connection.platform) : handleConnect(connection.platform)}
                    disabled={isLoading}
                  >
                      {isLoading ? (
                          <Text style={[styles.actionButtonText, isConnected && { color: colors.text }]}>...</Text>
                      ) : (
                          <Text style={[styles.actionButtonText, isConnected ? { color: colors.text } : { color: '#FFF' }]}>
                              {isConnected ? 'Manage' : 'Connect'}
                          </Text>
                      )}
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
  },
  backButton: {
    marginRight: spacing[4],
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing[6],
    lineHeight: 22,
  },
  grid: {
      gap: spacing[4],
  },
  card: {
    backgroundColor: isDark ? colors.neutral[900] : '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      flex: 1,
  },
  cardInfo: {
      justifyContent: 'center',
  },
  cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
  },
  statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  statusText: {
      fontSize: 13,
      color: colors.textSecondary,
  },
  actionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      minWidth: 80,
      alignItems: 'center',
  },
  actionButtonPrimary: {
      backgroundColor: colors.primary[500],
  },
  actionButtonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
  },
  actionButtonText: {
      fontSize: 13,
      fontWeight: '600',
  },
});

