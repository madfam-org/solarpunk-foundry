/**
 * @madfam/analytics
 * Shared PostHog instrumentation for MADFAM ecosystem
 */

import posthog from 'posthog-js';

export type { PostHog } from 'posthog-js';

// ============================================
// Configuration Types
// ============================================

export interface AnalyticsConfig {
  /** PostHog API key (project key) */
  apiKey: string;
  /** PostHog host URL (self-hosted or cloud) */
  apiHost?: string;
  /** Enable debug mode */
  debug?: boolean;
  /** Site identifier for multi-site analytics */
  siteId: 'madfam' | 'madfam' | 'primavera3d';
  /** Environment */
  environment?: 'development' | 'staging' | 'production';
  /** Disable in certain environments */
  disabled?: boolean;
}

export interface UserIdentity {
  id: string;
  email?: string;
  name?: string;
  company?: string;
  plan?: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  [key: string]: string | number | boolean | undefined;
}

// ============================================
// MADFAM Standard Events
// ============================================

export const MADFAM_EVENTS = {
  // Page & Navigation
  PAGE_VIEW: 'page_view',
  PAGE_LEAVE: 'page_leave',

  // User Actions
  SIGN_UP_STARTED: 'signup_started',
  SIGN_UP_COMPLETED: 'signup_completed',
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Engagement
  CTA_CLICKED: 'cta_clicked',
  FEATURE_EXPLORED: 'feature_explored',
  DEMO_REQUESTED: 'demo_requested',
  CONTACT_FORM_SUBMITTED: 'contact_form_submitted',

  // Commerce (Primavera3D)
  QUOTE_STARTED: 'quote_started',
  QUOTE_COMPLETED: 'quote_completed',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  PAYMENT_COMPLETED: 'payment_completed',

  // Product Interest
  PRICING_VIEWED: 'pricing_viewed',
  PRICING_CALCULATOR_USED: 'pricing_calculator_used',
  PRODUCT_SELECTED: 'product_selected',
  TRIAL_STARTED: 'trial_started',

  // Content
  BLOG_POST_READ: 'blog_post_read',
  DOCUMENTATION_VIEWED: 'documentation_viewed',
  RESOURCE_DOWNLOADED: 'resource_downloaded',

  // A/B Testing
  EXPERIMENT_VIEWED: 'experiment_viewed',
  VARIANT_CONVERTED: 'variant_converted',
} as const;

export type MadfamEvent = typeof MADFAM_EVENTS[keyof typeof MADFAM_EVENTS];

// ============================================
// Analytics Class
// ============================================

class Analytics {
  private initialized = false;
  private config: AnalyticsConfig | null = null;

  /**
   * Initialize PostHog with MADFAM configuration
   */
  init(config: AnalyticsConfig): void {
    if (this.initialized) {
      console.warn('[@madfam/analytics] Already initialized');
      return;
    }

    if (config.disabled) {
      console.log('[@madfam/analytics] Disabled by configuration');
      return;
    }

    // Skip initialization in SSR
    if (typeof window === 'undefined') {
      return;
    }

    this.config = config;

    posthog.init(config.apiKey, {
      api_host: config.apiHost || 'http://localhost:8100',
      loaded: (ph) => {
        if (config.debug) {
          console.log('[@madfam/analytics] PostHog loaded');
        }

        // Set super properties for all events
        ph.register({
          site_id: config.siteId,
          environment: config.environment || 'development',
          app_version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
        });
      },
      autocapture: true,
      capture_pageview: false, // We'll handle this manually for SPA
      capture_pageleave: true,
      disable_session_recording: config.environment !== 'production',
      persistence: 'localStorage',
      bootstrap: {
        distinctID: undefined,
        featureFlags: {},
      },
    });

    this.initialized = true;
  }

  /**
   * Identify a user
   */
  identify(user: UserIdentity): void {
    if (!this.initialized || this.config?.disabled) return;

    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
      company: user.company,
      plan: user.plan,
      ...user,
    });
  }

  /**
   * Reset user identity (on logout)
   */
  reset(): void {
    if (!this.initialized || this.config?.disabled) return;
    posthog.reset();
  }

  /**
   * Track a page view
   */
  pageView(pageName?: string, properties?: Record<string, unknown>): void {
    if (!this.initialized || this.config?.disabled) return;

    posthog.capture(MADFAM_EVENTS.PAGE_VIEW, {
      page_name: pageName || document.title,
      page_url: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer,
      ...properties,
    });
  }

  /**
   * Track a custom event
   */
  track(event: MadfamEvent | string, properties?: Record<string, unknown>): void {
    if (!this.initialized || this.config?.disabled) return;

    posthog.capture(event, {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  }

  /**
   * Track CTA click with standard properties
   */
  trackCTA(ctaName: string, properties?: Record<string, unknown>): void {
    this.track(MADFAM_EVENTS.CTA_CLICKED, {
      cta_name: ctaName,
      cta_location: window.location.pathname,
      ...properties,
    });
  }

  /**
   * Track pricing calculator usage
   */
  trackPricingCalculator(inputs: Record<string, unknown>, result: Record<string, unknown>): void {
    this.track(MADFAM_EVENTS.PRICING_CALCULATOR_USED, {
      calculator_inputs: inputs,
      calculator_result: result,
    });
  }

  /**
   * Track quote flow (Primavera3D)
   */
  trackQuote(stage: 'started' | 'completed', quoteData: Record<string, unknown>): void {
    const event = stage === 'started'
      ? MADFAM_EVENTS.QUOTE_STARTED
      : MADFAM_EVENTS.QUOTE_COMPLETED;

    this.track(event, quoteData);
  }

  /**
   * Track checkout flow (Primavera3D)
   */
  trackCheckout(
    stage: 'started' | 'completed' | 'payment_completed',
    orderData: Record<string, unknown>
  ): void {
    const eventMap = {
      started: MADFAM_EVENTS.CHECKOUT_STARTED,
      completed: MADFAM_EVENTS.CHECKOUT_COMPLETED,
      payment_completed: MADFAM_EVENTS.PAYMENT_COMPLETED,
    };

    this.track(eventMap[stage], orderData);
  }

  // ============================================
  // Feature Flags
  // ============================================

  /**
   * Check if a feature flag is enabled
   */
  isFeatureEnabled(flag: string): boolean {
    if (!this.initialized || this.config?.disabled) return false;
    return posthog.isFeatureEnabled(flag) ?? false;
  }

  /**
   * Get feature flag value (for multivariate flags)
   */
  getFeatureFlag(flag: string): string | boolean | undefined {
    if (!this.initialized || this.config?.disabled) return undefined;
    return posthog.getFeatureFlag(flag);
  }

  /**
   * Reload feature flags
   */
  async reloadFeatureFlags(): Promise<void> {
    if (!this.initialized || this.config?.disabled) return;
    await posthog.reloadFeatureFlagsAsync();
  }

  /**
   * Subscribe to feature flag changes
   */
  onFeatureFlagsLoaded(callback: () => void): () => void {
    if (!this.initialized || this.config?.disabled) return () => {};
    posthog.onFeatureFlags(callback);
    return () => {}; // PostHog doesn't provide unsubscribe
  }

  // ============================================
  // A/B Testing Helpers
  // ============================================

  /**
   * Get A/B test variant
   */
  getExperimentVariant(experimentKey: string): string | undefined {
    const variant = this.getFeatureFlag(experimentKey);

    if (typeof variant === 'string') {
      // Track experiment view
      this.track(MADFAM_EVENTS.EXPERIMENT_VIEWED, {
        experiment_key: experimentKey,
        variant,
      });
      return variant;
    }

    return undefined;
  }

  /**
   * Track experiment conversion
   */
  trackExperimentConversion(experimentKey: string, conversionEvent: string): void {
    const variant = this.getFeatureFlag(experimentKey);

    this.track(MADFAM_EVENTS.VARIANT_CONVERTED, {
      experiment_key: experimentKey,
      variant,
      conversion_event: conversionEvent,
    });
  }

  // ============================================
  // Group Analytics
  // ============================================

  /**
   * Associate user with a group (company/organization)
   */
  setGroup(groupType: string, groupId: string, properties?: Record<string, unknown>): void {
    if (!this.initialized || this.config?.disabled) return;
    posthog.group(groupType, groupId, properties);
  }

  // ============================================
  // Direct PostHog Access
  // ============================================

  /**
   * Get the underlying PostHog instance for advanced usage
   */
  get posthog(): typeof posthog {
    return posthog;
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export for direct imports
export { posthog };
export default analytics;
