import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { borderRadius, spacing, typography } from '../theme';
import { MOCK_BUNDLES, MOCK_TOOLKITS, Toolkit, ToolkitBundle } from '../utils/mockToolkits';

export default function ToolkitsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [installedIds, setInstalledIds] = useState<Set<string>>(new Set(['1', '2', '6', '11']));
    const [modalVisible, setModalVisible] = useState(false);
    const [pendingToolkit, setPendingToolkit] = useState<Toolkit | null>(null);

    const categories = ['All', 'Productivity', 'Development', 'Communication', 'Finance', 'Design', 'Social'];

    const filteredToolkits = useMemo(() => {
        return MOCK_TOOLKITS.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    // Handlers
    const initiateConnection = (toolkit: Toolkit) => {
        if (installedIds.has(toolkit.id)) {
            // Disconnect flow remains simple
            Alert.alert("Sever Neural Link", `Disconnect ${toolkit.name}?`, [
                { text: "Cancel", style: "cancel"},
                { text: "Disconnect", style: "destructive", onPress: () => {
                    const newSet = new Set(installedIds);
                    newSet.delete(toolkit.id);
                    setInstalledIds(newSet);
                }}
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
        const potential = bundle.toolkitIds.filter(id => !installedIds.has(id));
        if (potential.length === 0) {
            Alert.alert("Already Optimized", "You have this full stack active.");
            return;
        }

        Alert.alert(
            `Activate ${bundle.title}?`, 
            `This will connect ${potential.length} new tools. Review permissions in next step?`,
            [
                { text: "Detailed Review", onPress: () => {
                    // In a real app, queue them up. Here we just pick the first one for demo
                    const firstId = potential[0];
                    const toolkit = MOCK_TOOLKITS.find(t => t.id === firstId);
                    if (toolkit) {
                        setPendingToolkit(toolkit);
                        setModalVisible(true);
                    }
                }},
                { text: "Trust & Connect All", style: "default", onPress: () => {
                   const newSet = new Set(installedIds);
                   potential.forEach(id => newSet.add(id));
                   setInstalledIds(newSet);
                }}
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
                                    <Ionicons name={pendingToolkit.icon as any} size={32} color={colors.primary[500]} />
                                </View>
                                <Text style={styles.modalTitle}>Connect {pendingToolkit.name}</Text>
                                <Text style={styles.modalSubtitle}>Permission Handshake</Text>
                            </View>

                            <ScrollView style={styles.scopeList}>
                                <Text style={styles.sectionLabel}>REQUESTED ACCESS</Text>
                                {pendingToolkit.scopes?.map(scope => (
                                    <View key={scope.id} style={styles.scopeItem}>
                                        <Ionicons 
                                            name={scope.riskLevel === 'critical' || scope.riskLevel === 'high' ? 'warning' : 'checkmark-circle'} 
                                            size={20} 
                                            color={getRiskColor(scope.riskLevel, isDark)} 
                                            style={{ marginRight: spacing[3] }}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.scopeLabel}>{scope.label}</Text>
                                            <Text style={styles.scopeDesc}>{scope.description}</Text>
                                        </View>
                                        <View style={[styles.riskTag, { backgroundColor: getRiskColor(scope.riskLevel, isDark) + '20' }]}>
                                            <Text style={[styles.riskText, { color: getRiskColor(scope.riskLevel, isDark) }]}>
                                                {scope.riskLevel.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <Text style={styles.disclaimer}>
                                    By connecting, you allow the Assistant to act on your behalf within these limits.
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

    const renderBundleItem = ({ item }: { item: ToolkitBundle }) => (
        <TouchableOpacity style={styles.bundleCard} onPress={() => installBundle(item)}>
            <View style={styles.bundleHeader}>
                <Ionicons name={item.icon as any} size={24} color={colors.text} />
                <View style={styles.savingsTag}>
                    <Text style={styles.savingsText}>{item.savings}</Text>
                </View>
            </View>
            <Text style={styles.bundleTitle}>{item.title}</Text>
            <Text style={styles.bundleDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.bundleFooter}>
                <Text style={styles.bundleCount}>{item.toolkitIds.length} Tools</Text>
                <Ionicons name="arrow-forward-circle" size={24} color={colors.primary[500]} />
            </View>
        </TouchableOpacity>
    );

    const renderToolkitItem = ({ item }: { item: Toolkit }) => {
        const isInstalled = installedIds.has(item.id);
        
        return (
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons name={item.icon as any} size={24} color={isDark ? '#FFF' : colors.primary[600]} />
                </View>
                
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        {item.isPremium && (
                            <View style={styles.premiumTag}>
                                <Text style={styles.premiumText}>PRO</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
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
                        {isInstalled ? 'ACTIVE' : 'ADD'}
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
                <View>
                    <Text style={styles.headerTitle}>Neural Marketplace</Text>
                    <Text style={styles.headerSubtitle}>865 Available Modules</Text>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing[25] }}>
                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search capabilities..."
                        placeholderTextColor={colors.neutral[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.hScrollContent}>
                    {categories.map((cat) => (
                        <TouchableOpacity 
                            key={cat} 
                            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Smart Bundles (Only show when not searching) */}
                {searchQuery === '' && selectedCategory === 'All' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Smart Bundles</Text>
                        <FlatList 
                            data={MOCK_BUNDLES}
                            renderItem={renderBundleItem}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing[6] }}
                            ItemSeparatorComponent={() => <View style={{ width: spacing[4] }} />}
                        />
                    </View>
                )}

                {/* Toolkits List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Individual Modules</Text>
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

function getRiskColor(level: string, isDark: boolean) {
    switch (level) {
        case 'critical': return '#ef4444'; // Red
        case 'high': return '#f97316'; // Orange
        case 'medium': return '#eab308'; // Yellow
        case 'low': return isDark ? '#94a3b8' : '#64748b'; // Slate
        default: return '#94a3b8';
    }
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
    searchContainer: {
        marginHorizontal: spacing[6], // lg
        marginVertical: spacing[4], // md
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? colors.surface : '#F1F5F9',
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing[4], // md
        height: 48,
        borderWidth: 1,
        borderColor: isDark ? colors.border : 'transparent',
    },
    searchIcon: {
        marginRight: spacing[2], // sm
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        ...typography.textStyles.body, // body1
    },
    hScroll: {
        maxHeight: 50,
        marginBottom: spacing[4], // md
    },
    hScrollContent: {
        paddingHorizontal: spacing[6], // lg
        alignItems: 'center',
    },
    catChip: {
        paddingHorizontal: spacing[6], // lg
        paddingVertical: spacing[1] + 2, // xs + 2
        borderRadius: borderRadius.xl,
        backgroundColor: isDark ? colors.surface : '#E2E8F0',
        marginRight: spacing[2], // sm
        borderWidth: 1,
        borderColor: isDark ? colors.border : 'transparent',
    },
    catChipActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    catText: {
        ...typography.textStyles.bodySmall, // body2
        color: colors.text,
        fontWeight: '600',
    },
    catTextActive: {
        color: '#FFFFFF',
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
    // Bundle Styles
    bundleCard: {
        width: 280,
        backgroundColor: isDark ? '#1E293B' : '#FFF',
        borderRadius: borderRadius.lg,
        padding: spacing[6], // lg
        borderWidth: 1,
        borderColor: isDark ? colors.border : '#E2E8F0',
        shadowColor: '#000',
        elevation: 2,
    },
    bundleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[4], // md
    },
    savingsTag: {
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
        paddingHorizontal: spacing[2], // sm
        paddingVertical: spacing[0.5],
        borderRadius: borderRadius.sm,
    },
    savingsText: {
        color: isDark ? '#4ADE80' : '#15803D',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    bundleTitle: {
        ...typography.textStyles.h3,
        color: colors.text,
        fontSize: 18,
        marginBottom: spacing[1],
    },
    bundleDesc: {
        ...typography.textStyles.bodySmall, // body2
        color: colors.neutral[500], // gray[500]
        marginBottom: spacing[6], // lg
        height: 40,
    },
    bundleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing[2], // sm
        borderTopWidth: 1,
        borderTopColor: isDark ? colors.border : '#F1F5F9',
    },
    bundleCount: {
        ...typography.textStyles.caption,
        color: colors.primary[500],
        fontWeight: 'bold',
    },
    // Toolkit Card Styles
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderRadius: borderRadius.lg,
        padding: spacing[4], // md
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E2E8F0',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: isDark ? '#2D3748' : '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[4], // md
    },
    cardContent: {
        flex: 1,
        marginRight: spacing[2], // sm
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[1],
    },
    cardTitle: {
        ...typography.textStyles.h3,
        fontSize: 16,
        color: colors.text,
        marginRight: spacing[2], // sm
    },
    premiumTag: {
        backgroundColor: isDark ? '#F59E0B20' : '#FEF3C7',
        paddingHorizontal: spacing[1.5],
        paddingVertical: spacing[0.5],
        borderRadius: borderRadius.sm,
    },
    premiumText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#D97706',
    },
    cardDesc: {
        ...typography.textStyles.bodySmall, // body2
        color: colors.neutral[500], // gray[500]
        fontSize: 13,
    },
    actionButton: {
        paddingHorizontal: spacing[4], // md
        paddingVertical: spacing[1] + 2, // xs+2
        borderRadius: borderRadius.xl,
        borderWidth: 1,
    },
    actionButtonActive: {
        backgroundColor: 'transparent',
        borderColor: colors.neutral[600], // gray[600]
    },
    actionButtonInactive: {
        backgroundColor: colors.primary[500],
        borderColor: 'transparent',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionButtonTextActive: {
        color: colors.neutral[500], // gray[500]
    },
    actionButtonTextInactive: {
        color: '#FFFFFF',
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
        marginBottom: spacing[0.5],
    },
    scopeDesc: {
        ...typography.textStyles.caption,
        color: colors.neutral[500], // gray[500]
    },
    riskTag: {
        paddingHorizontal: spacing[1.5],
        paddingVertical: spacing[0.5],
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
