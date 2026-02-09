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
});

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = pal(isDark);
  const styles = {
    lastUpdated: {
      fontSize: 12,
      color: c.textMut,
      marginBottom: 24,
      fontStyle: "italic" as "italic",
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 24,
      color: c.textSec,
      marginBottom: 12,
    },
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
          Terms of Service
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={ls.content}>
        <Text style={styles.lastUpdated}>Last updated: January 2026</Text>

        <Text style={styles.paragraph}>
          Welcome to Aariv. By using the app, you agree to the terms below.
        </Text>

        <Section title="1. Service Overview">
          <Text style={styles.paragraph}>
            Aariv is a personal productivity assistant that helps you manage and
            interact with connected apps (such as email and calendar) in one
            place.
          </Text>
        </Section>

        <Section title="2. Eligibility">
          <Text style={styles.paragraph}>You must:</Text>
          <Bullet>Be at least 13 years old</Bullet>
          <Bullet>
            Use Aariv only with accounts you own or are authorized to access
          </Bullet>
        </Section>

        <Section title="3. Your Responsibilities">
          <Text style={styles.paragraph}>You agree to:</Text>
          <Bullet>Keep your account secure</Bullet>
          <Bullet>Use the app lawfully and respectfully</Bullet>
          <Bullet>Not misuse or abuse connected services</Bullet>
        </Section>

        <Section title="4. Permissions & Connected Apps">
          <Text style={styles.paragraph}>
            By connecting an app, you grant Aariv permission to access ONLY the
            data required to perform the actions you request.
          </Text>
          <Text style={styles.paragraph}>
            You can revoke permissions at any time.
          </Text>
        </Section>

        <Section title="5. Availability & Changes">
          <Text style={styles.paragraph}>Aariv is provided “as is”.</Text>
          <Bullet>Features may change or improve over time</Bullet>
          <Bullet>Temporary outages may occur</Bullet>
          <Text style={styles.paragraph}>
            We aim for reliability, but we don’t guarantee uninterrupted
            service.
          </Text>
        </Section>

        <Section title="6. Account Termination">
          <Text style={styles.paragraph}>
            You may delete your account at any time.
          </Text>
          <Text style={styles.paragraph}>
            We may suspend or terminate accounts if:
          </Text>
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
          <Text style={styles.paragraph}>
            We may update these terms. Continued use of Aariv means acceptance
            of the latest version.
          </Text>
        </Section>

        <Section title="9. Contact">
          <Text style={styles.paragraph}>Questions about these terms?</Text>
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
});
