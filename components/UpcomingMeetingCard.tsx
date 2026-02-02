import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

interface UpcomingMeeting {
    id: string;
    title: string;
    startTime: string;
    meetingLink: string;
    attendees?: Array<{
        name: string;
        email: string;
    }>;
    minutesUntilStart: number;
}

interface Props {
    meeting: UpcomingMeeting;
    onDismiss: () => void;
}

export function UpcomingMeetingCard({ meeting, onDismiss }: Props) {
    const { colors } = useTheme();

    const handleJoinMeeting = () => {
        if (meeting.meetingLink) {
            Linking.openURL(meeting.meetingLink);
        }
    };

    const getAttendeesSummary = () => {
        if (!meeting.attendees || meeting.attendees.length === 0) return null;

        const names = meeting.attendees.slice(0, 2).map(a => a.name.split(' ')[0]);
        const remaining = meeting.attendees.length - 2;

        if (remaining > 0) {
            return `With ${names.join(', ')} +${remaining} more`;
        }
        return `With ${names.join(', ')}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.primary[500] }]}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="sparkles" size={16} color={colors.primary[500]} />
                <Text style={[styles.headerText, { color: colors.primary[500] }]}>
                    Upcoming Meeting
                </Text>
            </View>

            {/* Meeting Info */}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {meeting.title}
            </Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
                {meeting.minutesUntilStart > 0
                    ? `Starts in ${meeting.minutesUntilStart} ${meeting.minutesUntilStart === 1 ? 'minute' : 'minutes'}`
                    : meeting.minutesUntilStart === 0
                        ? 'Starts now'
                        : `Started ${Math.abs(meeting.minutesUntilStart)} ${Math.abs(meeting.minutesUntilStart) === 1 ? 'minute' : 'minutes'} ago`
                }
            </Text>

            {meeting.attendees && meeting.attendees.length > 0 && (
                <View style={styles.attendeesRow}>
                    <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.attendees, { color: colors.textSecondary }]}>
                        {getAttendeesSummary()}
                    </Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.joinButton, { backgroundColor: colors.primary[500] }]}
                    onPress={handleJoinMeeting}
                >
                    <Ionicons name="videocam" size={16} color="#FFFFFF" />
                    <Text style={styles.joinButtonText}>Join Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.dismissButton, { borderColor: colors.textTertiary }]}
                    onPress={onDismiss}
                >
                    <Text style={[styles.dismissButtonText, { color: colors.textSecondary }]}>
                        Dismiss
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: spacing[4],
        marginBottom: spacing[4],
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[3],
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: spacing[1],
    },
    time: {
        fontSize: 14,
        marginBottom: spacing[2],
    },
    attendeesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        marginBottom: spacing[3],
    },
    attendees: {
        fontSize: 13,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing[2],
        marginTop: spacing[2],
    },
    joinButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        paddingVertical: spacing[2],
        borderRadius: 8,
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    dismissButton: {
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
    },
    dismissButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
