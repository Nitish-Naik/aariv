import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/api'; // Ensure API_URL is accessible or use relative
import { getCurrentUser } from '../services/auth';
import { spacing, typography } from '../theme';

export default function VoiceModeScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    // Audio Refs
    const recording = useRef<Audio.Recording | null>(null);
    const sound = useRef<Audio.Sound | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Animation Values
    const scaleOuter = useRef(new Animated.Value(1)).current;
    const scaleInner = useRef(new Animated.Value(1)).current;
    const opacityPulse = useRef(new Animated.Value(0.3)).current;

    // Waveform animations (multiple bars)
    const barHeights = useRef([...Array(5)].map(() => new Animated.Value(10))).current;

    // Transcript
    const [transcript, setTranscript] = useState("Tap microphone to speak");
    const [reply, setReply] = useState("");

    useEffect(() => {
        // 1. Organic Breathing Orb Animation (Idle/Listening)
        const breathe = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleOuter, { toValue: 1.3, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(scaleOuter, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(scaleInner, { toValue: 0.8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(scaleInner, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityPulse, { toValue: 0.1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(opacityPulse, { toValue: 0.3, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ])
        );
        breathe.start();

        // Permissions
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Microphone access is required for voice mode.');
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

    // Waveform Animation Logic
    useEffect(() => {
        if (isPlaying) {
            startPlaybackWaveform();
        } else if (!isRecording) {
            // Stop if neither recording nor playing (idle/processing)
            // Note: recording handles its own animation via metering callback
            stopWaveform();
        }
    }, [isPlaying, isRecording]);

    // Helper to animate bars randomly for AI playback (simulated voice activity)
    const startPlaybackWaveform = () => {
        const animations = barHeights.map((anim) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: Math.random() * 40 + 10,
                        duration: 200 + Math.random() * 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(anim, {
                        toValue: 10,
                        duration: 200 + Math.random() * 200,
                        useNativeDriver: false,
                    })
                ])
            );
        });
        Animated.parallel(animations).start();
    };

    const stopWaveform = () => {
        barHeights.forEach(anim => {
            anim.stopAnimation();
            anim.setValue(10);
        });
    };

    // Helper to animate bars based on level (0-160 approx range for metering usually -160 to 0)
    const updateWaveform = (metering: number) => {
        // Metering is usually -160 (silence) to 0 (loud)
        // Normalize to 0-1
        const level = Math.max(0, (metering + 160) / 160);

        const animations = barHeights.map((anim) => {
            return Animated.timing(anim, {
                toValue: Math.max(10, level * 50 * Math.random()), // Randomize slightly for organic feel
                duration: 100,
                useNativeDriver: false,
            });
        });
        Animated.parallel(animations).start();
    };

    const startRecording = async () => {
        try {
            // Interruptibility: Stop AI if talking
            if (sound.current) {
                await sound.current.stopAndUnloadAsync();
                sound.current = null;
                setIsPlaying(false);
            }

            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Prepare
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
                (status) => {
                    if (status.isRecording && status.metering !== undefined) {
                        updateWaveform(status.metering);
                    }
                },
                100 // Update every 100ms
            );

            recording.current = newRecording;
            setIsRecording(true);
            setTranscript("Listening...");
            setReply("");

        } catch (err) {
            console.error("Failed to start recording", err);
        }
    };

    // ... (stopRecording and sendAudioToBackend remain roughly the same, reusing existing context) ...
    // Note: To match the instruction for accessibility, I need to fetch the return block too or do it in a separate chunk to be safe.
    // Since I cannot effectively "edit" the JSX in this same contiguous block without including the whole file body,
    // I will split this into two edits: Logic first, then JSX.
    // Wait, the instruction allows "SINGLE CONTIGUOUS block". The functions are separated from JSX.
    // I will do logic here and JSX in the next tool call to be safe and precise.

    const stopRecording = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRecording(false);
        setIsProcessing(true);
        setTranscript("Thinking...");

        // Reset bars
        stopWaveform();

        try {
            if (!recording.current) return;

            await recording.current.stopAndUnloadAsync();
            const uri = recording.current.getURI();
            recording.current = null;

            if (uri) {
                await sendAudioToBackend(uri);
            }
        } catch (error) {
            console.error("Stop recording failed", error);
        }
    };

    const sendAudioToBackend = async (uri: string) => {
        try {
            const user = await getCurrentUser();
            if (!user) {
                setTranscript("Please login first.");
                setIsProcessing(false);
                return;
            }

            const formData = new FormData();
            // React Native specific: { uri, type, name }
            // @ts-ignore
            formData.append('audio', {
                uri,
                type: 'audio/m4a', // or audio/mp4 depending on preset
                name: 'voice_command.m4a'
            });
            formData.append('userId', user.id);

            const finalUrl = `${API_URL || 'http://localhost:3000/api'}/voice/chat`;

            console.log("Sending audio to:", finalUrl);

            const response = await fetch(finalUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                }
            });

            // Check for non-200 status
            if (!response.ok) {
                const text = await response.text();
                console.error("Backend Error:", text);
                setTranscript("Server error.");
                return;
            }

            const data = await response.json();

            if (data.replyText) {
                setTranscript(data.transcript ? `"${data.transcript}"` : "Processing complete");
                setReply(data.replyText);

                if (data.audioBase64) {
                    await playAudio(data.audioBase64);
                } else {
                    // Simulate TTS time if no real audio
                    setIsPlaying(true);
                    setTimeout(() => setIsPlaying(false), 3000);
                }
            } else {
                setTranscript("Sorry, I didn't understand.");
            }

        } catch (e) {
            console.error("Upload failed", e);
            setTranscript("Network error.");
        } finally {
            setIsProcessing(false);
        }
    };

    const playAudio = async (base64: string) => {
        try {
            setIsPlaying(true);
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: `data:audio/mp3;base64,${base64}` },
                { shouldPlay: true }
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
    };



    const styles = getStyles(colors, isDark);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeButton}
                    accessibilityLabel="Close Voice Mode"
                >
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.orbWrapper}>
                    {/* Outer Glow Ring */}
                    <Animated.View
                        style={[
                            styles.orbRing,
                            { transform: [{ scale: scaleOuter }], opacity: opacityPulse }
                        ]}
                    />

                    {/* Middle Layer */}
                    <Animated.View
                        style={[
                            styles.orbMiddle,
                            { transform: [{ scale: scaleInner }] }
                        ]}
                    />

                    {/* Core */}
                    <View style={styles.orbCore}>
                        <Ionicons name="mic" size={32} color="#FFF" />
                    </View>
                </View>

                <Text style={styles.statusText}>{isRecording ? "Listening..." : (isProcessing ? "Processing..." : (isPlaying ? "Speaking..." : "Tap to Speak"))}</Text>

                {/* Dynamic Transcription */}
                <View style={styles.transcriptContainer}>
                    <Text style={styles.transcriptText}>
                        "{transcript}"
                    </Text>
                    {reply ? <Text style={styles.replyText}>{reply}</Text> : null}
                </View>

                {/* New Controls */}
                <TouchableOpacity
                    style={[styles.micButton, isRecording && styles.micButtonActive]}
                    onPressIn={startRecording}
                    onPressOut={stopRecording}
                    activeOpacity={0.8}
                    accessibilityLabel="Start Recording"
                    accessibilityHint="Press and hold to speak"
                >
                    <Ionicons
                        name={isRecording ? "mic" : "mic-outline"}
                        size={36}
                        color="#FFF"
                    />
                </TouchableOpacity>
            </View>

            {/* Active Waveform */}
            <View style={styles.waveformContainer}>
                {barHeights.map((anim, i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.bar,
                            {
                                height: anim,
                                backgroundColor: i === 2 ? colors.primary[500] : colors.primary[300], // Center bar highlights
                                opacity: i === 2 ? 1 : 0.6
                            }
                        ]}
                    />
                ))}
            </View>

        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    micButton: {
        marginTop: spacing[8],
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 100,
    },
    micButtonActive: {
        backgroundColor: colors.semantic.error, // Red when recording
        transform: [{ scale: 1.1 }]
    },
    replyText: {
        ...typography.textStyles.body,
        color: colors.primary[500],
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '600'
    },
    container: {
        flex: 1,
        backgroundColor: colors.background, // Should be #000000 in OLED mode
    },
    header: {
        padding: spacing[4],
        alignItems: 'flex-end',
    },
    closeButton: {
        padding: spacing[2],
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -spacing[20],
        paddingHorizontal: spacing[8],
    },
    orbWrapper: {
        width: 240,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[12],
    },
    orbRing: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 1,
        borderColor: colors.primary[500],
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    orbMiddle: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primary[900], // Dark blue backing
        opacity: 0.5,
    },
    orbCore: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 30,
        elevation: 25,
    },
    statusText: {
        ...typography.textStyles.caption,
        fontSize: 14,
        color: colors.textTertiary,
        marginBottom: spacing[4],
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    transcriptContainer: {
        minHeight: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transcriptText: {
        ...typography.textStyles.h3,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 32,
    },
    cursor: {
        color: colors.primary[500],
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 60,
        marginBottom: spacing[12],
    },
    bar: {
        width: 6,
        borderRadius: 3,
    }
});
