import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';
import { PlatformIcon } from './PlatformIcon';

interface StatusLogCardProps {
    label: string;
    status: string;
    tool?: string;
    minimal?: boolean;
}

export const StatusLogCard = ({ label, status, tool, minimal }: StatusLogCardProps) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark, minimal);

    const isSuccess = status.toLowerCase() === 'completed' || status.toLowerCase() === 'success';

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.leftSection}>
                    <View style={styles.iconContainer}>
                        {tool ? (
                            <PlatformIcon platform={tool} size={minimal ? 16 : 20} />
                        ) : (
                            <Ionicons name="settings-outline" size={minimal ? 14 : 18} color={colors.textSecondary} />
                        )}
                    </View>
                    <Text style={styles.label} numberOfLines={1}>{label}</Text>
                </View>

                <View style={styles.rightSection}>
                    {isSuccess ? (
                        <LottieView
                            source={{ uri: 'https://lottie.host/4e0f6b4d-1a86-4f9e-bd71-e2a2e3796f64/x55iGfS5x7.json' }}
                            autoPlay
                            loop={false}
                            style={styles.lottieIcon}
                        />
                    ) : (
                        <LottieView
                            source={{ uri: 'https://lottie.host/9e4d075d-3d07-4e6a-8b8a-b8a7b93a3848/lKx4Q1z8R0.json' }}
                            autoPlay
                            loop
                            style={styles.lottieLoading}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors: any, isDark: boolean, minimal?: boolean) => StyleSheet.create({
    container: {
        backgroundColor: minimal ? 'transparent' : (isDark ? colors.neutral[900] : colors.neutral[100]),
        borderRadius: borderRadius.lg,
        paddingHorizontal: minimal ? 0 : spacing[4],
        paddingVertical: minimal ? 4 : spacing[3],
        marginVertical: minimal ? 0 : 4,
        borderWidth: minimal ? 0 : 1,
        borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: spacing[3],
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        ...typography.textStyles.bodySmall,
        color: colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    rightSection: {
        marginLeft: spacing[2],
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lottieIcon: {
        width: 28,
        height: 28,
    },
    lottieLoading: {
        width: 20,
        height: 20,
    },
    loadingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary[500],
        opacity: 0.6,
    }
});
