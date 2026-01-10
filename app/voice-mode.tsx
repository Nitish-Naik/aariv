import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';

const SIMULATED_TRANSCRIPT = "Summarize my morning meetings and draft a reply to Samika...";

export default function VoiceModeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  // Animation Values
  const scaleOuter = useRef(new Animated.Value(1)).current;
  const scaleInner = useRef(new Animated.Value(1)).current;
  const opacityPulse = useRef(new Animated.Value(0.3)).current;
  
  // Waveform animations (multiple bars)
  const barHeights = useRef([...Array(5)].map(() => new Animated.Value(10))).current;

  // Transcript Simulation
  const [transcript, setTranscript] = useState("");
  
  useEffect(() => {
    // 1. Organic Breathing Orb Animation
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

    // 2. Random Waveform Animation
    const animateBars = () => {
        const animations = barHeights.map((anim) => {
            return Animated.sequence([
                Animated.timing(anim, {
                    toValue: Math.random() * 40 + 10, // Random height between 10 and 50
                    duration: 300 + Math.random() * 200,
                    useNativeDriver: false, // height layout prop
                }),
                Animated.timing(anim, {
                    toValue: 10,
                    duration: 300 + Math.random() * 200,
                    useNativeDriver: false,
                })
            ]);
        });

        Animated.loop(Animated.stagger(100, animations)).start();
    };

    breathe.start();
    animateBars();

    // 3. Simulate Transcription Typing
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
        if (currentIndex <= SIMULATED_TRANSCRIPT.length) {
            setTranscript(SIMULATED_TRANSCRIPT.slice(0, currentIndex));
            currentIndex++;
        } else {
            clearInterval(typingInterval);
        }
    }, 50); // Speed of typing

    return () => clearInterval(typingInterval);
  }, []);

  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
             <Ionicons name="close" size={28} color={colors.textSecondary} />
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

        <Text style={styles.statusText}>Listening...</Text>

        {/* Dynamic Transcription */}
        <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptText}>
                "{transcript}<Text style={styles.cursor}>|</Text>"
            </Text>
        </View>
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
