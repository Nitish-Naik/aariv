import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';

// Configuration - Replace with actual keys from RevenueCat Dashboard
const REVENUECAT_API_KEY = Platform.select({
    ios: 'goog_ios_placeholder',
    android: 'goog_android_placeholder',
});

export const ENTITLEMENT_ID = 'pro';

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

export const isProUser = async (): Promise<boolean> => {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        // Check if the user has the "pro" entitlement active
        return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
};

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
            return offerings.current;
        }
    } catch (error) {
        console.error('Error fetching offerings:', error);
    }
    return null;
};

export const purchaseSubscription = async (packageToPurchase: any) => {
    try {
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
            return { success: true, customerInfo };
        }
    } catch (error: any) {
        if (!error.userCancelled) {
            console.error('Purchase failed:', error);
            throw error;
        }
    }
    return { success: false };
};

export const restorePurchases = async () => {
    try {
        const customerInfo = await Purchases.restorePurchases();
        return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    } catch (error) {
        console.error('Error restoring purchases:', error);
        return false;
    }
};
