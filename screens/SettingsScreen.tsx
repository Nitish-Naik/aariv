/**
 * Settings Screen - App settings and key vault management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { signOut } from '../services/auth';
import { clearAllData } from '../utils/storage';

interface SettingsScreenProps {
  onSignOut: () => void;
  onBack: () => void;
  onNavigateToKeyVault: () => void;
  onNavigateToKnowledgeGraph: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onSignOut,
  onBack,
  onNavigateToKeyVault,
  onNavigateToKnowledgeGraph,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? (Mock - for UI review only)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              await clearAllData();
              onSignOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'Cache cleared');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications for new actions
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: colors.neutral[300],
                true: colors.primary[500],
              }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-approve (Beta)</Text>
              <Text style={styles.settingDescription}>
                Automatically approve low-risk actions
              </Text>
            </View>
            <Switch
              value={autoApproveEnabled}
              onValueChange={setAutoApproveEnabled}
              trackColor={{
                false: colors.neutral[300],
                true: colors.primary[500],
              }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark theme
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{
                false: colors.neutral[300],
                true: colors.primary[500],
              }}
            />
          </View>
        </Card>
      </View>

      {/* Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Card>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={onNavigateToKeyVault}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Key Vault</Text>
              <Text style={styles.settingDescription}>
                Manage encrypted tokens
              </Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={onNavigateToKnowledgeGraph}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Knowledge Graph</Text>
              <Text style={styles.settingDescription}>
                View and manage your data patterns
              </Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Card>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleClearCache}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.settingDescription}>
                Remove all cached data
              </Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Card>
          <Text style={styles.aboutText}>
            Aariv v1.0.0{'\n'}
            Privacy-first productivity copilot
          </Text>
        </Card>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
  },
  backButton: {
    marginBottom: spacing[2],
  },
  backButtonText: {
    ...typography.textStyles.body,
    color: colors.primary[500],
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  settingLabel: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  settingDescription: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[500],
  },
  chevron: {
    ...typography.textStyles.body,
    color: colors.neutral[400],
  },
  aboutText: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
    lineHeight: 24,
  },
  signOutButton: {
    borderColor: colors.semantic.error,
  },
});

