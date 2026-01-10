import { useRouter } from 'expo-router';
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
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

export default function SettingsTab() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);

  const styles = getStyles(colors);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // await signOut(); // Mocked auth
              // await clearAllData();
              Alert.alert('Signed Out', 'You have been signed out (mock).');
              // router.replace('/');
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
              // await clearAllData();
              Alert.alert('Success', 'Cache cleared');
            } catch (error: any) {
              // Alert.alert('Error', error.message || 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
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
              trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Approval</Text>
              <Text style={styles.settingDescription}>
                Automatically approve low-risk actions
              </Text>
            </View>
            <Switch
              value={autoApproveEnabled}
              onValueChange={setAutoApproveEnabled}
              trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark color scheme
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
            />
          </View>
        </Card>
      </View>
      {/* Subscription */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <Card>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/paywall')}
          >
            <View style={{ flex: 1 }}>
                <Text style={styles.menuItemText}>Manage Subscription</Text>
                <Text style={{ ...typography.textStyles.caption, color: colors.primary[500] }}>Current Plan: Free</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>
      </View>
      {/* Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security & Data</Text>
        <Card>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Key Vault', 'Secure storage for API keys.')}
          >
            <Text style={styles.menuItemText}>Manage API Keys (Key Vault)</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Knowledge Graph', 'Visualize your data connections.')}
          >
            <Text style={styles.menuItemText}>View Knowledge Graph</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleClearCache}
          >
            <Text style={styles.menuItemText}>Clear Local Cache</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
        />
        <Text style={styles.version}>Version 1.0.0 (Alpha)</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing[4],
    paddingTop: spacing[8],
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.textStyles.h4,
    color: colors.text,
    marginBottom: spacing[3],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  settingLabel: {
    ...typography.textStyles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  settingDescription: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  menuItemText: {
    ...typography.textStyles.body,
    color: colors.text,
  },
  chevron: {
    fontSize: 20,
    color: colors.neutral[400],
  },
  version: {
    ...typography.textStyles.caption,
    textAlign: 'center',
    color: colors.textTertiary,
    marginTop: spacing[4],
  },
});
