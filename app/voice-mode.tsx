import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../services/api";
import { getCurrentUser } from "../services/auth";
import { borderRadius, spacing, typography } from "../theme";

type ListeningState = "idle" | "listening" | "thinking" | "speaking";

export default function VoiceModeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, isLoading: isAuthLoading } = useAuth();

  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Microphone access is required for voice mode.",
        );
      }
    })();

    return () => {
      if (recording.current) {
        recording.current.stopAndUnloadAsync();
      }
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const playAudio = useCallback(async (base64: string) => {
    try {
      setIsPlaying(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64}` },
        { shouldPlay: true },
      );
      sound.current = newSound;

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.error("Playback failed", e);
      setIsPlaying(false);
    }
  }, []);

  const sendAudioToBackend = useCallback(
    async (uri: string) => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setTranscript("Please login first.");
          setIsProcessing(false);
          return;
        }

        const formData = new FormData();
        formData.append("audio", {
          uri,
          type: "audio/m4a",
          name: "voice_command.m4a",
        } as any);
        formData.append("userId", currentUser.id);

        const finalUrl = `${API_URL || "http://localhost:3000/api"}/voice/chat`;

        const response = await fetch(finalUrl, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Backend Error:", text);
          setTranscript("Server error.");
          return;
        }

        const data = await response.json();

        if (data.replyText) {
          setTranscript(data.transcript || "");
          setReply(data.replyText);
          if (data.audioBase64) {
            await playAudio(data.audioBase64);
          } else {
            setIsPlaying(true);
            setTimeout(() => setIsPlaying(false), 3000);
          }
        } else {
          setTranscript(data.transcript || "");
          setReply("Sorry, I didn't understand.");
        }
      } catch (e) {
        console.error("Upload failed", e);
        setTranscript("Network error.");
        setReply("");
      } finally {
        setIsProcessing(false);
      }
    },
    [playAudio],
  );

  const startRecording = useCallback(async () => {
    try {
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      }

      if (sound.current) {
        await sound.current.stopAsync();
        await sound.current.unloadAsync();
        sound.current = null;
        setIsPlaying(false);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recording.current = newRecording;
      setIsRecording(true);
      setTranscript("");
      setReply("");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Microphone Error", "Failed to access microphone.");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording.current) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;

      if (uri) {
        await sendAudioToBackend(uri);
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Stop recording failed", error);
      setIsProcessing(false);
    }
  }, [sendAudioToBackend]);

  const handleMicPress = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const listeningState: ListeningState = useMemo(() => {
    if (isProcessing) return "thinking";
    if (isPlaying) return "speaking";
    if (isRecording) return "listening";
    return "idle";
  }, [isProcessing, isPlaying, isRecording]);

  const isSpeakingView =
    listeningState === "speaking" || listeningState === "thinking";
  const responseText =
    reply || "Tomorrow is light. Standup at 10, lunch with Mike at 1.";

  const displayTranscript = transcript
    ? `"${transcript}"`
    : "\"What does tomorrow look like?\"";
  const transcriptLabel = isSpeakingView
    ? listeningState === "thinking"
      ? "THINKING"
      : "SPEAKING"
    : "YOU SAID";
  const transcriptText = isSpeakingView
    ? `"${responseText}"`
    : displayTranscript;

  if (isAuthLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#0B0B0D" : "#F7F4F1",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={colors?.primary ? colors.primary[500] : "#6B7390"}
        />
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#0B0B0D" : "#F7F4F1",
        }}
      />
    );
  }

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {listeningState === "idle" ? (
        <View style={styles.startContent}>
          <View style={styles.sparkBadge}>
            <Ionicons name="sparkles" size={18} color={styles.sparkle.color} />
          </View>
          <Text style={styles.startTitle}>Talk to Aariv</Text>
          <Text style={styles.startSubtitle}>Voice is available on Pro</Text>

          <TouchableOpacity
            style={styles.startMicButton}
            onPress={handleMicPress}
            activeOpacity={0.9}
          >
            <Ionicons name="mic" size={20} color="#0B0B0D" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.modeContent}>
          <View
            style={[
              styles.orb,
              isSpeakingView ? styles.orbSpeaking : styles.orbListening,
            ]}
          >
            <Ionicons
              name={isSpeakingView ? "sparkles" : "mic"}
              size={22}
              color={
                isSpeakingView ? styles.sparkle.color : styles.listeningIcon.color
              }
            />
          </View>

          <Text style={styles.modeLabel}>
            {isSpeakingView ? "AARIV" : "LISTENING"}
          </Text>
          <Text
            style={[
              styles.modeTitle,
              isSpeakingView && styles.modeTitleSpeaking,
            ]}
          >
            {isSpeakingView ? responseText : "I'm here. Take your time."}
          </Text>

          <View
            style={[
              styles.transcriptCard,
              isSpeakingView && styles.transcriptCardSpeaking,
            ]}
          >
            <Text style={styles.transcriptLabel}>{transcriptLabel}</Text>
            <Text
              style={[
                styles.transcriptText,
                isSpeakingView && styles.transcriptTextSpeaking,
              ]}
            >
              {transcriptText}
            </Text>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleMicPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isRecording ? "mic" : "mic-off"}
                size={18}
                color={styles.controlIcon.color}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.endButton]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
              <Ionicons
                name="keypad-outline"
                size={18}
                color={styles.controlIcon.color}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0B0B0D" : "#F7F4F1",
    },
    sparkle: {
      color: isDark ? "#E6D6C6" : "#7C6C5A",
    },
    startContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing[6],
      gap: spacing[3],
    },
    sparkBadge: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "#24242A" : "#EEE7DF",
      marginBottom: spacing[3],
    },
    startTitle: {
      ...typography.textStyles.h3,
      color: isDark ? "#F2EDE6" : "#2E2620",
    },
    startSubtitle: {
      ...typography.textStyles.bodySmall,
      color: isDark ? "rgba(255,255,255,0.55)" : "#6E6258",
      marginBottom: spacing[6],
    },
    startMicButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#8BC79A",
      shadowColor: "#8BC79A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    modeContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing[6],
    },
    orb: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing[5],
    },
    orbListening: {
      backgroundColor: isDark ? "#222328" : "#E8E6E3",
    },
    orbSpeaking: {
      backgroundColor: isDark ? "#1F2025" : "#E4E1DD",
    },
    listeningIcon: {
      color: isDark ? "#D5CDC4" : "#7B6F65",
    },
    modeLabel: {
      ...typography.textStyles.caption,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: isDark ? "rgba(255,255,255,0.4)" : "#A39487",
      marginBottom: spacing[2],
    },
    modeTitle: {
      ...typography.textStyles.h4,
      color: isDark ? "#F2EDE6" : "#2E2620",
      textAlign: "center",
      marginBottom: spacing[6],
    },
    modeTitleSpeaking: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600",
      maxWidth: 300,
    },
    transcriptCard: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: isDark ? "#15151A" : "#FFFFFF",
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      borderWidth: 1,
      borderColor: isDark ? "#222228" : "#EFE6DC",
      marginBottom: spacing[7],
    },
    transcriptCardSpeaking: {
      backgroundColor: isDark ? "#17181C" : "#F2EFEB",
      borderColor: isDark ? "#1F2025" : "#E5DED6",
    },
    transcriptLabel: {
      ...typography.textStyles.caption,
      color: isDark ? "rgba(255,255,255,0.35)" : "#A39487",
      letterSpacing: 1.2,
      marginBottom: spacing[2],
    },
    transcriptText: {
      ...typography.textStyles.bodySmall,
      color: isDark ? "#D8D1C8" : "#6E6258",
      fontStyle: "italic",
    },
    transcriptTextSpeaking: {
      fontSize: 13,
      lineHeight: 18,
    },
    controlRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing[4],
    },
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#1B1C20" : "#EEE7DF",
    },
    controlIcon: {
      color: isDark ? "#CFC8BF" : "#7C6C5A",
    },
    endButton: {
      backgroundColor: "#D35D5D",
      width: 56,
      height: 56,
      borderRadius: 28,
    },
  });
