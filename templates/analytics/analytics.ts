/**
 * Analytics Reference Implementation
 *
 * This is a TEMPLATE - copy to your app's lib/analytics.ts
 * Each app owns its analytics implementation.
 *
 * Uses Plausible for privacy-first tracking.
 * Event names follow @madfam/core taxonomy.
 *
 * Usage:
 *   1. Copy this file to your app: cp analytics.ts ~/your-app/src/lib/analytics.ts
 *   2. Install dependency: pnpm add plausible-tracker
 *   3. Install @madfam/core: pnpm add @madfam/core
 *   4. Initialize in your app entry point
 *   5. Use throughout your app
 */

import Plausible, { type PlausibleOptions } from 'plausible-tracker';
import type {
  AnalyticsEventName,
  EventProps,
  ProductId,
  BaseEventProps,
} from '@madfam/core';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface AnalyticsConfig {
  /** Your Plausible domain (e.g., 'dhanam.app') */
  domain: string;
  /** Plausible API host (default: 'https://plausible.io') */
  apiHost?: string;
  /** Track localhost for development (default: false) */
  trackLocalhost?: boolean;
  /** Your app's product ID from @madfam/core */
  appId: ProductId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class Analytics {
  private static instance: Analytics;
  private plausible: ReturnType<typeof Plausible> | null = null;
  private appId: ProductId | null = null;
  private sessionId: string | null = null;

  private constructor() {
    // Generate session ID on instantiation
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Initialize analytics with configuration
   * Call once at app startup
   */
  initialize(config: AnalyticsConfig): void {
    if (this.plausible) {
      console.warn('[Analytics] Already initialized');
      return;
    }

    this.appId = config.appId;

    const options: PlausibleOptions = {
      domain: config.domain,
      apiHost: config.apiHost || 'https://plausible.io',
      trackLocalhost: config.trackLocalhost || false,
    };

    this.plausible = Plausible(options);
    this.plausible.enableAutoPageviews();

    console.log(`[Analytics] Initialized for ${config.appId} on ${config.domain}`);
  }

  /**
   * Track a page view (usually automatic, but can be called manually for SPAs)
   */
  trackPageView(path?: string): void {
    if (!this.plausible) {
      console.warn('[Analytics] Not initialized');
      return;
    }

    if (path) {
      this.plausible.trackPageview({ url: path });
    } else {
      this.plausible.trackPageview();
    }
  }

  /**
   * Track an event from the @madfam/core taxonomy
   * Type-safe: only accepts valid event names and their required props
   */
  track<T extends AnalyticsEventName>(
    eventName: T,
    props: Omit<EventProps<T>, keyof BaseEventProps>
  ): void {
    if (!this.plausible || !this.appId) {
      console.warn('[Analytics] Not initialized');
      return;
    }

    // Add base props automatically
    const fullProps = {
      ...props,
      app: this.appId,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    } as EventProps<T>;

    // Convert to string values for Plausible
    const stringProps = this.toStringProps(fullProps);

    this.plausible.trackEvent(eventName, { props: stringProps });
  }

  /**
   * Track a custom event (not in taxonomy - use sparingly)
   */
  trackCustom(eventName: string, props?: Record<string, string | number | boolean>): void {
    if (!this.plausible) {
      console.warn('[Analytics] Not initialized');
      return;
    }

    const stringProps = props ? this.toStringProps(props) : undefined;
    this.plausible.trackEvent(eventName, { props: stringProps });
  }

  /**
   * Set user ID for cross-session tracking (after authentication)
   */
  setUserId(userId: string): void {
    // Store for inclusion in events
    // Note: Plausible doesn't support user ID natively, but we include it in props
    (this as any).userId = userId;
  }

  /**
   * Clear user ID (on logout)
   */
  clearUserId(): void {
    (this as any).userId = undefined;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONVENIENCE METHODS (following @madfam/core event taxonomy)
  // ─────────────────────────────────────────────────────────────────────────────

  /** User signed up */
  trackSignUp(source: 'organic' | 'referral' | 'campaign' | 'social' | 'direct', opts?: { referralCode?: string; campaignId?: string }) {
    this.track('user.signed_up', { source, ...opts });
  }

  /** User signed in */
  trackSignIn(method: 'password' | 'magic_link' | 'oauth_google' | 'oauth_github' | 'passkey' | 'mfa') {
    this.track('user.signed_in', { method });
  }

  /** User signed out */
  trackSignOut(reason?: 'manual' | 'session_expired' | 'forced') {
    this.track('user.signed_out', { reason });
  }

  /** Feature used */
  trackFeature(feature: string, action: 'viewed' | 'started' | 'completed' | 'dismissed', context?: Record<string, string>) {
    this.track('feature.used', { feature, action, context });
  }

  /** Error occurred */
  trackError(errorCode: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical', context: string) {
    this.track('error.occurred', { errorCode, message, severity, context });
  }

  /** Lead captured */
  trackLead(source: string, form: string, opts?: { score?: number; tier?: string }) {
    this.track('lead.captured', { source, form, ...opts });
  }

  /** Funnel step */
  trackFunnelStep(funnelName: string, step: number, stepName: string, timeOnStep?: number) {
    this.track('funnel.step_completed', { funnelName, step, stepName, timeOnStep });
  }

  /** Search performed */
  trackSearch(query: string, resultsCount: number, category?: string) {
    this.track('search.performed', { query, resultsCount, category });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private toStringProps(props: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          result[key] = JSON.stringify(value);
        } else {
          result[key] = String(value);
        }
      }
    }
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Singleton instance */
export const analytics = Analytics.getInstance();

/** React hook for analytics */
export function useAnalytics() {
  return analytics;
}

/** Initialize analytics - call once at app startup */
export function initializeAnalytics(config: AnalyticsConfig) {
  analytics.initialize(config);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════════

/*
// In your app's entry point (e.g., _app.tsx or main.tsx):

import { initializeAnalytics } from '@/lib/analytics';

initializeAnalytics({
  domain: 'dhanam.app',
  appId: 'dhanam',
  trackLocalhost: process.env.NODE_ENV === 'development',
});

// In your components:

import { useAnalytics } from '@/lib/analytics';

function LoginForm() {
  const analytics = useAnalytics();

  const handleLogin = async (method: 'password' | 'magic_link') => {
    // ... login logic
    analytics.trackSignIn(method);
  };

  return <form>...</form>;
}

// For type-safe custom events:

import { analytics } from '@/lib/analytics';

analytics.track('purchase.completed', {
  transactionId: 'txn_123',
  products: [{ id: 'prod_1', name: 'Widget', quantity: 2, price: 10.00 }],
  totalValue: 20.00,
  currency: 'USD',
});
*/
