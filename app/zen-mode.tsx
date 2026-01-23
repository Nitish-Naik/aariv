import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeCard } from '../components/SwipeCard';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';
import { spacing, typography } from '../theme';

const Toast = ({ message, visible, styles }: { message: string, visible: boolean, styles: any }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [visible, opacity]);

    if (!visible && (opacity as any)._value === 0) return null;

    return (
        <Animated.View style={[styles.toastContainer, { opacity }]}>
            <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

export default function ZenModeScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const [actions, setActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processedCount, setProcessedCount] = useState(0);

    // Toast State
    const [toastMsg, setToastMsg] = useState("");
    const [toastVisible, setToastVisible] = useState(false);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    };



    const fetchActions = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                // We reuse the briefing endpoint which returns 'actions'
                const data = await api.get(`/dashboard/briefing?userId=${user.id}`);
                if (data.actions && Array.isArray(data.actions)) {
                    setActions(data.actions.map((a: any) => ({
                        id: a.id,
                        title: a.title,
                        subtitle: a.subtitle,
                        type: a.type,
                        platform: a.type === 'email' ? 'gmail' : (a.type === 'calendar' ? 'google-calendar' : 'gmail'), // Map type to platform to prevent crash
                        proposedAt: new Date(), // Add default date to prevent crash
                        status: 'pending',
                        priority: a.priority || 'medium',
                        data: a.data
                    })));
                }
            }
        } catch (_e) {
            console.log("Failed to load actions", _e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActions();
    }, [fetchActions]);

    const executeAction = async (action: any) => {
        try {
            const user = await getCurrentUser();
            if (!user) return;

            // Haptic Feedback for Immediate Satisfaction
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // API Call to Backend
            await api.post(`/actions/${action.id}/execute`, {
                userId: user.id,
                actionData: action.data
            });

            // Update local action status
            const updatedAction = { ...action, status: 'executed' };

            // Navigate to execution status screen
            router.push({
                pathname: '/action-status',
                params: { actionData: JSON.stringify(updatedAction) }
            });

        } catch (e: any) {
            Alert.alert(
                "Execution Failed",
                e.message || "Could not execute the action. Please try again.",
                [{ text: "OK" }]
            );
        }
    };

    const handleApprove = async (action: any) => {
        // Remove from queue immediately for snappy UX
        setActions(prev => prev.filter(a => a.id !== action.id));
        setProcessedCount(prev => prev + 1);

        // Update action status to approved
        const approvedAction = { ...action, status: 'approved' };

        try {
            await executeAction(approvedAction);
        } catch (e) {
            console.log("Approval failed:", e);
            // Optionally re-add to queue on failure
        }
    };

    const handleReject = async (action: any) => {
        // Haptic Feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        // Remove from queue
        setActions(prev => prev.filter(a => a.id !== action.id));
        setProcessedCount(prev => prev + 1);

        // Update action status to rejected  
        const rejectedAction = { ...action, status: 'rejected' };

        try {
            const user = await getCurrentUser();
            if (user) {
                await api.post(`/actions/${action.id}/reject`, {
                    userId: user.id
                });
            }

            // Navigate to execution status to show rejection
            router.push({
                pathname: '/action-status',
                params: { actionData: JSON.stringify(rejectedAction) }
            });

        } catch (e: any) {
            console.log("Rejection failed:", e);
        }
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        const currentAction = actions[0];
        if (!currentAction) return;

        // Handle approve (right swipe) or reject (left swipe)
        if (direction === 'right') {
            handleApprove(currentAction);
        } else {
            handleReject(currentAction);
        }
    };

    // We always render the first item in the array
    const currentAction = actions[0];

    // Animation for the empty state checkmark
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (actions.length === 0 && !loading) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [actions.length, loading, scaleAnim, fadeAnim]);

    const renderEmptyState = () => (
        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
            <Animated.View style={[styles.emptyIconContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Ionicons name="checkmark-circle" size={80} color={colors.semantic.success} />
            </Animated.View>
            <Text style={styles.emptyTitle}>All Caught Up</Text>
            <Text style={styles.emptySubtitle}>You&apos;ve reviewed all pending items for today.</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{processedCount}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.returnButton}
                onPress={() => router.back()}
            >
                <Text style={styles.returnButtonText}>Return Home</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>Review Queue</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.counter}>{actions.length} left</Text>
                </View>
            </View>

            <View style={styles.content}>
                {actions.length > 0 && currentAction ? (
                    <View style={styles.cardContainer}>
                        {/* Background cards for stack effect */}
                        {actions.length > 1 && (
                            <View style={[styles.stackCard, styles.stackCard2]} />
                        )}
                        {actions.length > 2 && (
                            <View style={[styles.stackCard, styles.stackCard3]} />
                        )}

                        <SwipeCard
                            key={currentAction.id} // Key is important for animation reset when component replaces
                            action={currentAction}
                            onSwipeLeft={() => handleSwipe('left')}
                            onSwipeRight={() => handleSwipe('right')}
                            style={styles.mainCard}
                        />
                    </View>
                ) : (
                    renderEmptyState()
                )}
            </View>

            {actions.length > 0 && (
                <View style={styles.footer}>
                    <Text style={styles.instruction}>Swipe right to approve, left to defer</Text>
                </View>
            )}

            <Toast message={toastMsg} visible={toastVisible} styles={styles} />

        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        bottom: spacing[8],
        left: spacing[6],
        right: spacing[6],
        backgroundColor: colors.surface,
        padding: spacing[4],
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 100,
    },
    toastText: {
        ...typography.textStyles.body,
        fontWeight: '600',
        marginLeft: spacing[3],
        color: colors.text,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[6],
        paddingTop: spacing[8],
        paddingBottom: spacing[4],
    },
    headerLeft: {
        minWidth: 44, // Ensure touch target size
    },
    backButton: {
        padding: spacing[2],
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    headerTitle: {
        ...typography.textStyles.body,
        fontWeight: '600',
        color: colors.text,
    },
    counter: {
        ...typography.textStyles.caption,
        color: colors.textTertiary,
    },
    content: {
        flex: 1,
        padding: spacing[6],
        justifyContent: 'center',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: 500, // Limit card height impact
    },
    mainCard: {
        width: '100%',
        // height is determined by content, but we could enforce it if needed
        zIndex: 10,
    },
    stackCard: {
        position: 'absolute',
        width: '95%',
        height: '100%', // Match main card roughly
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    stackCard2: {
        top: 10,
        width: '92%',
        zIndex: 5,
        opacity: 0.5,
        transform: [{ scale: 0.95 }],
    },
    stackCard3: {
        top: 20,
        width: '88%',
        zIndex: 1,
        opacity: 0.3,
        transform: [{ scale: 0.9 }],
    },
    footer: {
        padding: spacing[6],
        alignItems: 'center',
    },
    instruction: {
        color: colors.textTertiary,
        fontSize: 14,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconContainer: {
        marginBottom: spacing[6],
        transform: [{ scale: 1.2 }],
    },
    emptyTitle: {
        ...typography.textStyles.h2,
        color: colors.text,
        marginBottom: spacing[2],
    },
    emptySubtitle: {
        ...typography.textStyles.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing[8],
        maxWidth: 250,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing[4],
        marginBottom: spacing[8],
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: spacing[6],
    },
    statValue: {
        ...typography.textStyles.h3,
        color: colors.text,
    },
    statLabel: {
        ...typography.textStyles.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    returnButton: {
        backgroundColor: colors.primary[500],
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[8],
        borderRadius: 24,
        marginTop: spacing[4],
    },
    returnButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    }
});
