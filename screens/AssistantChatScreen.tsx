/**
 * Assistant Chat Screen - Copilot chat interface
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import type { ChatMessage, ActionItem } from '../types';
import { format } from 'date-fns';

interface AssistantChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSuggestActions: () => void;
  onApproveAction: (actionId: string) => void;
  onBack: () => void;
}

export const AssistantChatScreen: React.FC<AssistantChatScreenProps> = ({
  messages,
  onSendMessage,
  onSuggestActions,
  onApproveAction,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
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
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
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
                    onPress={() => onApproveAction(action.id)}
                    size="small"
                    style={styles.actionButton}
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.assistantName}>aariv</Text>
          <Text style={styles.assistantSubtitle}>Your productivity copilot</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Start a conversation with aariv. Ask questions or request actions.
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <Button
          title="Suggest actions"
          onPress={onSuggestActions}
          variant="outline"
          size="small"
          style={styles.suggestButton}
        />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask aariv..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text
              style={[
                styles.sendButtonText,
                !inputText.trim() && styles.sendButtonTextDisabled,
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing[3],
  },
  backButtonText: {
    ...typography.textStyles.body,
    color: colors.primary[500],
  },
  headerContent: {
    flex: 1,
  },
  assistantName: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
  },
  assistantSubtitle: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  messagesList: {
    padding: spacing[4],
  },
  messageContainer: {
    marginBottom: spacing[3],
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
  },
  userMessageCard: {
    backgroundColor: colors.primary[500],
  },
  assistantMessageCard: {
    backgroundColor: colors.light.surface,
  },
  messageText: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  messageTime: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
    fontSize: 10,
  },
  suggestions: {
    marginTop: spacing[3],
  },
  suggestionButton: {
    padding: spacing[2],
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  suggestionText: {
    ...typography.textStyles.bodySmall,
    color: colors.primary[700],
  },
  actions: {
    marginTop: spacing[3],
  },
  actionCard: {
    backgroundColor: colors.light.surfaceElevated,
  },
  actionTitle: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing[1],
  },
  actionDescription: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
    marginBottom: spacing[2],
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  inputContainer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  suggestButton: {
    marginBottom: spacing[2],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...typography.textStyles.body,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 24,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.light.border,
    color: colors.neutral[900],
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  sendButtonText: {
    ...typography.textStyles.body,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  sendButtonTextDisabled: {
    color: colors.neutral[400],
  },
  emptyContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});

