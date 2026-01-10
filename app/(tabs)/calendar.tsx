import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {Array.from({ length: 14 }, (_, i) => i + 8).map(renderTimeBlock)}
          <View style={{ height: 100 }} />
      </ScrollView>
      
      <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
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
    paddingBottom: spacing[4],
    paddingTop: spacing[2],
  },
  headerTitle: {
    ...typography.textStyles.h2,
    color: colors.text,
    marginBottom: spacing[4],
  },
  auditContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.border,
  },
  auditItem: {
      flex: 1,
      alignItems: 'center',
  },
  auditValue: {
      ...typography.textStyles.h3,
      color: colors.text,
  },
  auditLabel: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      fontSize: 10,
      marginTop: 2,
  },
  auditDivider: {
      width: 1,
      backgroundColor: colors.border,
      height: '80%',
      alignSelf: 'center',
  },
  insightBanner: {
      marginHorizontal: spacing[6],
      marginBottom: spacing[6],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.semantic.warning,
  },
  insightText: {
      ...typography.textStyles.caption,
      color: isDark ? colors.semantic.warning : '#B45309',
      flex: 1,
  },

  // Timeline
  scrollView: {
      flex: 1,
  },
  timeRow: {
      flexDirection: 'row',
      minHeight: 80,
  },
  timeLabelContainer: {
      width: 60,
      alignItems: 'center',
  },
  timeLabel: {
      ...typography.textStyles.caption,
      color: colors.textTertiary,
      marginTop: -8, // Align with grid line
  },
  timeLabelActive: {
      color: colors.primary[500],
      fontWeight: 'bold',
  },
  timelineContent: {
      flex: 1,
      paddingRight: spacing[4],
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
  },
  gridLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
      opacity: 0.5,
  },
  eventCard: {
      marginTop: 2,
      marginBottom: 4,
      borderRadius: 6,
      borderWidth: 1,
      padding: spacing[2],
      paddingLeft: spacing[3],
      flexDirection: 'row',
      overflow: 'hidden',
  },
  eventBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
  },
  eventDetails: {
      flex: 1,
  },
  eventTitle: {
      ...typography.textStyles.bodySmall,
      color: colors.text,
      fontWeight: '600',
  },
  eventTime: {
      fontSize: 11,
      color: colors.textSecondary,
  },
  
  // Suggestion
  aiSuggestion: {
      marginTop: spacing[2],
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      alignSelf: 'flex-start',
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.primary[300],
  },
  aiSuggestionText: {
      fontSize: 11,
      color: colors.primary[400],
  },
  
  fab: {
      position: 'absolute',
      bottom: spacing[6],
      right: spacing[6],
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
  }
});

