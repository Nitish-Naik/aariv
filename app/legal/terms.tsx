import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

        <Text style={styles.paragraph}>
          Welcome to Aariv. By using the app, you agree to the terms below.
        </Text>

        <Section title="1. Service Overview">
          <Text style={styles.paragraph}>
            Aariv is a personal productivity assistant that helps you manage and interact with connected apps (such as email and calendar) in one place.
          </Text>
        </Section>

        <Section title="2. Eligibility">
          <Text style={styles.paragraph}>You must:</Text>
          <Bullet>Be at least 13 years old</Bullet>
          <Bullet>Use Aariv only with accounts you own or are authorized to access</Bullet>
        </Section>

        <Section title="3. Your Responsibilities">
          <Text style={styles.paragraph}>You agree to:</Text>
          <Bullet>Keep your account secure</Bullet>
          <Bullet>Use the app lawfully and respectfully</Bullet>
          <Bullet>Not misuse or abuse connected services</Bullet>
        </Section>

        <Section title="4. Permissions & Connected Apps">
          <Text style={styles.paragraph}>
            By connecting an app, you grant Aariv permission to access ONLY the data required to perform the actions you request.
          </Text>
          <Text style={styles.paragraph}>You can revoke permissions at any time.</Text>
        </Section>

        <Section title="5. Availability & Changes">
          <Text style={styles.paragraph}>Aariv is provided “as is”.</Text>
          <Bullet>Features may change or improve over time</Bullet>
          <Bullet>Temporary outages may occur</Bullet>
          <Text style={styles.paragraph}>We aim for reliability, but we don’t guarantee uninterrupted service.</Text>
        </Section>

        <Section title="6. Account Termination">
          <Text style={styles.paragraph}>You may delete your account at any time.</Text>
          <Text style={styles.paragraph}>We may suspend or terminate accounts if:</Text>
          <Bullet>Required by law</Bullet>
          <Bullet>There is misuse, abuse, or security risk</Bullet>
        </Section>

        <Section title="7. Limitation of Liability">
          <Text style={styles.paragraph}>Aariv is not responsible for:</Text>
          <Bullet>Third-party service outages (e.g., Google services)</Bullet>
          <Bullet>Data inaccuracies from connected platforms</Bullet>
          <Bullet>Indirect or incidental damages</Bullet>
        </Section>

        <Section title="8. Updates to These Terms">
          <Text style={styles.paragraph}>We may update these terms. Continued use of Aariv means acceptance of the latest version.</Text>
        </Section>

        <Section title="9. Contact">
          <Text style={styles.paragraph}>Questions about these terms?</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:support@aariv.app')}>
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
