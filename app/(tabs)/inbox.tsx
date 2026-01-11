import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const priorityItems = items.slice(0, 3);
  const displayItems = filter === 'high_priority' ? priorityItems : items;

  const renderItem = ({ item, index }: { item: typeof items[0], index: number }) => {
    // SIMULATED AI INTELLIGENCE
    // In a real app, this comes from the backend.
    const isActionable = filter === 'high_priority';
    const suggestedAction = index === 0 ? "Drafted reply: 'Confirmed for 2pm'" 
                          : index === 1 ? "Added to Calendar: Nov 19 @ 10am" 
                          : "Review required: Legal Contract";
    const actionType = index === 0 ? "reply" : index === 1 ? "calendar" : "alert";

    return (
        <Card 
           // Different visual treatment for priority cards to reduce scanning effort
           style={[
               styles.messageCard, 
               isActionable && styles.actionCard
           ]} 
           padding={0} // Custom padding handling
        >
          <View style={styles.cardInner}>
                {/* 1. Header: Quick Context (Who & When) */}
                <View style={styles.messageHeader}>
                    <View style={styles.senderInfo}>
                    <PlatformIcon platform={item.platform} size={16} />
                    <Text style={styles.sender}>{item.from}</Text>
                    </View>
                    <Text style={styles.time}>{format(item.receivedAt, 'h:mm a')}</Text>
                </View>

                {/* 2. Content: Focused Subject */}
                <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
                
                {/* 3. DECISION LAYER (The Mental Load Reducer) */}
                {isActionable ? (
                    <View style={styles.actionBlock}>
                        <View style={styles.aiReasoning}>
                            <Ionicons 
                                name={actionType === 'reply' ? 'return-up-back' : actionType === 'calendar' ? 'calendar' : 'alert-circle'} 
                                size={14} 
                                color={colors.primary[500]} 
                            />
                            <Text style={styles.aiReasoningText}>{suggestedAction}</Text>
                        </View>
                        
                        <View style={styles.quickActions}>
                            <TouchableOpacity style={styles.actionButtonSecondary}>
                                <Text style={styles.actionTextSecondary}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButtonPrimary}>
                                <Text style={styles.actionTextPrimary}>
                                    {actionType === 'reply' ? 'Send' : actionType === 'calendar' ? 'Confirm' : 'Resolve'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.preview} numberOfLines={2}>{item.preview}</Text>
                )}
          </View>
        </Card>
      );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus</Text>
        {/* Mental Load Reducer: "You are mostly done" indicator */}
        <View style={styles.chillBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary[500]} />
            <Text style={styles.chillText}>3 decisions left</Text>
        </View>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tab, filter === 'high_priority' && styles.activeTab]}
          onPress={() => setFilter('high_priority')}
        >
          <Text style={[styles.tabText, filter === 'high_priority' && styles.activeTabText]}>
            Decisions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'all' && styles.activeTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>
            Everything Else
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

      {/* Floating Copilot Bar (Improved for Visual Lightness) */}
      <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} 
          style={styles.copilotWrapper}
      >
          <View style={styles.copilotIsland}>
              <View style={styles.copilotInputContainer}>
                  <Ionicons name="sparkles" size={18} color={colors.primary[500]} style={styles.copilotIcon} />
                  <TextInput 
                      style={styles.copilotInput}
                      placeholder="Ask Iris..."
                      placeholderTextColor={colors.textTertiary}
                  />
                  <TouchableOpacity style={styles.micButtonSmall}>
                      <Ionicons name="mic" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
              </View>
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text,
  },
  chillBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
  },
  chillText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary[500],
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
    gap: spacing[4],
  },
  tab: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : colors.neutral[100],
  },
  tabText: {
    ...typography.textStyles.button,
    color: colors.textSecondary,
    fontSize: 14,
  },
  activeTabText: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing[6],
    paddingBottom: 120, // Space for Copilot bar
  },
  
  // CARD STYLES
  messageCard: {
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden', // Contain buttons
  },
  actionCard: {
      borderColor: isDark ? colors.primary[900] : colors.primary[100],
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
  },
  cardInner: {
      padding: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
    alignItems: 'center',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sender: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  time: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
  },
  subject: {
    ...typography.textStyles.h4,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing[3],
  },
  preview: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // DECISION LAYER STYLES (Mental Load Reducers)
  actionBlock: {
      marginTop: 4,
  },
  aiReasoning: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
  },
  aiReasoningText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text, // Prominent text
  },
  quickActions: {
      flexDirection: 'row',
      gap: 8,
  },
  actionButtonPrimary: {
      backgroundColor: colors.primary[500],
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
  },
  actionButtonSecondary: {
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
  },
  actionTextPrimary: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 13,
  },
  actionTextSecondary: {
      color: colors.text,
      fontWeight: '500',
      fontSize: 13,
  },

  // FLOATING ISLAND STYLES
  copilotWrapper: {
      position: 'absolute',
      bottom: 90, // Pushed UP to avoid the new Floating Tab Dock (which is ~64px high + margins)
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 100,
  },
  copilotIsland: {
      width: '90%', 
      maxWidth: 400,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 30, // Capsule
      padding: 6,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
  },
  copilotInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[3],
      height: 44,
  },
  copilotIcon: {
      marginRight: spacing[2],
      opacity: 0.8
  },
  copilotInput: {
      flex: 1,
      color: colors.text,
      ...typography.textStyles.body,
      fontSize: 15,
  },
  micButtonSmall: {
      padding: spacing[2],
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
      borderRadius: 100,
  },
});

