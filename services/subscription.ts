import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesOffering, CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useState, useEffect, useCallback } from 'react';


// Configuration - Replace with actual keys from RevenueCat Dashboard
const REVENUECAT_API_KEY = Platform.select({
    ios: 'goog_ios_placeholder',
    android: 'goog_android_placeholder',
});


/**
 * The entitlement ID for Pro users (as set in RevenueCat dashboard)
 */
export const ENTITLEMENT_ID = 'pro';


/**
 * Initialize RevenueCat Purchases SDK
 * @param userId Optional user ID to associate with purchases
 */
export const initSubscription = async (userId?: string) => {
    try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        if (REVENUECAT_API_KEY) {
            Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
        }
        console.log('RevenueCat initialized for user:', userId);
    } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
    }
};

/**
 * Check if the current user is a Pro subscriber
 * @returns Promise<boolean>
 */
export const isProUser = async (): Promise<boolean> => {
    try {
        const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
        return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    } catch (e) {
        console.error('Error checking pro status:', e);
        return false;
    }
};

/**
 * Fetch current subscription offerings
 * @returns Promise<PurchasesOffering | null>
 */
export const fetchCurrentOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
        const availableOfferings = await Purchases.getOfferings();
        return availableOfferings.current ?? null;
    } catch (e) {
        console.error('Error fetching offerings:', e);
        return null;
    }
};

/**
 * Purchase a subscription package
 * @param packageToPurchase The package to purchase
 * @returns Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }>
 */
export const purchaseSubscription = async (
    packageToPurchase: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> => {
    try {
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
            return { success: true, customerInfo };
        }
        return { success: false, customerInfo };
    } catch (e: any) {
        if (Purchases.is && Purchases.PURCHASES_ERROR_CODE && Purchases.is(e, Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED)) {
            return { success: false, error: 'Purchase cancelled.' };
        }
        console.error('Purchase failed:', e);
        return { success: false, error: 'Failed to complete purchase.' };
    }
};

/**
 * Restore previous purchases
 * @returns Promise<{ isPro: boolean; customerInfo?: CustomerInfo; error?: string }>
 */
export const restorePurchases = async (): Promise<{ isPro: boolean; customerInfo?: CustomerInfo; error?: string }> => {
    try {
        const customerInfo = await Purchases.restorePurchases();
        const proStatus = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
        return { isPro: proStatus, customerInfo };
    } catch (e) {
        console.error('Error restoring purchases:', e);
        return { isPro: false, error: 'Failed to restore purchases.' };
    }
};


/**
 * React hook for subscription state and actions
 */
export const useSubscriptionService = () => {
    const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
    const [isPro, setIsPro] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshStatus = useCallback(async () => {
        setLoading(true);
        try {
            const [offeringsResult, proStatus] = await Promise.all([
                fetchCurrentOfferings(),
                isProUser(),
            ]);
            setOfferings(offeringsResult);
            setIsPro(proStatus);
        } catch (e) {
            setError('Failed to refresh subscription status.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    const handlePurchase = useCallback(async (pkg: PurchasesPackage) => {
        setLoading(true);
        try {
            const result = await purchaseSubscription(pkg);
            setIsPro(result.success);
            if (!result.success && result.error) setError(result.error);
            return result;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRestore = useCallback(async () => {
        setLoading(true);
        try {
            const result = await restorePurchases();
            setIsPro(result.isPro);
            if (!result.isPro && result.error) setError(result.error);
            return result;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        offerings,
        isPro,
        loading,
        error,
        purchaseSubscription: handlePurchase,
        restorePurchases: handleRestore,
        refreshStatus,
    };
};

