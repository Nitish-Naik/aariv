
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface OnboardingOverlayProps {
    isVisible: boolean;
    onComplete: () => void;
    currentStep: number;
    onNextStep: () => void;
    onSkip: () => void;
}

const STEPS = [
        {
            id: 1,
            title: "Side Menu",
            description: "Access your profile, settings, and manage connected accounts from here.",
            target: { top: 60, left: 20 }, // Approximate position of hamburger
        },
        {
            id: 2,
            title: "Connect Your Apps",
            description: "Connect your Calendar and Gmail via our SOC compliant connection provider. Iris never modifies your inbox or calendar without asking for your confirmation.",
            target: { top: 180, left: 20 }, // Approximate position of connected accounts in menu
        },
        {
            id: 3,
            title: "Ask Iris Anything",
            description: "Tap here to speak to Iris, your personalized assistant. Schedule meetings, send emails, get answers, and manage your day all in one place.",
            target: { bottom: 100, left: 20, right: 20 }, // Input area
        },
        {
            id: 4,
            title: "Send Your First Message",
            description: "We've prepared a message for you. Click send to see Iris in action!",
            target: { bottom: 80, right: 20 }, // Send button
        }
    ];

export default function OnboardingOverlay({ isVisible, onComplete, currentStep, onNextStep, onSkip }: OnboardingOverlayProps) {
    const { colors, isDark } = useTheme();

    if (!isVisible) return null;

    const step = STEPS[currentStep];

    const styles = getStyles(colors, isDark);

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.container}>
                {/* Dark Backdrop with Hole Punch effect simulated by multiple views would be complex.
                    For simplicity, we use a semi-transparent background and position the card.
                 */}

                {/* Step Content Card */}
                <View style={[
                    styles.card,
                    step.target.top ? { top: step.target.top + 50 } : undefined,
                    step.target.bottom ? { bottom: step.target.bottom + 120 } : undefined,
                ]}>
                    <View style={styles.header}>
                        <Text style={styles.stepIndicator}>{currentStep + 1} / {STEPS.length}</Text>
                        <TouchableOpacity onPress={onSkip}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>{step.title}</Text>
                    <Text style={styles.description}>{step.description}</Text>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={currentStep === STEPS.length - 1 ? onComplete : onNextStep}
                        >
                            <Text style={styles.nextButtonText}>
                                {currentStep === STEPS.length - 1 ? "Done" : "Next ->"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Highlight Box Simulation (Visual Cue) */}
                {step.target && (
                    <View style={[
                        styles.highlightBox,
                        {
                            top: step.target.top,
                            left: step.target.left,
                            bottom: step.target.bottom,
                            right: step.target.right,
                        }
                    ]} />
                )}
            </View>
        </Modal>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    card: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: isDark ? '#111' : '#FFF',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    stepIndicator: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    skipText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    title: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    description: {
        color: colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    footer: {
        alignItems: 'flex-end',
    },
    nextButton: {
        backgroundColor: isDark ? '#333' : '#F0F0F0',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    nextButtonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    highlightBox: {
        position: 'absolute',
        // width: 60,
        // height: 60,
        borderColor: '#FFF',
        borderWidth: 2,
        borderRadius: 12,
        // Using explicit props from target
        width: 100, // Default width if not stretched
        height: 60, // Default height
        borderStyle: 'dashed',
    }
});
