import { format, isSameDay } from 'date-fns';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';
import { MOCK_EVENTS } from '../../utils/mockData';

const { width } = Dimensions.get('window');

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const events = MOCK_EVENTS;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const selectedDateEvents = events.filter(event =>
    isSameDay(event.startTime, selectedDate)
  );

  const renderDayView = () => {
    return (
      <ScrollView style={styles.timelineContainer}>
        {hours.map((hour) => {
          const hourEvents = selectedDateEvents.filter(
            event => event.startTime.getHours() === hour
          );
          return (
            <View key={hour} style={styles.hourRow}>
              <Text style={styles.hourLabel}>
                {hour.toString().padStart(2, '0')}:00
              </Text>
              <View style={styles.eventsColumn}>
                {hourEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventBlock,
                      {
                        backgroundColor: event.color || colors.primary[500],
                        height: 60, 
                      },
                    ]}
                    onPress={() => {}}
                  >
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventTime} numberOfLines={1}>
                      {format(event.startTime, 'h:mm a')} -{' '}
                      {format(event.endTime, 'h:mm a')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.dateDisplay}>
            {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        <View style={styles.viewToggle}>
            <TouchableOpacity onPress={() => setViewMode('day')} style={[styles.toggleBtn, viewMode === 'day' && styles.toggleBtnActive]}><Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive]}>Day</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('week')} style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}><Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Week</Text></TouchableOpacity>
        </View>
      </View>
      {viewMode === 'day' ? renderDayView() : <View style={styles.placeholder}><Text style={{color: colors.textSecondary}}>Week view coming soon</Text></View>}
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.textStyles.h3,
    color: colors.text,
  },
  dateDisplay: {
      ...typography.textStyles.body,
      color: colors.textSecondary,
      marginBottom: spacing[2],
  },
  viewToggle: {
      flexDirection: 'row',
      marginTop: spacing[2],
  },
  toggleBtn: {
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[3],
      borderRadius: spacing[1],
      marginRight: spacing[2],
      backgroundColor: colors.neutral[100], // Keep neutral for toggle bg
  },
  toggleBtnActive: {
      backgroundColor: colors.primary[500],
  },
  toggleText: {
      ...typography.textStyles.bodySmall,
      color: colors.neutral[600],
  },
  toggleTextActive: {
      color: colors.neutral[50],
  },
  timelineContainer: {
    flex: 1,
    padding: spacing[4],
  },
  hourRow: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    minHeight: 60,
  },
  hourLabel: {
    width: 50,
    ...typography.textStyles.caption,
    color: colors.textTertiary,
    textAlign: 'right',
    paddingRight: spacing[2],
    paddingTop: spacing[1],
  },
  eventsColumn: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: spacing[2],
  },
  eventBlock: {
    borderRadius: spacing[2],
    padding: spacing[2],
    marginBottom: spacing[1],
  },
  eventTitle: {
    ...typography.textStyles.caption,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFF',
  },
  eventTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  }
});

