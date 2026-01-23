import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme';

interface FloatingCopilotBarProps {
    onTextSubmit?: (text: string) => void;
    onVoicePress?: () => void;
}

export const FloatingCopilotBar: React.FC<FloatingCopilotBarProps> = ({
    onTextSubmit,
    onVoicePress,
}) => {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const [inputValue, setInputValue] = React.useState('');
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulsing animation for the mint dot
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    const handleVoicePress = () => {
        if (onVoicePress) {
            onVoicePress();
        } else {
            router.push('/voice-mode');
        }
    };

    const handleSubmit = () => {
        if (inputValue.trim()) {
            if (onTextSubmit) {
                onTextSubmit(inputValue);
            }
            setInputValue('');
            Keyboard.dismiss();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.wrapper}
            pointerEvents="box-none"
        >
            <View style={[styles.container, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                <View style={styles.inputContainer}>
                    {/* Pulsing Mint Dot - AI Presence Indicator */}
                    <Animated.View
                        style={[
                            styles.irisDot,
                            {
                                transform: [{ scale: pulseAnim }],
                            },
                        ]}
                    />

                    {/* Text Input */}
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Ask Iris..."
                        placeholderTextColor={colors.textSecondary}
                        value={inputValue}
                        onChangeText={setInputValue}
                        onSubmitEditing={handleSubmit}
                        returnKeyType="send"
                    />

                    {/* Mic Button */}
                    <TouchableOpacity
                        style={styles.micButton}
                        onPress={handleVoicePress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="mic" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 90, // Above tab bar
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 30,
        padding: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[3],
        height: 44,
    },
    irisDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#059669', // Mint green
        marginRight: spacing[3],
        shadowColor: '#059669',
        shadowOpacity: 0.6,
        shadowRadius: 6,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '400',
    },
    micButton: {
        padding: spacing[2],
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 100,
        marginLeft: spacing[2],
    },
});
