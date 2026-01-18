/**
 * Connect Platforms Screen - Manage platform connections
 */

import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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
import { borderRadius, spacing, typography } from '../theme';
import type { Platform, PlatformConnection } from '../types';

interface ConnectPlatformsScreenProps {
  connections: PlatformConnection[];
  onConnect: (platform: Platform) => Promise<void>;
  onDisconnect: (platform: Platform) => Promise<void>;
  onBack?: () => void; // Optional now
  actionLabel?: string;
  onAction?: () => void;
}

export const ConnectPlatformsScreen: React.FC<ConnectPlatformsScreenProps> = ({
  connections,
  onConnect,
  onDisconnect,
  onBack,
  actionLabel,
  onAction,
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

  const connectedCount = connections.filter(c => c.connected).length;
  const totalCount = connections.length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
        ) : (
            <View style={{ width: 44 }} /> // Spacer
        )}
        
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>Connect Platforms</Text>
          <Text style={styles.subtitle}>{connectedCount} of {totalCount} connected</Text>
        </View>

        {actionLabel && onAction ? (
             <TouchableOpacity onPress={onAction} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{actionLabel}</Text>
             </TouchableOpacity>
        ) : (
             <View style={{ width: 44 }} /> // Spacer
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary[500]} />
          <View style={{ flex: 1, marginLeft: spacing[3] }}>
            <Text style={styles.infoTitle}>Secure & Encrypted</Text>
            <Text style={styles.infoText}>
              All connections are encrypted and stored securely. You control what data is shared.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
            {connections.map((connection) => {
              const isConnected = connection.connected;
              const isLoading = connecting === connection.platform;
              
              return (
                <View key={connection.id} style={[styles.card, isConnected && styles.cardConnected]}>
                  <View style={styles.cardHeader}>
                     <View style={[styles.iconWrapper, isConnected && styles.iconWrapperConnected]}>
                       <PlatformIcon platform={connection.platform} size={32} />
                     </View>
                     <View style={styles.cardInfo}>
                         <Text style={styles.cardTitle}>{connection.name}</Text>
                         <View style={styles.statusRow}>
                             <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.semantic.success : colors.neutral[400] }]} />
                             <Text style={styles.statusText}>
                                 {isConnected ? 'Sync Active' : 'Not Connected'}
                             </Text>
                             {isConnected && connection.connectedAt && (
                               <Text style={styles.connectedDate}>
                                 • Connected {format(new Date(connection.connectedAt), 'MMM d')}
                               </Text>
                             )}
                         </View>
                     </View>
                  </View>

                  <TouchableOpacity 
                    style={[
                        styles.actionButton, 
                        isConnected ? styles.actionButtonOutline : styles.actionButtonPrimary,
                        isLoading && styles.actionButtonLoading
                    ]}
                    onPress={() => isConnected ? handleDisconnect(connection.platform) : handleConnect(connection.platform)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                      {isLoading ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={isConnected ? colors.text : '#FFF'} />
                          </View>
                      ) : (
                          <>
                            <Ionicons 
                              name={isConnected ? "checkmark-circle" : "add-circle-outline"} 
                              size={16} 
                              color={isConnected ? colors.text : '#FFF'} 
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.actionButtonText, isConnected ? { color: colors.text } : { color: '#FFF' }]}>
                                {isConnected ? 'Connected' : 'Connect'}
                            </Text>
                          </>
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
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing[4],
    padding: 4,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
  },
  actionButton: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.md,
  },
  actionButtonText: {
      color: '#FFF',
      fontWeight: '600',
      fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.neutral[900] : colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: isDark ? colors.neutral[800] : colors.primary[200],
    alignItems: 'flex-start',
  },
  infoTitle: {
    ...typography.textStyles.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  grid: {
      gap: spacing[4],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardConnected: {
    borderColor: colors.primary[200],
    backgroundColor: isDark ? colors.primary[950] : colors.primary[50],
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      flex: 1,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperConnected: {
    backgroundColor: isDark ? colors.primary[900] : colors.primary[100],
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
      ...typography.textStyles.bodySmall,
      color: colors.textSecondary,
  },
  connectedDate: {
      ...typography.textStyles.caption,
      color: colors.textTertiary,
      marginLeft: 4,
  },
  actionButton: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.full,
      minWidth: 100,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  actionButtonLoading: {
      opacity: 0.7,
  },
  loadingContainer: {
      paddingVertical: 2,
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

