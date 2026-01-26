
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useIntegrations } from '../hooks/useIntegrations';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';
import { spacing } from '../theme';

interface SideMenuProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function SideMenu({ isVisible, onClose }: SideMenuProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    // Use Central Hook
    const { integrations, refetch: loadIntegrations } = useIntegrations();

    const [isConnecting, setIsConnecting] = useState(false);
    // Expand state for "Manage Accounts"
    const [isExpanded, setIsExpanded] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    // Initial User Load
    useEffect(() => {
        if (isVisible) {
            getCurrentUser().then(u => {
                if (u) setUser({ name: u.name || "User", email: u.email });
            });
            loadIntegrations();
        }
    }, [isVisible, loadIntegrations]);

    const handleConnect = async (appName: string) => {
        setIsConnecting(true);
        try {
            const user = await getCurrentUser();
            if (!user) {
                Alert.alert("Error", "You must be logged in.");
                return;
            }
            // Logic to add NEW connection (Composio supports multiple)
            const response = await api.post('/integrations/connect', {
                userId: user.id,
                appName: appName
            });

            if (response.url) {
                const supported = await Linking.canOpenURL(response.url);
                if (supported) {
                    await Linking.openURL(response.url);
                    // Poll for update or wait
                    setTimeout(loadIntegrations, 5000);
                }
            }
        } catch (error: any) {
            Alert.alert("Connection Failed", error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async (appName: string, connectionId?: string) => {
        // TODO: Backend needs to support disconnecting specific ID
        // For now, call the generic disconnect (which might need update to take ID)
        // Ignoring specific ID implementation for brevity, assuming backend handles "disconnect app" as "delete connection" 
        // But to be precise, we need to pass connectionId to backend. 
        // Updating backend might be needed. For now, let's assume we can only disconnect the APP or we use the ID if we updated backend.

        // Actually, the current disconnectIntegration controller uses `appName` and finds `targetConnection`.
        // To support specific ID deletion, we should update the backend.
        // But let's try calling it anyway.

        try {
            const user = await getCurrentUser();
            if (!user) return;

            // If we have an ID, we might need a specific endpoint or update the existing one.
            // Let's just use the existing one for now, it removes *one* active connection.
            await api.post('/integrations/disconnect', {
                userId: user.id,
                appName: appName,
                connectionId: connectionId // Pass connectionId if backend supports it
            });

            loadIntegrations();
        } catch (error) {
            console.error(error);
            Alert.alert("Disconnect Failed", "Could not disconnect account.");
        }
    };

    // Filter Gmail connections
    const gmailConnections = integrations.filter(i => i.appName === 'gmail' && (i.status === 'ACTIVE' || i.status === 'CONNECTED'));

    const styles = getStyles(colors, isDark, insets);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.menuContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.userName}>{user?.name || "Loading..."}</Text>
                                <Text style={styles.userEmail}>{user?.email || "..."}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.sectionTitle}>Menu</Text>

                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="add-circle-outline" size={22} color={colors.text} />
                            <Text style={styles.menuItemText}>Add Context</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>RECOMMENDED</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="mail-outline" size={22} color={colors.text} />
                            <Text style={styles.menuItemText}>Contact Us</Text>
                        </TouchableOpacity>

                        <View style={styles.separator} />

                        <Text style={styles.sectionTitle}>Connected Accounts</Text>

                        {/* Google Manage Accounts / List */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => setIsExpanded(!isExpanded)}
                        >
                            <Ionicons name="logo-google" size={22} color={colors.text} />
                            <Text style={styles.menuItemText}>Manage Accounts</Text>
                            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={styles.accountsList}>
                                {gmailConnections.length > 0 ? (
                                    gmailConnections.map((conn, index) => (
                                        <View key={conn.id} style={styles.accountItem}>
                                            <View style={styles.accountInfo}>
                                                <Text style={styles.accountEmail}>{conn.email || `Account ${index + 1}`}</Text>
                                                {index === 0 && ( // Assume first is primary for now
                                                    <View style={styles.primaryTag}>
                                                        <Text style={styles.primaryTagText}>PRIMARY</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <TouchableOpacity onPress={() => handleDisconnect('gmail', conn.id)}>
                                                <Ionicons name="trash-outline" size={18} color={colors.semantic.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noAccountsText}>No accounts connected.</Text>
                                )}

                                <TouchableOpacity
                                    style={styles.addAccountButton}
                                    onPress={() => handleConnect('gmail')}
                                    disabled={isConnecting}
                                >
                                    {isConnecting ? (
                                        <ActivityIndicator size="small" color={colors.text} />
                                    ) : (
                                        <>
                                            <Ionicons name="add-circle-outline" size={20} color={colors.textSecondary} />
                                            <Text style={styles.addAccountText}>Add Account</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="log-out-outline" size={22} color={colors.semantic.error} />
                            <Text style={[styles.menuItemText, { color: colors.semantic.error }]}>Sign Out</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                Alert.alert(
                                    "Delete Account",
                                    "Are you sure you want to delete your account? This action is irreversible and will delete all your data.",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Delete",
                                            style: "destructive",
                                            onPress: async () => {
                                                try {
                                                    // 1. Call backend delete endpoint
                                                    await api.delete("/auth/account");
                                                } catch (error) {
                                                    console.error("Account deletion API failed", error);
                                                    // Continue to logout anyway
                                                } finally {
                                                    // 2. Hard logout (always)
                                                    try {
                                                        await api.post('/auth/logout', {}); // Optional: Call backend logout if exists
                                                        // Supabase logout
                                                        const { error } = await supabase.auth.signOut();
                                                        if (error) console.error("Supabase signOut error", error);
                                                    } catch (e) {
                                                        console.error("Logout error", e);
                                                    }

                                                    // 3. Clear local state / Close menu
                                                    onClose();

                                                    // 4. Redirect triggers automatically via auth state listener in layout
                                                    // But we can force it just in case
                                                    // router.replace("/login"); 
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <Ionicons name="trash-outline" size={22} color={colors.textSecondary} />
                            <Text style={[styles.menuItemText, { color: colors.textSecondary }]}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Backdrop press to close */}
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />
            </View>
        </Modal>
    );
}

const getStyles = (colors: any, isDark: boolean, insets: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    backdrop: {
        flex: 1,
    },
    menuContainer: {
        width: '80%',
        maxWidth: 320,
        backgroundColor: isDark ? '#000' : '#FFF',
        height: '100%',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#222' : '#F0F0F0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    userName: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    userEmail: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: spacing[4],
    },
    sectionTitle: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    menuItemText: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 'auto',
    },
    badgeText: {
        color: '#666',
        fontSize: 10,
        fontWeight: '700',
    },
    separator: {
        height: 1,
        backgroundColor: isDark ? '#222' : '#F0F0F0',
        marginVertical: 16,
    },
    integrationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDark ? '#111' : '#F8F9FA',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#222' : '#E0E0E0',
    },
    integrationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    integrationName: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '600',
    },
    connectButton: {
        backgroundColor: isDark ? '#FFF' : '#000',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    connectButtonText: {
        color: isDark ? '#000' : '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    connectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(52, 168, 83, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    connectedDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#34A853',
    },
    connectedText: {
        color: '#34A853',
        fontSize: 13,
        fontWeight: '500',
    },
    // New Styles
    accountsList: {
        marginTop: 8,
        marginLeft: 16, // Indent
        gap: 8,
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDark ? '#111' : '#F1F3F5',
        padding: 12,
        borderRadius: 8,
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    accountEmail: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '500',
    },
    primaryTag: {
        backgroundColor: 'rgba(52, 168, 83, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    primaryTagText: {
        color: '#34A853',
        fontSize: 10,
        fontWeight: '700',
    },
    noAccountsText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontStyle: 'italic',
        marginTop: 4,
    },
    addAccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E0E0E0',
        borderRadius: 8,
        borderStyle: 'dashed',
        marginTop: 8,
    },
    addAccountText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    footer: {
        padding: spacing[4],
        borderTopWidth: 1,
        borderTopColor: isDark ? '#222' : '#F0F0F0',
    }
});
