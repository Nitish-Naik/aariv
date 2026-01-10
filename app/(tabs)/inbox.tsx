import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../../components/Card';
import { PlatformIcon } from '../../components/PlatformIcon';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';
import { MOCK_INBOX_ITEMS } from '../../utils/mockData';

export default function InboxTab() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const items = MOCK_INBOX_ITEMS;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const filteredItems = filter === 'unread' ? items.filter(item => item.unread) : items;
  const unreadCount = items.filter(item => item.unread).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tab, filter === 'all' && styles.activeTab]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.tabText,
              filter === 'all' && styles.activeTabText,
            ]}
          >
            All Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'unread' && styles.activeTab]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.tabText,
              filter === 'unread' && styles.activeTabText,
            ]}
          >
            Unread
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => {}}>
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
        )}
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[4],
    paddingTop: spacing[8],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text,
    marginRight: spacing[2],
  },
  badge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterTabs: {
    flexDirection: 'row',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tab: {
    marginRight: spacing[4],
    paddingBottom: spacing[1],
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  listContent: {
    padding: spacing[4],
    gap: spacing[3],
  },
  itemCard: {
    marginBottom: spacing[1],
  },
  unreadCard: {
    backgroundColor: colors.neutral[50], // Maybe keep slightly different background for unread
    borderColor: colors.primary[200],
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  itemFrom: {
    ...typography.textStyles.bodySmall,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  itemTime: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  itemSubject: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing[1],
  },
  itemPreview: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    ...typography.textStyles.caption,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

