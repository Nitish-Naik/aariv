import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: January 2026</Text>

        <Section title="1. Agreement">
          <Text style={styles.paragraph}>
            By using Aariv, you agree to these Terms. If you do not agree, please do not use the app.
          </Text>
        </Section>

        <Section title="2. What Aariv provides">
          <Text style={styles.paragraph}>Aariv:</Text>
          <Bullet>Prepares suggested actions</Bullet>
          <Bullet>Drafts responses and schedules</Bullet>
          <Bullet>Executes actions only after your approval</Bullet>
          <Bullet>Connects to third-party services you choose</Bullet>
          <Text style={[styles.paragraph, styles.highlight, { marginTop: 8 }]}>
            Aariv does not act autonomously.
          </Text>
        </Section>

        <Section title="3. Your responsibility">
          <Text style={styles.paragraph}>You remain responsible for:</Text>
          <Bullet>Reviewing all suggested actions</Bullet>
          <Bullet>Approving or rejecting executions</Bullet>
          <Bullet>Ensuring accuracy of final actions</Bullet>
          <Text style={[styles.paragraph, { marginTop: 8 }]}>
            Aariv assists with decisions. You make the final call.
          </Text>
        </Section>

        <Section title="4. Third-party services">
          <Text style={styles.paragraph}>
            Aariv integrates with external platforms (Google, Slack, etc.). These services:
          </Text>
          <Bullet>Operate under their own terms</Bullet>
          <Bullet>Are responsible for their availability and behavior</Bullet>
          <Text style={styles.paragraph}>
            Aariv is not responsible for third-party service outages or errors.
          </Text>
        </Section>

        <Section title="5. Limitations">
          <Text style={styles.paragraph}>
            Aariv is a productivity assistant, not:
          </Text>
          <Bullet>A legal advisor</Bullet>
          <Bullet>A financial advisor</Bullet>
          <Bullet>A medical advisor</Bullet>
          <Text style={styles.paragraph}>
            Suggestions are informational and require your judgment.
          </Text>
        </Section>

        <Section title="6. Account termination">
          <Text style={styles.paragraph}>
            You may stop using Aariv at any time. We may suspend access if the service is misused or abused.
          </Text>
        </Section>

        <Section title="7. Changes">
          <Text style={styles.paragraph}>
            We may update these Terms. Continued use means acceptance of changes.
          </Text>
        </Section>

        <Section title="8. Contact">
          <TouchableOpacity onPress={() => {/* In real app, open email */ }}>
            <Text style={styles.link}>support@aariv.app</Text>
          </TouchableOpacity>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const { isDark } = useTheme();
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
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
