/**
 * @solarpunk/core - Analytics Event Taxonomy
 *
 * Authoritative analytics event schema for cross-ecosystem tracking.
 * This defines the STRUCTURE of events, not the implementation.
 * Apps own their tracking implementation but MUST use these event names
 * for ecosystem-wide analytics to work.
 *
 * Changes to this file require governance approval.
 */

import type { ProductId } from './products';

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Event categories for organization and filtering
 */
export const eventCategories = [
  'user',       // User lifecycle events
  'auth',       // Authentication events
  'navigation', // Page/screen navigation
  'engagement', // User engagement with content
  'conversion', // Business conversion events
  'error',      // Error tracking
  'feature',    // Feature usage tracking
  'feedback',   // User feedback events
] as const;

export type EventCategory = (typeof eventCategories)[number];

// ═══════════════════════════════════════════════════════════════════════════════
// BASE EVENT PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Properties that MUST be included with every event
 */
export interface BaseEventProps {
  /** Which app triggered the event */
  app: ProductId;
  /** Timestamp (ISO 8601) */
  timestamp?: string;
  /** Session ID for journey tracking */
  sessionId?: string;
  /** User ID (if authenticated) */
  userId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER LIFECYCLE EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface UserSignedUpProps extends BaseEventProps {
  /** Where the user came from */
  source: 'organic' | 'referral' | 'campaign' | 'social' | 'direct';
  /** Referral code if applicable */
  referralCode?: string;
  /** Campaign ID if from marketing */
  campaignId?: string;
}

export interface UserSignedInProps extends BaseEventProps {
  /** Authentication method used */
  method: 'password' | 'magic_link' | 'oauth_google' | 'oauth_github' | 'passkey' | 'mfa';
}

export interface UserSignedOutProps extends BaseEventProps {
  /** Reason for sign out */
  reason?: 'manual' | 'session_expired' | 'forced';
}

export interface UserUpgradedProps extends BaseEventProps {
  /** Previous plan */
  fromPlan: string;
  /** New plan */
  toPlan: string;
  /** Monthly recurring revenue change */
  mrrChange?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSION FUNNEL EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface FunnelStartedProps extends BaseEventProps {
  /** Funnel identifier */
  funnelName: string;
  /** Entry point */
  entryPoint: string;
}

export interface FunnelStepCompletedProps extends BaseEventProps {
  /** Funnel identifier */
  funnelName: string;
  /** Step number (1-indexed) */
  step: number;
  /** Step name */
  stepName: string;
  /** Time spent on previous step (ms) */
  timeOnStep?: number;
}

export interface FunnelConvertedProps extends BaseEventProps {
  /** Funnel identifier */
  funnelName: string;
  /** Total steps completed */
  stepsCompleted: number;
  /** Conversion value */
  value?: number;
  /** Currency of value */
  currency?: string;
}

export interface FunnelAbandonedProps extends BaseEventProps {
  /** Funnel identifier */
  funnelName: string;
  /** Step where user abandoned */
  abandonedAtStep: number;
  /** Reason if known */
  reason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGAGEMENT EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PageViewedProps extends BaseEventProps {
  /** Page path */
  path: string;
  /** Page title */
  title?: string;
  /** Referrer */
  referrer?: string;
}

export interface FeatureUsedProps extends BaseEventProps {
  /** Feature identifier */
  feature: string;
  /** Action taken */
  action: 'viewed' | 'started' | 'completed' | 'dismissed';
  /** Additional context */
  context?: Record<string, string>;
}

export interface ContentViewedProps extends BaseEventProps {
  /** Content type */
  contentType: 'article' | 'video' | 'case_study' | 'documentation' | 'tutorial';
  /** Content identifier */
  contentId: string;
  /** Content title */
  title: string;
  /** View duration (seconds) */
  duration?: number;
  /** Completion percentage (0-100) */
  completionPercent?: number;
}

export interface SearchPerformedProps extends BaseEventProps {
  /** Search query */
  query: string;
  /** Number of results */
  resultsCount: number;
  /** Search category/scope */
  category?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface LeadCapturedProps extends BaseEventProps {
  /** Lead source */
  source: string;
  /** Form identifier */
  form: string;
  /** Lead quality score (if calculated) */
  score?: number;
  /** Tier of interest */
  tier?: string;
}

export interface DemoRequestedProps extends BaseEventProps {
  /** Product of interest */
  product: ProductId;
  /** Requested demo type */
  demoType?: 'live' | 'recorded' | 'self_guided';
}

export interface QuoteRequestedProps extends BaseEventProps {
  /** Service/product category */
  category: string;
  /** Estimated value */
  estimatedValue?: number;
  /** Currency */
  currency?: string;
}

export interface PurchaseCompletedProps extends BaseEventProps {
  /** Order/transaction ID */
  transactionId: string;
  /** Product(s) purchased */
  products: Array<{ id: string; name: string; quantity: number; price: number }>;
  /** Total value */
  totalValue: number;
  /** Currency */
  currency: string;
  /** Payment method */
  paymentMethod?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ErrorOccurredProps extends BaseEventProps {
  /** Error code or type */
  errorCode: string;
  /** Error message (sanitized - no PII) */
  message: string;
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Where the error occurred */
  context: string;
  /** Stack trace (truncated, no PII) */
  stack?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface FeedbackSubmittedProps extends BaseEventProps {
  /** Feedback type */
  type: 'bug' | 'feature_request' | 'general' | 'complaint' | 'praise';
  /** Rating (1-5) if applicable */
  rating?: number;
  /** NPS score (0-10) if applicable */
  npsScore?: number;
  /** Category */
  category?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Complete event taxonomy with required properties
 *
 * This is the authoritative list of events that can be tracked
 * across the ecosystem. Apps MUST use these event names.
 */
export const analyticsEvents = {
  // User lifecycle
  'user.signed_up': {} as UserSignedUpProps,
  'user.signed_in': {} as UserSignedInProps,
  'user.signed_out': {} as UserSignedOutProps,
  'user.upgraded': {} as UserUpgradedProps,

  // Conversion funnel
  'funnel.started': {} as FunnelStartedProps,
  'funnel.step_completed': {} as FunnelStepCompletedProps,
  'funnel.converted': {} as FunnelConvertedProps,
  'funnel.abandoned': {} as FunnelAbandonedProps,

  // Engagement
  'page.viewed': {} as PageViewedProps,
  'feature.used': {} as FeatureUsedProps,
  'content.viewed': {} as ContentViewedProps,
  'search.performed': {} as SearchPerformedProps,

  // Business
  'lead.captured': {} as LeadCapturedProps,
  'demo.requested': {} as DemoRequestedProps,
  'quote.requested': {} as QuoteRequestedProps,
  'purchase.completed': {} as PurchaseCompletedProps,

  // Error
  'error.occurred': {} as ErrorOccurredProps,

  // Feedback
  'feedback.submitted': {} as FeedbackSubmittedProps,
} as const;

/**
 * Event name type derived from registry
 */
export type AnalyticsEventName = keyof typeof analyticsEvents;

/**
 * Get the props type for a specific event
 */
export type EventProps<T extends AnalyticsEventName> = (typeof analyticsEvents)[T];

/**
 * Type-safe event helper
 */
export type AnalyticsEvent<T extends AnalyticsEventName = AnalyticsEventName> = {
  name: T;
  props: EventProps<T>;
};
