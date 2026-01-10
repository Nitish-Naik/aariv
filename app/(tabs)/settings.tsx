import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  
  // State
  const [operatingMode, setOperatingMode] = useState<'passive' | 'executive'>('passive');
  const [notifications, setNotifications] = useState(true);

  const styles = getStyles(colors, isDark);

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
        <Text style={styles.title}>Neural Protocols</Text>
        <TouchableOpacity style={styles.profileBtn}>
             <Ionicons name="person-circle" size={32} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* OPERATING MODE SELECTOR */}
        <Text style={styles.sectionLabel}>OPERATING MODE</Text>
        <View style={styles.modeContainer}>
            {renderModeCard(
                'passive', 
                'Passive Mode', 
                'Iris waits for commands. Acts only when explicitly asked. High control, zero risk.', 
                'shield-checkmark'
            )}
            {renderModeCard(
                'executive', 
                'Executive Mode', 
                'Iris acts proactively. Reschedules conflicts and drafts replies automatically.', 
                'flash'
            )}
        </View>

        {/* NEURAL ACCESS */}
        <Text style={styles.sectionLabel}>NEURAL ACCESS</Text>
        <View style={styles.card}>
             <TouchableOpacity style={styles.row} onPress={() => router.push('/knowledge-graph')}>
                 <View style={styles.rowIcon}>
                     <Ionicons name="git-network" size={20} color={colors.primary[500]} />
                 </View>
                 <View style={{flex: 1}}>
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
                 <View style={{flex: 1}}>
                     {/* <Text style={styles.rowTitle}>Toolkit Capacity</Text> */}
                     <Text style={styles.rowTitle}>Neural Marketplace</Text>
                     <Text style={styles.rowSubtitle}>Manage integrations & capabilities</Text>
                 </View>
                 <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
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
                    trackColor={{true: colors.primary[500], false: colors.neutral[700]}}
                 />
             </View>
             <View style={styles.divider} />
             <View style={styles.row}>
                 <Text style={styles.rowTitle}>Dark Mode</Text>
                 <Switch 
                    value={isDark} 
                    onValueChange={toggleTheme}
                    trackColor={{true: colors.primary[500], false: colors.neutral[700]}}
                 />
             </View>
        </View>

        {/* SUBSCRIPTION */}
        <TouchableOpacity style={styles.subCard} onPress={() => router.push('/paywall')}>
            <View>
                <Text style={styles.subTitle}>Pro Plan Active</Text>
                <Text style={styles.subDesc}>Next billing date: Nov 24</Text>
            </View>
            <Text style={styles.subAction}>Manage</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Copilot Bar */}
      <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          style={styles.copilotBarWrapper}
      >
          <View style={styles.copilotBar}>
              <View style={styles.copilotInputContainer}>
                  <Ionicons name="sparkles" size={20} color={colors.primary[500]} style={styles.copilotIcon} />
                  <TextInput 
                      style={styles.copilotInput}
                      placeholder="Ask Copilot..."
                      placeholderTextColor={isDark ? colors.textSecondary : colors.neutral[400]}
                  />
                  <TouchableOpacity style={styles.micButton}>
                      <Ionicons name="mic" size={20} color={colors.text} />
                  </TouchableOpacity>
              </View>
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text,
  },
  profileBtn: {
      opacity: 0.8
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
      padding: 16,
      gap: 12
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
      marginLeft: 60, // Align with text
  },
  // Sub Card
  subCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      borderRadius: 16,
  },
  subTitle: {
      fontWeight: 'bold',
      color: colors.text,
  },
  subDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
  },
  subAction: {
      fontWeight: 'bold',
      color: colors.primary[500],
  },
  // Copilot Bar
  copilotBarWrapper: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: isDark ? colors.border : '#E2E8F0',
  },
  copilotBar: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      paddingBottom: Platform.OS === 'ios' ? spacing[6] : spacing[3],
  },
  copilotInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#2D3748' : '#F1F5F9',
      borderRadius: 24,
      paddingHorizontal: spacing[4],
      height: 48,
  },
  copilotIcon: {
      marginRight: spacing[2],
  },
  copilotInput: {
      flex: 1,
      color: colors.text,
      ...typography.textStyles.body,
  },
  micButton: {
      padding: spacing[1],
  },
});
