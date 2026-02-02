import { Ionicons } from '@expo/vector-icons';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from 'react';

import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { getCurrentUser } from '../../services/auth';
import { spacing } from '../../theme';

const MOCK_EVENTS: CalendarEvent[] = [
    {
        id: '1',
        title: 'Design Sync',
        description: 'Review new mockups and finalize design system',
        startTime: new Date(new Date().setHours(10, 0, 0, 0)),
        endTime: new Date(new Date().setHours(10, 30, 0, 0)),
        location: 'Conference Room A',
        attendeesCount: 3,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        color: '#3B82F6',
        status: 'confirmed',
        isAllDay: false,
    },
    {
        id: '2',
        title: 'Frontend Standup',
        description: 'Daily team sync',
        startTime: new Date(new Date().setHours(11, 0, 0, 0)),
        endTime: new Date(new Date().setHours(11, 15, 0, 0)),
        location: 'Zoom',
        attendeesCount: 5,
        meetingLink: 'https://zoom.us/j/123456789',
        color: '#F59E0B',
        status: 'confirmed',
        isAllDay: false,
    },
    {
        id: '3',
        title: 'Lunch with the team',
        startTime: new Date(new Date().setHours(13, 0, 0, 0)),
        endTime: new Date(new Date().setHours(14, 0, 0, 0)),
        location: 'Cafe Downtown',
        attendeesCount: 4,
        color: '#10B981',
        status: 'confirmed',
        isAllDay: false,
    },
    {
        id: '4',
        title: 'Doctor Appointment',
        startTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(9, 30, 0, 0)),
        endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10, 0, 0, 0)),
        location: 'City Medical Center',
        color: '#EF4444',
        status: 'confirmed',
        isAllDay: false,
    },
];

interface CalendarEvent {
    id: string;
    title: string;
    description?: string | null;
    startTime: Date;
    endTime: Date;
    location?: string | null;
    attendees?: Array<{
        email: string;
        name: string;
        responseStatus: string;
        organizer: boolean;
        self: boolean;
    }>;
    attendeesCount?: number;
    meetingLink?: string | null;
    htmlLink?: string | null;
    status?: string; // confirmed, tentative, cancelled
    color?: string;
    isAllDay?: boolean;
    creator?: string | null;
    organizer?: string | null;
}

export default function CalendarTab() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // AI Scheduling Assistant state
    const [schedulingQuery, setSchedulingQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Event creation state
    const [creatingEvent, setCreatingEvent] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

    const fetchEvents = useCallback(async () => {
        try {
            setError(null);
            const user = await getCurrentUser();
            if (!user) {
                // If no user, just show mock data for today
                setEvents(MOCK_EVENTS.filter(e => isSameDay(new Date(), e.startTime)));
                return;
            }

            const start = new Date(selectedDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(selectedDate);
            end.setHours(23, 59, 59, 999);

            const data = await api.get(`/calendar?userId=${user.id}&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`);

            let normalized = Array.isArray(data.events) ? data.events : [];

            // If API returns no events, use mock data for the selected date
            if (normalized.length === 0) {
                normalized = MOCK_EVENTS.filter(e => isSameDay(selectedDate, e.startTime));
            }

            setEvents(normalized.map((e: any) => ({
                ...e,
                startTime: new Date(e.startTime),
                endTime: new Date(e.endTime)
            })));
        } catch (e: any) {
            console.error("Failed to fetch calendar, falling back to mock data", e);
            setEvents(MOCK_EVENTS.filter(e => isSameDay(selectedDate, e.startTime)));
            setError(e?.message || "Failed to load calendar");
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchEvents();
    }, [selectedDate]);

    // AI Scheduling Assistant handlers
    const handleFindTime = async () => {
        if (!schedulingQuery.trim()) return;

        setLoadingSuggestions(true);
        setShowSuggestions(true);

        try {
            const user = await getCurrentUser();
            const response = await api.post('/calendar/suggest-times', {
                userId: user.id,
                query: schedulingQuery
            });

            console.log('📊 Suggest times response:', response);

            // Safely access suggestions with fallback
            const suggestionsData = response?.data?.suggestions || response?.suggestions || [];
            setSuggestions(suggestionsData);

            if (suggestionsData.length === 0) {
                setError('No available time slots found for your query.');
            }
        } catch (err: any) {
            console.error('Failed to get time suggestions:', err);
            console.error('Error details:', err.response?.data);
            setError(err.response?.data?.error || 'Failed to find available times');
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleCreateEvent = async (suggestion: any) => {
        // Show the inline title input for this suggestion
        setSelectedSuggestion(suggestion);
        setCreatingEvent(true);
        setEventTitle('');
    };

    const confirmCreateEvent = async () => {
        if (!eventTitle.trim() || !selectedSuggestion) return;

        try {
            const user = await getCurrentUser();

            console.log('Creating event with:', {
                userId: user.id,
                title: eventTitle.trim(),
                startTime: selectedSuggestion.startTime,
                endTime: selectedSuggestion.endTime
            });

            // Create the event via API
            const response = await api.post('/calendar/create', {
                userId: user.id,
                title: eventTitle.trim(),
                startTime: selectedSuggestion.startTime,
                endTime: selectedSuggestion.endTime,
                description: `Created via AI scheduling assistant`
            });

            console.log('📊 Create event response:', response);

            if (response?.success || response?.data?.success) {
                // Success!
                alert(`✅ Event "${eventTitle}" created successfully!`);

                // Reset and close
                setCreatingEvent(false);
                setEventTitle('');
                setSelectedSuggestion(null);
                setShowSuggestions(false);
                setSuggestions([]);
                setSchedulingQuery('');

                // Refresh calendar to show new event
                await fetchEvents();
            } else {
                throw new Error('Event creation failed');
            }
        } catch (err: any) {
            console.error('Failed to create event:', err);
            alert(err.response?.data?.error || err.response?.data?.details || 'Failed to create event. Please try again.');
            setCreatingEvent(false);
        }
    };

    const cancelCreateEvent = () => {
        setCreatingEvent(false);
        setEventTitle('');
        setSelectedSuggestion(null);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    }, [fetchEvents]);


    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));




    const todayEvents = events;

    const renderTimeLine = () => {
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing[4], paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
                }
            >
                {/* AI Scheduling Assistant - Quieter, subordinate to calendar */}
                <View style={[styles.schedulingAssistant, { opacity: 0.85 }]}>
                    <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 6, fontWeight: '500' }}>
                        Suggestion
                    </Text>
                    <View style={[styles.schedulingInputContainer, { backgroundColor: colors.surface }]}>
                        <Ionicons name="sparkles" size={18} color={colors.primary[500]} style={{ marginRight: 8 }} />
                        <TextInput
                            placeholder="Ask me to find time..."
                            placeholderTextColor={colors.textSecondary}
                            value={schedulingQuery}
                            onChangeText={setSchedulingQuery}
                            onSubmitEditing={handleFindTime}
                            returnKeyType="search"
                            style={styles.schedulingInput}
                        />
                        {schedulingQuery.length > 0 && (
                            <TouchableOpacity onPress={handleFindTime} disabled={loadingSuggestions}>
                                {loadingSuggestions ? (
                                    <ActivityIndicator size="small" color={colors.primary[500]} />
                                ) : (
                                    <Ionicons name="send" size={18} color={colors.primary[500]} />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Suggestions */}
                    {showSuggestions && (
                        <View style={styles.suggestionsContainer}>
                            {suggestions.length > 0 ? (
                                <>
                                    <Text style={styles.suggestionsTitle}>
                                        📅 Suggested Times ({suggestions.length})
                                    </Text>
                                    {suggestions.map((suggestion, index) => (
                                        <View key={index} style={[styles.suggestionCard, { backgroundColor: colors.surface }]}>
                                            {index === 0 && (
                                                <View style={styles.recommendedBadge}>
                                                    <Ionicons name="star" size={14} color="#F6BF26" />
                                                    <Text style={styles.recommendedText}>Recommended</Text>
                                                </View>
                                            )}
                                            <Text style={[styles.suggestionTime, { color: colors.text }]}>
                                                {format(new Date(suggestion.startTime), 'EEEE, MMM d')}
                                            </Text>
                                            <Text style={[styles.suggestionTimeSlot, { color: colors.text }]}>
                                                {format(new Date(suggestion.startTime), 'h:mm a')} - {format(new Date(suggestion.endTime), 'h:mm a')}
                                            </Text>
                                            <Text style={[styles.suggestionReason, { color: colors.textSecondary }]}>
                                                {suggestion.reason}
                                            </Text>

                                            {/* Show title input if this suggestion is being created */}
                                            {creatingEvent && selectedSuggestion === suggestion ? (
                                                <View style={styles.eventCreationContainer}>
                                                    <TextInput
                                                        placeholder="Event title..."
                                                        placeholderTextColor={colors.textSecondary}
                                                        value={eventTitle}
                                                        onChangeText={setEventTitle}
                                                        autoFocus
                                                        style={[styles.eventTitleInput, {
                                                            color: colors.text,
                                                            backgroundColor: colors.background,
                                                            borderColor: colors.primary[500]
                                                        }]}
                                                    />
                                                    <View style={styles.eventCreationButtons}>
                                                        <TouchableOpacity
                                                            style={[styles.cancelButton, { borderColor: colors.textTertiary }]}
                                                            onPress={cancelCreateEvent}
                                                        >
                                                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={[styles.confirmButton, { backgroundColor: colors.primary[500] }]}
                                                            onPress={confirmCreateEvent}
                                                            disabled={!eventTitle.trim()}
                                                        >
                                                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                                            <Text style={styles.confirmButtonText}>Create</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    style={[styles.createEventButton, { backgroundColor: colors.primary[500] }]}
                                                    onPress={() => handleCreateEvent(suggestion)}
                                                >
                                                    <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                                                    <Text style={styles.createEventButtonText}>Create Event</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.closeSuggestionsButton}
                                        onPress={() => setShowSuggestions(false)}
                                    >
                                        <Text style={[styles.closeSuggestionsText, { color: colors.textSecondary }]}>
                                            Close
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.emptyStateContainer}>
                                    <Text style={styles.emptyStateIcon}>📭</Text>
                                    <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                                        No Available Slots
                                    </Text>
                                    <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
                                        Your calendar is fully booked during this time.
                                    </Text>
                                    <View style={styles.emptyStateSuggestions}>
                                        <Text style={[styles.suggestionLabel, { color: colors.textSecondary }]}>
                                            💡 Try:
                                        </Text>
                                        <Text style={[styles.suggestionItem, { color: colors.textSecondary }]}>
                                            • A different time range
                                        </Text>
                                        <Text style={[styles.suggestionItem, { color: colors.textSecondary }]}>
                                            • A shorter duration
                                        </Text>
                                        <Text style={[styles.suggestionItem, { color: colors.textSecondary }]}>
                                            • Tomorrow or next week
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.tryAgainButton, { borderColor: colors.primary[500] }]}
                                        onPress={() => {
                                            setShowSuggestions(false);
                                            setSchedulingQuery('');
                                        }}
                                    >
                                        <Ionicons name="refresh" size={16} color={colors.primary[500]} />
                                        <Text style={[styles.tryAgainButtonText, { color: colors.primary[500] }]}>
                                            Try Different Query
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>

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
                        <Text style={{ color: colors.textTertiary }}>No events for today.</Text>
                        <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 12 }}>Enjoy your clear schedule!</Text>
                    </View>
                )}
                {!loading && !error && todayEvents.length > 0 && (
                    <View style={{ gap: spacing[3] }}>
                        {todayEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                onPress={() => router.push({
                                    pathname: '/event-detail',
                                    params: {
                                        eventData: JSON.stringify(event)
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.eventCard,
                                        {
                                            backgroundColor: colors.surface,
                                            borderLeftColor: event.color || colors.primary[500],
                                        }
                                    ]}
                                >
                                    <View style={styles.eventContent}>
                                        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                                        <Text style={styles.eventDuration}>
                                            {event.isAllDay
                                                ? 'All day'
                                                : `${format(event.startTime, 'h:mm a')} - ${format(event.endTime, 'h:mm a')}`
                                            }
                                        </Text>

                                        {/* Location */}
                                        {event.location && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                                <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 4 }} numberOfLines={1}>
                                                    {event.location}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Attendees - Only show if multiple attendees (real meeting) */}
                                        {event.attendeesCount && event.attendeesCount > 1 && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                                <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                                                <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 4 }}>
                                                    {event.attendeesCount} attendees
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        );
    };

    return (

        <SafeAreaView style={styles.container} edges={['top']}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={{ width: 24 }} />
                    <View style={styles.monthSelector}>
                        <Text style={styles.monthText}>{format(selectedDate, 'MMMM yyyy')}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>

                {/* Calendar / Date Strip */}
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
        minHeight: 44,
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

    dateStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: spacing[2],
    },
    dateItem: {
        alignItems: 'center',
        gap: spacing[1.5],
        opacity: 0.6,
        minWidth: 44,
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

    eventCard: {
        borderRadius: 12,
        padding: spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    eventContent: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing[1],
    },
    eventDuration: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    emptyStateImage: {
        textAlign: 'center',
        fontSize: 48,
        marginBottom: spacing[3],
    },
    // AI Scheduling Assistant styles
    schedulingAssistant: {
        marginBottom: spacing[4],
    },
    schedulingInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        marginBottom: spacing[3],
    },
    schedulingInput: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        paddingVertical: spacing[2],
    },
    suggestionsContainer: {
        gap: spacing[3],
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing[2],
    },
    suggestionCard: {
        borderRadius: 12,
        padding: spacing[4],
        gap: spacing[2],
    },
    recommendedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        marginBottom: spacing[1],
    },
    recommendedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F6BF26',
    },
    suggestionTime: {
        fontSize: 14,
        fontWeight: '600',
    },
    suggestionTimeSlot: {
        fontSize: 18,
        fontWeight: '700',
    },
    suggestionReason: {
        fontSize: 13,
        marginTop: spacing[1],
    },
    createEventButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[3],
        borderRadius: 8,
        marginTop: spacing[2],
    },
    createEventButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    closeSuggestionsButton: {
        paddingVertical: spacing[2],
        alignItems: 'center',
    },
    closeSuggestionsText: {
        fontSize: 14,
        fontWeight: '500',
    },
    copilotBarWrapper: {
        position: 'absolute',
        bottom: 100,
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
    eventCreationContainer: {
        marginTop: spacing[3],
        gap: spacing[2],
    },
    eventTitleInput: {
        fontSize: 15,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[3],
        borderRadius: 8,
        borderWidth: 2,
    },
    eventCreationButtons: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    cancelButton: {
        flex: 1,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[3],
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[3],
        borderRadius: 8,
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: spacing[6],
        paddingHorizontal: spacing[4],
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: spacing[3],
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing[2],
    },
    emptyStateMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: spacing[4],
    },
    emptyStateSuggestions: {
        alignSelf: 'stretch',
        marginBottom: spacing[4],
    },
    suggestionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: spacing[2],
    },
    suggestionItem: {
        fontSize: 13,
        marginLeft: spacing[2],
        marginBottom: spacing[1],
    },
    tryAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderRadius: 8,
        borderWidth: 1,
    },
    tryAgainButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },

});