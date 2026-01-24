import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { analytics } from '../services/analytics'; // Import analytics
import { borderRadius, spacing, typography } from '../theme';

export type HighlightSeverity = 'info' | 'attention' | 'urgent';

interface HighlightCardProps {
    id?: string; // Alert ID for telemetry
    title: string;
    description: string;
    severity?: HighlightSeverity;
    actionLabel?: string;
    onActionPress?: () => void;
    style?: any;
    alertType?: string; // Telemetry: type of alert
    screenName?: string; // Telemetry: screen where shown
    userId?: string; // Telemetry: user ID
}

export function HighlightCard({
    id = 'unknown',
    title,
    description,
    severity = 'info',
    actionLabel,
    onActionPress,
    style,
    alertType = 'insight',
    screenName = 'dashboard',
    userId,
}: HighlightCardProps) {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    // Track View on Mount
    useEffect(() => {
        analytics.trackHighlightViewed(id, severity, alertType, screenName, userId);
    }, [id, severity, alertType, screenName, userId]);

    const handlePress = () => {
        analytics.trackHighlightClicked(id, severity, actionLabel || 'unknown', screenName, userId);
        onActionPress?.();
    };

    // Configuration per severity
    const config = {
        info: {
            icon: 'sparkles-outline' as const,
            color: colors.primary[500],
            bg: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', // Light Blue
            border: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        },
        attention: {
            icon: 'shield-checkmark-outline' as const,
            color: '#F59E0B', // Amber
            bg: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', // Light Amber
            border: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
        },
        urgent: {
            icon: 'warning-outline' as const,
            color: colors.semantic.error,
            bg: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', // Light Red
            border: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
        },
    };

    const theme = config[severity];

    return (
        <View style={[styles.card, { borderColor: theme.border }, style]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
                    <Ionicons name={theme.icon} size={16} color={theme.color} />
                </View>
                <Text style={styles.title}>{title}</Text>
            </View>

            <Text style={styles.description}>{description}</Text>

            {actionLabel && onActionPress && (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handlePress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.actionText}>{actionLabel}</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    card: {
        width: 280,
        marginRight: spacing[4],
        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
        borderWidth: 1,
        padding: spacing[5],
        borderRadius: borderRadius.xl,
        justifyContent: 'space-between',
        minHeight: 140,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[3],
        gap: spacing[3],
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...typography.textStyles.body,
        fontSize: 14,
        fontWeight: "700",
        color: colors.text,
        letterSpacing: 0.2,
        flex: 1,
    },
    description: {
        ...typography.textStyles.body,
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
        flex: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing[4],
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
});
