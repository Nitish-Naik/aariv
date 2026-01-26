import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';

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

        <Text style={styles.paragraph}>
          Aariv is built to be a calm, low-stress place to manage your digital life.
          Your privacy and trust are fundamental to how we design and operate the product.
        </Text>
        <Text style={styles.paragraph}>
          This Privacy Policy explains what data we collect, why we collect it, and how you stay in control.
        </Text>

        <Section title="1. Information We Collect">
          <Text style={styles.subHeader}>1.1 Account Information (Required)</Text>
          <Text style={styles.paragraph}>When you sign in using Google, we collect:</Text>
          <Bullet>Your name</Bullet>
          <Bullet>Your email address</Bullet>
          <Bullet>Your profile photo (avatar)</Bullet>
          <Bullet>Authentication identifiers required to keep you signed in securely</Bullet>
          <Text style={[styles.paragraph, styles.highlight]}>We do not collect passwords.</Text>

          <Text style={[styles.subHeader, { marginTop: 16 }]}>1.2 Connected App Data (Only With Your Consent)</Text>
          <Text style={styles.paragraph}>If you choose to connect apps like Gmail or Google Calendar, we may access:</Text>
          <Bullet>Email metadata (sender, subject, timestamp)</Bullet>
          <Bullet>Calendar metadata (event title, date, time)</Bullet>
          <Bullet>Connection status (which apps are connected)</Bullet>
          <Text style={[styles.paragraph, styles.highlight]}>
            This data is accessed only to perform actions you explicitly request.
          </Text>
        </Section>

        <Section title="2. What We Do NOT Collect">
          <Text style={styles.paragraph}>We want to be very clear. Aariv does NOT:</Text>
          <Bullet>Read or modify your emails without your action</Bullet>
          <Bullet>Permanently store full email bodies unless required for a feature</Bullet>
          <Bullet>Access files, photos, or personal drives</Bullet>
          <Bullet>Sell or share your data</Bullet>
          <Bullet>Use your personal data to train AI models</Bullet>
        </Section>

        <Section title="3. How App Integrations Work">
          <Text style={styles.paragraph}>When you connect an external app:</Text>
          <Bullet>Access is granted through secure, industry-standard authorization</Bullet>
          <Bullet>Permissions are limited to what the feature requires</Bullet>
          <Bullet>You can revoke access at any time</Bullet>
          <Text style={styles.paragraph}>All integrations are handled through secure, SOC-compliant providers.</Text>
        </Section>

        <Section title="4. Your Control & Choices">
          <Text style={styles.paragraph}>You are always in control of your data:</Text>
          <Bullet>Connect or disconnect apps at any time</Bullet>
          <Bullet>Choose what actions Aariv can perform</Bullet>
          <Bullet>Delete your account whenever you want</Bullet>
        </Section>

        <Section title="5. Data Deletion">
          <Text style={styles.paragraph}>If you delete your account:</Text>
          <Bullet>All your user data is permanently removed</Bullet>
          <Bullet>All connected integrations are revoked</Bullet>
          <Bullet>Active sessions are invalidated immediately</Bullet>
          <Text style={[styles.paragraph, styles.highlight]}>Deleted data cannot be recovered.</Text>
        </Section>

        <Section title="6. Security">
          <Text style={styles.paragraph}>We use industry-standard security practices, including:</Text>
          <Bullet>Secure authentication</Bullet>
          <Bullet>Encrypted data transmission</Bullet>
          <Bullet>Access controls and monitoring</Bullet>
          <Text style={styles.paragraph}>No system is perfect, but protecting your data is a top priority.</Text>
        </Section>

        <Section title="7. Changes to This Policy">
          <Text style={styles.paragraph}>
            We may update this policy as Aariv evolves.
            If changes are significant, we’ll notify you in the app.
          </Text>
        </Section>

        <Section title="8. Contact Us">
          <Text style={styles.paragraph}>If you have questions or concerns:</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:support@aariv.app')}>
            <Text style={styles.link}>support@aariv.app</Text>
          </TouchableOpacity>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components for consistency
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
