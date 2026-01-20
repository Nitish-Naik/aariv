import { Ionicons } from '@expo/vector-icons';
import { addDays, addMonths, format, getMonth, isSameDay, setMonth, startOfWeek, subMonths } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { getCurrentUser } from '../../services/auth';
import { spacing } from '../../theme';
// import { MOCK_EVENTS } from '../../utils/mockData';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    attendees?: string[];
    color?: string;
}

export default function CalendarTab() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMonthExpanded, setIsMonthExpanded] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
  const toggleMonthView = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsMonthExpanded(!isMonthExpanded);
  };

  const fetchEvents = useCallback(async () => {
      try {
          setError(null);
          const user = await getCurrentUser();
          if (!user) {
              throw new Error("You are signed out. Please log in again.");
          }
          // Fetch events for the selected day (approx range)
          const start = new Date(selectedDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(selectedDate);
          end.setHours(23, 59, 59, 999);
          
          const data = await api.get(`/calendar?userId=${user.id}&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`);
          
          const normalized = Array.isArray(data.events) ? data.events : [];
          setEvents(normalized.map((e: any) => ({
              ...e,
              startTime: new Date(e.startTime),
              endTime: new Date(e.endTime)
          })));
      } catch (e: any) {
          console.error("Failed to fetch calendar", e);
          setError(e?.message || "Failed to load calendar");
      } finally {
          setLoading(false);
      }
  }, [selectedDate]);

  useEffect(() => {
      fetchEvents();
  }, [fetchEvents]);

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchEvents();
      setRefreshing(false);
  };

  // Re-calculate week days when selectedDate changes to keep it in view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // const events = MOCK_EVENTS; // In real app, filter by selectedDate
  
  // Filter events for the selected day
  const todayEvents = events; // Since we fetch exactly for this range

  const renderTimeLine = () => {

    // Render hours 6 AM to 11 PM
    const hours = Array.from({ length: 18 }).map((_, i) => i + 6);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return (
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }} // Space for TabBar
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
        }
      >
        {loading && !refreshing && (
             <ActivityIndicator style={{ padding: 20 }} color={colors.primary[500]} />
        )}
        {!loading && error && (
            <View style={{ padding: 16, alignItems: 'center' }}>
                <Ionicons name="warning" size={32} color={colors.textTertiary} />
                <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Could not load events.</Text>
                <TouchableOpacity onPress={fetchEvents} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="refresh" size={16} color={colors.primary[500]} />
                    <Text style={{ color: colors.primary[500], marginLeft: 6 }}>Retry</Text>
                </TouchableOpacity>
            </View>
        )}
        {!loading && !error && todayEvents.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: colors.textTertiary }}>No events for this day</Text>
            </View>
        )}
        {hours.map((hour) => {
            const hourEvents = todayEvents.filter(e => e.startTime.getHours() === hour);
            const isPast = hour < currentHour;
            
            return (
                <View key={hour} style={styles.timeRow}>
                    {/* Time Column */}
                    <View style={styles.timeLabelContainer}>
                        <Text style={[
                            styles.timeLabel, 
                            hour === currentHour && styles.timeLabelActive
                        ]}>
                            {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                        </Text>
                    </View>

                    {/* Content Column */}
                    <View style={styles.gridCell}>
                        {/* Horizontal Grid Line */}
                        <View style={styles.gridLine} />
                        
                        {/* "Current Time" Indicator Line */}
                        {hour === currentHour && isSameDay(selectedDate, now) && (
                             <View style={[styles.currentTimeIndicator, { top: (currentMinute / 60) * 60 }]} >
                                <View style={styles.currentTimeDot} />
                                <View style={styles.currentTimeLine} />
                             </View>
                        )}

                        {/* Events in this hour */}
                        {hourEvents.map((event, idx) => (
                            <View 
                                key={idx}
                                style={[
                                    styles.eventCard,
                                    { 
                                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                                        borderLeftColor: event.color 
                                    }
                                ]}
                            >
                                <View style={styles.eventContent}>
                                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                                    <Text style={styles.eventDuration}>
                                        {format(event.startTime, 'h:mm')} - {format(event.endTime, 'h:mm')}
                                    </Text>
                                </View>
                                {event.platform === 'google-calendar' && (
                                    <Ionicons name="logo-google" size={14} color={colors.textTertiary} />
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            );
        })}
      </ScrollView>
    );
  };

  return (

    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <TouchableOpacity>
                <Ionicons name="menu" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.monthSelector} 
                onPress={toggleMonthView}
            >
                <Text style={styles.monthText}>{format(selectedDate, 'MMMM')}</Text>
                <Ionicons 
                    name={isMonthExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={colors.textSecondary} 
                />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileButton}>
                {/* Replaced Profile with Logo-like Icon to match inspiration */}
                <Ionicons name="infinite" size={24} color={colors.primary} />
            </TouchableOpacity>
        </View>

        {/* Calendar / Date Strip */}
        <View style={{ overflow: 'hidden' }}>
            {isMonthExpanded ? (
                <View style={styles.expandedCalendarContainer}>
                    {/* Custom Calendar Header */}
                    <View style={styles.calendarHeader}>
                        <Text style={styles.calendarHeaderTitle}>
                            {format(selectedDate, 'MMMM')}
                        </Text>
                        <View style={styles.calendarArrows}>
                            <TouchableOpacity onPress={() => setSelectedDate(curr => subMonths(curr, 1))} style={styles.arrowBtn}>
                                <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSelectedDate(curr => addMonths(curr, 1))} style={styles.arrowBtn}>
                                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Calendar
                        current={format(selectedDate, 'yyyy-MM-dd')}
                        key={format(selectedDate, 'yyyy-MM')} 
                        onDayPress={(day: { dateString: string }) => {
                            setSelectedDate(new Date(day.dateString));
                            toggleMonthView();
                        }}
                        theme={{
                            backgroundColor: 'transparent',
                            calendarBackground: 'transparent',
                            textSectionTitleColor: colors.textSecondary,
                            selectedDayBackgroundColor: 'transparent', // We'll custom render or use standard but clean
                            selectedDayTextColor: colors.primary,
                            todayTextColor: colors.primary,
                            dayTextColor: colors.text,
                            textDisabledColor: colors.textTertiary,
                            dotColor: colors.primary,
                            arrowColor: colors.textSecondary,
                            monthTextColor: colors.text,
                            indicatorColor: colors.primary,
                            textDayFontWeight: '500',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '500',
                            textDayFontSize: 14,
                        }}
                        markingType={'custom'}
                        markedDates={{
                            [format(selectedDate, 'yyyy-MM-dd')]: {
                                customStyles: {
                                    container: {
                                        backgroundColor: 'transparent',
                                        borderWidth: 1,
                                        borderColor: colors.primary, // Square border like inspiration
                                        borderRadius: 4, // Slightly rounded square
                                    },
                                    text: {
                                        color: colors.text,
                                        fontWeight: 'bold',
                                    }
                                }
                            }
                        }}
                        renderHeader={() => null}
                        hideArrows={true}
                    />

                    {/* Month Picker Strip */}
                    <View style={styles.monthStripContainer}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.monthStripContent}
                        >
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => {
                                const isActive = getMonth(selectedDate) === idx;
                                return (
                                    <TouchableOpacity 
                                        key={m} 
                                        style={[styles.monthPill, isActive && styles.monthPillActive]}
                                        onPress={() => setSelectedDate(d => setMonth(d, idx))}
                                    >
                                        <Text style={[styles.monthPillText, isActive && styles.monthPillTextActive]}>{m}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            ) : (
                <View style={styles.dateStrip}>
                    {weekDays.map((date, index) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, new Date());
                        
                        return (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.dateItem, isSelected && styles.dateItemActive]}
                                onPress={() => setSelectedDate(date)}
                            >
                                {isToday && !isSelected && (
                                    <View style={styles.todayDot} />
                                )}
                                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
                                    {format(date, 'EEEEE')}
                                </Text>
                                <View style={[styles.dayNumberContainer, isSelected && styles.dayNumberContainerActive]}>
                                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                                        {format(date, 'd')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
      </View>

      {/* Main Timeline */}
      {renderTimeLine()}

      {/* "Ask Iris" Input Bar (Floating) */}
      {/* <View style={styles.copilotBarWrapper}>
         <View style={styles.copilotBar}>
            <View style={styles.copilotInputContainer}>
                <TextInput 
                    placeholder="Ask iris"
                    placeholderTextColor={colors.textTertiary}
                    style={styles.copilotInput}
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Ionicons name="send" size={18} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
            </View>
         </View>
      </View> */}



    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    marginTop: spacing[8],
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    minHeight: 44, // Ensure touch target size
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  profileButton: {
      padding: 4,
  },

  // Expanded Calendar Styles
  expandedCalendarContainer: {
     paddingBottom: spacing[4],
  },
  calendarHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: spacing[2],
     marginBottom: spacing[2],
  },
  calendarHeaderTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
  },
  calendarArrows: {
      flexDirection: 'row',
      gap: spacing[2],
  },
  arrowBtn: {
      padding: 4,
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      borderRadius: 20,
  },
  monthStripContainer: {
      marginTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333' : '#eee',
      paddingTop: spacing[3],
  },
  monthStripContent: {
      paddingHorizontal: spacing[2],
      gap: spacing[2],
  },
  monthPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'transparent',
  },
  monthPillActive: {
      backgroundColor: isDark ? '#333' : '#E2E8F0',
  },
  monthPillText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
  },
  monthPillTextActive: {
      color: colors.text,
      fontWeight: '600',
  },
  
  // Date Strip
  dateStrip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: spacing[2],
  },
  dateItem: {
      alignItems: 'center',
      gap: spacing[1.5],
      opacity: 0.6,
      minWidth: 44, // Ensure touch target size
      paddingVertical: spacing[1],
  },
  dateItemActive: {
      opacity: 1,
  },
  dayName: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
  },
  dayNameActive: {
      color: colors.primary[500],
  },
  dayNumberContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: 'transparent',
  },
  dayNumberContainerActive: {
      borderColor: colors.primary[500],
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
  },
  dayNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
  },
  dayNumberActive: {
      color: colors.primary[500],
  },
  todayDot: {
      position: 'absolute',
      top: -4,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary[500],
  },

  // Timeline
  timeRow: {
      flexDirection: 'row',
      height: 60, // Height per hour block
  },
  timeLabelContainer: {
      width: 60,
      alignItems: 'center',
      justifyContent: 'flex-start', // Align to grid line
      paddingTop: -8, // Nudge up to center on line
  },
  timeLabel: {
      fontSize: 12,
      color: colors.textTertiary,
      transform: [{ translateY: -8 }] // Center vertically on the line
  },
  timeLabelActive: {
      color: colors.primary[500],
      fontWeight: '600',
  },
  gridCell: {
      flex: 1,
      borderTopWidth: 0,
      borderColor: isDark ? '#333' : '#eee',
      position: 'relative',
  },
  gridLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: isDark ? '#222' : '#f5f5f5',
  },
  
  // Current Time Indicator
  currentTimeIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 10,
  },
  currentTimeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary[500],
      marginLeft: -4,
      borderWidth: 2,
      borderColor: isDark ? '#000' : '#fff',
  },
  currentTimeLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.primary[500],
  },

  // Event Card
  eventCard: {
      position: 'absolute',
      top: 2,
      left: 0,
      right: spacing[4],
      bottom: 2,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
      borderRadius: 8,
      padding: 8,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderLeftWidth: 3,
  },
  eventContent: {
      flex: 1,
  },
  eventTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
  },
  eventDuration: {
      fontSize: 11,
      color: colors.textSecondary,
  },

  // Copilot Bar
  copilotBarWrapper: {
      position: 'absolute',
      bottom: 100, // Adjusted for new tab bar
      left: spacing[4],
      right: spacing[4],
  },
  copilotBar: {
      backgroundColor: isDark ? '#111' : '#fff',
      borderRadius: 25,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#eee',
      paddingHorizontal: 6,
      paddingVertical: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
  },
  copilotInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      paddingHorizontal: 12,
  },
  copilotInput: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
  },
  sendButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      alignItems: 'center',
      justifyContent: 'center',
  },

});