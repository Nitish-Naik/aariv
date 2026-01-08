/**
 * Edit Action Form Screen - Edit action before approval
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PlatformIcon } from '../components/PlatformIcon';
import type { ActionItem } from '../types';

interface EditActionFormScreenProps {
  action: ActionItem;
  onSave: (updatedAction: ActionItem) => void;
  onCancel: () => void;
}

export const EditActionFormScreen: React.FC<EditActionFormScreenProps> = ({
  action,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(action.title);
  const [description, setDescription] = useState(action.description);

  const handleSave = () => {
    const updatedAction: ActionItem = {
      ...action,
      title,
      description,
    };
    onSave(updatedAction);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Action</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <PlatformIcon platform={action.platform} size={40} />
            <View style={styles.actionInfo}>
              <Text style={styles.platformName}>
                {action.platform.toUpperCase()}
              </Text>
              <Text style={styles.actionType}>{action.type}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Action title"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Action description"
              placeholderTextColor={colors.neutral[400]}
              multiline
              numberOfLines={6}
            />
          </View>

          {action.metadata && (
            <View style={styles.metadata}>
              <Text style={styles.label}>Additional Details</Text>
              <Card style={styles.metadataCard}>
                {Object.entries(action.metadata).map(([key, value]) => (
                  <View key={key} style={styles.metadataRow}>
                    <Text style={styles.metadataKey}>{key}:</Text>
                    <Text style={styles.metadataValue}>
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Save Changes"
          onPress={handleSave}
          style={styles.button}
        />
      </View>
    </View>
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
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
  },
  actionCard: {
    marginBottom: spacing[6],
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  platformName: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing[1],
  },
  actionType: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[500],
  },
  form: {
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  label: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[700],
    marginBottom: spacing[2],
    fontWeight: typography.fontWeight.semibold,
  },
  input: {
    ...typography.textStyles.body,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    color: colors.neutral[900],
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  metadata: {
    marginTop: spacing[2],
  },
  metadataCard: {
    marginTop: spacing[2],
  },
  metadataRow: {
    flexDirection: 'row',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  metadataKey: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
    fontWeight: typography.fontWeight.semibold,
    width: 100,
  },
  metadataValue: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[900],
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  button: {
    flex: 1,
  },
});

