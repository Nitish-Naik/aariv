import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { getOfferings, purchaseSubscription, restorePurchases } from '../services/subscription';
import { borderRadius, spacing, typography } from '../theme';

interface PaywallScreenProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const PaywallScreen = ({ onClose, onSuccess }: PaywallScreenProps) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

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
        'Unlimited connected accounts & apps',
        '5,000 monthly automations (for email, calendar, etc.)',
        '100 monthly Advanced AI Lookups (for web search & research)',
        'Priority access to new features & models',
        'Dedicated team collaboration hub',
    ];

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Aariv Pro</Text>
                         <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subtitle}>Become more focused and prepared than ever before.</Text>
                    
                    <View style={styles.planSelector}>
                        <TouchableOpacity 
                            style={[styles.planOption, selectedPlan === 'monthly' && styles.planOptionSelected]} 
                            onPress={() => setSelectedPlan('monthly')}
                        >
                            <Text style={[styles.planText, selectedPlan === 'monthly' && styles.planTextSelected]}>Monthly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.planOption, selectedPlan === 'annual' && styles.planOptionSelected]} 
                            onPress={() => setSelectedPlan('annual')}
                        >
                            <Text style={[styles.planText, selectedPlan === 'annual' && styles.planTextSelected]}>Annual</Text>
                             <View style={styles.badge}>
                                <Text style={styles.badgeText}>SAVE 40%</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pricingDisplay}>
                        <Text style={styles.price}>
                            {selectedPlan === 'annual' 
                                ? offerings?.annual?.product?.priceString || '$199.99' 
                                : offerings?.monthly?.product?.priceString || '$19.99'}
                        </Text>
                        <Text style={styles.priceUnit}>
                            {selectedPlan === 'annual' ? '/ year' : '/ month'}
                        </Text>
                    </View>

                    <View style={styles.benefitsContainer}>
                        {benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                                <Ionicons name="checkmark-circle-outline" size={22} color={colors.primary[500]} />
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
                
                <View style={styles.footer}>
                     <Button
                        title="Unlock Pro"
                        onPress={handlePurchase}
                        loading={purchasing}
                        size="large"
                        variant="primary"
                    />
                    <Button
                        title="Restore Purchase"
                        onPress={handleRestore}
                        variant="ghost"
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing[5],
        paddingBottom: spacing[20] // Extra padding to ensure content is above footer
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing[4],
    },
    title: {
        ...typography.textStyles.h3,
        color: colors.text,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: '50%',
        marginTop: -14,
    },
    subtitle: {
        ...typography.textStyles.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing[6],
    },
    planSelector: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing[1],
        marginBottom: spacing[5],
    },
    planOption: {
        flex: 1,
        paddingVertical: spacing[3],
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    planOptionSelected: {
        backgroundColor: colors.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    planText: {
        ...typography.textStyles.button,
        fontSize: 16,
        color: colors.textSecondary,
    },
    planTextSelected: {
        color: colors.text,
    },
    badge: {
        backgroundColor: colors.primary[500],
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        marginLeft: spacing[2],
    },
    badgeText: {
        ...typography.textStyles.caption,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
    },
    pricingDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: spacing[6],
    },
    price: {
        ...typography.textStyles.h1,
        color: colors.text,
    },
    priceUnit: {
        ...typography.textStyles.h4,
        color: colors.textSecondary,
        marginLeft: spacing[2],
    },
    benefitsContainer: {
        gap: spacing[4],
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    benefitText: {
        ...typography.textStyles.body,
        color: colors.text,
        flex: 1,
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing[5],
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderColor: colors.border,
        gap: spacing[2],
    }
});