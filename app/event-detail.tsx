import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../theme/spacing';
import { useTheme } from '../context/ThemeContext'; // Add this import

interface Attendee {
    email: string;
    name: string;
    responseStatus: string;
    organizer: boolean;
    self: boolean;
}

interface CalendarEvent {
    id: string;
    title: string;
    description?: string | null;
    startTime: Date;
    endTime: Date;
    location?: string | null;
    attendees?: Attendee[];
    attendeesCount?: number;
    meetingLink?: string | null;
    htmlLink?: string | null;
    status?: string;
    color?: string;
    isAllDay?: boolean;
    creator?: string | null;
    organizer?: string | null;
}

export default function EventDetailScreen() {
    const params = useLocalSearchParams();
    const { colors } = useTheme();

    // Parse event data from params
    const event: CalendarEvent = params.eventData
        ? JSON.parse(params.eventData as string)
        : null;

    // RSVP status configuration with theme-aware colors
    const RSVP_STATUS = {
        accepted: { icon: 'checkmark-circle', color: '#10B981', label: 'Accepted' },
        declined: { icon: 'close-circle', color: '#EF4444', label: 'Declined' },
        tentative: { icon: 'help-circle', color: '#F59E0B', label: 'Tentative' },
        needsAction: { icon: 'ellipse-outline', color: colors.textSecondary, label: 'No response' }
    };

    const getStyles = (colors: any) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollView: {
            flex: 1,
            paddingHorizontal: spacing[4],
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing[4],
            marginTop: spacing[2],
        },
        backButton: {
            padding: spacing[2],
            marginLeft: -spacing[2],
        },
        errorText: {
            color: colors.text,
            fontSize: 16,
            textAlign: 'center',
            marginTop: spacing[8],
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
            marginBottom: spacing[4],
        },
        infoCard: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing[4],
            marginBottom: spacing[3],
            gap: spacing[3],
        },
        infoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[3],
        },
        infoText: {
            fontSize: 15,
            color: colors.text,
            flex: 1,
        },
        section: {
            marginBottom: spacing[4],
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing[3],
        },
        attendeesCard: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing[4],
            gap: spacing[4],
        },
        attendeeItem: {
            borderBottomWidth: 1,
            borderBottomColor: colors.border || 'rgba(255,255,255,0.1)',
            paddingBottom: spacing[3],
        },
        attendeeInfo: {
            gap: spacing[1],
        },
        attendeeHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        attendeeName: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        attendeeEmail: {
            fontSize: 13,
            color: colors.textSecondary,
        },
        attendeeStatus: {
            fontSize: 12,
            fontWeight: '500',
        },
        descriptionCard: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing[4],
        },
        descriptionText: {
            fontSize: 14,
            color: colors.text,
            lineHeight: 20,
        },
        actionsSection: {
            gap: spacing[3],
            marginTop: spacing[4],
        },
        primaryButton: {
            backgroundColor: colors.primary[500],
            borderRadius: 12,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
        },
        primaryButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
        },
        secondaryButton: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            borderWidth: 1,
            borderColor: colors.primary[500],
        },
        secondaryButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.primary[500],
        },
    });

    const styles = getStyles(colors); // Get the themed styles

    if (!event) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Event not found</Text>
            </SafeAreaView>
        );
    }

    // Convert string dates back to Date objects
    event.startTime = new Date(event.startTime);
    event.endTime = new Date(event.endTime);

    const duration = Math.round((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60));
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    const handleOpenInGoogleCalendar = () => {
        if (event.htmlLink) {
            Linking.openURL(event.htmlLink);
        }
    };

    const handleJoinMeeting = () => {
        if (event.meetingLink) {
            Linking.openURL(event.meetingLink);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <Text style={styles.title}>{event.title}</Text>

                {/* Date & Time Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary[500]} />
                        <Text style={styles.infoText}>
                            {format(event.startTime, 'EEEE, MMM d, yyyy')}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
                        <Text style={styles.infoText}>
                            {event.isAllDay
                                ? 'All day'
                                : `${format(event.startTime, 'h:mm a')} - ${format(event.endTime, 'h:mm a')}`
                            }
                        </Text>
                    </View>
                    {!event.isAllDay && (
                        <View style={styles.infoRow}>
                            <Ionicons name="hourglass-outline" size={20} color={colors.primary[500]} />
                            <Text style={styles.infoText}>
                                {hours > 0 && `${hours}h `}{minutes > 0 && `${minutes}m`}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Location */}
                {event.location && (
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color={colors.primary[500]} />
                            <Text style={styles.infoText}>{event.location}</Text>
                        </View>
                    </View>
                )}

                {/* Attendees */}
                {event.attendees && event.attendees.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            👥 Attendees ({event.attendees.length})
                        </Text>
                        <View style={styles.attendeesCard}>
                            {event.attendees.map((attendee, index) => {
                                const status = RSVP_STATUS[attendee.responseStatus as keyof typeof RSVP_STATUS]
                                    || RSVP_STATUS.needsAction;

                                return (
                                    <View key={index} style={styles.attendeeItem}>
                                        <View style={styles.attendeeInfo}>
                                            <View style={styles.attendeeHeader}>
                                                <Text style={styles.attendeeName}>
                                                    {attendee.name}
                                                    {attendee.organizer && ' (Organizer)'}
                                                </Text>
                                                <Ionicons
                                                    name={status.icon as any}
                                                    size={18}
                                                    color={status.color}
                                                />
                                            </View>
                                            <Text style={styles.attendeeEmail}>{attendee.email}</Text>
                                            <Text style={[styles.attendeeStatus, { color: status.color }]}>
                                                {status.label}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Description */}
                {event.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📝 Description</Text>
                        <View style={styles.descriptionCard}>
                            <Text style={styles.descriptionText}>{event.description}</Text>
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    {event.meetingLink && (
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleJoinMeeting}
                        >
                            <Ionicons name="videocam" size={20} color="#FFFFFF" />
                            <Text style={styles.primaryButtonText}>Join Meeting</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleOpenInGoogleCalendar}
                    >
                        <Ionicons name="calendar" size={20} color={colors.primary[500]} />
                        <Text style={styles.secondaryButtonText}>Open in Google Calendar</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom padding */}
                <View style={{ height: spacing[6] }} />
            </ScrollView>
        </SafeAreaView>
    );
}


