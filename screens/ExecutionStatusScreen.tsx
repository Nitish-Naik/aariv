/**
 * Execution Status Screen - View action execution status
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { PlatformIcon } from '../components/PlatformIcon';
import type { ActionItem } from '../types';
import { format } from 'date-fns';

interface ExecutionStatusScreenProps {
  action: ActionItem;
  onBack: () => void;
}

export const ExecutionStatusScreen: React.FC<ExecutionStatusScreenProps> = ({
  action,
  onBack,
}) => {
  const getStatusColor = () => {
    switch (action.status) {
      case 'approved':
        return colors.action.approve;
      case 'rejected':
        return colors.action.reject;
      case 'executed':
        return colors.action.approve;
      case 'expired':
        return colors.action.neutral;
      default:
        return colors.action.pending;
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
  statusCard: {
    marginBottom: spacing[4],
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
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
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  detailLabel: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
    fontWeight: typography.fontWeight.semibold,
    width: 100,
  },
  detailValue: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[900],
    flex: 1,
  },
  metadataCard: {
    marginBottom: spacing[4],
  },
});

