import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
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
import { borderRadius, spacing } from '../../theme';
import { ChatMessage } from '../../types';

// Extended type for UI demo purposes
interface RichChatMessage extends ChatMessage {
    type?: 'text' | 'action_review' | 'options' | 'suggestions';
    data?: any;
}

const INITIAL_MESSAGES: RichChatMessage[] = [
    {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I am your AI assistant. Connect your apps (Gmail, Calendar) and I can help you manage your digital life.',
        timestamp: new Date(),
        type: 'text'
    }
];

export default function AssistantTab() {
    const router = useRouter();
    const [messages, setMessages] = useState<RichChatMessage[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [, setIsLoading] = useState(false);
    const [isAccountModalVisible, setAccountModalVisible] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
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
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleActionInteraction = (messageId: string, action: 'confirm' | 'cancel') => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId && msg.type === 'action_review') {
                return {
                    ...msg,
                    data: {
                        ...msg.data,
                        status: action === 'confirm' ? 'success' : 'cancelled' // content updated to reflect state
                    }
                };
            }
            return msg;
        }));
    };

    const handleSend = async () => {
        if (!inputText.trim()) {
            // Navigate to Voice Mode if input is empty (Mic button pressed)
            router.push('/voice-mode');
            return;
        }

        const userMsg: RichChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const user = await getCurrentUser();
            if (!user) {
                throw new Error("You must be logged in.");
            }

            const response = await api.post('/chat', {
                userId: user.id,
                message: userMsg.content
            });

            const assistantMsg: RichChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content || "Action processed.",
                timestamp: new Date(),
                type: response.type || 'text',
                data: response.data
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (e: any) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Error: " + (e.message || "Failed to connect"),
                timestamp: new Date(),
                type: 'text'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: RichChatMessage }) => {
        const isUser = item.role === 'user';

        // 1. Text Message (User or Assistant)
        if (!item.type || item.type === 'text') {
            if (!item.content) return null; // Skip empty container messages
            return (
                <View style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowAssistant
                ]}>
                    {!isUser && (
                        <View style={styles.avatar}>
                            <Ionicons name="infinite" size={16} color={colors.primary[500]} />
                        </View>
                    )}
                    <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                        <View style={[
                            styles.bubble,
                            isUser ? styles.bubbleUser : styles.bubbleAssistant
                        ]}>
                            <Text style={[
                                styles.messageText,
                                isUser ? styles.messageTextUser : styles.messageTextAssistant
                            ]}>
                                {item.content}
                            </Text>
                        </View>
                        <Text style={styles.timestamp}>
                            {item.role === 'user' ? 'Just now' : ''}
                        </Text>
                    </View>
                </View>
            );
        }

        // 2. Suggestions List
        if (item.type === 'suggestions') {
            return (
                <View style={styles.messageBlock}>
                    <View style={styles.messageRowAssistant}>
                        <View style={styles.avatar}>
                            <Ionicons name="infinite" size={16} color={colors.primary[500]} />
                        </View>
                        <View style={styles.bubbleAssistant}>
                            <Text style={styles.messageTextAssistant}>{item.content}</Text>
                        </View>
                    </View>

                    {/* Vertical Stack of Suggestions */}
                    <View style={[styles.suggestionBlock, { width: '100%' }]}>
                        {item.data.options.map((opt: any, idx: number) => (
                            <TouchableOpacity key={idx} style={styles.suggestionCard}>
                                {/* Emulate the dual-icon badge look from screenshot 2 */}
                                <View style={{ flexDirection: 'row', marginRight: 12 }}>
                                    {/* Primary Icon (Square) */}
                                    <View style={{
                                        width: 24, height: 24,
                                        backgroundColor: isDark ? '#222' : '#EFF6FF',
                                        alignItems: 'center', justifyContent: 'center',
                                        borderRadius: 6,
                                        zIndex: 2,
                                    }}>
                                        <Ionicons name={opt.icon} size={14} color={opt.color} />
                                    </View>
                                    {/* Secondary Icon (Offset) */}
                                    {opt.secondaryIcon && (
                                        <View style={{
                                            width: 24, height: 24,
                                            backgroundColor: isDark ? '#333' : '#DBEAFE',
                                            alignItems: 'center', justifyContent: 'center',
                                            borderRadius: 6,
                                            marginLeft: -10, // Overlap
                                            zIndex: 1,
                                        }}>
                                            <Ionicons name={opt.secondaryIcon} size={12} color={colors.textSecondary} />
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.suggestionText}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        }

        // 3. Choice Options (Vertical)
        if (item.type === 'options') {
            return (
                <View style={styles.messageBlock}>
                    <View style={styles.messageRowAssistant}>
                        <View style={styles.avatar}>
                            <Ionicons name="infinite" size={16} color={colors.primary[500]} />
                        </View>
                        <View style={styles.bubbleAssistant}>
                            <Text style={styles.messageTextAssistant}>{item.content}</Text>
                        </View>
                    </View>

                    <View style={styles.optionsContainer}>
                        <Text style={styles.optionsTitle}>{item.data.title}</Text>
                        {item.data.options.map((opt: any, idx: number) => (
                            <TouchableOpacity key={idx} style={styles.optionButton}>
                                <Text style={styles.optionLabel}>{opt.label}</Text>
                                {opt.subtext && <Text style={styles.optionSubtext}>{opt.subtext}</Text>}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.optionButtonInput}>
                            <Text style={styles.optionLabelDim}>Other: Input here</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // 4. Action Confirmation Card
        if (item.type === 'action_review') {
            const isActionCompleted = item.data.status === 'success';
            const isActionCancelled = item.data.status === 'cancelled';

            return (
                <View style={styles.messageBlock}>
                    <View style={styles.messageRowAssistant}>
                        <View style={styles.avatar}>
                            <Ionicons name="infinite" size={16} color={colors.primary[500]} />
                        </View>
                    </View>
                    <View style={[styles.actionCardWrapper, isActionCancelled && { opacity: 0.6 }]}>
                        <View style={styles.actionHeader}>
                            <Ionicons name="settings-outline" size={16} color={colors.text} />
                            <Text style={styles.actionHeaderText}>
                                {isActionCompleted ? 'Action Completed' : (isActionCancelled ? 'Action Dismissed' : 'Action Executed')}
                            </Text>
                            {isActionCompleted && <Ionicons name="checkmark" size={16} color={colors.semantic.success} />}
                        </View>

                        <View style={styles.actionBody}>
                            <Text style={styles.actionSectionTitle}>Review Actions</Text>

                            <View style={styles.actionItemCard}>
                                <View style={styles.actionItemHeader}>
                                    <View style={[styles.actionIcon, { backgroundColor: isActionCancelled ? colors.neutral[400] : colors.semantic.warning }]}>
                                        <Ionicons name={item.data.action.icon || "calendar"} size={14} color="#FFF" />
                                    </View>
                                    <Text style={styles.actionItemTitle}>{item.data.action.title}</Text>
                                </View>

                                <View style={styles.actionItemDetails}>
                                    {item.data.action.details && Object.entries(item.data.action.details).map(([key, value]) => (
                                        <View key={key} style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>{key}:</Text>
                                            <Text style={styles.detailValue} numberOfLines={2}>{String(value)}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {!isActionCompleted && !isActionCancelled && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButtonSecondary, { marginRight: 8 }]}
                                        onPress={() => router.push({
                                            pathname: "/edit-action",
                                            params: {
                                                platform: item.data.action.icon?.replace('logo-', '') || 'generic',
                                                title: item.data.action.title,
                                                description: JSON.stringify(item.data.action.details, null, 2),
                                                id: item.id
                                            }
                                        })}
                                    >
                                        <Text style={styles.actionButtonTextSecondary}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButtonSecondary}
                                        onPress={() => handleActionInteraction(item.id, 'cancel')}
                                    >
                                        <Text style={styles.actionButtonTextSecondary}>Dismiss</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButtonPrimary}
                                        onPress={() => handleActionInteraction(item.id, 'confirm')}
                                    >
                                        <Text style={styles.actionButtonTextPrimary}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            );
        }
        return null;

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

                <TouchableOpacity style={styles.userDropdown} onPress={() => setAccountModalVisible(true)}>
                    <Text style={styles.username}>moneybeast733</Text>
                    <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content Wrapper handling Keyboard */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
            >
                {/* Chat List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    style={{ flex: 1 }}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                />

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    {/* Context Suggestion Chip (Shows when input is empty) */}
                    {inputText.length === 0 && (
                        <TouchableOpacity style={styles.contextChip}>
                            <Ionicons name="bulb-outline" size={16} color={colors.primary[500]} />
                            <Text style={styles.contextChipText}>Suggest actions</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message Aariv..."
                            placeholderTextColor={colors.textTertiary}
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSend}
                            multiline // Allow multiline for better UX
                        />
                        <TouchableOpacity
                            style={[styles.micButton, inputText.length > 0 && styles.sendButtonActive]}
                            onPress={handleSend}
                        >
                            <Ionicons
                                name={inputText ? "arrow-up" : "mic"}
                                size={20}
                                color={inputText ? (isDark ? '#000' : '#FFF') : colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Account Selection Modal */}
            <Modal
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
            </Modal>
        </SafeAreaView>
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
        gap: spacing[2.5],
        marginLeft: spacing[2],
    },
    accountEmail: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    primaryBadge: {
        backgroundColor: isDark ? '#333' : '#E2E8F0',
        paddingHorizontal: spacing[1.5],
        paddingVertical: spacing[0.5],
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
});
