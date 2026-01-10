import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';

const { width } = Dimensions.get('window');

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Basic access',
    cta: 'Start with Free',
    features: ['Unified calendar', 'Basic inbox'],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$7.99',
    period: 'mo',
    description: 'For individuals',
    cta: 'Go Pro',
    features: ['Unlimited history', 'AI Analysis', 'Priority Support'],
    highlight: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$19.99',
    period: 'user/mo',
    description: 'For small teams',
    cta: 'Upgrade for Teams',
    features: ['Shared workspaces', 'Admin controls', 'Team analytics'],
    highlight: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$39.99',
    period: 'mo',
    description: 'Power users',
    cta: 'Unlock Elite',
    features: ['White glove setup', 'API Access', '24/7 Concierge'],
    highlight: false,
  },
];

const BENEFITS = [
  "Unified calendar & inbox",
  "800+ tools, your rules",
  "Swipe to delegate",
  "Learn patterns, forget noise",
  "Encrypted judgment engine"
];

export default function PaywallScreen() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  
  // Iris Animation (Breathing Orb)
  const fadeAnim = useRef(new Animated.Value(0.6)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.6,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
      ])
    );
    breathe.start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header / Iris */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.neutral[400]} />
            </TouchableOpacity>
            
            <View style={styles.irisContainer}>
                <Animated.View style={[styles.irisOrb, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]} />
                <View style={styles.irisCore} />
            </View>

            <Text style={styles.headline}>Let Iris run ahead, quietly.</Text>
            <Text style={styles.subHeadline}>Not more notifications. More clarity.</Text>
            
            <View style={styles.irisIntroContainer}>
                <Text style={styles.irisIntro}>"I prepared the next steps. You decide when to delegate."</Text>
            </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
            {BENEFITS.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary[300]} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                </View>
            ))}
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
            <Text style={[styles.toggleLabel, !isYearly && styles.activeLabel]}>Monthly</Text>
            <Switch
                value={isYearly}
                onValueChange={setIsYearly}
                trackColor={{ false: colors.neutral[700], true: colors.primary[600] }}
                thumbColor={colors.neutral[100]}
                ios_backgroundColor={colors.neutral[700]}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
            <Text style={[styles.toggleLabel, isYearly && styles.activeLabel]}>Yearly <Text style={styles.saveTag}>(Save 20%)</Text></Text>
        </View>

        {/* Tiers Layer */}
        <View style={styles.tiersContainer}>
            {TIERS.map((tier) => (
                <TouchableOpacity key={tier.id} style={[styles.tierCard, tier.highlight && styles.tierCardHighlighted]} activeOpacity={0.9}>
                   <View style={styles.tierHeader}>
                        <View>
                            <Text style={[styles.tierName, tier.highlight && styles.textHighlighted]}>{tier.name}</Text>
                            <Text style={[styles.tierDesc, tier.highlight && styles.textHighlightedDim]}>{tier.description}</Text>
                        </View>
                        <View style={{alignItems: 'flex-end'}}>
                            <Text style={[styles.tierPrice, tier.highlight && styles.textHighlighted]}>
                                {isYearly && tier.price !== '$0' ? `$${(parseFloat(tier.price.replace('$','')) * 10).toFixed(0)}` : tier.price}
                            </Text>
                            <Text style={[styles.tierPeriod, tier.highlight && styles.textHighlightedDim]}>
                                {isYearly && tier.price !== '$0' ? '/yr' : `/${tier.period}`}
                            </Text>
                        </View>
                   </View>
                   
                    <View style={styles.tierDivider} />
                    
                    <TouchableOpacity style={[styles.ctaButton, tier.highlight ? styles.ctaButtonHighlighted : styles.ctaButtonOutline]}>
                        <Text style={[styles.ctaText, tier.highlight ? styles.ctaTextHighlighted : styles.ctaTextOutline]}>{tier.cta}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
            <TouchableOpacity style={styles.footerLink}>
                <Text style={styles.footerLinkText}>Restore Purchase</Text>
            </TouchableOpacity>
            <Text style={styles.footerPipe}>|</Text>
            <TouchableOpacity style={styles.footerLink}>
                <Text style={styles.footerLinkText}>Manage Subscription</Text>
            </TouchableOpacity>
        </View>
        <Text style={styles.cancelText}>Cancel anytime, no questions asked.</Text>

        <Text style={styles.legalText}>
            By continuing, you agree to Terms & Privacy. You stay in control. Always.
        </Text>
        
        <View style={{height: 40}} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900 - Premium Dark
  },
  scrollContent: {
    padding: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
    marginTop: spacing[2],
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing[2],
    zIndex: 10,
  },
  irisContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    position: 'relative',
  },
  irisOrb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  irisCore: {
      position: 'absolute',
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#FFF',
      opacity: 0.9,
  },
  headline: {
    ...typography.textStyles.h2,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: spacing[2],
    letterSpacing: -0.5,
  },
  subHeadline: {
    ...typography.textStyles.body,
    fontSize: 18,
    color: '#94A3B8', // Slate 400
    textAlign: 'center',
    marginBottom: spacing[6],
    letterSpacing: 0.5,
  },
  irisIntroContainer: {
      backgroundColor: 'rgba(30, 41, 59, 0.5)', // Slate 800 with opacity
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: 20,
  },
  irisIntro: {
      ...typography.textStyles.bodySmall,
      color: colors.primary[200],
      fontStyle: 'italic',
      textAlign: 'center',
  },
  benefitsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing[3],
      marginBottom: spacing[8],
  },
  benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(30, 41, 59, 0.3)',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  benefitText: {
      ...typography.textStyles.caption,
      color: '#CBD5E1',
      marginLeft: spacing[1],
  },
  toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing[6],
      gap: spacing[3],
  },
  toggleLabel: {
      ...typography.textStyles.bodySmall,
      color: '#64748B',
      fontWeight: '600',
  },
  activeLabel: {
      color: '#F8FAFC',
  },
  saveTag: {
      color: colors.semantic.success,
      fontSize: 10,
  },
  tiersContainer: {
      gap: spacing[4],
      marginBottom: spacing[8],
  },
  tierCard: {
      backgroundColor: '#1E293B', // Slate 800
      borderRadius: 16,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: '#334155',
  },
  tierCardHighlighted: {
      backgroundColor: '#0F172A', // Slate 900
      borderColor: colors.primary[500],
      borderWidth: 1.5,
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
  },
  tierHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing[4],
  },
  tierName: {
      ...typography.textStyles.h4,
      color: '#F8FAFC',
      marginBottom: 2,
  },
  tierDesc: {
      ...typography.textStyles.caption,
      color: '#94A3B8',
  },
  tierPrice: {
      ...typography.textStyles.h3,
      color: '#F8FAFC',
  },
  tierPeriod: {
      ...typography.textStyles.caption,
      color: '#64748B',
      textAlign: 'right',
  },
  textHighlighted: {
      color: colors.primary[400],
  },
  textHighlightedDim: {
      color: colors.primary[200],
  },
  tierDivider: {
      height: 1,
      backgroundColor: '#334155',
      marginBottom: spacing[4],
  },
  ctaButton: {
      paddingVertical: spacing[3],
      borderRadius: 10,
      alignItems: 'center',
  },
  ctaButtonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#475569',
  },
  ctaButtonHighlighted: {
      backgroundColor: colors.primary[600],
  },
  ctaText: {
      ...typography.textStyles.bodySmall,
      fontWeight: 'bold',
  },
  ctaTextOutline: {
      color: '#F8FAFC',
  },
  ctaTextHighlighted: {
      color: '#FFFFFF',
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: spacing[2],
      gap: spacing[2],
  },
  footerLink: {
      padding: spacing[1],
  },
  footerLinkText: {
      ...typography.textStyles.caption,
      color: '#94A3B8',
      textDecorationLine: 'underline',
  },
  footerPipe: {
      color: '#475569',
      marginTop: spacing[1],
  },
  cancelText: {
      ...typography.textStyles.caption,
      color: '#64748B',
      textAlign: 'center',
      marginBottom: spacing[4],
  },
  legalText: {
      ...typography.textStyles.caption,
      fontSize: 10,
      color: '#475569',
      textAlign: 'center',
      paddingHorizontal: spacing[8],
      lineHeight: 14,
  },
});
