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
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConnections = connections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const connectedPlatforms = filteredConnections.filter(c => c.connected);
  const availablePlatforms = filteredConnections.filter(c => !c.connected);

  const renderSection = (title: string, data: PlatformConnection[]) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.grid}>
          {data.map((connection) => {
            const isConnected = connection.connected;
            const isLoading = connecting === connection.platform;

            return (
              <View key={connection.id} style={[styles.card, isConnected && styles.cardConnected]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrapper, isConnected && styles.iconWrapperConnected]}>
                    <PlatformIcon platform={connection.platform} size={32} logo={connection.logo} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{connection.name}</Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.semantic.success : colors.neutral[400] }]} />
                      <Text style={styles.statusText}>
                        {isConnected ? 'Sync Active' : 'Not Connected'}
                      </Text>
                    </View>
                    {isConnected && connection.connectedAt && (
                      <Text style={styles.connectedDate}>
                        Connected {format(new Date(connection.connectedAt), 'MMM d')}
                      </Text>
                    )}
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
      </View>
    );
  };

  const connectedCount = connections.filter(c => c.connected).length;
  const totalCount = connections.length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}

          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Connected Platforms</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{connectedCount} of {totalCount} active</Text>
            </View>
          </View>

          {actionLabel && onAction ? (
            <TouchableOpacity onPress={onAction} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search platforms..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary[500]} />
          <View style={{ flex: 1, marginLeft: spacing[3] }}>
            <Text style={styles.infoTitle}>Secure & Encrypted</Text>
            <Text style={styles.infoText}>
              All connections are encrypted and stored securely. You control what data is shared.
            </Text>
          </View>
        </View> */}

        {filteredConnections.length > 0 ? (
          <>
            {renderSection('Connected', connectedPlatforms)}
            {renderSection('Available Platforms', availablePlatforms)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.neutral[700]} />
            <Text style={styles.emptyStateTitle}>No platforms found</Text>
            <Text style={styles.emptyStateText}>Try searching for a different keyword</Text>
          </View>
        )}
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
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: spacing[1],
    marginLeft: -spacing[1],
  },
  title: {
    ...typography.textStyles.h3,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginTop: 6,
  },
  countText: {
    ...typography.textStyles.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    height: 52,
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing[3],
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    height: '100%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    opacity: 0.8,
  },
  emptyStateTitle: {
    ...typography.textStyles.body,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing[4],
    marginBottom: 4,
  },
  emptyStateText: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.neutral[900] : '#FFF',
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[8],
    borderWidth: 1,
    borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  infoText: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    opacity: 0.8,
  },
  grid: {
    gap: spacing[4],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionTitle: {
    ...typography.textStyles.bodySmall,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[4],
    marginLeft: spacing[1],
  },
  card: {
    backgroundColor: isDark ? colors.neutral[900] : '#FFF',
    borderRadius: borderRadius.xl,
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
  cardConnected: {
    borderColor: colors.primary[500],
    borderWidth: 1.5,
    backgroundColor: isDark ? colors.neutral[900] : colors.primary[50],
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
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing[2],
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

