import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import { MOCK_TOOLKITS, Toolkit } from '../utils/mockToolkits';

export default function ToolkitsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [installedIds, setInstalledIds] = useState<Set<string>>(new Set(['1', '2', '6', '11']));

    const categories = ['All', 'Productivity', 'Development', 'Communication', 'Finance', 'Design', 'Social'];

    const filteredToolkits = useMemo(() => {
        return MOCK_TOOLKITS.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const handleToggleInstall = (id: string, name: string) => {
        if (installedIds.has(id)) {
            Alert.alert("Disconnect Neural Link", `Sever connection to ${name}?`, [
                { text: "Cancel", style: "cancel"},
                { text: "Disconnect", style: "destructive", onPress: () => {
                    const newSet = new Set(installedIds);
                    newSet.delete(id);
                    setInstalledIds(newSet);
                }}
            ]);
        } else {
            // Simulate Installing
            const newSet = new Set(installedIds);
            newSet.add(id);
            setInstalledIds(newSet);
        }
    };

    const renderItem = ({ item }: { item: Toolkit }) => {
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
                    onPress={() => handleToggleInstall(item.id, item.name)}
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Neural Expansion</Text>
                    <Text style={styles.headerSubtitle}>{MOCK_TOOLKITS.length} modules available</Text>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search modules..."
                    placeholderTextColor={colors.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Categories */}
            <View>
                <FlatList
                    horizontal
                    data={categories}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item && styles.categoryTextActive
                            ]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Main List */}
            <FlatList
                data={filteredToolkits}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No modules found matching neural pattern.</Text>
                    </View>
                }
            />
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
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
        gap: spacing[4],
    },
    backButton: {
        padding: spacing[2],
    },
    headerTitle: {
        ...typography.textStyles.h3,
        color: colors.text,
    },
    headerSubtitle: {
        ...typography.textStyles.caption,
        color: colors.textSecondary,
    },
    searchContainer: {
        marginHorizontal: spacing[4],
        marginBottom: spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: spacing[4],
        height: 48,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
    },
    searchIcon: {
        marginRight: spacing[2],
    },
    searchInput: {
        flex: 1,
        color: colors.text,
        height: '100%',
        fontSize: 16,
    },
    categoryList: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
        gap: spacing[2],
    },
    categoryChip: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryChipActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: colors.primary[500],
    },
    categoryText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    categoryTextActive: {
        color: colors.primary[400],
    },
    listContent: {
        padding: spacing[4],
        paddingTop: 0,
        gap: spacing[3],
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#111' : '#FFF', // Slightly Lighter black for cards
        padding: spacing[4],
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[4],
    },
    cardContent: {
        flex: 1,
        marginRight: spacing[2],
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 2,
        gap: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    cardDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    premiumTag: {
        backgroundColor: isDark ? '#F59E0B' : '#F59E0B',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
    },
    premiumText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#000',
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    actionButtonActive: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    actionButtonInactive: {
        backgroundColor: colors.primary[600],
    },
    actionButtonText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    actionButtonTextActive: {
        color: colors.semantic.success,
    },
    actionButtonTextInactive: {
        color: '#FFF',
    },
    emptyState: {
        padding: spacing[8],
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textTertiary,
        fontStyle: 'italic',
    }
});
