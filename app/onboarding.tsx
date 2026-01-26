import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useIntegrations } from "../hooks/useIntegrations";
import { api } from "../services/api";
import { getCurrentUser } from "../services/auth";
import { spacing, typography } from "../theme";

export default function OnboardingScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const { integrations, isLoading, refetch } = useIntegrations();
    const [isConnecting, setIsConnecting] = React.useState(false);

    // Auto-refresh when returning from browser (Deep Link)
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Check if we can proceed
    useEffect(() => {
        if (!isLoading && integrations.length > 0) {
            const hasGmail = integrations.some(i => i.appName === 'gmail' && (i.status === 'ACTIVE' || i.status === 'CONNECTED'));
            if (hasGmail) {
                // router.replace("/(tabs)");
                // Keep manual proceed or auto?
                // Let's stick to router replace if they are connected
                router.replace("/(tabs)");
            }
        }
    }, [integrations, isLoading]);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const user = await getCurrentUser();
            if (!user) return;

            const response = await api.post('/integrations/connect', {
                userId: user.id,
                appName: 'gmail' // Force Gmail as primary first step
            });

            if (response.url) {
                const supported = await Linking.canOpenURL(response.url);
                if (supported) {
                    await Linking.openURL(response.url);
                    // We rely on useIntegrations polling or focus effect to pick up the change
                    // But let's trigger a refetch after a delay
                    setTimeout(refetch, 3000);
                }
            }
        } catch (error) {
            console.error("Connect failed", error);
        } finally {
            setIsConnecting(false);
        }
    };

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
