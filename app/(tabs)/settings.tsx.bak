import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

export default function SettingsTab() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const styles = getStyles(colors, isDark);

  const [mode, setMode] = useState<'passive' | 'active'>('active');
  const [readEmail, setReadEmail] = useState(true);
  const [readCalendar, setReadCalendar] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Protocols</Text>
        <Text style={styles.headerSubtitle}>Configure assistant behavior and permissions.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Operating Mode Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operating Mode</Text>
            <View style={styles.modeSelector}>
                <TouchableOpacity 
                    style={[styles.modeOption, mode === 'passive' && styles.modeActive]}
                    onPress={() => setMode('passive')}
                >
                    <Ionicons name="shield-checkmark-outline" size={24} color={mode === 'passive' ? '#FFF' : colors.textSecondary} />
                    <Text style={[styles.modeText, mode === 'passive' && styles.modeTextActive]}>Passive</Text>
                    <Text style={[styles.modeSub, mode === 'passive' && styles.modeTextActive]}>Wait for commands</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.modeOption, mode === 'active' && styles.modeActive]}
                    onPress={() => setMode('active')}
                >
                    <Ionicons name="flash-outline" size={24} color={mode === 'active' ? '#FFF' : colors.textSecondary} />
                    <Text style={[styles.modeText, mode === 'active' && styles.modeTextActive]}>Executive</Text>
                    <Text style={[styles.modeSub, mode === 'active' && styles.modeTextActive]}>Proactive action</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Neural Link Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Neural Access</Text>
            <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Inbox Read Access</Text>
                    <Text style={styles.settingDesc}>Allow scanning of high-priority emails.</Text>
                </View>
                <Switch 
                    value={readEmail} 
                    onValueChange={setReadEmail} 
                    trackColor={{ false: colors.border, true: colors.primary[500] }}
                />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Calendar Negotiation</Text>
                    <Text style={styles.settingDesc}>Allow moving flexible meetings automatically.</Text>
                </View>
                <Switch 
                    value={readCalendar} 
                    onValueChange={setReadCalendar} 
                    trackColor={{ false: colors.border, true: colors.primary[500] }}
                />
            </View>
        </View>

        {/* Brain Access */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Memory & Knowledge</Text>
            <TouchableOpacity 
                style={styles.brainCard}
                onPress={() => router.push('/knowledge-graph')}
            >
                <View style={styles.brainIcon}>
                    <Ionicons name="git-network-outline" size={24} color={colors.primary[400]} />
                </View>
                <View style={styles.brainContent}>
                    <Text style={styles.brainTitle}>View Knowledge Graph</Text>
                    <Text style={styles.brainSubtitle}>128 nodes • 45 relationships</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={toggleTheme}>
                 <Text style={styles.actionText}>Toggle Theme (Dev)</Text>
                 <Text style={styles.actionValue}>{isDark ? 'Dark' : 'Light'}</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Assistant v2.4.0 • Neural Core v1.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  headerTitle: {
    ...typography.textStyles.h2,
    color: colors.text,
    marginBottom: spacing[2],
  },
  headerSubtitle: {
      ...typography.textStyles.body,
      color: colors.textSecondary,
  },
  content: {
    padding: spacing[6],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionTitle: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[4],
    fontWeight: '600',
  },
  
  // Mode Selector
  modeSelector: {
      flexDirection: 'row',
      gap: spacing[4],
  },
  modeOption: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
  },
  modeActive: {
      backgroundColor: colors.primary[600],
      borderColor: colors.primary[600],
  },
  modeText: {
      ...typography.textStyles.h4,
      color: colors.text,
      marginTop: spacing[2],
      marginBottom: 2,
  },
  modeSub: {
      fontSize: 12,
      color: colors.textSecondary,
  },
  modeTextActive: {
      color: '#FFF',
  },

  // Rows
  settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing[2],
  },
  settingInfo: {
      flex: 1,
      paddingRight: spacing[4],
  },
  settingLabel: {
      ...typography.textStyles.body,
      color: colors.text,
      fontWeight: '500',
  },
  settingDesc: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
  },
  divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing[4],
  },

  // Brain Card
  brainCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing[4],
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[4],
  },
  brainIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[4],
  },
  brainContent: {
      flex: 1,
  },
  brainTitle: {
      ...typography.textStyles.body,
      color: colors.text,
      fontWeight: '600',
  },
  brainSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
  },

  actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing[3],
  },
  actionText: {
      color: colors.text,
  },
  actionValue: {
      color: colors.textTertiary,
  },

  versionText: {
      textAlign: 'center',
      color: colors.textTertiary,
      fontSize: 12,
      marginTop: spacing[8],
  }
});
