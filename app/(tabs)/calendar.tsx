import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';
import { MOCK_EVENTS } from '../../utils/mockData';

export default function CalendarTab() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const events = MOCK_EVENTS;

  // AI-inferred stats
  const meetingHours = 5;
  const deepWorkHours = 2.5;
  const conflictCount = 1;

  const renderTimeBlock = (hour: number) => {
    const hourEvents = events.filter(e => e.startTime.getHours() === hour);
    const isCurrentHour = new Date().getHours() === hour;

    return (
      <View key={hour} style={styles.timeRow}>
        <View style={styles.timeLabelContainer}>
           <Text style={[styles.timeLabel, isCurrentHour && styles.timeLabelActive]}>
              {hour}:00
           </Text>
        </View>
        
        <View style={styles.timelineContent}>
            {/* Grid Line */}
            <View style={styles.gridLine} />
            
            {/* Events */}
            {hourEvents.map((event, index) => (
                <View 
                    key={index} 
                    style={[
                        styles.eventCard, 
                        { backgroundColor: event.color + '20', borderColor: event.color }
                    ]}
                >
                     <View style={[styles.eventBar, { backgroundColor: event.color }]} />
                     <View style={styles.eventDetails}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                        <Text style={styles.eventTime}>{format(event.startTime, 'h:mm')} - {format(event.endTime, 'h:mm')}</Text>
                     </View>
                </View>
            ))}

            {/* AI Suggestion Injection at specific times (mock logic) */}
            {hour === 14 && (
                <View style={styles.aiSuggestion}>
                    <Ionicons name="sparkles" size={14} color={colors.primary[400]} />
                    <Text style={styles.aiSuggestionText}>Open slot: Ideal for clear-out</Text>
                </View>
            )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header: Time Audit */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <View style={styles.auditContainer}>
            <View style={styles.auditItem}>
                <Text style={styles.auditValue}>{meetingHours}h</Text>
                <Text style={styles.auditLabel}>Meetings</Text>
            </View>
            <View style={styles.auditDivider} />
            <View style={styles.auditItem}>
                <Text style={[styles.auditValue, { color: colors.semantic.success }]}>{deepWorkHours}h</Text>
                <Text style={styles.auditLabel}>Focus</Text>
            </View>
            <View style={styles.auditDivider} />
            <View style={styles.auditItem}>
                <Text style={[styles.auditValue, { color: colors.semantic.error }]}>{conflictCount}</Text>
                <Text style={styles.auditLabel}>Conflicts</Text>
            </View>
        </View>
      </View>

      <View style={styles.insightBanner}>
           <Ionicons name="alert-circle-outline" size={20} color={colors.semantic.warning} />
           <Text style={styles.insightText}>Consider rescheduling "Design Review" to clear your afternoon.</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for Copilot bar
      >
          {Array.from({ length: 14 }, (_, i) => i + 8).map(renderTimeBlock)}
      </ScrollView>

      {/* Bottom Copilot Bar */}
      {/* <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          style={styles.copilotBarWrapper}
      >
          <View style={styles.copilotBar}>
              <View style={styles.copilotInputContainer}>
                  <Ionicons name="sparkles" size={20} color={colors.primary[500]} style={styles.copilotIcon} />
                  <TextInput 
                      style={styles.copilotInput}
                      placeholder="Ask Copilot..."
                      placeholderTextColor={isDark ? colors.textSecondary : colors.neutral[400]}
                  />
                  <TouchableOpacity style={styles.micButtonSmall}>
                      <Ionicons name="arrow-up-circle" size={24} color={colors.primary[500]} />
                  </TouchableOpacity>
              </View>
          </View>
      </KeyboardAvoidingView> */}
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
  headerTitle: {
    ...typography.textStyles.h2,
    color: colors.text,
  },
  auditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  auditItem: {
    alignItems: 'center',
  },
  auditValue: {
    ...typography.textStyles.body,
    fontWeight: '700',
    color: colors.text,
  },
  auditLabel: {
    ...typography.textStyles.caption,
    fontSize: 10,
    color: colors.textTertiary,
  },
  auditDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },

  insightBanner: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[4],
    padding: spacing[3],
    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB',
    borderRadius: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
  },
  insightText: {
    ...typography.textStyles.bodySmall,
    color: colors.text,
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timeLabelContainer: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: spacing[3],
    paddingTop: 0,
  },
  timeLabel: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
    fontSize: 12,
  },
  timeLabelActive: {
    color: colors.primary[500],
    fontWeight: '700',
  },
  
  timelineContent: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingRight: spacing[4],
    paddingBottom: spacing[2],
  },
  gridLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
  },
  
  eventCard: {
      flex: 1,
      marginTop: 2,
      marginBottom: 2,
      borderRadius: spacing[2],
      borderLeftWidth: 3,
      padding: spacing[2],
      overflow: 'hidden',
  },
  eventBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 0, 
  },
  eventDetails: {
      marginLeft: spacing[1],
  },
  eventTitle: {
      ...typography.textStyles.bodySmall,
      fontWeight: '600',
      color: colors.text,
  },
  eventTime: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
      marginTop: 2,
  },

  aiSuggestion: {
      marginTop: spacing[2],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2],
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.05)' : '#F0F9FF',
      borderRadius: 4,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.primary[200],
  },
  aiSuggestionText: {
      fontSize: 11,
      color: colors.primary[500],
      fontStyle: 'italic',
  },

  // Copilot Bar
  copilotBarWrapper: {
      position: 'absolute',
      bottom: 90, // Pushed UP to avoid Floating Tab Dock
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 100,
  },
  copilotBar: {
      width: '90%', 
      maxWidth: 400,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 30,
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

