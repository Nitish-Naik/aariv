import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
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
import { borderRadius, spacing } from '../../theme';
// NEW: Import canonical types and guard
import { AssistantMessage, ChatMessage, ToolExecutionMessage, UserMessage } from '../../types/chat';
import { isDev, shouldRenderMessage } from '../../utils/chatMiddleware';

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: 'welcome',
        type: 'assistant',
        text: 'Hello! I am your AI assistant. I can help you manage your emails, calendar, and more.',
        timestamp: Date.now(),
        tone: 'neutral',
        suggestions: [
            { id: 's1', label: 'Check my calendar', intent: 'Check my calendar', app: 'calendar' },
            { id: 's2', label: 'Summarize emails', intent: 'Summarize emails', app: 'gmail' },
            { id: 's3', label: 'What can you do?', intent: 'What can you do?', app: 'generic' }
        ]
    }
];

export default function AssistantTab() {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [, setIsLoading] = useState(false);
    const [isAccountModalVisible, setAccountModalVisible] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    // Debug toggle state
    const [showDebugDrawer, setShowDebugDrawer] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const { colors, isDark } = useTheme();

    const styles = getStyles(colors, isDark, isKeyboardVisible);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        // Scroll on valid messages only
        const visibleMessages = messages.filter(shouldRenderMessage);
        if (visibleMessages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || inputText.trim();
        if (!textToSend) {
            router.push('/voice-mode');
            return;
        }

        const userMsg: UserMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: textToSend,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const user = await getCurrentUser();
            if (!user) throw new Error("You must be logged in.");

            const response = await api.post('/chat', {
                userId: user.id,
                message: userMsg.text
            });

            // Handle Tool Execution Messages (if provided by backend in future, debugging only)
            if (response.toolExecutions && isDev) {
                const toolMsgs: ToolExecutionMessage[] = response.toolExecutions.map((exec: any, i: number) => ({
                    id: `tool-${Date.now()}-${i}`,
                    type: 'tool_execution',
                    tool: exec.tool || 'unknown_tool',
                    status: 'success',
                    output: exec.output
                }));
                setMessages(prev => [...prev, ...toolMsgs]);
            }

            // Clean Assistant Message
            const assistantMsg: AssistantMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                text: response.content || "I've processed that.",
                timestamp: Date.now(),
                tone: 'reassuring', // Default tone
                suggestions: response.suggestions // Bind suggestions from backend
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (e: any) {
            const errorMsg: AssistantMessage = {
                id: Date.now().toString(),
                type: 'assistant',
                text: "I'm having trouble connecting right now.",
                timestamp: Date.now(),
                tone: 'neutral'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        // CRITICAL GUARD: Do not render if not allowed
        if (!shouldRenderMessage(item)) return null;

        if (item.type === 'user') {
            return (
                <View style={[styles.messageRow, styles.messageRowUser]}>
                    <View style={{ alignItems: 'flex-end', maxWidth: '85%' }}>
                        <View style={[styles.bubble, styles.bubbleUser]}>
                            <Text style={[styles.messageText, styles.messageTextUser]}>{item.text}</Text>
                        </View>
                        <Text style={styles.timestamp}>Just now</Text>
                    </View>
                </View>
            );
        }

        if (item.type === 'assistant') {
            return (
                <View style={[styles.messageRow, styles.messageRowAssistant]}>
                    <View style={styles.avatar}>
                        <Ionicons name="infinite" size={16} color={colors.primary[500]} />
                    </View>
                    <View style={{ alignItems: 'flex-start', maxWidth: '85%' }}>
                        <View style={[styles.bubble, styles.bubbleAssistant]}>
                            <Text style={[styles.messageText, styles.messageTextAssistant]}>{item.text}</Text>
                        </View>
                        {item.followUp && (
                            <TouchableOpacity style={{ marginTop: 8 }}>
                                <Text style={{ color: colors.primary[500], fontSize: 13 }}>{item.followUp}</Text>
                            </TouchableOpacity>
                        )}

                        {/* Render Contextual Suggestions (Max 3) */}
                        {item.suggestions && item.suggestions.length > 0 && (
                            <View style={styles.suggestionChipsContainer}>
                                {item.suggestions.slice(0, 3).map((suggestion) => {
                                    // Map app to icon
                                    let iconName: any = 'flash';
                                    let iconColor = colors.text;
                                    let iconBg = isDark ? '#333' : '#E2E8F0';

                                    switch (suggestion.app) {
                                        case 'gmail':
                                            iconName = 'mail';
                                            iconColor = '#EA4335'; // Gmail Red
                                            iconBg = isDark ? '#2B1A1A' : '#FCE8E6';
                                            break;
                                        case 'calendar':
                                            iconName = 'calendar';
                                            iconColor = '#4285F4'; // Google Blue
                                            iconBg = isDark ? '#1A2333' : '#E8F0FE';
                                            break;
                                        case 'maps':
                                            iconName = 'map';
                                            iconColor = '#34A853'; // Google Green
                                            iconBg = isDark ? '#1A2B1A' : '#E6F4EA';
                                            break;
                                        default:
                                            iconName = 'sparkles';
                                            iconColor = colors.primary[500];
                                            iconBg = isDark ? '#1A1A1A' : '#F0F9FF';
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={suggestion.id}
                                            style={styles.suggestionChip}
                                            onPress={() => handleSend(suggestion.label)}
                                        >
                                            <View style={[styles.suggestionIconContainer, { backgroundColor: iconBg }]}>
                                                <Ionicons name={iconName} size={16} color={iconColor} />
                                            </View>
                                            <Text style={styles.suggestionChipText}>{suggestion.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </View>
            );
        }

        return null; // Fallback for other types handled by logic but not simple UI
    };

    // Debug Drawer Component
    const renderDebugDrawer = () => {
        if (!isDev || !showDebugDrawer) return null;

        // Filter for debug-only messages
        const debugMessages = messages.filter(m => m.type === 'tool_execution' || m.type === 'debug' || m.type === 'system');

        return (
            <View style={styles.debugDrawer}>
                <Text style={styles.debugTitle}>Developer Console</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                    {debugMessages.map(m => (
                        <View key={m.id} style={styles.debugItem}>
                            <Text style={styles.debugType}>[{m.type.toUpperCase()}]</Text>
                            {m.type === 'tool_execution' && (
                                <Text style={styles.debugContent}>
                                    Tool: {m.tool} | Status: {m.status}
                                </Text>
                            )}
                            {m.type === 'system' && (
                                <Text style={styles.debugContent}>{m.text}</Text>
                            )}
                        </View>
                    ))}
                    {debugMessages.length === 0 && <Text style={styles.debugType}>No debug logs.</Text>}
                </ScrollView>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Ionicons name="infinite" size={28} color={colors.primary[500]} style={styles.logo} />
                </View>

                {isDev && (
                    <TouchableOpacity onPress={() => setShowDebugDrawer(!showDebugDrawer)} style={{ marginLeft: 10 }}>
                        <Ionicons name={showDebugDrawer ? "bug" : "bug-outline"} size={20} color={colors.semantic.warning} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.userDropdown} onPress={() => setAccountModalVisible(true)}>
                    <Text style={styles.username}>moneybeast733</Text>
                    <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMessages([])}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {renderDebugDrawer()}

            {/* Main Content Wrapper handling Keyboard */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
            >
                {/* Chat List */}
                < FlatList
                    ref={flatListRef}
                    data={messages}
                    style={{ flex: 1 }
                    }
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                />

                {/* Input Area */}
                < View style={styles.inputContainer} >
                    {/* Context Suggestion Chip (Shows when input is empty) */}
                    {/* Context Suggestion Chip (Shows when input is empty) - REMOVED for cleaner UI
                        inputText.length === 0 && (
                            <TouchableOpacity style={styles.contextChip}>
                                <Ionicons name="bulb-outline" size={16} color={colors.primary[500]} />
                                <Text style={styles.contextChipText}>Suggest actions</Text>
                            </TouchableOpacity>
                        )
                    */}

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message Aariv..."
                            placeholderTextColor={colors.textTertiary}
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={() => handleSend()}
                            multiline // Allow multiline for better UX
                        />
                        <TouchableOpacity
                            style={[styles.micButton, inputText.length > 0 && styles.sendButtonActive]}
                            onPress={() => handleSend()}
                        >
                            <Ionicons
                                name={inputText ? "arrow-up" : "mic"}
                                size={20}
                                color={inputText ? (isDark ? '#000' : '#FFF') : colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                </View >
            </KeyboardAvoidingView >

            {/* Account Selection Modal */}
            < Modal
                animationType="fade"
                transparent={true}
                visible={isAccountModalVisible}
                onRequestClose={() => setAccountModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Account</Text>
                            <TouchableOpacity onPress={() => setAccountModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.accountItemActive}>
                            <View style={[styles.accountItemLeftBar, { backgroundColor: colors.primary[500] }]} />
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountEmail}>moneybeast733@gmail...</Text>
                                <View style={styles.primaryBadge}>
                                    <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                                </View>
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.addAccountButton}>
                            <Ionicons name="add-circle-outline" size={20} color={colors.text} />
                            <Text style={styles.addAccountText}>Add Another Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >
        </SafeAreaView >
    );
}

const getStyles = (colors: any, isDark: boolean, isKeyboardVisible: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // Use theme background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
        paddingTop: spacing[8],
        paddingBottom: spacing[4],
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    logo: {
        // 
    },
    userDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E0E0E0',
    },
    username: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
    },
    clearText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },

    listContent: {
        padding: spacing[4],
        paddingBottom: 140, // Reduced from 180 to fit tighter visually while still clearing input
        gap: 24,
    },

    // Message Common
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    messageRowUser: {
        justifyContent: 'flex-end',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    messageRowAssistant: {
        justifyContent: 'flex-start',
        gap: 8,
    },
    messageBlock: {
        gap: 12,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        display: 'none',
    },

    // Bubbles
    bubble: {
        padding: 12,
        borderRadius: 20,
    },
    bubbleUser: {
        backgroundColor: isDark ? '#262626' : '#eff6ff', // Dark gray / Light blue for user
        borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
        backgroundColor: 'transparent',
        paddingLeft: 0,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 24,
    },
    messageTextUser: {
        color: colors.text,
        textAlign: 'right',
    },
    messageTextAssistant: {
        color: colors.text,
    },
    timestamp: {
        fontSize: 11,
        color: colors.textTertiary,
        marginTop: 4,
    },

    // Suggestions (Vertical Stack now)
    suggestionBlock: {
        marginTop: 8,
        gap: 8,
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#111' : '#F8FAFC',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 24, // Rounder pills like screenshot
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E2E8F0',
        width: '100%',
    },
    suggestionText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '500',
        flex: 1, // Allow text to wrap
        lineHeight: 18,
    },

    // Options (Vertical Choice)
    optionsContainer: {
        backgroundColor: isDark ? '#0F0F0F' : '#F8FAFC',
        borderWidth: 1,
        borderColor: isDark ? '#222' : '#E2E8F0',
        borderRadius: 20,
        padding: 16,
        marginLeft: 32,
        gap: 8,
        width: '85%',
    },
    optionsTitle: {
        color: colors.text,
        fontSize: 15,
        marginBottom: 8,
        lineHeight: 22,
    },
    optionButton: {
        backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? 'transparent' : '#E2E8F0',
    },
    optionButtonInput: {
        backgroundColor: isDark ? '#111' : '#F1F5F9',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#222' : '#E2E8F0',
    },
    optionLabel: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    optionLabelDim: {
        color: colors.textTertiary,
        fontSize: 14,
    },
    optionSubtext: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },

    // Action Review Card
    actionCardWrapper: {
        backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? '#222' : '#E2E8F0',
        overflow: 'hidden',
        marginTop: 0,
        marginLeft: 32,
        width: '85%',
    },
    actionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#222' : '#E5E5E5',
        backgroundColor: isDark ? '#0F0F0F' : '#F8FAFC',
    },
    actionHeaderText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        marginLeft: 10,
    },
    actionBody: {
        padding: 16,
    },
    actionSectionTitle: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    actionItemCard: {
        backgroundColor: isDark ? '#171717' : '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    actionItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    actionIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionItemTitle: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 15,
    },
    actionItemDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
    },
    detailLabel: {
        color: colors.textSecondary,
        fontSize: 13,
        width: 80,
    },
    detailValue: {
        color: colors.text,
        fontSize: 13,
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButtonSecondary: {
        flex: 1,
        backgroundColor: isDark ? '#1C1C1C' : '#FFF',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDark ? 'transparent' : '#E2E8F0',
    },
    actionButtonTextSecondary: {
        color: colors.textSecondary,
        fontWeight: '600',
    },
    actionButtonPrimary: {
        flex: 1,
        backgroundColor: colors.primary[500],
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonTextPrimary: {
        color: '#FFF',
        fontWeight: '600',
    },

    // Input
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: isKeyboardVisible
            ? 16
            : (Platform.OS === 'ios' ? 20 : 10), // Minimal padding as standard tabs already handle bottom spacing
        backgroundColor: 'transparent',
        zIndex: 100,
    },
    contextChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: isDark ? '#222' : '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 4, // Reduced height
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E2E8F0',
        marginBottom: 12, // Reduced space
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        gap: 6,
    },
    contextChipText: {
        fontSize: 13, // Slightly smaller text
        color: colors.text,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#222' : '#F1F5F9', // Darker gray bg like screenshot
        borderRadius: 24, // Slightly reduced radius
        paddingHorizontal: 4, // Reduced padding
        paddingVertical: 4, // Reduced padding
        borderWidth: 0, // No border for cleaner look
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        paddingHorizontal: 12, // Reduced horizontal padding
        paddingVertical: 8, // Reduced vertical padding
        height: 40, // Height Reduced (was 48)
    },
    micButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'transparent', // Transparent by default
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonActive: {
        backgroundColor: isDark ? '#FFF' : '#000', // White/Black circle when active
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[5],
    },
    modalContent: {
        width: '100%',
        backgroundColor: isDark ? '#111' : '#FFF',
        borderRadius: borderRadius.xl,
        padding: spacing[5],
        borderWidth: 1,
        borderColor: isDark ? '#222' : '#E2E8F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[5],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    closeButton: {
        padding: 4,
        backgroundColor: isDark ? '#222' : '#F1F5F9',
        borderRadius: 12,
    },
    accountItemActive: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#1A1A1A' : '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E2E8F0',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    accountItemLeftBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    accountInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginLeft: spacing[2],
    },
    accountEmail: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    primaryBadge: {
        backgroundColor: isDark ? '#333' : '#E2E8F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    primaryBadgeText: {
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    addAccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4],
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#E2E8F0',
        gap: spacing[2],
        borderStyle: 'dashed',
        minHeight: 44, // Ensure touch target size
    },
    addAccountText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },

    // Suggestion Chips
    suggestionChipsContainer: {
        flexDirection: 'column',
        width: '100%',
        gap: 12, // Increased gap
        marginTop: 12,
        paddingLeft: 4, // Align visually
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#000000' : '#FFFFFF', // Pitch black in dark mode per screenshot
        borderRadius: 24, // Very rounded
        paddingHorizontal: 6, // Narrow padding around icon
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: isDark ? '#222' : '#E2E8F0',
        width: '100%', // Full width
    },
    suggestionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    suggestionChipText: {
        fontSize: 14,
        color: colors.text, // Normal text color (white/black)
        fontWeight: '500',
        flex: 1, // Wrap text
        lineHeight: 20,
        paddingRight: 16,
    },

    // Debug Drawer Styles
    debugDrawer: {
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        padding: 10,
        maxHeight: 250,
    },
    debugTitle: {
        color: '#0F0',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    debugItem: {
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        paddingBottom: 4,
    },
    debugType: {
        color: '#FF0',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 2,
    },
    debugContent: {
        color: '#CCC',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
