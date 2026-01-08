/**
 * Unified Calendar Screen - Google Calendar style UI
 */

import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { colors, spacing, typography } from '../../theme';
// import { Card } from '../components/Card';
// import { PlatformIcon } from '../components/PlatformIcon';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';

// Create a local type since we might not have the full types file yet or to simplify
type LocalCalendarEvent = {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    platform: 'google' | 'outlook';
    color?: string;
};

const MOCK_EVENTS: LocalCalendarEvent[] = [
    {
        id: '1',
        title: 'Team Standup',
        startTime: new Date(new Date().setHours(10, 0)),
        endTime: new Date(new Date().setHours(10, 30)),
        platform: 'google',
        color: colors.primary[500]
    },
    {
        id: '2',
        title: 'Project Review',
        startTime: new Date(new Date().setHours(14, 0)),
        endTime: new Date(new Date().setHours(15, 0)),
        platform: 'outlook',
        color: colors.primary[700]
    }
];

const { width } = Dimensions.get('window');

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [events, setEvents] = useState<LocalCalendarEvent[]>(MOCK_EVENTS);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const selectedDateEvents = events.filter(event =>
    isSameDay(event.startTime, selectedDate)
  );

  const onEventPress = (event: LocalCalendarEvent) => {
      console.log('Event pressed:', event.title);
  };

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
                        height: Math.max(
                          60,
                          ((event.endTime.getTime() - event.startTime.getTime()) /
                            (1000 * 60 * 60)) *
                            60
                        ),
                      },
                    ]}
                    onPress={() => onEventPress(event)}
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

  const renderWeekView = () => {
    const weekStart = startOfDay(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          <View style={styles.hourColumn} />
          {weekDays.map((day) => (
            <View key={day.toISOString()} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{format(day, 'EEE')}</Text>
              <Text style={styles.dayNumber}>{format(day, 'd')}</Text>
            </View>
          ))}
        </View>
        <ScrollView style={styles.weekTimeline}>
          {hours.map((hour) => (
            <View key={hour} style={styles.weekHourRow}>
              <Text style={styles.hourLabel}>
                {hour.toString().padStart(2, '0')}:00
              </Text>
              {weekDays.map((day) => {
                const dayEvents = events.filter(
                  event =>
                    isSameDay(event.startTime, day) &&
                    event.startTime.getHours() === hour
                );
                return (
                  <View key={day.toISOString()} style={styles.weekEventsColumn}>
                    {dayEvents.map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        style={[
                          styles.weekEventBlock,
                          {
                            backgroundColor: event.color || colors.primary[500],
                          },
                        ]}
                        onPress={() => onEventPress(event)}
                      >
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
             <Text style={styles.headerTitle}>Calendar</Text>
        </View>
        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'day' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('day')}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'day' && styles.viewModeTextActive,
              ]}
            >
              Day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'week' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('week')}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'week' && styles.viewModeTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'month' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('month')}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'month' && styles.viewModeTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'month' ? (
        <Calendar
          current={selectedDate.toISOString().split('T')[0]}
          onDayPress={(day) => setSelectedDate(new Date(day.dateString))}
          markedDates={{
            [selectedDate.toISOString().split('T')[0]]: {
              selected: true,
              selectedColor: colors.primary[500],
            },
          }}
          theme={{
            backgroundColor: colors.light.background,
            calendarBackground: colors.light.background,
            textSectionTitleColor: colors.neutral[600],
            selectedDayBackgroundColor: colors.primary[500],
            selectedDayTextColor: colors.light.text,
            todayTextColor: colors.primary[500],
            dayTextColor: colors.neutral[900],
            textDisabledColor: colors.neutral[400],
            dotColor: colors.primary[500],
            selectedDotColor: colors.light.text,
            arrowColor: colors.primary[500],
            monthTextColor: colors.neutral[900],
            textDayFontWeight: '400',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '600',
          }}
        />
      ) : viewMode === 'week' ? (
        renderWeekView()
      ) : (
        renderDayView()
      )}

      {/* Bottom Chat Bar */}
      <View style={styles.chatBar}>
        <TouchableOpacity style={styles.chatInput}>
          <Text style={styles.chatPlaceholder}>Ask aariv...</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: colors.light.surface,
  },
  headerTitleContainer: {
    marginBottom: spacing[4],
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[900],
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    padding: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewModeButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  viewModeText: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
  },
  viewModeTextActive: {
    color: colors.light.text,
    fontWeight: typography.fontWeight.semibold,
  },
  timelineContainer: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  hourLabel: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
    width: 60,
    padding: spacing[2],
    textAlign: 'right',
  },
  eventsColumn: {
    flex: 1,
    padding: spacing[1],
  },
  eventBlock: {
    padding: spacing[2],
    borderRadius: 8,
    marginBottom: spacing[1],
  },
  eventTitle: {
    ...typography.textStyles.bodySmall,
    color: colors.light.text,
    fontWeight: typography.fontWeight.semibold,
  },
  eventTime: {
    ...typography.textStyles.caption,
    color: colors.light.text,
    opacity: 0.9,
  },
  weekContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.light.border,
  },
  hourColumn: {
    width: 60,
  },
  dayColumn: {
    flex: 1,
    padding: spacing[2],
    alignItems: 'center',
  },
  dayLabel: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
    marginBottom: spacing[1],
  },
  dayNumber: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
  },
  weekTimeline: {
    flex: 1,
  },
  weekHourRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  weekEventsColumn: {
    flex: 1,
    padding: spacing[1],
  },
  weekEventBlock: {
    padding: spacing[1],
    borderRadius: 4,
    marginBottom: spacing[1],
    minHeight: 20,
  },
  chatBar: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  chatInput: {
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 24,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  chatPlaceholder: {
    ...typography.textStyles.body,
    color: colors.neutral[400],
  },
});

