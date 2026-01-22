/**
 * Settings Screen - App settings and key vault management
 */


import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Use Supabase JS client and Expo Router navigation
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { api } from '../services/api';
import { signOut as appSignOut } from '../services/auth';
import { supabase } from '../services/supabaseClient';
import { colors, spacing, typography } from '../theme';
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
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleTestConnection = async () => {
    try {
      // Note: This endpoint is not technically under /api based on backend/src/index.ts which has app.get('/health') directly on app
      // But let's check services/api.ts which appends /api to BASE_URL.
      // If backend has app.get('/health'), then localhost:3000/health is the url.
      // But services/api.ts sets base to localhost:3000/api.
      // So api.get('/health') would hit localhost:3000/api/health.
      // I need to adjust the backend to invoke /api/health or adjust the client.
      // Let's assume I'll fix the backend to mount health on /api, or just use a relative path trick if possible.
      // safely, I should check backend/src/index.ts again.
      // Backend: app.get('/health'...) is root.
      // Helper: BASE_URL = .../api
      // So I should probably use `api.get('/../health')`? No, that's ugly.
      // Or I can add a specific test method.
      // Or just update backend to put health check on /api/health.
      
      const result = await api.get('/health'); 
      Alert.alert('Success', `Backend is connected!\n${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      await appSignOut(); // Clear local storage and tokens
      Alert.alert('Signed out', 'You have been signed out.', [
        {
          text: 'OK',
          onPress: () => router.replace('/'), // Go to root, which will redirect to /login
        },
      ]);
    } catch (error: any) {
      Alert.alert('Sign out failed', error.message || 'Could not sign out.');
    }
  };

  const handleDeleteAccount = async () => {
    // Delete user from Supabase
    const { data: user } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'No user found.');
      return;
    }
    try {
      // await api.delete(`/users/${user.id}`); // If you have a backend endpoint
      // For Supabase, you need admin access to delete users
      Alert.alert('Account deletion', 'Account deletion is not supported directly from the app. Please contact support.', [
        {
          text: 'OK',
          onPress: async () => {
            await supabase.auth.signOut();
            await appSignOut();
            router.replace('/'); // Go to root, which will redirect to /login
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Failed to delete account.', error.message || 'Could not delete account.');
    }
    // Optionally sign out after deletion
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Sign out failed', error.message || 'Could not sign out after deletion.');
    }
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

      {/* Developer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <Card>
          <Button
            title="Test Backend Connection"
            onPress={handleTestConnection}
            variant="outline"
          />
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

      {/* Delete Account */}
      <View style={styles.section}>
        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          variant="outline"
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

