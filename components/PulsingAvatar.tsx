import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PulsingAvatarProps {
    isThinking: boolean;
    size?: number;
}

export const PulsingAvatar = ({ isThinking, size = 32 }: PulsingAvatarProps) => {
    const { colors } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isThinking) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
            pulseAnim.stopAnimation();
        }
    }, [isThinking, pulseAnim]);

    const pulseOpacity = pulseAnim.interpolate({
        inputRange: [1, 1.2],
        outputRange: [0.3, 0],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {isThinking && (
                <Animated.View
                    style={[
                        styles.pulse,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: colors.primary[500],
                            transform: [{ scale: pulseAnim }],
                            opacity: pulseOpacity,
                        },
                    ]}
                />
            )}
            <View
                style={[
                    styles.avatar,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: colors.primary[500],
                    },
                ]}
            >
                <Ionicons name="sparkles" size={size * 0.5} color="#FFF" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    pulse: {
        position: 'absolute',
        zIndex: 1,
    },
});
