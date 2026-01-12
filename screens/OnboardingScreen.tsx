import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        title: 'I work quietly in the background.',
        lines: [
            'I observe how you plan and reply.',
            'I prepare the next best actions.',
            'Nothing happens unless you approve.'
        ],
        icon: 'glasses-outline',
        cta: 'That sounds good'
    },
    {
        id: '2',
        title: 'You stay in control. Always.',
        lines: [
            'Every action is reviewed by you.',
            'Your data is encrypted and auto-forgotten.',
            'You can disconnect anytime.'
        ],
        trustBadges: [
            { icon: 'lock-closed-outline', text: 'Encrypted' },
            { icon: 'trash-outline', text: 'Auto-cleanup' },
            { icon: 'hand-left-outline', text: 'Human-approved' }
        ],
        icon: 'shield-checkmark-outline',
        cta: 'Show me'
    },
    {
        id: '3',
        title: 'Let\'s start with your calendar.',
        lines: [
            'I\'ll use it to understand your day',
            'and suggest better timing — nothing more.'
        ],
        icon: 'calendar-outline',
        cta: 'Connect Google Calendar',
        secondaryCta: 'I\'ll do this later' // Text link
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    // Force dark mode for onboarding to match "11 PM friendly" vibe
    const styles = getStyles(colors, true); 
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<Animated.FlatList<any>>(null);

    const handleNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Action for the final button (Google Calendar Connect)
            // In a real flow, this would trigger auth
            // For now, we go to the "Today Prepared" screen (which is our main tabs)
            router.replace('/(tabs)');
        }
    };

    const handleSkip = () => {
        // "I'll do this later"
        router.replace('/(tabs)');
    };

    const renderItem = ({ item, index }: { item: typeof ONBOARDING_DATA[0], index: number }) => {
        return (
            <View style={{ width, alignItems: 'center', justifyContent: 'center', padding: spacing[6] }}>
                <View style={styles.iconContainer}>
                    <Ionicons name={item.icon as any} size={48} color={colors.primary[400]} style={{ opacity: 0.8 }} />
                </View>

                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.linesContainer}>
                    {item.lines.map((line, i) => (
                        <Text key={i} style={styles.lineText}>{line}</Text>
                    ))}
                </View>

                {item.trustBadges && (
                    <View style={styles.badgesContainer}>
                        {item.trustBadges.map((badge, i) => (
                            <View key={i} style={styles.badge}>
                                <Ionicons name={badge.icon as any} size={14} color={colors.textSecondary} />
                                <Text style={styles.badgeText}>{badge.text}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.FlatList
                ref={slidesRef}
                data={ONBOARDING_DATA}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={32}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={useRef(({ viewableItems }: any) => {
                    if (viewableItems[0]) {
                        setCurrentIndex(viewableItems[0].index);
                    }
                }).current}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                renderItem={renderItem}
            />

            {/* Bottom Actions */}
            <View style={styles.footer}>
                {/* Dots Indicator */}
                <View style={styles.dotsContainer}>
                    {ONBOARDING_DATA.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
                    })}
                </View>

                <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>{ONBOARDING_DATA[currentIndex].cta}</Text>
                </TouchableOpacity>

                {currentIndex === ONBOARDING_DATA.length - 1 && (
                     <TouchableOpacity onPress={handleSkip} style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>I'll do this later</Text>
                     </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Quiet Black
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: spacing[6],
        letterSpacing: -0.5,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[6],
    },
    linesContainer: {
        gap: spacing[2],
        marginBottom: spacing[6],
    },
    lineText: {
        fontSize: 18,
        color: '#9CA3AF', // Gray-400
        textAlign: 'center',
        lineHeight: 28,
        fontWeight: '400',
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: spacing[3],
        justifyContent: 'center',
        marginTop: spacing[2],
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    badgeText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    
    // Footer
    footer: {
        padding: spacing[6],
        paddingBottom: spacing[8],
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: spacing[6],
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    primaryButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        padding: spacing[2],
    },
    secondaryButtonText: {
        color: '#6B7280', // Gray-500, very subtle
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
