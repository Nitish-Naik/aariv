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
import { borderRadius, spacing, typography } from '../../theme';
import { MOCK_INBOX_ITEMS } from '../../utils/mockData';

export default function PriorityTab() {
  const [filter, setFilter] = useState<'high_priority' | 'all'>('high_priority');
  const items = MOCK_INBOX_ITEMS;
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // In a real app we would have a 'priority' flag.
  // For now, we simulate priority by taking the first 3 items or just unread ones.
  const priorityItems = items.slice(0, 3); 
  const displayItems = filter === 'high_priority' ? priorityItems : items;

  const renderItem = ({ item }: { item: typeof items[0] }) => (
    <Card 
       style={[
           styles.messageCard, 
           item.unread && styles.unreadCard
       ]} 
       padding={4}
    >
      <View style={styles.messageHeader}>
        <View style={styles.senderInfo}>
          <PlatformIcon platform={item.platform} size={20} />
          <Text style={[styles.sender, item.unread && styles.unreadText]}>
            {item.from}
          </Text>
        </View>
        <Text style={styles.time}>
          {format(item.receivedAt, 'MMM d')}
        </Text>
      </View>
      <Text
        style={[styles.subject, item.unread && styles.unreadText]}
        numberOfLines={1}
      >
        {item.subject}
      </Text>
      <Text style={styles.preview} numberOfLines={2}>
        {item.preview}
      </Text>
      
      {/* AI Summary Tag for Priority Items */}
      {filter === 'high_priority' && (
          <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>AI: Needs reply by 5pm</Text>
          </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus</Text>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tab, filter === 'high_priority' && styles.activeTab]}
          onPress={() => setFilter('high_priority')}
        >
          <Text
            style={[
              styles.tabText,
              filter === 'high_priority' && styles.activeTabText,
            ]}
          >
            Priority
          </Text>
        </TouchableOpacity>
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
            All Stream
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
    backgroundColor: colors.background,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
    gap: spacing[4],
  },
  tab: {
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
    borderRadius: 0,
  },
  tabText: {
    ...typography.textStyles.bodySmall,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text,
  },
  listContent: {
    padding: spacing[4],
  },
  messageCard: {
    marginBottom: spacing[3],
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
    borderColor: isDark ? colors.border : colors.neutral[200],
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sender: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
  },
  time: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
  },
  subject: {
    ...typography.textStyles.body,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  unreadText: {
    color: colors.text, // Bright white for unread in dark mode
  },
  preview: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  aiTag: {
      marginTop: spacing[3],
      alignSelf: 'flex-start',
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: 4,
  },
  aiTagText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.primary[500],
  },
});

