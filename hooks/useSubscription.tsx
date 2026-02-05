/**
 * useSubscription Hook
 * Manages subscription state throughout the app
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import subscriptionService, {
  SubscriptionState,
  SubscriptionTier,
  SubscriptionLimits,
  PricingPackage,
  TIER_LIMITS,
} from '../services/subscription';
import { PurchasesPackage } from 'react-native-purchases';

// ===========================================
// Types
// ===========================================

interface Usage {
  messagesUsed: number;
  messagesLimit: number;
  appsConnected: number;
  appsLimit: number;
  resetDate: string;
}

interface SubscriptionContextValue {
  // State
  subscription: SubscriptionState;
  usage: Usage;
  isLoading: boolean;
  offerings: {
    pro: PricingPackage[];
    business: PricingPackage[];
  } | null;

  // Computed
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  isPro: boolean;
  isBusiness: boolean;
  isEnterprise: boolean;
  isPaid: boolean;

  // Actions
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  updateUsage: (updates: Partial<Usage>) => void;

  // Permission checks
  canSendMessage: () => { allowed: boolean; reason?: string };
  canConnectApp: () => { allowed: boolean; reason?: string };
  canAccessFeature: (feature: 'inbox' | 'slack' | 'teams') => boolean;
  canConnectIntegration: (toolkit: string) => { allowed: boolean; requiredTier?: SubscriptionTier };
}

// ===========================================
// Context
// ===========================================

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// ===========================================
// Provider Component
// ===========================================

interface SubscriptionProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function SubscriptionProvider({ children, userId }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: 'free',
    isActive: false,
    expiresAt: null,
    willRenew: false,
    limits: TIER_LIMITS.free,
  });

  const [usage, setUsage] = useState<Usage>({
    messagesUsed: 0,
    messagesLimit: TIER_LIMITS.free.aiMessagesPerMonth,
    appsConnected: 0,
    appsLimit: TIER_LIMITS.free.maxIntegrations,
    resetDate: getNextResetDate(),
  });

  const [offerings, setOfferings] = useState<{
    pro: PricingPackage[];
    business: PricingPackage[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Initialize on mount
  useEffect(() => {
    initializeSubscription();
  }, [userId]);

  // Listen for subscription changes
  useEffect(() => {
    const unsubscribe = subscriptionService.addSubscriptionListener((state) => {
      setSubscription(state);
      setUsage((prev) => ({
        ...prev,
        messagesLimit: state.limits.aiMessagesPerMonth,
        appsLimit: state.limits.maxIntegrations,
      }));
    });

    return unsubscribe;
  }, []);

  // ===========================================
  // Initialization
  // ===========================================

  const initializeSubscription = async () => {
    setIsLoading(true);
    try {
      // Initialize RevenueCat
      await subscriptionService.initialize(userId);

      // Get current subscription state
      const state = await subscriptionService.getSubscriptionState();
      setSubscription(state);

      // Update usage limits based on tier
      setUsage((prev) => ({
        ...prev,
        messagesLimit: state.limits.aiMessagesPerMonth,
        appsLimit: state.limits.maxIntegrations,
      }));

      // Fetch available packages
      const packages = await subscriptionService.getOfferings();
      setOfferings(packages);
    } catch (error) {
      console.error('Failed to initialize subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================
  // Actions
  // ===========================================

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    const result = await subscriptionService.purchasePackage(pkg);
    
    if (result.success && result.customerInfo) {
      // Subscription state will be updated via listener
      return true;
    }
    
    return false;
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    const result = await subscriptionService.restorePurchases();
    return result.success;
  }, []);

  const refreshSubscription = useCallback(async () => {
    const state = await subscriptionService.getSubscriptionState();
    setSubscription(state);
  }, []);

  const updateUsage = useCallback((updates: Partial<Usage>) => {
    setUsage((prev) => ({ ...prev, ...updates }));
  }, []);

  // ===========================================
  // Permission Checks
  // ===========================================

  const canSendMessage = useCallback(() => {
    return subscriptionService.canPerformAction(
      subscription.limits,
      'sendMessage',
      { messagesUsed: usage.messagesUsed }
    );
  }, [subscription.limits, usage.messagesUsed]);

  const canConnectApp = useCallback(() => {
    return subscriptionService.canPerformAction(
      subscription.limits,
      'connectApp',
      { appsConnected: usage.appsConnected }
    );
  }, [subscription.limits, usage.appsConnected]);

  const canAccessFeature = useCallback(
    (feature: 'inbox' | 'slack' | 'teams'): boolean => {
      switch (feature) {
        case 'inbox':
          return subscription.limits.canAccessInbox;
        case 'slack':
          return subscription.limits.canAccessSlack;
        case 'teams':
          return subscription.limits.canAccessTeams;
        default:
          return false;
      }
    },
    [subscription.limits]
  );

  const canConnectIntegration = useCallback(
    (toolkit: string) => {
      return subscriptionService.canConnectIntegration(subscription.limits, toolkit);
    },
    [subscription.limits]
  );

  // ===========================================
  // Computed Values
  // ===========================================

  const value: SubscriptionContextValue = {
    subscription,
    usage,
    isLoading,
    offerings,

    tier: subscription.tier,
    limits: subscription.limits,
    isPro: subscription.tier === 'pro' || subscription.tier === 'business' || subscription.tier === 'enterprise',
    isBusiness: subscription.tier === 'business' || subscription.tier === 'enterprise',
    isEnterprise: subscription.tier === 'enterprise',
    isPaid: subscription.tier !== 'free',

    purchase,
    restore,
    refreshSubscription,
    updateUsage,

    canSendMessage,
    canConnectApp,
    canAccessFeature,
    canConnectIntegration,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ===========================================
// Hook
// ===========================================

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  
  return context;
}

// ===========================================
// Helper Functions
// ===========================================

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

// ===========================================
// Export
// ===========================================

export { TIER_LIMITS, SubscriptionTier, SubscriptionLimits };
