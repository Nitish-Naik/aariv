import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme';

export const TodayPreparedScreen = () => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Section: Greeting (Quiet, Centered) */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Good evening, Siddhant.</Text>
                <Text style={styles.subGreeting}>I’ve prepared a few things for you.</Text>
            </View>

            {/* Middle Section: Empty State (Sparse) */}
            <View style={styles.content}>
                <Card style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                        No actions need your attention right now.
                    </Text>
                    <Text style={[styles.emptyText, { marginTop: 8, opacity: 0.5 }]}>
                        I’ll let you know when something matters.
                    </Text>
                </Card>
            </View>

            {/* Bottom Section: Floating Copilot Bar */}
            <View style={styles.bottomBarContainer}>
                <View style={styles.copilotBar}>
                    <View style={styles.copilotIcon}>
                        {/* Abstract Iris/Copilot Icon */}
                        <View style={styles.irisDot} />
                    </View>
                    <TextInput 
                        placeholder="Ask Iris…" 
                        placeholderTextColor={colors.textSecondary}
                        style={styles.copilotInput}
                    />
                    <Ionicons name="mic-outline" size={20} color={colors.textSecondary} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // Should appear Black in dark mode
        justifyContent: 'space-between',
    },
    header: {
        marginTop: spacing[8],
        alignItems: 'center',
        paddingHorizontal: spacing[6],
    },
    greeting: {
        fontSize: 24,
        fontWeight: '500', // Medium weight, not bold
        color: colors.text,
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: spacing[2],
    },
    subGreeting: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        fontWeight: '400',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
    },
    emptyCard: {
        width: '100%',
        paddingVertical: spacing[8],
        paddingHorizontal: spacing[6],
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB', // Very subtle
        borderWidth: 0, // No border for maximum quietness
    },
    emptyText: {
        color: colors.textSecondary,
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
    },
    bottomBarContainer: {
        padding: spacing[4],
        paddingBottom: spacing[4], // Adjust if tab bar is present
    },
    copilotBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF', // Slightly lighter than background
        borderRadius: 30,
        paddingHorizontal: spacing[4],
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    copilotIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[3],
    },
    irisDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: isDark ? '#6EE7B7' : '#059669', // Mint Brand Color
        shadowColor: isDark ? '#6EE7B7' : '#059669',
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    copilotInput: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
    }
});
