/**
 * Analytics Service - Lightweight abstraction for event tracking
 * Supports multiple providers: Segment, Mixpanel, PostHog, or custom
 */

interface AnalyticsEvent {
  userId?: string;
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

interface AnalyticsProvider {
  track(event: AnalyticsEvent): Promise<void>;
  identify(userId: string, traits?: Record<string, any>): Promise<void>;
  reset(): void;
}

/**
 * Console provider for development
 */
class ConsoleProvider implements AnalyticsProvider {
  async track(event: AnalyticsEvent): Promise<void> {
    console.log("[Analytics] Track:", {
      event: event.event,
      userId: event.userId,
      properties: event.properties,
      timestamp: event.timestamp || new Date(),
    });
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    console.log("[Analytics] Identify:", { userId, traits });
  }

  reset(): void {
    console.log("[Analytics] Reset user session");
  }
}

/**
 * PostHog provider (example)
 * Install: npm install posthog-react-native
 */
class PostHogProvider implements AnalyticsProvider {
  private client: any;

  constructor(apiKey: string, host?: string) {
    // Uncomment when PostHog is installed
    // import PostHog from 'posthog-react-native'
    // this.client = new PostHog(apiKey, { host: host || 'https://app.posthog.com' });
    console.warn("PostHog provider not initialized - install posthog-react-native");
  }

  async track(event: AnalyticsEvent): Promise<void> {
    // this.client?.capture(event.event, event.properties);
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    // this.client?.identify(userId, traits);
  }

  reset(): void {
    // this.client?.reset();
  }
}

/**
 * Main Analytics service
 */
class Analytics {
  private provider: AnalyticsProvider;
  private enabled: boolean = true;

  constructor(provider?: AnalyticsProvider) {
    // Use console provider by default in development
    this.provider = provider || new ConsoleProvider();
  }

  /**
   * Set analytics provider
   */
  setProvider(provider: AnalyticsProvider): void {
    this.provider = provider;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Track an event
   */
  async track(event: string, properties?: Record<string, any>, userId?: string): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.provider.track({
        event,
        properties,
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[Analytics] Track error:", error);
    }
  }

  /**
   * Identify a user
   */
  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.provider.identify(userId, traits);
    } catch (error) {
      console.error("[Analytics] Identify error:", error);
    }
  }

  /**
   * Reset user session (on logout)
   */
  reset(): void {
    if (!this.enabled) return;

    try {
      this.provider.reset();
    } catch (error) {
      console.error("[Analytics] Reset error:", error);
    }
  }

  // Convenience methods for common events
  async trackScreenView(screenName: string, userId?: string): Promise<void> {
    return this.track("Screen Viewed", { screen: screenName }, userId);
  }

  async trackPlatformConnected(platform: string, userId: string): Promise<void> {
    return this.track("Platform Connected", { platform }, userId);
  }

  async trackPlatformDisconnected(platform: string, userId: string): Promise<void> {
    return this.track("Platform Disconnected", { platform }, userId);
  }

  async trackActionApproved(actionType: string, userId: string): Promise<void> {
    return this.track("Action Approved", { actionType }, userId);
  }

  async trackActionRejected(actionType: string, userId: string): Promise<void> {
    return this.track("Action Rejected", { actionType }, userId);
  }

  async trackChatMessage(messageLength: number, userId: string, hasTools: boolean): Promise<void> {
    return this.track("Chat Message Sent", { messageLength, hasTools }, userId);
  }

  async trackVoiceModeActivated(userId: string): Promise<void> {
    return this.track("Voice Mode Activated", {}, userId);
  }

  async trackZenModeActivated(userId: string): Promise<void> {
    return this.track("Zen Mode Activated", {}, userId);
  }

  async trackSubscriptionUpgrade(tier: string, userId: string): Promise<void> {
    return this.track("Subscription Upgraded", { tier }, userId);
  }

  async trackPaywallShown(feature: string, userId: string): Promise<void> {
    return this.track("Paywall Shown", { feature }, userId);
  }

  async trackHighlightViewed(alertId: string, severity: string, alertType: string, screenName: string, userId?: string): Promise<void> {
    return this.track("highlight_viewed", { alert_id: alertId, severity, alert_type: alertType, screen_name: screenName }, userId);
  }

  async trackHighlightClicked(alertId: string, severity: string, actionLabel: string, screenName: string, userId?: string): Promise<void> {
    return this.track("highlight_clicked", { alert_id: alertId, severity, action_label: actionLabel, screen_name: screenName }, userId);
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export provider classes for custom setup
export { ConsoleProvider, PostHogProvider };
export type { AnalyticsProvider };

