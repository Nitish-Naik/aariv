import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
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
import { ActionReviewCard, PulsingAvatar, StatusLogCard } from '../../components';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { getCurrentUser } from '../../services/auth';
import { borderRadius, spacing, typography } from '../../theme';
import type { ActionItem, ChatMessage } from '../../types';
import { MarkdownText } from '../components/MarkdownText';

export default function AssistantScreen() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        // Proactive Notification Stream
        const controller = new AbortController();
        const startNotificationStream = async () => {
            console.log(`[SSE] Starting notification stream for user: ${userId}`);
            try {
                // Using standard fetch for SSE
                const response = await fetch(`${api.getBaseUrl()}/notifications/${userId}`, {
                    signal: controller.signal
                });

                if (!response.body) {
                    console.error('[SSE] No response body for notifications');
                    return;
                }
                console.log('[SSE] Notification stream established');
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulated = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log('[SSE] Notification stream closed');
                        break;
                    }

                    accumulated += decoder.decode(value, { stream: true });
                    const parts = accumulated.split('\n\n');
                    accumulated = parts.pop() || '';

                    for (const part of parts) {
                        if (part.startsWith('data: ')) {
                            try {
                                const rawData = part.substring(6);
                                console.log('[SSE] Notification received:', rawData);
                                const event = JSON.parse(rawData);
                                if (event.type === 'proactive_summary') {
                                    setMessages(prev => [
                                        ...prev,
                                        {
                                            id: event.data.id || Date.now().toString(),
                                            role: 'assistant',
                                            content: event.data.content,
                                            timestamp: new Date(event.data.timestamp),
                                            is_proactive: true
                                        }
                                    ]);
                                }
                            } catch (err) {
                                console.error('Failed to parse notification event:', err);
                            }
                        }
                    }
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.error('Notification stream error:', e);
                    // Retry after 5 seconds
                    setTimeout(startNotificationStream, 5000);
                }
            }
        };

        startNotificationStream();
        return () => controller.abort();
    }, [userId]);

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

        const aiMessageId = Date.now().toString() + '_ai';
        const initialAiMessage: ChatMessage = {
            id: aiMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            logs: []
        };

        setMessages(prev => [...prev, userMessage, initialAiMessage]);
        setInputText('');
        setLoading(true);

        try {
            const response = await api.stream('/chat', {
                userId,
                message: userMessage.content
            });

            if (!response.body) throw new Error('No response body from server');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                accumulated += decoder.decode(value, { stream: true });

                const parts = accumulated.split('\n\n');
                accumulated = parts.pop() || '';

                for (const part of parts) {
                    if (part.startsWith('data: ')) {
                        try {
                            const eventData = part.substring(6);
                            const event = JSON.parse(eventData);

                            setMessages(prev => prev.map(msg => {
                                if (msg.id === aiMessageId) {
                                    if (event.type === 'log') {
                                        const newLogs = [...(msg.logs || [])];
                                        // Update existing log if label matches, or if it's a transition from Running to Completed
                                        const existingIdx = newLogs.findIndex(l =>
                                            l.label === event.data.label ||
                                            (l.label.startsWith('Thinking:') && event.data.label.startsWith('Completed:') &&
                                                l.label.split(':')[1] === event.data.label.split(':')[1])
                                        );

                                        if (existingIdx >= 0) {
                                            newLogs[existingIdx] = event.data;
                                        } else {
                                            newLogs.push(event.data);
                                        }
                                        return { ...msg, logs: newLogs };
                                    } else if (event.type === 'auth_required') {
                                        const newAuthActions = [...(msg.auth_actions || [])];
                                        // Avoid duplicates
                                        if (!newAuthActions.some(a => a.url === event.data.url)) {
                                            newAuthActions.push(event.data);
                                        }
                                        return { ...msg, auth_actions: newAuthActions };
                                    } else if (event.type === 'result') {
                                        return {
                                            ...msg,
                                            content: event.data.response,
                                            auth_actions: event.data.auth_actions?.length > 0 ? event.data.auth_actions : msg.auth_actions,
                                            logs: event.data.logs || msg.logs,
                                        };
                                    } else if (event.type === 'error') {
                                        return { ...msg, content: `Error: ${event.data}` };
                                    }
                                }
                                return msg;
                            }));
                        } catch (e) {
                            console.error('Failed to parse SSE line:', part, e);
                        }
                    }
                }
            }
        } catch (e: any) {
            console.error('Chat error:', e);
            const errorMessage = "Sorry, I encountered an error: " + (e.message || "Unknown error");
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, content: errorMessage } : msg
            ));
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isUser = item.role === 'user';
        const isThinking = !item.content && (item.logs?.length || 0) > 0;

        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.assistantBubble
            ]}>
                {!isUser && (
                    <View style={styles.avatarContainer}>
                        <PulsingAvatar isThinking={isThinking} size={32} />
                    </View>
                )}
                <View style={[
                    styles.messageContent,
                    isUser ? styles.userContent : styles.assistantContent,
                    item.is_proactive && styles.proactiveContent
                ]}>
                    {item.is_proactive && (
                        <View style={styles.proactiveBadge}>
                            <Ionicons name="flash" size={12} color="#FFD700" />
                            <Text style={styles.proactiveBadgeText}>PROACTIVE SUMMARY</Text>
                        </View>
                    )}

                    {/* Render Logs (Thinking Process) - Minimal Inline Style */}
                    {item.logs && item.logs.length > 0 && (
                        <View style={{ marginBottom: item.content ? 12 : 0, gap: 2 }}>
                            {item.logs.map((log, idx) => {
                                // Only show physical cards for completed/historic logs if message has content
                                // Otherwise if thinking, show all in minimal mode
                                const isLatest = idx === item.logs!.length - 1;
                                if (!item.content || isLatest) {
                                    return (
                                        <StatusLogCard
                                            key={idx}
                                            label={log.label}
                                            status={log.status || 'completed'}
                                            tool={log.tool}
                                            minimal={true}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </View>
                    )}

                    {/* Render Tool Actions for Approval */}
                    {item.actions && item.actions.length > 0 && (
                        <View style={{ marginBottom: 12 }}>
                            <ActionReviewCard
                                actions={item.actions}
                                onApprove={(action: ActionItem) => {
                                    console.log('Approved action:', action);
                                }}
                                onReject={(id: string) => {
                                    console.log('Rejected action:', id);
                                }}
                                isExecuting={false}
                            />
                        </View>
                    )}

                    {/* Message Content with Markdown Support */}
                    {isUser ? (
                        <Text style={styles.userText}>{item.content}</Text>
                    ) : (
                        item.content ? <MarkdownText content={item.content} /> : null
                    )}

                    {/* Render Auth Actions if available */}
                    {item.auth_actions && item.auth_actions.length > 0 && (
                        <View style={{ marginTop: 12, gap: 8 }}>
                            {item.auth_actions.map((action, idx) => (
                                <View key={idx} style={styles.authCard}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                        <Text style={styles.authCardTitle}>
                                            {`Connect to ${action.appName}`}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.connectButton}
                                        onPress={() => Linking.openURL(action.url)}
                                    >
                                        <Text style={styles.connectButtonText}>Connect</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
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
        fontSize: 24,
    },
    listContent: {
        padding: spacing[4],
        paddingBottom: spacing[10],
    },
    messageBubble: {
        flexDirection: 'row',
        marginBottom: spacing[6],
        alignItems: 'flex-end',
    },
    userBubble: {
        justifyContent: 'flex-end',
    },
    assistantBubble: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        marginRight: spacing[3],
        marginBottom: 2,
    },
    messageContent: {
        maxWidth: '85%',
        padding: spacing[4],
        borderRadius: borderRadius.xl,
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.4 : 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    userContent: {
        backgroundColor: colors.primary[500],
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: 4,
    },
    assistantContent: {
        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    userText: {
        color: '#FFF',
        ...typography.textStyles.body,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[4],
        backgroundColor: isDark ? colors.background : '#FFF',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        gap: spacing[3],
    },
    input: {
        flex: 1,
        height: 48,
        backgroundColor: isDark ? colors.surface : colors.neutral[100],
        borderRadius: 24,
        paddingHorizontal: spacing[5],
        color: colors.text,
        borderWidth: 1,
        borderColor: isDark ? colors.border : 'transparent',
        ...typography.textStyles.body,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    authCard: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        borderRadius: 16,
        padding: spacing[4],
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
    },
    authCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    connectButton: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    connectButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold',
    },
    proactiveContent: {
        borderColor: '#FFD700',
        backgroundColor: isDark ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 215, 0, 0.03)',
    },
    proactiveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    proactiveBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#B8860B',
    }
});
