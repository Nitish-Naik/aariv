import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback } from "react";
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useIntegrations } from "../hooks/useIntegrations";
import { api } from "../services/api";
import { getCurrentUser } from "../services/auth";
import { spacing, typography } from "../theme";
import { setOnboardingComplete } from "../utils/onboarding";

const DEEP_LINK_SCHEME = 'aariv://';

export default function OnboardingScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const [userId, setUserId] = React.useState<string | null>(null);
    const { integrations, loading, refetch } = useIntegrations(userId || undefined);
    const [isConnecting, setIsConnecting] = React.useState(false);

    // Get current user on mount
    React.useEffect(() => {
        getCurrentUser().then(user => {
            if (user) setUserId(user.id);
        });
    }, []);

    // Poll for connection status and navigate when Gmail is connected
    useFocusEffect(
        useCallback(() => {
            const poll = async () => {
                const fetchedIntegrations = await refetch();
                console.log('📊 Fetched integrations:', fetchedIntegrations);

                // Handle different toolkit slug formats (gmail, GMAIL, googlemail, etc.)
                const hasGmail = fetchedIntegrations?.some(i => {
                    const appNameLower = i.appName?.toLowerCase() || '';
                    const isGmailConnected = (appNameLower.includes('gmail') || appNameLower === 'googlemail')
                        && i.status === 'ACTIVE';
                    console.log(`🔍 Checking ${i.appName}: ${isGmailConnected ? '✅' : '❌'}`);
                    return isGmailConnected;
                });

                if (hasGmail) {
                    console.log('✅ Gmail detected! Navigating to main app...');
                    await setOnboardingComplete();
                    router.replace("/(tabs)"); // Navigate to main app
                }
            };
            poll();
        }, [refetch, router])
    );

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const user = await getCurrentUser();
            if (!user) return;

            const response = await api.post('/integrations/connect', {
                userId: user.id,
                appName: 'gmail',
                platform: Platform.OS === 'web' ? 'web' : 'mobile'
            });

            if (response.url) {
                if (Platform.OS === 'web') {
                    // On web, use a full redirect to avoid cross-origin policy issues.
                    Linking.openURL(response.url);
                } else {
                    // On mobile, use the in-app browser for a better UX.
                    await WebBrowser.openAuthSessionAsync(response.url, DEEP_LINK_SCHEME);
                }
                // After returning, the useFocusEffect will handle checking the connection status.
            }
        } catch (error) {
            console.error("Connect failed", error);
        } finally {
            setIsConnecting(false);
        }
    };

    // The rest of the component remains the same
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="link" size={48} color={colors.primary[500]} />
                    </View>
                    <Text style={styles.title}>Connect Your World</Text>
                    <Text style={styles.subtitle}>
                        To be your Neural Companion, Aariv needs access to your communications.
                    </Text>
                    <Text style={styles.description}>
                        Please connect your **Google Account** to continue.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.connectButton}
                        onPress={handleConnect}
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <ActivityIndicator color={isDark ? '#000' : '#FFF'} />
                        ) : (
                            <>
                                <Ionicons name="logo-google" size={24} color={isDark ? '#000' : '#FFF'} />
                                <Text style={styles.connectButtonText}>Connect Google</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.disclaimer}>
                        Powered by Composio. Your data is secure.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: spacing[6],
        justifyContent: 'space-between',
        paddingVertical: spacing[12],
    },
    header: {
        alignItems: 'center',
        marginTop: spacing[8],
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: isDark ? 'rgba(5, 150, 105, 0.1)' : '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[6],
    },
    title: {
        ...typography.textStyles.h1,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing[4],
    },
    subtitle: {
        ...typography.textStyles.h3,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing[4],
        fontWeight: 'normal',
    },
    description: {
        ...typography.textStyles.body,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: '80%',
    },
    footer: {
        width: '100%',
        gap: spacing[4],
    },
    connectButton: {
        backgroundColor: colors.primary[500],
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[3],
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    connectButtonText: {
        color: isDark ? '#000' : '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    disclaimer: {
        textAlign: 'center',
        color: colors.textTertiary,
        fontSize: 12,
    }
});
