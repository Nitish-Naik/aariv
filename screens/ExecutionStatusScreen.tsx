/**
 * Execution Status Screen - View action execution status
 */

import { format } from 'date-fns';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../components/Card';
import { PlatformIcon } from '../components/PlatformIcon';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import type { ActionItem } from '../types';

interface ExecutionStatusScreenProps {
  action: ActionItem;
  onBack: () => void;
}

export const ExecutionStatusScreen: React.FC<ExecutionStatusScreenProps> = ({
  action,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const getStatusColor = () => {
    switch (action.status) {
      case 'approved':
        return colors.semantic.success;
      case 'rejected':
        return colors.semantic.error;
      case 'executed':
        return colors.semantic.success;
      case 'expired':
        return colors.textTertiary;
      default:
        return colors.semantic.warning;
    }
  };

  const getStatusText = () => {
    switch (action.status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'executed':
        return 'Executed';
      case 'expired':
        return 'Expired';
      default:
        return 'Pending';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Execution Status</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <PlatformIcon platform={action.platform} size={48} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() + '20' },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: getStatusColor() }]}
                >
                  {getStatusText()}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Action Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Title:</Text>
            <Text style={styles.detailValue}>{action.title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{action.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Platform:</Text>
            <Text style={styles.detailValue}>
              {action.platform.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{action.type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Proposed:</Text>
            <Text style={styles.detailValue}>
              {format(action.proposedAt, 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
          {action.expiresAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expires:</Text>
              <Text style={styles.detailValue}>
                {format(action.expiresAt, 'MMM d, yyyy h:mm a')}
              </Text>
            </View>
          )}
        </Card>

        {action.metadata && Object.keys(action.metadata).length > 0 && (
          <Card style={styles.metadataCard}>
            <Text style={styles.detailsTitle}>Metadata</Text>
            {Object.entries(action.metadata).map(([key, value]) => (
              <View key={key} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{key}:</Text>
                <Text style={styles.detailValue}>{String(value)}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: 120,
  },
  statusCard: {
    marginBottom: spacing[4],
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
  statusText: {
    ...typography.textStyles.bodySmall,
    fontWeight: typography.fontWeight.semibold,
  },
  detailsCard: {
    marginBottom: spacing[4],
  },
  detailsTitle: {
    ...typography.textStyles.h4,
    color: colors.text,
    marginBottom: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
    width: 100,
  },
  detailValue: {
    ...typography.textStyles.bodySmall,
    color: colors.text,
    flex: 1,
  },
  metadataCard: {
    marginBottom: spacing[4],
  },
});

