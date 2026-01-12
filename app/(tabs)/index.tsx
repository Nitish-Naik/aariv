import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
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
<SafeAreaView style={styles.container} edges={['top']}>
<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
<Text style={styles.sectionTitle}>System Status</Text>
<TouchableOpacity onPress={() => router.push('/toolkits')}>
<Text style={{ color: colors.primary[500], fontSize: 13, fontWeight: '600', marginBottom: spacing[4] }}>+ Add Toolkit</Text>
</TouchableOpacity>
</View>
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

{/* Bottom Copilot Bar */}
{/* <KeyboardAvoidingView
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
<TouchableOpacity style={styles.micButtonSmall}>
<Ionicons name="arrow-up-circle" size={24} color={colors.primary[500]} />
</TouchableOpacity>
</View>
</View>
</KeyboardAvoidingView> */}
</SafeAreaView>
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
paddingBottom: 100, // Ensure scroll space for Copilot Bar
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

// Integration Status
section: {
marginBottom: spacing[8],
},
sectionTitle: {
...typography.textStyles.h4,
color: colors.text,
marginBottom: spacing[4],
},
statusCard: {
padding: 0,
backgroundColor: colors.surface,
borderWidth: 1,
borderColor: colors.border,
overflow: 'hidden',
},
statusItem: {
padding: spacing[4],
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
statusLeft: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing[3],
},
statusText: {
...typography.textStyles.bodySmall,
color: colors.text,
fontWeight: '500',
},
statusRight: {
flexDirection: 'row',
alignItems: 'center',
gap: spacing[2],
},
dot: {
width: 6,
height: 6,
borderRadius: 3,
},
statusValue: {
...typography.textStyles.caption,
color: colors.textTertiary,
fontWeight: '600',
},
divider: {
height: 1,
backgroundColor: colors.border,
marginHorizontal: spacing[4],
},

// Nudges
nudgeScroll: {
marginHorizontal: -spacing[6],
paddingHorizontal: spacing[6],
},
nudgeCard: {
width: 260,
marginRight: spacing[4],
backgroundColor: isDark ? '#1E293B' : '#F1F5F9', // Slate-800 or Slate-100
borderColor: 'transparent',
padding: spacing[5],
},
nudgeText: {
...typography.textStyles.body,
fontSize: 15,
color: colors.text,
lineHeight: 24,
},

// Copilot Bar
copilotBarWrapper: {
position: 'absolute',
bottom: 90, // Pushed UP to avoid Floating Tab Dock
left: 0,
right: 0,
alignItems: 'center',
zIndex: 100,
},
copilotBar: {
width: '90%',
maxWidth: 400,
backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
borderRadius: 30,
padding: 6,
borderWidth: 1,
borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',

shadowColor: "#000",
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.25,
shadowRadius: 8,
elevation: 8,
},
copilotInputContainer: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: spacing[3],
height: 44,
},
copilotIcon: {
marginRight: spacing[2],
opacity: 0.8
},
copilotInput: {
flex: 1,
color: colors.text,
...typography.textStyles.body,
fontSize: 15,
},
micButtonSmall: {
padding: spacing[2],
backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
borderRadius: 100,
},
});

















