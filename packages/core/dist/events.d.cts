import { ProductId } from './products.cjs';

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

/**
 * Event categories for organization and filtering
 */
declare const eventCategories: readonly ["user", "auth", "navigation", "engagement", "conversion", "error", "feature", "feedback"];
type EventCategory = (typeof eventCategories)[number];
/**
 * Properties that MUST be included with every event
 */
interface BaseEventProps {
    /** Which app triggered the event */
    app: ProductId;
    /** Timestamp (ISO 8601) */
    timestamp?: string;
    /** Session ID for journey tracking */
    sessionId?: string;
    /** User ID (if authenticated) */
    userId?: string;
}
interface UserSignedUpProps extends BaseEventProps {
    /** Where the user came from */
    source: 'organic' | 'referral' | 'campaign' | 'social' | 'direct';
    /** Referral code if applicable */
    referralCode?: string;
    /** Campaign ID if from marketing */
    campaignId?: string;
}
interface UserSignedInProps extends BaseEventProps {
    /** Authentication method used */
    method: 'password' | 'magic_link' | 'oauth_google' | 'oauth_github' | 'passkey' | 'mfa';
}
interface UserSignedOutProps extends BaseEventProps {
    /** Reason for sign out */
    reason?: 'manual' | 'session_expired' | 'forced';
}
interface UserUpgradedProps extends BaseEventProps {
    /** Previous plan */
    fromPlan: string;
    /** New plan */
    toPlan: string;
    /** Monthly recurring revenue change */
    mrrChange?: number;
}
interface FunnelStartedProps extends BaseEventProps {
    /** Funnel identifier */
    funnelName: string;
    /** Entry point */
    entryPoint: string;
}
interface FunnelStepCompletedProps extends BaseEventProps {
    /** Funnel identifier */
    funnelName: string;
    /** Step number (1-indexed) */
    step: number;
    /** Step name */
    stepName: string;
    /** Time spent on previous step (ms) */
    timeOnStep?: number;
}
interface FunnelConvertedProps extends BaseEventProps {
    /** Funnel identifier */
    funnelName: string;
    /** Total steps completed */
    stepsCompleted: number;
    /** Conversion value */
    value?: number;
    /** Currency of value */
    currency?: string;
}
interface FunnelAbandonedProps extends BaseEventProps {
    /** Funnel identifier */
    funnelName: string;
    /** Step where user abandoned */
    abandonedAtStep: number;
    /** Reason if known */
    reason?: string;
}
interface PageViewedProps extends BaseEventProps {
    /** Page path */
    path: string;
    /** Page title */
    title?: string;
    /** Referrer */
    referrer?: string;
}
interface FeatureUsedProps extends BaseEventProps {
    /** Feature identifier */
    feature: string;
    /** Action taken */
    action: 'viewed' | 'started' | 'completed' | 'dismissed';
    /** Additional context */
    context?: Record<string, string>;
}
interface ContentViewedProps extends BaseEventProps {
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
interface SearchPerformedProps extends BaseEventProps {
    /** Search query */
    query: string;
    /** Number of results */
    resultsCount: number;
    /** Search category/scope */
    category?: string;
}
interface LeadCapturedProps extends BaseEventProps {
    /** Lead source */
    source: string;
    /** Form identifier */
    form: string;
    /** Lead quality score (if calculated) */
    score?: number;
    /** Tier of interest */
    tier?: string;
}
interface DemoRequestedProps extends BaseEventProps {
    /** Product of interest */
    product: ProductId;
    /** Requested demo type */
    demoType?: 'live' | 'recorded' | 'self_guided';
}
interface QuoteRequestedProps extends BaseEventProps {
    /** Service/product category */
    category: string;
    /** Estimated value */
    estimatedValue?: number;
    /** Currency */
    currency?: string;
}
interface PurchaseCompletedProps extends BaseEventProps {
    /** Order/transaction ID */
    transactionId: string;
    /** Product(s) purchased */
    products: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    /** Total value */
    totalValue: number;
    /** Currency */
    currency: string;
    /** Payment method */
    paymentMethod?: string;
}
interface ErrorOccurredProps extends BaseEventProps {
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
interface FeedbackSubmittedProps extends BaseEventProps {
    /** Feedback type */
    type: 'bug' | 'feature_request' | 'general' | 'complaint' | 'praise';
    /** Rating (1-5) if applicable */
    rating?: number;
    /** NPS score (0-10) if applicable */
    npsScore?: number;
    /** Category */
    category?: string;
}
/**
 * Complete event taxonomy with required properties
 *
 * This is the authoritative list of events that can be tracked
 * across the ecosystem. Apps MUST use these event names.
 */
declare const analyticsEvents: {
    readonly 'user.signed_up': UserSignedUpProps;
    readonly 'user.signed_in': UserSignedInProps;
    readonly 'user.signed_out': UserSignedOutProps;
    readonly 'user.upgraded': UserUpgradedProps;
    readonly 'funnel.started': FunnelStartedProps;
    readonly 'funnel.step_completed': FunnelStepCompletedProps;
    readonly 'funnel.converted': FunnelConvertedProps;
    readonly 'funnel.abandoned': FunnelAbandonedProps;
    readonly 'page.viewed': PageViewedProps;
    readonly 'feature.used': FeatureUsedProps;
    readonly 'content.viewed': ContentViewedProps;
    readonly 'search.performed': SearchPerformedProps;
    readonly 'lead.captured': LeadCapturedProps;
    readonly 'demo.requested': DemoRequestedProps;
    readonly 'quote.requested': QuoteRequestedProps;
    readonly 'purchase.completed': PurchaseCompletedProps;
    readonly 'error.occurred': ErrorOccurredProps;
    readonly 'feedback.submitted': FeedbackSubmittedProps;
};
/**
 * Event name type derived from registry
 */
type AnalyticsEventName = keyof typeof analyticsEvents;
/**
 * Get the props type for a specific event
 */
type EventProps<T extends AnalyticsEventName> = (typeof analyticsEvents)[T];
/**
 * Type-safe event helper
 */
type AnalyticsEvent<T extends AnalyticsEventName = AnalyticsEventName> = {
    name: T;
    props: EventProps<T>;
};

export { type AnalyticsEvent, type AnalyticsEventName, type BaseEventProps, type ContentViewedProps, type DemoRequestedProps, type ErrorOccurredProps, type EventCategory, type EventProps, type FeatureUsedProps, type FeedbackSubmittedProps, type FunnelAbandonedProps, type FunnelConvertedProps, type FunnelStartedProps, type FunnelStepCompletedProps, type LeadCapturedProps, type PageViewedProps, type PurchaseCompletedProps, type QuoteRequestedProps, type SearchPerformedProps, type UserSignedInProps, type UserSignedOutProps, type UserSignedUpProps, type UserUpgradedProps, analyticsEvents, eventCategories };
