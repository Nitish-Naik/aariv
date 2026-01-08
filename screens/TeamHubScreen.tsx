/**
 * Team Hub Screen - Team updates and collaboration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { PlatformIcon } from '../components/PlatformIcon';
import { format } from 'date-fns';

interface TeamUpdate {
  id: string;
  platform: string;
  type: 'message' | 'task' | 'update' | 'mention';
  title: string;
  description: string;
  author: string;
  timestamp: Date;
  unread: boolean;
}

interface TeamHubScreenProps {
  updates: TeamUpdate[];
  onUpdatePress: (update: TeamUpdate) => void;
  onBack: () => void;
}

export const TeamHubScreen: React.FC<TeamHubScreenProps> = ({
  updates,
  onUpdatePress,
  onBack,
}) => {
  const [filter, setFilter] = useState<'all' | TeamUpdate['type']>('all');

  const filteredUpdates =
    filter === 'all'
      ? updates
      : updates.filter(update => update.type === filter);

  const renderUpdate = ({ item }: { item: TeamUpdate }) => (
    <TouchableOpacity onPress={() => onUpdatePress(item)}>
      <Card style={[styles.updateCard, item.unread && styles.unreadCard]}>
        <View style={styles.updateHeader}>
          <PlatformIcon
            platform={item.platform as any}
            size={32}
          />
          <View style={styles.updateInfo}>
            <Text style={styles.updateAuthor}>{item.author}</Text>
            <Text style={styles.updateTime}>
              {format(item.timestamp, 'MMM d, h:mm a')}
            </Text>
          </View>
          {item.unread && <View style={styles.unreadDot} />}
        </View>

        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                item.type === 'message'
                  ? colors.primary[500] + '20'
                  : item.type === 'task'
                  ? colors.semantic.warning + '20'
                  : item.type === 'update'
                  ? colors.semantic.info + '20'
                  : colors.semantic.error + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              {
                color:
                  item.type === 'message'
                    ? colors.primary[700]
                    : item.type === 'task'
                    ? colors.semantic.warning
                    : item.type === 'update'
                    ? colors.semantic.info
                    : colors.semantic.error,
              },
            ]}
          >
            {item.type.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.updateTitle}>{item.title}</Text>
        <Text style={styles.updateDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Team Hub</Text>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {(['message', 'task', 'update', 'mention'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterText,
                filter === type && styles.filterTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUpdates}
        renderItem={renderUpdate}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No team updates</Text>
          </View>
        }
      />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing[3],
  },
  backButtonText: {
    ...typography.textStyles.body,
    color: colors.primary[500],
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
  },
  filters: {
    flexDirection: 'row',
    padding: spacing[4],
  },
  filterButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.light.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
  },
  filterTextActive: {
    color: colors.light.text,
    fontWeight: typography.fontWeight.semibold,
  },
  list: {
    padding: spacing[4],
  },
  updateCard: {
    marginBottom: spacing[3],
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  updateInfo: {
    flex: 1,
  },
  updateAuthor: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
  },
  updateTime: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
    marginBottom: spacing[2],
  },
  typeText: {
    ...typography.textStyles.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  updateTitle: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing[1],
  },
  updateDescription: {
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
  },
});

