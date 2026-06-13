/**
 * @madfam/webhook-attribution
 *
 * Reference implementation of the MADFAM signed payment-attribution contract.
 *
 * `routecraft` emits `payment.succeeded` and fans out to receivers (`dhanam`
 * `POST /v1/billing/madfam-events`, `phynd-crm` `POST /api/webhooks/routecraft`).
 * Each request carries:
 *
 *     x-madfam-signature: t=<unix-seconds>,v1=<hex hmac-sha256>
 *
 * where the signed payload is the literal string `` `${t}.${rawBody}` `` and the
 * HMAC key is the per-target shared secret. Receivers MUST verify the signature,
 * reject timestamps outside a 5-minute replay window, and de-duplicate by the
 * emitter's `event_id`.
 *
 * This package is the single source of truth for that scheme so Dhanam,
 * RouteCraft, PhyndCRM, and any future receiver share one audited implementation
 * instead of re-deriving HMAC handling per repo.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/** Canonical signature header name (lowercased, as Node/Fastify expose it). */
export const SIGNATURE_HEADER = 'x-madfam-signature' as const;

/** Replay window: reject timestamps more than this many seconds from now. */
export const DEFAULT_REPLAY_TOLERANCE_SECONDS = 300;

/** Scheme version emitted in the `v1=` field. */
export const SIGNATURE_SCHEME_VERSION = 'v1' as const;

/** Parsed form of an `x-madfam-signature` header value. */
export interface ParsedSignature {
  /** Unix timestamp (seconds) from the `t=` field. */
  timestamp: number;
  /** One or more `v1=` hex signatures (multiple supports secret rotation). */
  signatures: string[];
}

/**
 * Parse a raw `x-madfam-signature` value. Returns `null` when the header is
 * absent or malformed (no usable `t=` integer, or no `v1=` signature).
 */
export function parseSignatureHeader(
  header: string | undefined | null,
): ParsedSignature | null {
  if (!header || typeof header !== 'string') return null;

  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of header.split(',')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (!value) continue;
    if (key === 't') {
      const parsed = Number(value);
      if (Number.isInteger(parsed) && parsed > 0) timestamp = parsed;
    } else if (key === SIGNATURE_SCHEME_VERSION) {
      signatures.push(value);
    }
  }

  if (timestamp === null || signatures.length === 0) return null;
  return { timestamp, signatures };
}

/**
 * Compute the lowercase hex HMAC-SHA256 of `` `${timestamp}.${body}` `` under
 * `secret`. `body` MUST be the exact raw request body bytes/string as
 * transmitted — re-serializing parsed JSON will change the signature.
 */
export function computeSignature(
  secret: string,
  timestamp: number,
  body: string,
): string {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
}

/** Options for {@link signPayload}. */
export interface SignOptions {
  /** Per-target shared secret. */
  secret: string;
  /** Raw request body, exactly as it will be transmitted. */
  body: string;
  /** Unix timestamp (seconds). Defaults to the current time. */
  timestamp?: number;
}

/**
 * Produce a complete `x-madfam-signature` header value for an outbound request.
 *
 * @example
 * ```ts
 * const header = signPayload({ secret, body: rawBody });
 * await fetch(url, { method: 'POST', headers: { [SIGNATURE_HEADER]: header }, body: rawBody });
 * ```
 */
export function signPayload({ secret, body, timestamp }: SignOptions): string {
  const ts = timestamp ?? nowSeconds();
  const sig = computeSignature(secret, ts, body);
  return `t=${ts},${SIGNATURE_SCHEME_VERSION}=${sig}`;
}

/** Why a verification attempt failed. `undefined` on success. */
export type VerifyFailureReason =
  | 'missing_header'
  | 'malformed_header'
  | 'timestamp_out_of_tolerance'
  | 'no_match';

/** Options for {@link verifySignature}. */
export interface VerifyOptions {
  /** Shared secret, or several to allow zero-downtime rotation. */
  secret: string | string[];
  /** Raw request body, exactly as received (do not re-serialize). */
  body: string;
  /** The incoming `x-madfam-signature` header value. */
  header: string | undefined | null;
  /** Replay window in seconds. Defaults to {@link DEFAULT_REPLAY_TOLERANCE_SECONDS}. */
  toleranceSeconds?: number;
  /** Current unix time (seconds); injectable for tests. */
  now?: number;
}

/** Result of {@link verifySignature}. */
export interface VerifyResult {
  valid: boolean;
  reason?: VerifyFailureReason;
  /** The header timestamp, when the header parsed successfully. */
  timestamp?: number;
}

/**
 * Verify an incoming signed webhook. Constant-time signature comparison,
 * replay-window enforcement, and multi-secret support for rotation.
 *
 * @example
 * ```ts
 * const result = verifySignature({ secret: process.env.DHANAM_WEBHOOK_SECRET!, body: rawBody, header });
 * if (!result.valid) return reply.code(401).send({ error: result.reason });
 * ```
 */
export function verifySignature({
  secret,
  body,
  header,
  toleranceSeconds = DEFAULT_REPLAY_TOLERANCE_SECONDS,
  now,
}: VerifyOptions): VerifyResult {
  if (header === undefined || header === null || header === '') {
    return { valid: false, reason: 'missing_header' };
  }

  const parsed = parseSignatureHeader(header);
  if (!parsed) return { valid: false, reason: 'malformed_header' };

  const current = now ?? nowSeconds();
  if (Math.abs(current - parsed.timestamp) > toleranceSeconds) {
    return {
      valid: false,
      reason: 'timestamp_out_of_tolerance',
      timestamp: parsed.timestamp,
    };
  }

  const secrets = Array.isArray(secret) ? secret : [secret];
  for (const candidate of secrets) {
    if (!candidate) continue;
    const expected = computeSignature(candidate, parsed.timestamp, body);
    for (const provided of parsed.signatures) {
      if (timingSafeEqualHex(expected, provided)) {
        return { valid: true, timestamp: parsed.timestamp };
      }
    }
  }

  return { valid: false, reason: 'no_match', timestamp: parsed.timestamp };
}

/**
 * Durable de-duplication store keyed by emitter `event_id`. Production
 * receivers back this with their database; {@link InMemoryIdempotencyStore}
 * is provided for tests and local dev only.
 */
export interface IdempotencyStore {
  has(key: string): Promise<boolean> | boolean;
  add(key: string): Promise<void> | void;
}

/**
 * Record an event id and report whether it is new. Returns `true` when the
 * event should be processed, `false` when it is a duplicate delivery.
 *
 * @example
 * ```ts
 * if (!(await ensureFirstDelivery(store, event.event_id))) return reply.code(200).send(); // already handled
 * ```
 */
export async function ensureFirstDelivery(
  store: IdempotencyStore,
  eventId: string,
): Promise<boolean> {
  if (!eventId) throw new Error('eventId is required for idempotent processing');
  if (await store.has(eventId)) return false;
  await store.add(eventId);
  return true;
}

/**
 * Minimal in-memory {@link IdempotencyStore} with optional TTL. NOT for
 * production — a process restart or second replica loses the dedupe set.
 */
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly seen = new Map<string, number>();

  constructor(private readonly ttlMs = 24 * 60 * 60 * 1000) {}

  has(key: string): boolean {
    const expiry = this.seen.get(key);
    if (expiry === undefined) return false;
    if (Date.now() > expiry) {
      this.seen.delete(key);
      return false;
    }
    return true;
  }

  add(key: string): void {
    this.seen.set(key, Date.now() + this.ttlMs);
  }
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  // Lengths differ → not equal. Comparing unequal-length buffers throws, and the
  // length itself is not secret, so this short-circuit is safe.
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}
