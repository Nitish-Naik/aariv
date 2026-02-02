import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

export interface ConflictProposal {
    conflictId: string;
    events: Array<{
        id: string;
        title: string;
        startTime: string;
        endTime: string;
    }>;
    resolutions: Array<{
        id: string;
        type: 'reschedule' | 'notify' | 'decline' | 'skip';
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    severity: 'high' | 'medium';
}

interface Props {
    conflict: ConflictProposal;
    onResolve: (resolution: any) => void;
    onDismiss: () => void;
}

export function ConflictResolutionCard({ conflict, onResolve, onDismiss }: Props) {
    const { colors } = useTheme();

    // Find the primary resolution (reschedule) and secondary (notify/decline)
    const primaryResolution = conflict.resolutions.find(r => r.type === 'reschedule');
    const secondaryResolutions = conflict.resolutions.filter(r => r.type !== 'reschedule').slice(0, 2);

    const eventA = conflict.events[0];
    const eventB = conflict.events[1];

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: '#F59E0B' }]}>
            {/* Header - Amber color for caution but not panic */}
            <View style={styles.header}>
                <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
                <Text style={[styles.headerText, { color: "#F59E0B" }]}>
                    Scheduling Conflict
                </Text>
            </View>

            {/* Conflict Details */}
            <View style={styles.content}>
                <Text style={[styles.description, { color: colors.text }]}>
                    <Text style={{ fontWeight: '700' }}>{eventA?.title}</Text> overlaps with <Text style={{ fontWeight: '700' }}>{eventB?.title}</Text>.
                </Text>
                <Text style={[styles.time, { color: colors.textSecondary }]}>
                    {formatTime(eventA?.startTime)} - {formatTime(eventA?.endTime)}
                </Text>
            </View>

            {/* AI Proposal */}
            <View style={styles.actions}>
                {primaryResolution && (
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                        onPress={() => onResolve(primaryResolution)}
                    >
                        <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>{primaryResolution.title}</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.secondaryActions}>
                    {secondaryResolutions.map((res) => (
                        <TouchableOpacity
                            key={res.id}
                            style={[styles.secondaryButton, { borderColor: colors.border }]}
                            onPress={() => onResolve(res)}
                        >
                            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                                {res.type === 'notify' ? 'Notify' : 'Decline'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: colors.border }]}
                        onPress={onDismiss}
                    >
                        <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                            Ignore
                        </Text>
                    </TouchableOpacity>
                </View>
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
        marginBottom: spacing[2],
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    content: {
        marginBottom: spacing[3],
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: spacing[1],
    },
    time: {
        fontSize: 13,
    },
    actions: {
        gap: spacing[2],
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        paddingVertical: spacing[3],
        borderRadius: 8,
        width: '100%',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    secondaryButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[2],
        borderRadius: 8,
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
