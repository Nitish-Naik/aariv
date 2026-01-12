import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: January 2026</Text>

        <Section title="1. What Aariv is">
          <Text style={styles.paragraph}>
            Aariv is a personal productivity assistant that helps you manage your calendar, communications, and tasks by preparing actions for your review. Aariv never performs actions without your approval.
          </Text>
          <Text style={styles.paragraph}>
            Our guiding principle is simple:
          </Text>
          <Text style={[styles.paragraph, styles.highlight]}>
            We only access what’s needed to help you, we keep it briefly, and you stay in control.
          </Text>
        </Section>

        <Section title="2. Information we collect">
          <Text style={styles.subHeader}>Information you provide</Text>
          <Bullet>Google account email (used for login)</Bullet>
          <Bullet>Basic profile metadata (name, avatar if available)</Bullet>
          <Bullet>App preferences and permission choices</Bullet>

          <Text style={[styles.subHeader, { marginTop: 16 }]}>Information from connected services</Text>
          <Text style={styles.paragraph}>
            When you connect a service (e.g. Google Calendar, Gmail, Slack), Aariv may temporarily access:
          </Text>
          <Bullet>Event times and titles</Bullet>
          <Bullet>Sender, subject, and metadata of messages</Bullet>
          <Bullet>Scheduling availability</Bullet>
          <Text style={styles.paragraph}>
            This access is read-only unless you explicitly approve an action.
          </Text>
        </Section>

        <Section title="3. Information we do NOT store">
          <Text style={styles.paragraph}>
            Aariv is designed to forget noise. We do not permanently store:
          </Text>
          <Bullet>Full email bodies</Bullet>
          <Bullet>Message threads</Bullet>
          <Bullet>Attachments or files</Bullet>
          <Bullet>Calendar descriptions beyond what is required</Bullet>
          <Bullet>Voice recordings after processing</Bullet>
          <Bullet>Raw chat transcripts beyond the active session</Bullet>
        </Section>

        <Section title="4. How Aariv uses information">
          <Text style={styles.paragraph}>Your information is used only to:</Text>
          <Bullet>Prepare suggested actions</Bullet>
          <Bullet>Draft responses for review</Bullet>
          <Bullet>Identify patterns (e.g., preferred meeting times)</Bullet>
          <Bullet>Improve relevance of suggestions</Bullet>

          <Text style={[styles.paragraph, { marginTop: 8 }]}>Aariv does not:</Text>
          <Bullet>Sell your data</Bullet>
          <Bullet>Show ads</Bullet>
          <Bullet>Profile you for marketing</Bullet>
          <Bullet>Train public models on your personal content</Bullet>
        </Section>

        <Section title="5. Retention & automatic deletion">
          <Text style={styles.paragraph}>
            Aariv uses time-limited data retention by default.
          </Text>
          <Bullet>Raw context automatically expires after short time windows</Bullet>
          <Bullet>Approved actions are deleted after execution</Bullet>
          <Bullet>Behavioral learning stores patterns, not content</Bullet>
          <Bullet>You can manually delete everything at any time</Bullet>
          <Text style={[styles.paragraph, styles.highlight, { marginTop: 8 }]}>
            Wisdom stays. Noise disappears.
          </Text>
        </Section>

        <Section title="6. Security">
          <Text style={styles.paragraph}>We protect your data using:</Text>
          <Bullet>Encryption in transit (TLS)</Bullet>
          <Bullet>Encryption at rest</Bullet>
          <Bullet>Encrypted storage of third-party connection identifiers</Bullet>
          <Bullet>Strict access controls and audit logging</Bullet>
        </Section>

        <Section title="7. Your controls & rights">
          <Text style={styles.paragraph}>You can:</Text>
          <Bullet>Disconnect any service at any time</Bullet>
          <Bullet>Delete all stored data instantly</Bullet>
          <Bullet>Control permissions per connected app</Bullet>
          <Bullet>Adjust data retention settings</Bullet>
          <Bullet>Request account deletion</Bullet>
        </Section>

        <Section title="8. Changes">
          <Text style={styles.paragraph}>
            If we change this policy, we will notify you in-app and update the date above.
          </Text>
        </Section>

        <Section title="9. Contact">
          <Text style={styles.paragraph}>Questions or concerns?</Text>
          <TouchableOpacity onPress={() => {/* In real app, open email */}}>
              <Text style={styles.link}>privacy@aariv.app</Text>
          </TouchableOpacity>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components for consistency
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const { colors, isDark } = useTheme();
    return (
        <View style={{ marginBottom: 32 }}>
            <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: isDark ? '#FFFFFF' : '#111827',
                marginBottom: 12 
            }}>
                {title}
            </Text>
            {children}
        </View>
    );
};

const Bullet = ({ children }: { children: string }) => {
    const { colors } = useTheme();
    return (
        <View style={{ flexDirection: 'row', marginBottom: 8, paddingLeft: 8 }}>
            <Text style={{ color: colors.textSecondary, marginRight: 8 }}>•</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 24, flex: 1 }}>{children}</Text>
        </View>
    );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    padding: 24,
  },
  lastUpdated: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 32,
      fontStyle: 'italic',
  },
  paragraph: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.textSecondary,
      marginBottom: 12,
  },
  subHeader: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
  },
  highlight: {
      color: isDark ? '#6EE7B7' : '#059669', // Mint brand color
      fontWeight: '500',
  },
  link: {
      color: isDark ? '#6EE7B7' : '#059669',
      textDecorationLine: 'underline',
      fontSize: 15,
  }
});
