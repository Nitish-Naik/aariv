import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, typography } from '../../theme';
import { ChatMessage } from '../../types';
import { MOCK_MESSAGES } from '../../utils/mockData';

export default function AssistantTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { colors, isDark } = useTheme();
  
  // Dynamic styles
  const styles = getStyles(colors, isDark);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newUserMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputText.trim(),
        timestamp: new Date(),
      };
      setMessages([...messages, newUserMsg]);
      setInputText('');
      
      // Mock response
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm processing your request. As a mock, I can't really do much yet!",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 1000);
    }
  };

  const handleApproveAction = (actionId: string) => {
    alert(`Approved action ${actionId}`);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <Card
          style={[
            styles.messageCard,
            isUser ? styles.userMessageCard : styles.assistantMessageCard,
          ]}
          padding={3}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>{item.content}</Text>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {format(item.timestamp, 'h:mm a')}
          </Text>

          {/* Suggestions */}
          {item.suggestions && item.suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {item.suggestions.map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionButton}
                  onPress={() => setInputText(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Action items */}
          {item.actions && item.actions.length > 0 && (
            <View style={styles.actions}>
              {item.actions.map((action) => (
                <Card key={action.id} style={styles.actionCard} padding={3}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>
                    {action.description}
                  </Text>
                  <Button
                    title="Approve"
                    onPress={() => handleApproveAction(action.id)}
                    size="small"
                  />
                </Card>
              ))}
            </View>
          )}
        </Card>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Meet Aariv</Text>
        <Text style={styles.subtitle}>Calendar meets intelligence.</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Input Bar */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message Aariv..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            selectionColor={colors.primary[500]}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name={inputText.trim() ? "arrow-up" : "mic"} 
              size={20} 
              color={inputText.trim() ? '#FFF' : colors.textTertiary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[4],
    paddingTop: spacing[8],
    backgroundColor: colors.background,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[24], // Space for floating input
  },
  messageContainer: {
    marginBottom: spacing[4],
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageCard: {
    borderRadius: spacing[4],
    borderWidth: 0, // Cleaner look without borders
    backgroundColor: 'transparent', // Override default card bg
  },
  userMessageCard: {
    backgroundColor: 'transparent',
  },
  assistantMessageCard: {
    backgroundColor: 'transparent',
  },
  messageText: {
    ...typography.textStyles.body,
    fontSize: 16,
    color: colors.text, // For assistant
  },
  userMessageText: {
    color: colors.text, // User text also adaptive, or white if we do a bubble
    textAlign: 'right', // User right aligned
  },
  messageTime: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
    alignSelf: 'flex-start',
    fontSize: 10,
  },
  userMessageTime: {
    alignSelf: 'flex-end',
  },
  suggestions: {
    marginTop: spacing[2],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  suggestionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    ...typography.textStyles.caption,
    color: colors.text,
  },
  actions: {
    marginTop: spacing[3],
  },
  actionCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[2],
    marginBottom: spacing[2],
  },
  actionTitle: {
    ...typography.textStyles.bodySmall,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[1],
    color: colors.text,
  },
  actionDescription: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  
  // Floating Input Styling
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[4],
    paddingBottom: Platform.OS === 'ios' ? spacing[6] : spacing[4],
    backgroundColor: isDark 
      ? 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%)' // CSS valid, but in RN needs component. 
      : 'transparent', // In RN we might just use a solid background or BlurView if available
    // For now, solid background that matches screen
    backgroundColor: colors.background, 
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    padding: spacing[2],
    paddingLeft: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    ...typography.textStyles.body,
    fontSize: 16,
    color: colors.text,
    marginRight: spacing[2],
    height: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surface,
  },
});
