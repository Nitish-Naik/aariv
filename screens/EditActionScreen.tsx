import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformIcon } from '../components/PlatformIcon';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';

interface EditActionScreenProps {
  initialTitle?: string;
  initialDescription?: string;
  platform?: string;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditActionScreen: React.FC<EditActionScreenProps> = ({
  initialTitle = '',
  initialDescription = '',
  platform = 'gmail',
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
         <View style={{ flex: 1 }}>
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
            <Text style={styles.label}>ACTION INTENT</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Reply to Sarah"
              placeholderTextColor={colors.textTertiary}
            />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTENT / DETAILS</Text>
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
        <TouchableOpacity
          style={styles.discardButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.discardButtonText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
          onPress={() => onSave(title, description)}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
    flexDirection: 'row',
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
      gap: spacing[2],
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
  },
  platformName: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.5,
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
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing[2],
  },
  input: {
      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      color: colors.text,
      fontSize: 16,
      ...typography.textStyles.body,
      minHeight: 48,
  },
  textArea: {
      minHeight: 120,
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
  discardButton: {
    flex: 1,
    backgroundColor: isDark ? colors.neutral[900] : colors.neutral[200],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  discardButtonText: {
    ...typography.textStyles.button,
    color: colors.text,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...typography.textStyles.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
