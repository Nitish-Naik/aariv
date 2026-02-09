import { useRouter } from "expo-router";
import React from "react";
import {
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

const pal = (dark: boolean) => ({
  bg: dark ? "#0c0c0e" : "#f7f6f4",
  card: dark ? "#141416" : "#ffffff",
  accent: dark ? "#8b95b0" : "#6b7490",
  textPri: dark ? "#e4e2df" : "#1a1918",
  textSec: dark ? "#908c88" : "#6a6662",
  textMut: dark ? "#5a5754" : "#9a9794",
  border: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  success: "#7eb88a",
  successSoft: "rgba(126,184,138,0.12)",
});

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = pal(isDark);
  const styles = {
    paragraph: {
      fontSize: 14,
      lineHeight: 24,
      color: c.textSec,
      marginBottom: 12,
    },
    subHeader: {
      fontFamily: SERIF,
      fontSize: 16,
      fontWeight: "600" as "600",
      color: c.textPri,
      marginBottom: 8,
    },
    highlight: { color: c.accent, fontWeight: "500" as "500" },
    link: {
      color: c.accent,
      textDecorationLine: "underline" as "underline",
      fontSize: 14,
    },
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.bg }}
      edges={["top", "bottom"]}
    >
      <View style={[ls.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={ls.backBtn}>
          <Text style={[ls.backText, { color: c.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[ls.headerTitle, { color: c.textPri }]}>
          Privacy Policy
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={ls.content}>
        <Text style={[ls.updated, { color: c.textMut }]}>
          Last updated: January 2026
        </Text>

        <Text style={[ls.p, { color: c.textSec }]}>
          Aariv is built to be a calm, low-stress place to manage your digital
          life. Your privacy and trust are fundamental to how we design and
          operate the product.
        </Text>
        <Text style={[ls.p, { color: c.textSec }]}>
          This Privacy Policy explains what data we collect, why we collect it,
          and how you stay in control.
        </Text>

        <Section title="1. Information We Collect">
          <Text style={styles.subHeader}>
            1.1 Account Information (Required)
          </Text>
          <Text style={styles.paragraph}>
            When you sign in using Google, we collect:
          </Text>
          <Bullet>Your name</Bullet>
          <Bullet>Your email address</Bullet>
          <Bullet>Your profile photo (avatar)</Bullet>
          <Bullet>
            Authentication identifiers required to keep you signed in securely
          </Bullet>
          <Text style={[styles.paragraph, styles.highlight]}>
            We do not collect passwords.
          </Text>

          <Text style={[styles.subHeader, { marginTop: 16 }]}>
            1.2 Connected App Data (Only With Your Consent)
          </Text>
          <Text style={styles.paragraph}>
            If you choose to connect apps like Gmail or Google Calendar, we may
            access:
          </Text>
          <Bullet>Email metadata (sender, subject, timestamp)</Bullet>
          <Bullet>Calendar metadata (event title, date, time)</Bullet>
          <Bullet>Connection status (which apps are connected)</Bullet>
          <Text style={[styles.paragraph, styles.highlight]}>
            This data is accessed only to perform actions you explicitly
            request.
          </Text>
        </Section>

        <Section title="2. What We Do NOT Collect">
          <Text style={styles.paragraph}>
            We want to be very clear. Aariv does NOT:
          </Text>
          <Bullet>Read or modify your emails without your action</Bullet>
          <Bullet>
            Permanently store full email bodies unless required for a feature
          </Bullet>
          <Bullet>Access files, photos, or personal drives</Bullet>
          <Bullet>Sell or share your data</Bullet>
          <Bullet>Use your personal data to train AI models</Bullet>
        </Section>

        <Section title="3. How App Integrations Work">
          <Text style={styles.paragraph}>
            When you connect an external app:
          </Text>
          <Bullet>
            Access is granted through secure, industry-standard authorization
          </Bullet>
          <Bullet>Permissions are limited to what the feature requires</Bullet>
          <Bullet>You can revoke access at any time</Bullet>
          <Text style={styles.paragraph}>
            All integrations are handled through secure, SOC-compliant
            providers.
          </Text>
        </Section>

        <Section title="4. Your Control & Choices">
          <Text style={styles.paragraph}>
            You are always in control of your data:
          </Text>
          <Bullet>Connect or disconnect apps at any time</Bullet>
          <Bullet>Choose what actions Aariv can perform</Bullet>
          <Bullet>Delete your account whenever you want</Bullet>
        </Section>

        <Section title="5. Data Deletion">
          <Text style={styles.paragraph}>If you delete your account:</Text>
          <Bullet>All your user data is permanently removed</Bullet>
          <Bullet>All connected integrations are revoked</Bullet>
          <Bullet>Active sessions are invalidated immediately</Bullet>
          <Text style={[styles.paragraph, styles.highlight]}>
            Deleted data cannot be recovered.
          </Text>
        </Section>

        <Section title="6. Security">
          <Text style={styles.paragraph}>
            We use industry-standard security practices, including:
          </Text>
          <Bullet>Secure authentication</Bullet>
          <Bullet>Encrypted data transmission</Bullet>
          <Bullet>Access controls and monitoring</Bullet>
          <Text style={styles.paragraph}>
            No system is perfect, but protecting your data is a top priority.
          </Text>
        </Section>

        <Section title="7. Changes to This Policy">
          <Text style={styles.paragraph}>
            We may update this policy as Aariv evolves. If changes are
            significant, we’ll notify you in the app.
          </Text>
        </Section>

        <Section title="8. Contact Us">
          <Text style={styles.paragraph}>
            If you have questions or concerns:
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("mailto:support@aariv.app")}
          >
            <Text style={styles.link}>support@aariv.app</Text>
          </TouchableOpacity>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helpers
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const { isDark } = useTheme();
  const c = pal(isDark);
  return (
    <View style={{ marginBottom: 28 }}>
      <Text
        style={{
          fontFamily: SERIF,
          fontSize: 18,
          fontWeight: "500",
          color: c.textPri,
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};

const Bullet = ({ children }: { children: string }) => {
  const { isDark } = useTheme();
  const c = pal(isDark);
  return (
    <View style={{ flexDirection: "row", marginBottom: 8, paddingLeft: 8 }}>
      <Text style={{ color: c.textMut, marginRight: 8 }}>•</Text>
      <Text style={{ color: c.textSec, fontSize: 14, lineHeight: 22, flex: 1 }}>
        {children}
      </Text>
    </View>
  );
};

const ls = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 15 },
  headerTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: "500" },
  content: { padding: 24 },
  updated: { fontSize: 12, marginBottom: 24 },
  p: { fontSize: 14, lineHeight: 24, marginBottom: 12 },
});
