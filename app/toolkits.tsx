import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';
import { borderRadius, spacing, typography } from '../theme';
import { PlatformIcon } from '../components/PlatformIcon';
import { MOCK_BUNDLES, MOCK_TOOLKITS, Toolkit, ToolkitBundle } from '../utils/mockToolkits';

export default function ToolkitsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    // State
    const [toolkits, setToolkits] = useState<Toolkit[]>(MOCK_TOOLKITS);
    const [bundles, setBundles] = useState<ToolkitBundle[]>(MOCK_BUNDLES);
    const [installedIds, setInstalledIds] = useState<Set<string>>(new Set(['1', '2', '6', '11']));
    const [modalVisible, setModalVisible] = useState(false);
    const [pendingToolkit, setPendingToolkit] = useState<Toolkit | null>(null);
    const [, setLoading] = useState(true);

    // Fetch real toolkits on mount
    useEffect(() => {
        const fetchToolkits = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) throw new Error("Not signed in");

                const [toolkitsRes, bundlesRes] = await Promise.all([
                    api.get(`/toolkits?userId=${user.id}`),
                    api.get('/toolkits/bundles'),
                ]);

                if (toolkitsRes.toolkits && Array.isArray(toolkitsRes.toolkits)) {
                    setToolkits(toolkitsRes.toolkits);
                }
                if (bundlesRes.bundles && Array.isArray(bundlesRes.bundles)) {
                    setBundles(bundlesRes.bundles);
                }

                // Update installed from connected status
                const installed = new Set<string>();
                if (toolkitsRes.toolkits && Array.isArray(toolkitsRes.toolkits)) {
                    toolkitsRes.toolkits.forEach((t: Toolkit) => {
                        if (t.connected) installed.add(t.id);
                    });
                    setInstalledIds(installed);
                }
            } catch (e) {
                console.log("Failed to fetch toolkits, using defaults", e);
                // Fallback to mocks already set
            } finally {
                setLoading(false);
            }
        };
        fetchToolkits();
    }, []);

    const filteredToolkits = toolkits;

    // Handlers
    const initiateConnection = (toolkit: Toolkit) => {
        if (installedIds.has(toolkit.id)) {
            // Disconnect flow remains simple
            Alert.alert("Sever Neural Link", `Disconnect ${toolkit.name}?`, [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Disconnect", style: "destructive", onPress: () => {
                        const newSet = new Set(installedIds);
                        newSet.delete(toolkit.id);
                        setInstalledIds(newSet);
                    }
                }
            ]);
        } else {
            // New "Permission Handshake" flow
            setPendingToolkit(toolkit);
            setModalVisible(true);
        }
    };

    const confirmConnection = () => {
        if (pendingToolkit) {
            const newSet = new Set(installedIds);
            newSet.add(pendingToolkit.id);
            setInstalledIds(newSet);
            setModalVisible(false);
            setPendingToolkit(null);
        }
    };

    const installBundle = (bundle: ToolkitBundle) => {
        const toolkitIds = bundle.toolkitIds || [];
        const potential = toolkitIds.filter(id => !installedIds.has(id));
        if (potential.length === 0) {
            Alert.alert("Already Optimized", "You have this full stack active.");
            return;
        }

        Alert.alert(
            `Activate ${bundle.title}?`,
            `This will connect ${potential.length} new tools. Review permissions in next step?`,
            [
                {
                    text: "Detailed Review", onPress: () => {
                        // In a real app, queue them up. Here we just pick the first one for demo
                        const firstId = potential[0];
                        const toolkit = MOCK_TOOLKITS.find(t => t.id === firstId);
                        if (toolkit) {
                            setPendingToolkit(toolkit);
                            setModalVisible(true);
                        }
                    }
                },
                {
                    text: "Trust & Connect All", style: "default", onPress: () => {
                        const newSet = new Set(installedIds);
                        potential.forEach(id => newSet.add(id));
                        setInstalledIds(newSet);
                    }
                }
            ]
        );
    };

    // Components
    const PermissionHandshakeModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {pendingToolkit && (
                        <>
                            <View style={styles.modalHeader}>
                                <View style={styles.modalIconBg}>
                                    <PlatformIcon platform={pendingToolkit.platform as any} size={32} />
                                </View>
                                <Text style={styles.modalTitle}>Connect {pendingToolkit.name}</Text>
                            </View>

                            <ScrollView style={styles.scopeList}>
                                <Text style={styles.sectionLabel}>REQUESTED ACCESS</Text>
                                {pendingToolkit.scopes?.map(scope => (
                                    <View key={scope.id} style={styles.scopeItem}>
                                        <Ionicons
                                            name={'checkmark-circle'}
                                            size={20}
                                            color={colors.semantic.success}
                                            style={{ marginRight: spacing[3] }}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.scopeLabel}>{scope.label}</Text>
                                            <Text style={styles.scopeDesc}>{scope.description}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Text style={styles.disclaimer}>
                                    Aariv will use these permissions to act on your behalf.
                                </Text>
                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.cancelBtnText}>Deny</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.confirmBtn} onPress={confirmConnection}>
                                        <Text style={styles.confirmBtnText}>Authorize</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderToolkitItem = ({ item }: { item: Toolkit }) => {
        const isInstalled = installedIds.has(item.id);

        return (
            <View style={[styles.card, isInstalled && styles.cardConnected]}>
                <View style={[styles.iconContainer, isInstalled && styles.iconWrapperConnected]}>
                    <PlatformIcon platform={item.platform as any} size={24} />
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: isInstalled ? colors.semantic.success : colors.neutral[400] }]} />
                        <Text style={styles.statusText}>
                            {isInstalled ? 'Active' : 'Not Connected'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        isInstalled ? styles.actionButtonActive : styles.actionButtonInactive
                    ]}
                    onPress={() => initiateConnection(item)}
                >
                    <Text style={[
                        styles.actionButtonText,
                        isInstalled ? styles.actionButtonTextActive : styles.actionButtonTextInactive
                    ]}>
                        {isInstalled ? 'MANAGE' : 'CONNECT'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <PermissionHandshakeModal />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Toolkits</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing[24] }}>
                {/* Toolkits List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Toolkits</Text>
                    {filteredToolkits.map(item => (
                        <View key={item.id} style={{ marginBottom: spacing[4], paddingHorizontal: spacing[6] }}>
                            {renderToolkitItem({ item })}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Copilot Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                style={styles.copilotBarWrapper}
            >
                <View style={styles.copilotBar}>
                    <View style={styles.copilotInputContainer}>
                        <Ionicons name="sparkles" size={20} color={colors.primary[500]} style={styles.copilotIcon} />
                        <TextInput
                            style={styles.copilotInput}
                            placeholder="Ask Copilot regarding these tools..."
                            placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                        />
                        <TouchableOpacity style={styles.micButton}>
                            <Ionicons name="mic" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
        paddingTop: spacing[8],
        paddingBottom: spacing[4],
        justifyContent: 'space-between',
    },
    backButton: {
        padding: spacing[1], // xs
        marginRight: spacing[4], // md
    },
    headerTitle: {
        ...typography.textStyles.h2,
        color: colors.text,
        fontSize: 20,
    },
    headerSubtitle: {
        ...typography.textStyles.bodySmall, // body2
        color: colors.neutral[500], // gray[500]
        fontSize: 12,
    },
    filterButton: {
        padding: spacing[1], // xs
    },
    section: {
        marginTop: spacing[2], // sm
    },
    sectionTitle: {
        ...typography.textStyles.h3,
        color: colors.text,
        marginLeft: spacing[6], // lg
        marginBottom: spacing[4], // md
        fontSize: 18,
    },
    // Toolkit Card Styles
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? colors.surface : '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardConnected: {
        borderColor: colors.primary[500],
        backgroundColor: isDark ? colors.surface : colors.primary[50],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.lg,
        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[4],
    },
    iconWrapperConnected: {
        backgroundColor: isDark ? colors.primary[900] : colors.primary[100],
    },
    cardContent: {
        flex: 1,
        marginRight: spacing[2],
    },
    cardTitle: {
        ...typography.textStyles.h3,
        fontSize: 16,
        color: colors.text,
        marginBottom: spacing[1],
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        ...typography.textStyles.bodySmall,
        color: colors.textSecondary,
    },
    cardDesc: {
        ...typography.textStyles.bodySmall,
        color: colors.neutral[500],
        fontSize: 13,
    },
    actionButton: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.full,
        minWidth: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonInactive: {
        backgroundColor: colors.primary[500],
    },
    actionButtonActive: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionButtonTextInactive: {
        color: '#FFFFFF',
    },
    actionButtonTextActive: {
        color: colors.text,
    },
    // Permission Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing[8], // xl
        maxHeight: '80%',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: spacing[8], // xl
    },
    modalIconBg: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.xxl,
        backgroundColor: isDark ? '#2D3748' : '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[4], // md
    },
    modalTitle: {
        ...typography.textStyles.h2,
        color: colors.text,
        textAlign: 'center',
    },
    modalSubtitle: {
        ...typography.textStyles.bodySmall, // body2
        color: colors.neutral[500], // gray[500]
        textTransform: 'uppercase',
        marginTop: spacing[1],
        letterSpacing: 1,
    },
    sectionLabel: {
        ...typography.textStyles.caption,
        color: colors.neutral[500], // gray[500]
        marginBottom: spacing[4], // md
        fontWeight: 'bold',
    },
    scopeList: {
        marginBottom: spacing[8], // xl
    },
    scopeItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing[6], // lg
    },
    scopeLabel: {
        ...typography.textStyles.body, // body1
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing[1],
    },
    scopeDesc: {
        ...typography.textStyles.caption,
        color: colors.neutral[500], // gray[500]
    },
    riskTag: {
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.sm,
        marginLeft: spacing[2], // sm
    },
    riskText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalFooter: {
        paddingTop: spacing[4], // md
        borderTopWidth: 1,
        borderTopColor: isDark ? '#333' : '#E2E8F0',
    },
    disclaimer: {
        ...typography.textStyles.caption,
        color: colors.neutral[500], // gray[500]
        marginBottom: spacing[6], // lg
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing[4], // md
    },
    cancelBtn: {
        flex: 1,
        padding: spacing[4], // md
        borderRadius: borderRadius.md,
        backgroundColor: isDark ? '#333' : '#F1F5F9',
        alignItems: 'center',
    },
    cancelBtnText: {
        ...typography.textStyles.button,
        color: colors.text,
    },
    confirmBtn: {
        flex: 1,
        padding: spacing[4], // md
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[500],
        alignItems: 'center',
    },
    confirmBtnText: {
        ...typography.textStyles.button,
        color: '#FFFFFF',
    },
    // Copilot Bar
    copilotBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: isDark ? colors.border : '#E2E8F0',
    },
    copilotBar: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        paddingBottom: Platform.OS === 'ios' ? spacing[6] : spacing[3],
    },
    copilotInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#2D3748' : '#F1F5F9',
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing[4],
        height: 48,
    },
    copilotIcon: {
        marginRight: spacing[2],
    },
    copilotInput: {
        flex: 1,
        color: colors.text,
        ...typography.textStyles.body,
    },
    micButton: {
        padding: spacing[1],
    }
});
