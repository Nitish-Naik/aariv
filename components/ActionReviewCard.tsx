import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';
import type { ActionItem } from '../types';
import { PlatformIcon } from './PlatformIcon';

interface ActionReviewCardProps {
    actions: ActionItem[];
    onApprove: (action: ActionItem) => void;
    onReject: (actionId: string) => void;
    isExecuting?: boolean;
}

export const ActionReviewCard = ({ actions, onApprove, onReject, isExecuting }: ActionReviewCardProps) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    if (!actions || actions.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Review Actions</Text>

            {actions.map((action) => (
                <View key={action.id} style={styles.actionItemCard}>
                    <View style={styles.actionHeader}>
                        <View style={styles.iconContainer}>
                            <PlatformIcon platform={action.platform} size={20} />
                        </View>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                        {Object.entries(action.metadata || {}).map(([key, value]) => {
                            // Formatting key: camelCase to Title Case
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                            // Basic string representation of value
                            const displayValue = Array.isArray(value) ? (value.length > 0 ? value.join(', ') : 'None') : (value || 'Not specified').toString();

                            return (
                                <View key={key} style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>{label}:</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>
                                        {displayValue}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => onReject(action.id)}
                            disabled={isExecuting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.approveButton]}
                            onPress={() => onApprove(action)}
                            disabled={isExecuting}
                        >
                            <Text style={styles.approveButtonText}>
                                {action.title.toLowerCase().includes('create') ? 'Create' : 'Approve'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
        borderRadius: borderRadius.xl,
        padding: spacing[4],
        marginTop: spacing[2],
        borderWidth: 1,
        borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
        width: '100%',
    },
    headerTitle: {
        ...typography.textStyles.body,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing[4],
        fontSize: 15,
    },
    actionItemCard: {
        backgroundColor: isDark ? '#1A1D21' : colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        marginBottom: spacing[2],
    },
    actionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[3],
    },
    iconContainer: {
        marginRight: spacing[2],
    },
    actionTitle: {
        ...typography.textStyles.body,
        fontWeight: '700',
        color: colors.text,
        fontSize: 15,
    },
    detailsContainer: {
        marginBottom: spacing[4],
        gap: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    detailLabel: {
        ...typography.textStyles.bodySmall,
        color: colors.textTertiary,
        width: 90,
        fontWeight: '600',
    },
    detailValue: {
        ...typography.textStyles.bodySmall,
        color: colors.textSecondary,
        flex: 1,
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: isDark ? '#2C2F33' : colors.neutral[200],
    },
    approveButton: {
        backgroundColor: isDark ? '#3E444D' : colors.primary[500],
    },
    cancelButtonText: {
        color: isDark ? colors.textSecondary : colors.text,
        fontWeight: '700',
        fontSize: 14,
    },
    approveButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
});
