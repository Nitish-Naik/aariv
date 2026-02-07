import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const cards = [
  {
    id: "email",
    kicker: "Email from Sarah",
    time: "2h ago",
    body:
      "Sarah asked about the Q4 timeline. Should I let her know we're targeting mid-November?",
    primary: "Yes, do it",
  },
  {
    id: "calendar",
    kicker: "Calendar",
    time: "Tomorrow",
    body:
      "You have back-to-back meetings from 9-12. Want me to add a 15-min buffer between them?",
    primary: "Yes, do it",
  },
];

const palette = {
  backgroundTop: "#0b0b0d",
  backgroundBottom: "#121218",
  card: "#141418",
  cardBorder: "#24242a",
  textPrimary: "#e8e4df",
  textSecondary: "#a5a1a0",
  textMuted: "#7a7780",
  buttonPrimary: "#8b93b2",
  buttonPrimaryText: "#11131a",
  buttonSecondary: "rgba(255,255,255,0.04)",
  buttonSecondaryBorder: "rgba(255,255,255,0.12)",
  buttonSecondaryText: "#b9bdc8",
};

const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const sans = Platform.select({
  ios: "Avenir Next",
  android: "sans-serif",
  default: "System",
});

const sansMedium = Platform.select({
  ios: "Avenir Next",
  android: "sans-serif-medium",
  default: "System",
});

export default function HomeTab() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[palette.backgroundTop, palette.backgroundBottom]}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Good evening</Text>
            <Text style={styles.subGreeting}>A few things for you</Text>
          </View>

          {cards.map((card, index) => (
            <View
              key={card.id}
              style={[styles.card, index > 0 && styles.cardSpacing]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardKicker}>{card.kicker}</Text>
                <Text style={styles.cardTime}>{card.time}</Text>
              </View>
              <Text style={styles.cardBody}>{card.body}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryButtonText}>Later</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>{card.primary}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.backgroundTop,
  },
  background: {
    flex: 1,
  },
  content: {
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 18,
  },
  greeting: {
    fontSize: 28,
    lineHeight: 34,
    color: palette.textPrimary,
    fontFamily: serif,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    lineHeight: 18,
    color: palette.textSecondary,
    fontFamily: sans,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardSpacing: {
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardKicker: {
    fontSize: 12,
    color: palette.textMuted,
    fontFamily: sansMedium,
  },
  cardTime: {
    fontSize: 12,
    color: "#6b6f7b",
    fontFamily: sans,
  },
  cardBody: {
    fontSize: 16,
    lineHeight: 22,
    color: "#e6e8ef",
    fontFamily: sans,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.buttonSecondary,
    borderWidth: 1,
    borderColor: palette.buttonSecondaryBorder,
  },
  secondaryButtonText: {
    color: palette.buttonSecondaryText,
    fontSize: 14,
    fontFamily: sansMedium,
  },
  primaryButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.buttonPrimary,
  },
  primaryButtonText: {
    color: palette.buttonPrimaryText,
    fontSize: 14,
    fontFamily: sansMedium,
  },
  bottomSpace: {
    height: 90,
  },
});
