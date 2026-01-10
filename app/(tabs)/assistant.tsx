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
import { spacing, typography } from '../../theme';
import { ChatMessage } from '../../types';
import { MOCK_MESSAGES } from '../../utils/mockData';

export default function AssistantTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
    // Stub
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
                <Card key={action.id} style={styles.actionCard}>
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
        <Text style={styles.title}>Assistant</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything..."
          value={inputText}
          onChangeText={setInputText}
          placeholderTextColor={colors.neutral[400]}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[4],
    paddingTop: spacing[8],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text,
  },
  listContent: {
    padding: spacing[4],
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
    padding: spacing[3],
    borderRadius: spacing[3],
  },
  userMessageCard: {
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: 2,
    borderWidth: 0,
  },
  assistantMessageCard: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    ...typography.textStyles.body,
    color: colors.text,
  },
  userMessageText: {
    color: '#FFF',
  },
  messageTime: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing[1],
    alignSelf: 'flex-end',
    fontSize: 10,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  suggestions: {
    marginTop: spacing[2],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  suggestionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.neutral[100],
    borderRadius: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  suggestionText: {
    ...typography.textStyles.caption,
    color: colors.neutral[700],
  },
  actions: {
    marginTop: spacing[3],
  },
  actionCard: {
    backgroundColor: colors.neutral[50],
    padding: spacing[2],
    marginBottom: spacing[2],
  },
  actionTitle: {
    ...typography.textStyles.bodySmall,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[1],
  },
  actionDescription: {
    ...typography.textStyles.caption,
    color: colors.neutral[600],
    marginBottom: spacing[2],
  },
  inputContainer: {
    padding: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? spacing[8] : spacing[4],
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: spacing[4],
    marginRight: spacing[3],
    ...typography.textStyles.body,
    color: colors.text,
  },
  sendButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: spacing[4],
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  sendButtonText: {
    ...typography.textStyles.bodySmall,
    color: '#FFF',
    fontWeight: typography.fontWeight.bold,
  },
});
