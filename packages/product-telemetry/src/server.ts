/**
 * @madfam/product-telemetry/server: the product's own same-origin endpoint.
 *
 * It receives a ClientBatch from the browser, checks every event against the
 * schema and the product's catalogue, stamps product, surface, env, screen
 * class, time and the HMAC pseudonyms, and forwards a GateBatch to the gate.
 * It uses only Web-standard Request, Response and fetch, so it works as a
 * Next.js App Router route handler and in Node 20+.
 *
 * It never throws, and after a valid batch it always answers 204 whatever the
 * gate did: a product never waits on, or fails because of, telemetry.
 */

import { applyCatalog, isDeclaredRole } from './catalog';
import {
  BODY_MAX_BYTES,
  CONTRACT_VERSION,
  type Catalog,
  type DropReason,
  type Env,
  type GateBatch,
  type GateEvent,
  type StampedFields,
  type Surface,
} from './contract';
import { pseudonym } from './crypto';
import { empty, json, parseJson, readCappedBody, safeCall } from './http';
import { checkClientBatch, checkClientEvent, checkGateEvent, SLUG_RE } from './validate';

export interface TelemetryIdentity {
  /** The signed-in account. Only its pseudonym leaves the server. */
  accountId: string;
  /** The session. Only its pseudonym leaves the server. */
  sessionId?: string;
  /** A role class; stamped only when the catalogue declares it. */
  role?: string;
  /** A tenant slug; stamped only when it is a valid slug. */
  tenant?: string;
  /** The person opted out: the batch is dropped. */
  optedOut?: boolean;
}

/**
 * Why the server dropped events. Counts are events, except `disabled`,
 * `too_large` and `bad_batch`, which count requests (the body is not read or
 * not readable).
 */
export type ServerDropReason =
  | DropReason
  | 'schema'
  | 'disabled'
  | 'too_large'
  | 'bad_batch'
  | 'no_session'
  | 'opted_out'
  | 'no_key';

export type ForwardStatus = number | 'timeout' | 'error' | 'skipped';

export interface ForwardResult {
  sent: number;
  status: ForwardStatus;
}

export interface TelemetryHandlerOptions {
  product: string;
  surface: Surface;
  env: Env;
  catalog: Catalog;
  /** Checked on every request; false answers 204 without reading the body. */
  enabled: () => boolean;
  /** Resolves the signed-in person from the request (cookie, header). Never sent by the browser. */
  identify: (req: Request) => Promise<TelemetryIdentity | null>;
  /** When true (the default) a request without identity is refused with 401. */
  requireIdentity?: boolean;
  /** The product's HMAC key for pseudonyms. Without it no identified event is sent. */
  hmacKey: string | undefined;
  gate: { url: string | undefined; token: string | undefined; timeoutMs?: number };
  fetchImpl?: typeof fetch;
  now?: () => Date;
  onDrop?: (reason: ServerDropReason, count: number) => void;
  onForward?: (result: ForwardResult) => void;
}

const DEFAULT_GATE_TIMEOUT_MS = 1500;

async function forward(
  opts: TelemetryHandlerOptions,
  events: GateEvent[],
): Promise<ForwardResult> {
  const { url, token } = opts.gate;
  if (!url || !token) return { sent: 0, status: 'skipped' };
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') return { sent: 0, status: 'skipped' };

  const batch: GateBatch = { v: CONTRACT_VERSION, product: opts.product, events };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.gate.timeoutMs ?? DEFAULT_GATE_TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(batch),
      signal: controller.signal,
    });
    try {
      await res.body?.cancel();
    } catch {
      // The gate's answer body is never needed.
    }
    return { sent: events.length, status: res.status };
  } catch {
    return { sent: 0, status: controller.signal.aborted ? 'timeout' : 'error' };
  } finally {
    clearTimeout(timer);
  }
}

/** Builds the route handler. Use it as `export const POST = createTelemetryHandler({...})`. */
export function createTelemetryHandler(opts: TelemetryHandlerOptions): (req: Request) => Promise<Response> {
  const requireIdentity = opts.requireIdentity ?? true;
  const now = opts.now ?? (() => new Date());
  const drop = (reason: ServerDropReason, count: number): void => {
    if (count > 0) safeCall(opts.onDrop, reason, count);
  };

  async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return empty(405, { allow: 'POST' });

    let enabled = false;
    try {
      enabled = opts.enabled() === true;
    } catch {
      enabled = false;
    }
    if (!enabled) {
      drop('disabled', 1);
      return empty(204);
    }

    const body = await readCappedBody(req, BODY_MAX_BYTES);
    if (!body.ok) {
      if (body.reason === 'too_large') {
        drop('too_large', 1);
        return json(413, { error: 'too_large' });
      }
      drop('bad_batch', 1);
      return json(400, { error: 'bad_batch' });
    }
    const batch = checkClientBatch(parseJson(body.text));
    if (!batch.ok) {
      drop('bad_batch', 1);
      return json(400, { error: 'bad_batch' });
    }
    const count = batch.events.length;

    let identity: TelemetryIdentity | null = null;
    try {
      identity = await opts.identify(req);
    } catch {
      identity = null;
    }
    if (!identity && requireIdentity) {
      drop('no_session', count);
      return json(401, { error: 'no_session' });
    }
    if (identity?.optedOut === true) {
      drop('opted_out', count);
      return empty(204);
    }
    if (identity && !opts.hmacKey) {
      drop('no_key', count);
      return empty(204);
    }

    const stamp: Pick<StampedFields, 'actor' | 'session' | 'role' | 'tenant'> = {};
    if (identity) {
      const key = opts.hmacKey as string;
      if (typeof identity.accountId !== 'string' || identity.accountId === '') {
        drop('no_session', count);
        return json(401, { error: 'no_session' });
      }
      stamp.actor = await pseudonym(key, opts.product, identity.accountId);
      if (typeof identity.sessionId === 'string' && identity.sessionId !== '') {
        stamp.session = await pseudonym(key, opts.product, identity.sessionId);
      }
      if (isDeclaredRole(opts.catalog, identity.role)) stamp.role = identity.role;
      if (typeof identity.tenant === 'string' && SLUG_RE.test(identity.tenant)) stamp.tenant = identity.tenant;
    }

    const receivedAt = now().toISOString();
    const kept: GateEvent[] = [];
    for (const raw of batch.events) {
      const checked = checkClientEvent(raw);
      if (!checked.ok) {
        drop('schema', 1);
        continue;
      }
      const applied = applyCatalog(checked.event, opts.catalog);
      if (!applied.ok) {
        drop(applied.reason, 1);
        continue;
      }
      const candidate: GateEvent = {
        ...applied.event,
        product: opts.product,
        surface: opts.surface,
        env: opts.env,
        screen_class: applied.screenClass,
        ...stamp,
        received_at: receivedAt,
      };
      // Last line of defence: what leaves this server is a valid GateEvent.
      const final = checkGateEvent(candidate);
      if (!final.ok) {
        drop('schema', 1);
        continue;
      }
      kept.push(final.event);
    }

    if (kept.length === 0) {
      safeCall(opts.onForward, { sent: 0, status: 'skipped' });
      return empty(204);
    }
    safeCall(opts.onForward, await forward(opts, kept));
    return empty(204);
  }

  return async (req: Request): Promise<Response> => {
    try {
      return await handle(req);
    } catch {
      return json(500, { error: 'internal' });
    }
  };
}

export type { Catalog, ClientBatch, GateBatch, GateEvent } from './contract';
