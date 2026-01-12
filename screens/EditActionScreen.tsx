import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { PlatformIcon } from '../components/PlatformIcon';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';

interface EditActionScreenProps {
  initialTitle?: string;
  initialDescription?: string;
  platform?: string;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
}

export const EditActionScreen: React.FC<EditActionScreenProps> = ({
  initialTitle = '',
  initialDescription = '',
  platform = 'gmail',
  onSave,
  onCancel,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
         <View>
            <Text style={styles.headerTitle}>Refine Action</Text>
            <Text style={styles.headerSubtitle}>Edit the drafted response or logic.</Text>
         </View>
         <View style={styles.platformBadge}>
             <PlatformIcon platform={platform as any} size={20} />
             <Text style={styles.platformName}>{platform.toUpperCase()}</Text>
         </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Action Intent</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Reply to Sarah"
              placeholderTextColor={colors.textTertiary}
            />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Content / Details</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Draft content..."
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.aiHint}>
                <Ionicons name="sparkles" size={14} color={colors.primary[500]} />
                <Text style={styles.aiHintText}>AI will auto-format this before sending.</Text>
            </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Discard"
          onPress={onCancel}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Save Changes"
          onPress={() => onSave(title, description)}
          style={styles.saveButton}
        />
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[6],
    paddingTop: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
      ...typography.textStyles.h3,
      color: colors.text,
  },
  headerSubtitle: {
      ...typography.textStyles.bodySmall,
      color: colors.textSecondary,
      marginTop: 2,
  },
  platformBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
  },
  platformName: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[6],
    gap: spacing[6],
  },
  inputGroup: {
      gap: spacing[2],
  },
  label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      color: colors.text,
      fontSize: 16,
      ...typography.textStyles.body,
  },
  textArea: {
      minHeight: 200,
  },
  aiHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
  },
  aiHintText: {
      fontSize: 12,
      color: colors.primary[500],
      fontStyle: 'italic',
  },
  footer: {
    padding: spacing[6],
    paddingBottom: Platform.OS === 'ios' ? spacing[2] : spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: spacing[4],
    backgroundColor: colors.background,
  },
  cancelButton: {
      flex: 1,
      borderColor: colors.border,
  },
  saveButton: {
      flex: 2,
  },
});
