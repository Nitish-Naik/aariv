import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { getCurrentUser } from '../../services/auth';
import { spacing, typography } from '../../theme';
import type { ChatMessage } from '../../types';
import { MarkdownText } from '../components/MarkdownText';

export default function AssistantScreen() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [connectedApps, setConnectedApps] = useState<string[]>([]); // Define state here

    useEffect(() => {
        // Initialize with a welcome message
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Hello! I am Aariv, your productivity assistant. How can I help you today?',
                timestamp: new Date()
            }
        ]);

        getCurrentUser().then(u => {
            if (u) setUserId(u.id);
        });
    }, []);

    const handleSend = async () => {
        if (!inputText.trim() || !userId) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const res = await api.post('/chat', {
                userId,
                message: userMessage.content
            });

            const assistantMessage: ChatMessage = {
                id: Date.now().toString() + '_ai',
                role: 'assistant',
                content: res.response || "I processed that, but have no specific response.",
                timestamp: new Date(),
                actions: res.actions, // Optional actions if returned
                auth_actions: res.auth_actions,
                logs: res.logs
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (e: any) {
            const errorMessage: ChatMessage = {
                id: Date.now().toString() + '_error',
                role: 'assistant',
                content: "Sorry, I encountered an error: " + (e.message || "Unknown error"),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Move renderMessage INSIDE component to access connectedApps and colors
    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.assistantBubble
            ]}>
                {!isUser && (
                    <View style={styles.avatarContainer}>
                        <Ionicons name="sparkles" size={16} color="#FFF" />
                    </View>
                )}
                <View style={[
                    styles.messageContent,
                    isUser ? styles.userContent : styles.assistantContent
                ]}>

                    {/* Render Logs (Thinking Process) */}
                    {item.logs && item.logs.length > 0 && (
                        <View style={{ marginBottom: 8, gap: 4 }}>
                            {item.logs.map((log, idx) => (
                                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="checkmark-circle" size={14} color={(colors as any).success || '#4CAF50'} />
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                                        {log.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Message Content with Markdown Support */}
                    {isUser ? (
                        <Text style={styles.userText}>{item.content}</Text>
                    ) : (
                        <MarkdownText content={item.content} />
                    )}

                    {/* Render Auth Actions if available */}
                    {item.auth_actions && item.auth_actions.length > 0 && (
                        <View style={{ marginTop: 12, gap: 8 }}>
                            {item.auth_actions.map((action, idx) => {
                                const isConnected = connectedApps.includes(action.appName.toLowerCase()) ||
                                    connectedApps.some(ca => action.appName.toLowerCase().includes(ca));

                                return (
                                    <View key={idx} style={styles.authCard}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                            <View style={styles.authIconPlaceholder}>
                                                <Text style={styles.authIconText}>{action.appName[0]}</Text>
                                            </View>
                                            <Text style={styles.authCardTitle}>
                                                {isConnected ? `Connected to ${action.appName}` : `Connect to ${action.appName}`}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.connectButton, isConnected && { backgroundColor: (colors as any).success || '#4CAF50', opacity: 0.8 }]}
                                            onPress={() => !isConnected && Linking.openURL(action.url)}
                                            disabled={isConnected}
                                        >
                                            <Text style={styles.connectButtonText}>
                                                {isConnected ? 'Active' : 'Connect'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Assistant</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {loading && (
                <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={colors.primary[500]} />
                    <Text style={styles.typingText}>Aariv is thinking...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask anything..."
                        placeholderTextColor={colors.textTertiary}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Ionicons name="send" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        ...typography.textStyles.h3,
        color: colors.text,
    },
    listContent: {
        padding: spacing[4],
        gap: spacing[4],
    },
    messageBubble: {
        flexDirection: 'row',
        marginBottom: spacing[2],
        alignItems: 'flex-end',
    },
    userBubble: {
        justifyContent: 'flex-end',
    },
    assistantBubble: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[2],
        marginBottom: 4,
    },
    messageContent: {
        maxWidth: '80%',
        padding: spacing[3],
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    userContent: {
        backgroundColor: colors.primary[500],
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 4,
    },
    assistantContent: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#FFF',
    },
    assistantText: {
        color: colors.text,
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        gap: spacing[2],
    },
    typingText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing[4],
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        gap: spacing[3],
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: colors.background,
        borderRadius: 22,
        paddingHorizontal: spacing[4],
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    // Auth Card Styles
    authCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing[3],
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    authIconPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authIconText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    authCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    connectButton: {
        backgroundColor: isDark ? '#FFF' : '#000',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    connectButtonText: {
        color: isDark ? '#000' : '#FFF',
        fontSize: 13,
        fontWeight: '600',
    }
});
