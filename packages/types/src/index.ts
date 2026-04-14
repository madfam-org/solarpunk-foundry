/**
 * @madfam/types — Shared type definitions for the MADFAM ecosystem.
 *
 * These types match the event-schemas.yaml registry at
 * internal-devops/ecosystem/event-schemas.yaml.
 */

// ─── Event Envelope ──────────────────────────────────────────────────────────

export interface ServiceEventEnvelope<T = unknown> {
  event_type: string;
  source: MadfamService;
  correlation_id: string;
  timestamp: string; // ISO 8601
  payload: T;
}

// ─── Service Names ───────────────────────────────────────────────────────────

export type MadfamService =
  | 'dhanam'
  | 'phyne-crm'
  | 'autoswarm-office'
  | 'karafiel'
  | 'tezca'
  | 'janua'
  | 'forgesight'
  | 'digifab-quoting'
  | 'yantra4d'
  | 'fortuna'
  | 'ceq'
  | 'rondelio'
  | 'enclii'
  | 'pravara-mes'
  | 'coforma-studio'
  | 'legal-ops'
  | 'madfam-crawler';

// ─── Billing Events (published by Dhanam) ────────────────────────────────────

export type BillingProvider =
  | 'stripe'
  | 'stripe_mx'
  | 'conekta'
  | 'polar'
  | 'paddle';

export interface BillingSubscriptionCreated {
  user_id: string;
  email: string;
  plan: string;
  status: string;
  provider: BillingProvider;
  currency: string;
  amount: number;
}

export interface BillingSubscriptionCancelled {
  user_id: string;
  plan: string;
  reason?: string;
  effective_at: string; // ISO 8601
}

export interface BillingPaymentSucceeded {
  user_id: string;
  amount: number;
  currency: string;
  provider: BillingProvider;
  invoice_id?: string;
}

export interface BillingPaymentFailed {
  user_id: string;
  amount: number;
  currency: string;
  error_message?: string;
}

export interface KycVerified {
  user_id: string;
  email: string;
  verification_id: string;
}

export interface KycRejected {
  user_id: string;
  verification_id: string;
  reason?: string;
}

// ─── CRM Events (published by PhyneCRM) ──────────────────────────────────────

export interface CrmLeadCreated {
  lead_id: string;
  contact_id: string;
  email?: string;
  source?: string;
}

export interface CrmLeadScored {
  lead_id: string;
  score: number;
  previous_score?: number;
}

// ─── Event Type Map ──────────────────────────────────────────────────────────

export interface BillingEventMap {
  'billing.subscription.created': BillingSubscriptionCreated;
  'billing.subscription.cancelled': BillingSubscriptionCancelled;
  'billing.payment.succeeded': BillingPaymentSucceeded;
  'billing.payment.failed': BillingPaymentFailed;
  'kyc.verified': KycVerified;
  'kyc.rejected': KycRejected;
}

export interface CrmEventMap {
  'crm.lead.created': CrmLeadCreated;
  'crm.lead.scored': CrmLeadScored;
}

export type BillingEventType = keyof BillingEventMap;
export type CrmEventType = keyof CrmEventMap;
export type MadfamEventType = BillingEventType | CrmEventType;

// ─── Typed Event Helpers ─────────────────────────────────────────────────────

export type BillingEvent<T extends BillingEventType = BillingEventType> =
  ServiceEventEnvelope<BillingEventMap[T]> & { event_type: T };

export type CrmEvent<T extends CrmEventType = CrmEventType> =
  ServiceEventEnvelope<CrmEventMap[T]> & { event_type: T };

// ─── Health Check ────────────────────────────────────────────────────────────

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
}

// ─── Federation (PhyneCRM ↔ Dhanam) ──────────────────────────────────────────

export interface FederatedCustomer {
  id: string;
  subscription: {
    plan: string;
    status: string;
  };
  balance: {
    amount: number;
    currency: string;
  };
  invoices: FederatedInvoice[];
  payment_methods: string[];
}

export interface FederatedInvoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface FederatedCheckoutRequest {
  plan: string;
  success_url: string;
  cancel_url: string;
}

export interface FederatedCheckoutResponse {
  checkout_url: string;
  session_id: string;
}

// ─── Webhook Payloads ────────────────────────────────────────────────────────

export interface CotizaWebhookPayload {
  event_id: string;
  event_type:
    | 'payment.succeeded'
    | 'payment.failed'
    | 'subscription.created'
    | 'subscription.updated'
    | 'quote.paid'
    | 'invoice.paid';
  data: Record<string, unknown>;
  timestamp: string;
}

// ─── Redis Streams Constants ─────────────────────────────────────────────────

export const STREAMS = {
  BILLING: 'madfam:billing-events',
  CRM: 'madfam:crm-events',
} as const;

export const MAX_STREAM_LENGTH = 10_000;
export const DLQ_MAX_RETRIES = 3;
