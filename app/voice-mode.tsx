import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Platform,
    ScrollView,
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

const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

type ListeningState = "idle" | "listening" | "thinking" | "speaking";

const pal = (dark: boolean) => ({
  bg: dark ? "#0c0c0e" : "#f7f6f4",
  card: dark ? "#141416" : "#ffffff",
  elevated: dark ? "#1a1a1d" : "#f0efed",
  accentSoft: dark ? "rgba(139,149,176,0.12)" : "rgba(107,116,144,0.1)",
  accent: dark ? "#8b95b0" : "#6b7490",
  textPri: dark ? "#e4e2df" : "#1a1918",
  textSec: dark ? "#908c88" : "#6a6662",
  textMut: dark ? "#5a5754" : "#9a9794",
  border: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  danger: "#c45c5c",
});

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

  /* ── timer ── */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isRecording || isPlaying || isProcessing) {
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPlaying, isProcessing]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  /* ── pulse animation ── */
  const pulseAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (listeningState !== "idle") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.9,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [listeningState, pulseAnim]);

  const c = pal(isDark);

  const statusText =
    listeningState === "listening"
      ? "Listening..."
      : listeningState === "thinking"
        ? "Thinking..."
        : listeningState === "speaking"
          ? "Speaking..."
          : "Tap to start";

  if (isAuthLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  if (!user) {
    return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={vs.content}>
        {/* Avatar + pulse ring */}
        <View style={vs.avatarWrap}>
          {listeningState !== "idle" && (
            <Animated.View
              style={[
                vs.pulseRing,
                {
                  borderColor: c.accent,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          )}
          <View style={[vs.avatar, { backgroundColor: c.accentSoft }]}>
            <Text style={vs.avatarIcon}>✦</Text>
          </View>
        </View>

        {/* Status + Timer */}
        <Text style={[vs.status, { color: c.textPri }]}>{statusText}</Text>
        <Text style={[vs.timer, { color: c.textMut }]}>
          {formatTime(seconds)}
        </Text>

        {/* Controls */}
        <View style={vs.controls}>
          <TouchableOpacity
            style={[
              vs.ctrlBtn,
              {
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
              },
            ]}
            onPress={handleMicPress}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 24 }}>{isRecording ? "🔇" : "🎤"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[vs.ctrlBtn, vs.endBtn]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20, color: "#fff" }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Transcript */}
        {transcript || reply ? (
          <View style={[vs.transcriptCard, { backgroundColor: c.card }]}>
            <ScrollView
              style={{ maxHeight: 150 }}
              showsVerticalScrollIndicator={false}
            >
              {transcript ? (
                <Text style={[vs.tLine, { color: c.textPri }]}>
                  You: {transcript}
                </Text>
              ) : null}
              {reply ? (
                <Text style={[vs.tLine, { color: c.textSec }]}>
                  Aariv: {reply}
                </Text>
              ) : null}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

/* ── styles ── */
const vs = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  pulseRing: {
    position: "absolute",
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 2,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: 48,
  },
  status: {
    fontSize: 18,
    marginBottom: 8,
  },
  timer: {
    fontSize: 14,
    marginBottom: 40,
  },
  controls: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "center",
    marginBottom: 40,
  },
  ctrlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  endBtn: {
    backgroundColor: "#c45c5c",
  },
  transcriptCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
  },
  tLine: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
});
