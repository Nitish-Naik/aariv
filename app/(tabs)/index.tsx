import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, typography } from '../../theme';
import { MOCK_ACTIONS } from '../../utils/mockData';

export default function HomeTab() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const pendingActions = MOCK_ACTIONS;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Morning Briefing */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.briefing}>
            You have <Text style={styles.highlight}>3 overlapping meetings</Text> and <Text style={styles.highlight}>1 urgent email</Text> from Nitish requiring attention.
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/voice-mode')} style={styles.micButton}>
          <Ionicons name="mic" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Zen Mode / Review Queue Main CTA */}
      <TouchableOpacity 
        style={styles.zenModeCard}
        onPress={() => router.push('/zen-mode')}
        activeOpacity={0.9}
      >
        <View style={styles.zenContent}>
            <View style={styles.zenIconContainer}>
                <Ionicons name="documents-outline" size={32} color={colors.primary[500]} />
            </View>
            <View>
                <Text style={styles.zenTitle}>Daily Review</Text>
                <Text style={styles.zenSubtitle}>{pendingActions.length} decisions pending</Text>
            </View>
        </View>
        <View style={styles.zenArrow}>
            <Ionicons name="arrow-forward" size={24} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>

      {/* Integration Status Hub */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <Card style={styles.statusCard}>
             <View style={styles.statusItem}>
                <View style={styles.statusLeft}>
                    <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.statusText}>Gmail Indexing</Text>
                </View>
                <Text style={styles.statusValue}>Complete</Text>
             </View>
             
             <View style={styles.divider} />

             <View style={styles.statusItem}>
                <View style={styles.statusLeft}>
                    <Ionicons name="logo-slack" size={20} color={colors.textSecondary} />
                    <Text style={styles.statusText}>Slack Channels</Text>
                </View>
                <View style={styles.statusRight}>
                     <View style={[styles.dot, { backgroundColor: colors.semantic.warning }]} />
                     <Text style={styles.statusValue}>Reading...</Text>
                </View>
             </View>

             <View style={styles.divider} />

             <View style={styles.statusItem}>
                <View style={styles.statusLeft}>
                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.statusText}>Calendar Optimize</Text>
                </View>
                 <Text style={styles.statusValue}>Active</Text>
             </View>
        </Card>
      </View>

        {/* Quick Tips */}
       <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nudgeScroll}>
            <Card style={styles.nudgeCard}>
                <Text style={styles.nudgeText}>You spend 45% of your time in recurring meetings.</Text>
            </Card>
            <Card style={styles.nudgeCard}>
                <Text style={styles.nudgeText}>Fridays are your most productive coding days.</Text>
            </Card>
        </ScrollView>
       </View>

      <View style={{height: 100}} />
    </ScrollView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing[6],
    paddingTop: spacing[12],
  },
  header: {
    marginBottom: spacing[8],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[4],
  },
  micButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
  },
  greeting: {
    ...typography.textStyles.h2,
    color: colors.text,
    marginBottom: spacing[2],
  },
  briefing: {
    ...typography.textStyles.body,
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  highlight: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  
  // Zen Mode Card
  zenModeCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing[5],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing[8],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 16,
      elevation: 4,
  },
  zenContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[4],
  },
  zenIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
  },
  zenTitle: {
      ...typography.textStyles.h4,
      color: colors.text,
      marginBottom: 2,
  },
  zenSubtitle: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
  },
  zenArrow: {
      padding: spacing[2],
  },

  // Status Section
  section: {
      marginBottom: spacing[8],
  },
  sectionTitle: {
      ...typography.textStyles.bodySmall,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing[4],
      fontWeight: '600',
  },
  statusCard: {
      padding: 0, // Custom padding for list items
      overflow: 'hidden',
  },
  statusItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing[4],
  },
  statusLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
  },
  statusText: {
      ...typography.textStyles.body,
      color: colors.text,
  },
  statusRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
  },
  statusValue: {
      ...typography.textStyles.bodySmall,
      color: colors.textSecondary,
  },
  dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  divider: {
      height: 1,
      backgroundColor: colors.border,
  },

  // Insights
  nudgeScroll: {
      marginHorizontal: -spacing[6],
      paddingHorizontal: spacing[6],
  },
  nudgeCard: {
      width: 200,
      marginRight: spacing[4],
      backgroundColor: colors.surfaceElevated,
      height: 120,
      justifyContent: 'center',
  },
  nudgeText: {
      ...typography.textStyles.bodySmall,
      color: colors.textSecondary,
      lineHeight: 20,
  },
});
