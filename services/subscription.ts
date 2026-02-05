/**
 * Aariv Subscription Service
 * RevenueCat integration for iOS/Android subscriptions
 */

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// ===========================================
// Configuration
// ===========================================

const REVENUECAT_API_KEYS = {
  ios: 'appl_YOUR_REVENUECAT_IOS_KEY',
  android: 'goog_YOUR_REVENUECAT_ANDROID_KEY',
};

// Entitlement IDs (set these in RevenueCat dashboard)
export const ENTITLEMENTS = {
  PRO: 'pro',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
};

// Product IDs (set these in App Store Connect / Google Play Console)
export const PRODUCTS = {
  PRO_MONTHLY: 'aariv_pro_monthly',
  PRO_ANNUAL: 'aariv_pro_annual',
  BUSINESS_MONTHLY: 'aariv_business_monthly',
  BUSINESS_ANNUAL: 'aariv_business_annual',
};

// ===========================================
// Subscription Tier Definitions
// ===========================================

export interface SubscriptionLimits {
  aiMessagesPerMonth: number;
  maxIntegrations: number;
  chatHistoryDays: number;
  canAccessInbox: boolean;
  canAccessSlack: boolean;
  canAccessTeams: boolean;
  calendarProviders: string[];
  prioritySupport: boolean;
}

export const TIER_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    aiMessagesPerMonth: 50,
    maxIntegrations: 1,
    chatHistoryDays: 7,
    canAccessInbox: false,
    canAccessSlack: false,
    canAccessTeams: false,
    calendarProviders: ['GOOGLECALENDAR'],
    prioritySupport: false,
  },
  pro: {
    aiMessagesPerMonth: 500,
    maxIntegrations: 5,
    chatHistoryDays: 30,
    canAccessInbox: true,
    canAccessSlack: false,
    canAccessTeams: false,
    calendarProviders: ['GOOGLECALENDAR', 'OUTLOOK_CALENDAR'],
    prioritySupport: false,
  },
  business: {
    aiMessagesPerMonth: 2000,
    maxIntegrations: Infinity,
    chatHistoryDays: Infinity,
    canAccessInbox: true,
    canAccessSlack: true,
    canAccessTeams: true,
    calendarProviders: ['GOOGLECALENDAR', 'OUTLOOK_CALENDAR', 'APPLE_CALENDAR'],
    prioritySupport: true,
  },
  enterprise: {
    aiMessagesPerMonth: Infinity,
    maxIntegrations: Infinity,
    chatHistoryDays: Infinity,
    canAccessInbox: true,
    canAccessSlack: true,
    canAccessTeams: true,
    calendarProviders: ['GOOGLECALENDAR', 'OUTLOOK_CALENDAR', 'APPLE_CALENDAR'],
    prioritySupport: true,
  },
};

// ===========================================
// Types
// ===========================================

export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt: string | null;
  willRenew: boolean;
  limits: SubscriptionLimits;
}

export interface PricingPackage {
  id: string;
  title: string;
  description: string;
  price: string;
  pricePerMonth: string;
  period: 'monthly' | 'annual';
  package: PurchasesPackage;
  savings?: string;
}

// ===========================================
// Initialize RevenueCat
// ===========================================

export async function initializeRevenueCat(userId?: string): Promise<void> {
  try {
    // Set log level for debugging (remove in production)
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure with platform-specific API key
    const apiKey = Platform.OS === 'ios' 
      ? REVENUECAT_API_KEYS.ios 
      : REVENUECAT_API_KEYS.android;

    await Purchases.configure({ apiKey });

    // If user is logged in, identify them
    if (userId) {
      await Purchases.logIn(userId);
    }

    console.log('✅ RevenueCat initialized');
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat:', error);
    throw error;
  }
}

// ===========================================
// User Identification
// ===========================================

/**
 * Identify user with RevenueCat (call after login)
 */
export async function identifyUser(userId: string): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error('Failed to identify user:', error);
    throw error;
  }
}

/**
 * Logout user from RevenueCat
 */
export async function logoutUser(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.logOut();
    return customerInfo;
  } catch (error) {
    console.error('Failed to logout:', error);
    throw error;
  }
}

// ===========================================
// Subscription Status
// ===========================================

/**
 * Get current subscription state
 */
export async function getSubscriptionState(): Promise<SubscriptionState> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return parseCustomerInfo(customerInfo);
  } catch (error) {
    console.error('Failed to get subscription state:', error);
    // Return free tier on error
    return {
      tier: 'free',
      isActive: false,
      expiresAt: null,
      willRenew: false,
      limits: TIER_LIMITS.free,
    };
  }
}

/**
 * Parse RevenueCat CustomerInfo into our SubscriptionState
 */
function parseCustomerInfo(customerInfo: CustomerInfo): SubscriptionState {
  const { entitlements, activeSubscriptions } = customerInfo;

  // Check entitlements in order of highest to lowest
  if (entitlements.active[ENTITLEMENTS.ENTERPRISE]) {
    const entitlement = entitlements.active[ENTITLEMENTS.ENTERPRISE];
    return {
      tier: 'enterprise',
      isActive: true,
      expiresAt: entitlement.expirationDate,
      willRenew: entitlement.willRenew,
      limits: TIER_LIMITS.enterprise,
    };
  }

  if (entitlements.active[ENTITLEMENTS.BUSINESS]) {
    const entitlement = entitlements.active[ENTITLEMENTS.BUSINESS];
    return {
      tier: 'business',
      isActive: true,
      expiresAt: entitlement.expirationDate,
      willRenew: entitlement.willRenew,
      limits: TIER_LIMITS.business,
    };
  }

  if (entitlements.active[ENTITLEMENTS.PRO]) {
    const entitlement = entitlements.active[ENTITLEMENTS.PRO];
    return {
      tier: 'pro',
      isActive: true,
      expiresAt: entitlement.expirationDate,
      willRenew: entitlement.willRenew,
      limits: TIER_LIMITS.pro,
    };
  }

  // No active subscription = free tier
  return {
    tier: 'free',
    isActive: false,
    expiresAt: null,
    willRenew: false,
    limits: TIER_LIMITS.free,
  };
}

// ===========================================
// Fetch Available Packages
// ===========================================

/**
 * Get available subscription packages for purchase
 */
export async function getOfferings(): Promise<{
  pro: PricingPackage[];
  business: PricingPackage[];
} | null> {
  try {
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      console.log('No offerings available');
      return null;
    }

    const proPackages = parsePackages(offerings.current, 'pro');
    const businessPackages = parsePackages(offerings.current, 'business');

    return {
      pro: proPackages,
      business: businessPackages,
    };
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Parse RevenueCat packages into our format
 */
function parsePackages(
  offering: PurchasesOffering,
  tier: 'pro' | 'business'
): PricingPackage[] {
  const packages: PricingPackage[] = [];
  const prefix = tier === 'pro' ? 'aariv_pro' : 'aariv_business';

  // Monthly package
  const monthly = offering.availablePackages.find(
    (p) => p.product.identifier.includes(`${prefix}_monthly`)
  );
  if (monthly) {
    packages.push({
      id: monthly.identifier,
      title: `${tier === 'pro' ? 'Pro' : 'Business'} Monthly`,
      description: `Billed monthly`,
      price: monthly.product.priceString,
      pricePerMonth: monthly.product.priceString,
      period: 'monthly',
      package: monthly,
    });
  }

  // Annual package
  const annual = offering.availablePackages.find(
    (p) => p.product.identifier.includes(`${prefix}_annual`)
  );
  if (annual && monthly) {
    const monthlyPrice = monthly.product.price;
    const annualMonthlyPrice = annual.product.price / 12;
    const savings = Math.round((1 - annualMonthlyPrice / monthlyPrice) * 100);

    packages.push({
      id: annual.identifier,
      title: `${tier === 'pro' ? 'Pro' : 'Business'} Annual`,
      description: `Billed annually`,
      price: annual.product.priceString,
      pricePerMonth: `${annual.product.currencyCode} ${annualMonthlyPrice.toFixed(2)}`,
      period: 'annual',
      package: annual,
      savings: `Save ${savings}%`,
    });
  }

  return packages;
}

// ===========================================
// Purchase & Restore
// ===========================================

/**
 * Purchase a subscription package
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    
    return {
      success: true,
      customerInfo,
    };
  } catch (error: any) {
    // Check if user cancelled
    if (error.userCancelled) {
      return {
        success: false,
        error: 'Purchase cancelled',
      };
    }

    console.error('Purchase failed:', error);
    return {
      success: false,
      error: error.message || 'Purchase failed',
    };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    
    const hasActiveSubscription = Object.keys(
      customerInfo.entitlements.active
    ).length > 0;

    return {
      success: hasActiveSubscription,
      customerInfo,
      error: hasActiveSubscription 
        ? undefined 
        : 'No active subscriptions found',
    };
  } catch (error: any) {
    console.error('Restore failed:', error);
    return {
      success: false,
      error: error.message || 'Restore failed',
    };
  }
}

// ===========================================
// Subscription Listener
// ===========================================

/**
 * Add listener for subscription changes
 */
export function addSubscriptionListener(
  callback: (state: SubscriptionState) => void
): () => void {
  const listener = (customerInfo: CustomerInfo) => {
    const state = parseCustomerInfo(customerInfo);
    callback(state);
  };

  Purchases.addCustomerInfoUpdateListener(listener);

  // Return cleanup function
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

// ===========================================
// Utility Functions
// ===========================================

/**
 * Check if user can perform an action based on their tier
 */
export function canPerformAction(
  limits: SubscriptionLimits,
  action: 'sendMessage' | 'connectApp' | 'accessInbox' | 'accessSlack',
  currentUsage?: { messagesUsed?: number; appsConnected?: number }
): { allowed: boolean; reason?: string } {
  switch (action) {
    case 'sendMessage':
      if (currentUsage?.messagesUsed !== undefined) {
        if (currentUsage.messagesUsed >= limits.aiMessagesPerMonth) {
          return {
            allowed: false,
            reason: `You've reached your ${limits.aiMessagesPerMonth} message limit this month`,
          };
        }
      }
      return { allowed: true };

    case 'connectApp':
      if (currentUsage?.appsConnected !== undefined) {
        if (currentUsage.appsConnected >= limits.maxIntegrations) {
          return {
            allowed: false,
            reason: `You can only connect ${limits.maxIntegrations} app${limits.maxIntegrations === 1 ? '' : 's'} on your plan`,
          };
        }
      }
      return { allowed: true };

    case 'accessInbox':
      if (!limits.canAccessInbox) {
        return {
          allowed: false,
          reason: 'Inbox is available on Pro and above',
        };
      }
      return { allowed: true };

    case 'accessSlack':
      if (!limits.canAccessSlack) {
        return {
          allowed: false,
          reason: 'Slack integration is available on Business and above',
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

/**
 * Check if a specific integration is allowed
 */
export function canConnectIntegration(
  limits: SubscriptionLimits,
  toolkit: string
): { allowed: boolean; requiredTier?: SubscriptionTier } {
  // Slack/Teams require Business
  if (toolkit === 'SLACK' && !limits.canAccessSlack) {
    return { allowed: false, requiredTier: 'business' };
  }
  if (toolkit === 'MICROSOFT_TEAMS' && !limits.canAccessTeams) {
    return { allowed: false, requiredTier: 'business' };
  }

  // Gmail/email requires Pro
  if (toolkit === 'GMAIL' && !limits.canAccessInbox) {
    return { allowed: false, requiredTier: 'pro' };
  }

  // Calendar providers
  if (
    toolkit.includes('CALENDAR') &&
    !limits.calendarProviders.includes(toolkit)
  ) {
    return { allowed: false, requiredTier: 'pro' };
  }

  return { allowed: true };
}

/**
 * Convenience helper to check if user is on a paid tier (pro or above)
 */
export async function isProUser(): Promise<boolean> {
  const state = await getSubscriptionState();
  return state.tier !== 'free' && state.isActive;
}

export default {
  initialize: initializeRevenueCat,
  identifyUser,
  logoutUser,
  getSubscriptionState,
  getOfferings,
  purchasePackage,
  restorePurchases,
  addSubscriptionListener,
  canPerformAction,
  canConnectIntegration,
  isProUser,
  ENTITLEMENTS,
  PRODUCTS,
  TIER_LIMITS,
};
