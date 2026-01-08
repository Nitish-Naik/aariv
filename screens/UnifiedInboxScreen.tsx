/**
 * Unified Inbox Screen - Unified messages from all platforms
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
import type { InboxItem } from '../types';
import { format } from 'date-fns';

interface UnifiedInboxScreenProps {
  items: InboxItem[];
  onItemPress: (item: InboxItem) => void;
  onBack: () => void;
}

export const UnifiedInboxScreen: React.FC<UnifiedInboxScreenProps> = ({
  items,
  onItemPress,
  onBack,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredItems =
    filter === 'unread' ? items.filter(item => item.unread) : items;

  const renderItem = ({ item }: { item: InboxItem }) => (
    <TouchableOpacity onPress={() => onItemPress(item)}>
      <Card style={[styles.itemCard, item.unread && styles.unreadCard]}>
        <View style={styles.itemHeader}>
          <PlatformIcon platform={item.platform} size={32} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemFrom} numberOfLines={1}>
              {item.from}
            </Text>
            <Text style={styles.itemTime}>
              {format(item.receivedAt, 'MMM d, h:mm a')}
            </Text>
          </View>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.itemSubject} numberOfLines={1}>
          {item.subject}
        </Text>
        <Text style={styles.itemPreview} numberOfLines={2}>
          {item.preview}
        </Text>
        {item.priority && (
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor:
                  item.priority === 'high'
                    ? colors.semantic.error + '20'
                    : item.priority === 'medium'
                    ? colors.semantic.warning + '20'
                    : colors.semantic.info + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                {
                  color:
                    item.priority === 'high'
                      ? colors.semantic.error
                      : item.priority === 'medium'
                      ? colors.semantic.warning
                      : colors.semantic.info,
                },
              ]}
            >
              {item.priority.toUpperCase()}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const unreadCount = items.filter(item => item.unread).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Inbox</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
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
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'unread' && styles.filterTextActive,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages</Text>
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
    marginRight: spacing[2],
  },
  backButtonText: {
    ...typography.textStyles.body,
    color: colors.primary[500],
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
  },
  unreadBadgeText: {
    ...typography.textStyles.caption,
    color: colors.light.text,
    fontWeight: typography.fontWeight.semibold,
  },
  filters: {
    flexDirection: 'row',
    padding: spacing[4],
  },
  filterButton: {
    paddingHorizontal: spacing[4],
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
  itemCard: {
    marginBottom: spacing[3],
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  itemInfo: {
    flex: 1,
  },
  itemFrom: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
  },
  itemTime: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  itemSubject: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    marginBottom: spacing[1],
    fontWeight: typography.fontWeight.medium,
  },
  itemPreview: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
    marginBottom: spacing[2],
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  priorityText: {
    ...typography.textStyles.caption,
    fontWeight: typography.fontWeight.semibold,
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

