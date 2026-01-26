import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getOfferings, purchaseSubscription, restorePurchases } from '../services/subscription';
import { borderRadius, spacing, typography } from '../theme';

const { width } = Dimensions.get('window');

interface PaywallScreenProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const PaywallScreen = ({ onClose, onSuccess }: PaywallScreenProps) => {
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [offerings, setOfferings] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        try {
            const data = await getOfferings();
            setOfferings(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!offerings) return;

        const pkg = selectedPlan === 'annual' ? offerings.annual : offerings.monthly;
        if (!pkg) {
            Alert.alert("Offerings not found", "Please check back later.");
            return;
        }

        try {
            setPurchasing(true);
            const { success } = await purchaseSubscription(pkg);
            if (success) {
                Alert.alert("Welcome to Aariv Pro!", "Your digital life is now fully unlocked.");
                onSuccess();
            }
        } catch (e: any) {
            Alert.alert("Purchase Failed", e.message || "An error occurred.");
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        try {
            setPurchasing(true);
            const success = await restorePurchases();
            if (success) {
                Alert.alert("Purchases Restored", "Your Pro status has been reactivated.");
                onSuccess();
            } else {
                Alert.alert("No Subscription Found", "We couldn't find an active subscription for your account.");
            }
        } catch (e: any) {
            Alert.alert("Restore Failed", e.message);
        } finally {
            setPurchasing(false);
        }
    };

    const benefits = [
        { icon: 'infinite', title: 'Unlimited Toolkits', desc: 'Access 800+ apps like HubSpot, Jira, & Slack.' },
        { icon: 'flash', title: 'Instant Execution', desc: 'No more approval caps on high-speed actions.' },
        { icon: 'shield-checkmark', title: 'Early Access', desc: 'Get new features and visual overhauls first.' },
        { icon: 'people', title: 'Team Hub', desc: 'Collaborate with your team seamlessly.' },
    ];

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isDark ? ['#1e1b4b', '#000000'] : ['#e0e7ff', '#ffffff']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>

                        <View style={styles.logoAndTitle}>
                            <LinearGradient
                                colors={['#4f46e5', '#9333ea']}
                                style={styles.logoIcon}
                            >
                                <Ionicons name="sparkles" size={24} color="#FFF" />
                            </LinearGradient>
                            <Text style={styles.title}>Aariv <Text style={styles.proLabel}>PRO</Text></Text>
                            <Text style={styles.subtitle}>Unleash the full power of your productivity assistant.</Text>
                        </View>
                    </View>

                    {/* Benefits Grid */}
                    <View style={styles.benefitsGrid}>
                        {benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitCard}>
                                <View style={styles.benefitIconContainer}>
                                    <Ionicons name={benefit.icon as any} size={24} color={colors.primary[500]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                                    <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Pricing Selector */}
                    <View style={styles.pricingContainer}>
                        <TouchableOpacity
                            style={[
                                styles.pricingCard,
                                selectedPlan === 'annual' && styles.pricingCardActive,
                                { borderColor: selectedPlan === 'annual' ? colors.primary[500] : colors.border }
                            ]}
                            onPress={() => setSelectedPlan('annual')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.pricingHeader}>
                                <Text style={styles.planName}>Annual Pro</Text>
                                <View style={styles.bestValueBadge}>
                                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                                </View>
                            </View>
                            <Text style={styles.planPrice}>{offerings?.annual?.product?.priceString || '$199.99'}<Text style={styles.perYear}>/year</Text></Text>
                            <Text style={styles.planSavings}>Save 40% compared to monthly</Text>
                            <View style={[styles.checkbox, selectedPlan === 'annual' && { backgroundColor: colors.primary[500] }]}>
                                {selectedPlan === 'annual' && <Ionicons name="checkmark" size={14} color="#FFF" />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.pricingCard,
                                selectedPlan === 'monthly' && styles.pricingCardActive,
                                { borderColor: selectedPlan === 'monthly' ? colors.primary[500] : colors.border }
                            ]}
                            onPress={() => setSelectedPlan('monthly')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.pricingHeader}>
                                <Text style={styles.planName}>Monthly Pro</Text>
                            </View>
                            <Text style={styles.planPrice}>{offerings?.monthly?.product?.priceString || '$19.99'}<Text style={styles.perYear}>/mo</Text></Text>
                            <Text style={styles.planSavings}>Cancel anytime, no commitment</Text>
                            <View style={[styles.checkbox, selectedPlan === 'monthly' && { backgroundColor: colors.primary[500] }]}>
                                {selectedPlan === 'monthly' && <Ionicons name="checkmark" size={14} color="#FFF" />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Checkout Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.purchaseButton, purchasing && { opacity: 0.7 }]}
                            onPress={handlePurchase}
                            disabled={purchasing}
                        >
                            <LinearGradient
                                colors={['#4f46e5', '#7c3aed']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.purchaseGradient}
                            >
                                {purchasing ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.purchaseButtonText}>
                                        Continue with {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
                            <Text style={styles.restoreText}>Restore Purchases</Text>
                        </TouchableOpacity>

                        <Text style={styles.disclaimer}>
                            Recurring billing. Cancel anytime. By subscribing, you agree to our Terms and Privacy Policy.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing[10],
    },
    header: {
        paddingHorizontal: spacing[6],
        paddingTop: spacing[2],
    },
    closeButton: {
        alignSelf: 'flex-start',
        padding: spacing[2],
        marginLeft: -spacing[2],
    },
    logoAndTitle: {
        alignItems: 'center',
        marginVertical: spacing[6],
    },
    logoIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[4],
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        ...typography.textStyles.h1,
        fontSize: 32,
        textAlign: 'center',
        color: '#FFF',
    },
    proLabel: {
        color: '#9333ea',
        fontWeight: '900',
    },
    subtitle: {
        ...typography.textStyles.body,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: spacing[2],
        paddingHorizontal: spacing[4],
    },
    benefitsGrid: {
        paddingHorizontal: spacing[6],
        gap: spacing[4],
        marginBottom: spacing[8],
    },
    benefitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: spacing[4],
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    benefitIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[4],
    },
    benefitTitle: {
        ...typography.textStyles.body,
        fontWeight: '700',
        color: '#FFF',
    },
    benefitDesc: {
        ...typography.textStyles.bodySmall,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },
    pricingContainer: {
        paddingHorizontal: spacing[6],
        gap: spacing[4],
    },
    pricingCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: borderRadius.xl,
        padding: spacing[5],
        borderWidth: 2,
        position: 'relative',
    },
    pricingCardActive: {
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
    },
    pricingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[3],
    },
    planName: {
        ...typography.textStyles.body,
        fontWeight: '800',
        color: '#FFF',
        fontSize: 18,
    },
    bestValueBadge: {
        backgroundColor: '#9333ea',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    bestValueText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFF',
    },
    planPrice: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
    },
    perYear: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '500',
    },
    planSavings: {
        ...typography.textStyles.bodySmall,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 4,
    },
    checkbox: {
        position: 'absolute',
        top: spacing[5],
        right: spacing[5],
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        paddingHorizontal: spacing[6],
        marginTop: spacing[8],
        alignItems: 'center',
    },
    purchaseButton: {
        width: '100%',
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    purchaseGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    purchaseButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    restoreButton: {
        paddingVertical: spacing[4],
    },
    restoreText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '600',
    },
    disclaimer: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: spacing[4],
    }
});
