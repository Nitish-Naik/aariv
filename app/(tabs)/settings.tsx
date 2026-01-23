import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { deleteAccount, getCurrentUser, signOut } from '../../services/auth';
import { borderRadius, spacing, typography } from '../../theme';
import type { User } from '../../types';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [operatingMode, setOperatingMode] = useState<'passive' | 'executive'>('passive');
  const [notifications, setNotifications] = useState(true);

  const styles = getStyles(colors, isDark);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    Alert.alert(
      "Sever Neural Link?",
      "Disconnecting will pause all active context monitoring.",
      [
        { text: "Stay Connected", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account?",
      "This action is irreversible. All your data and connections will be wiped.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            try {
              await deleteAccount(user.id);
              router.replace('/login');
            } catch (e: any) {
              Alert.alert("Error", "Failed to delete account: " + e.message);
            }
          }
        }
      ]
    );
  };

  const renderModeCard = (mode: 'passive' | 'executive', title: string, desc: string, icon: string) => {
    const isActive = operatingMode === mode;
    return (
      <TouchableOpacity
        style={[styles.modeCard, isActive && styles.modeCardActive]}
        onPress={() => setOperatingMode(mode)}
      >
        <View style={styles.modeHeader}>
          <Ionicons
            name={icon as any}
            size={24}
            color={isActive ? '#FFF' : colors.textSecondary}
          />
          <Text style={[styles.modeTitle, isActive && styles.modeTitleActive]}>{title}</Text>
          {isActive && <View style={styles.pixelTag}><Text style={styles.pixelText}>ACTIVE</Text></View>}
        </View>
        <Text style={[styles.modeDesc, isActive && styles.modeDescActive]}>
          {desc}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Protocols</Text>
          <Text style={styles.briefing}>
            Configure <Text style={styles.highlight}>neural weights</Text> and integration permissions.
          </Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={handleLogout}>
          {user ? (
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarText}>
                {user.name
                  ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'ID'}
              </Text>
              <View style={styles.statusDot} />
            </View>
          ) : (
            <Ionicons name="person-circle" size={36} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* OPERATING MODE SELECTOR */}
        <Text style={styles.sectionLabel}>OPERATING MODE</Text>
        <View style={styles.modeContainer}>
          {renderModeCard(
            'passive',
            'Passive Mode',
            'Aariv waits for commands. Acts only when explicitly asked. High control, zero risk.',
            'shield-checkmark'
          )}
          {renderModeCard(
            'executive',
            'Executive Mode',
            'Aariv acts proactively. Reschedules conflicts and drafts replies automatically.',
            'flash'
          )}
        </View>

        {/* NEURAL ACCESS */}
        <Text style={styles.sectionLabel}>NEURAL ACCESS</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={async () => {
            // Check if user has granted consent
            const { hasKGConsent } = await import('../../utils/kgConsent');
            const hasConsent = await hasKGConsent();

            if (hasConsent) {
              router.push('/knowledge-graph');
            } else {
              // Show consent screen first
              router.push('/kg-consent');
            }
          }}>
            <View style={styles.rowIcon}>
              <Ionicons name="git-network" size={20} color={colors.primary[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Knowledge Graph</Text>
              <Text style={styles.rowSubtitle}>View mapped relationships & context</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => router.push('/toolkits')}>
            <View style={styles.rowIcon}>
              <Ionicons name="extension-puzzle" size={20} color={colors.primary[500]} />
            </View>
            <View style={{ flex: 1 }}>
              {/* <Text style={styles.rowTitle}>Toolkit Capacity</Text> */}
              <Text style={styles.rowTitle}>Neural Marketplace</Text>
              <Text style={styles.rowSubtitle}>Manage integrations & capabilities</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* PREVIEW-ONLY: Team Hub */}
          <TouchableOpacity style={styles.row} onPress={() => router.push('/team-hub')}>
            <View style={styles.rowIcon}>
              <Ionicons name="people" size={20} color={colors.primary[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Team Hub</Text>
              <Text style={styles.rowSubtitle}>Preview: Team collaboration feed</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* PREVIEW-ONLY: Execution Status */}
          <TouchableOpacity style={styles.row} onPress={() => router.push('/execution-status')}>
            <View style={styles.rowIcon}>
              <Ionicons name="checkmark-done" size={20} color={colors.primary[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Execution Status</Text>
              <Text style={styles.rowSubtitle}>Preview: Action tracking screen</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* CONFIGURATION */}
        <Text style={styles.sectionLabel}>CONFIGURATION</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/connect-platforms')}>
            <Text style={styles.rowTitle}>Connected Apps</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* SYSTEM PREFS */}
        <Text style={styles.sectionLabel}>SYSTEM PREFS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.primary[500], false: colors.neutral[700] }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ true: colors.primary[500], false: colors.neutral[700] }}
            />
          </View>
        </View>

        {/* DANGER ZONE */}
        <Text style={[styles.sectionLabel, { color: colors.semantic.error, marginTop: spacing[6] }]}>DANGER ZONE</Text>
        <View style={[styles.card, { borderColor: colors.semantic.error, borderWidth: 1 }]}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.semantic.error} />
            <Text style={[styles.rowTitle, { color: colors.semantic.error }]}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={colors.semantic.error} />
            <Text style={[styles.rowTitle, { color: colors.semantic.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView >
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
    paddingTop: spacing[8], // Matches Home Tab alignment
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[4],
    backgroundColor: colors.background,
  },
  greeting: {
    ...typography.textStyles.h2,
    color: colors.text,
    marginBottom: spacing[2],
  },
  briefing: {
    ...typography.textStyles.body,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  highlight: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  profileBtn: {
    // opacity: 0.8
  },
  avatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E', // Green-500
    borderWidth: 2,
    borderColor: colors.background,
  },
  scrollContent: {
    padding: spacing[4],
    gap: spacing[6],
    paddingBottom: 100
  },
  sectionLabel: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
    marginLeft: 4,
    marginBottom: -8, // pull closer to card
  },
  // Mode Cards
  modeContainer: {
    gap: 12,
  },
  modeCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeCardActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  modeTitleActive: {
    color: '#FFF',
  },
  modeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modeDescActive: {
    color: 'rgba(255,255,255,0.8)'
  },
  pixelTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pixelText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  // Standard Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
    minHeight: 44, // Ensure touch target size
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rowTitle: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 60, // Fixed: Align with text (32 icon + 12 gap + 16 padding)
  },
  // Sub Card
  subCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[5],
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    borderRadius: borderRadius.xl,
  },
  subTitle: {
    fontWeight: 'bold',
    color: colors.text,
  },
  subDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2, // Fixed: spacing[0.5] invalid
  },
  subAction: {
    fontWeight: 'bold',
    color: colors.primary[500],
  },
});


