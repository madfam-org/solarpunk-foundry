/**
 * @madfam/product-telemetry/gate: the handler for the telemetry gate service.
 *
 * Authenticates the product by its bearer token (stored only as a SHA-256 hex
 * digest and compared in constant time), honours a per-product kill switch,
 * re-checks every event with `checkGateBatch` and hands the accepted events to
 * `store`. It never logs or echoes event contents.
 */

import { checkGateBatch, type GateDropReason } from './catalog';
import { GATE_BODY_MAX_BYTES, type Catalog, type GateEvent } from './contract';
import { sha256Hex, timingSafeEqual } from './crypto';
import { empty, json, parseJson, readCappedBody, safeCall } from './http';
import { isRecord } from './validate';

export type GateHandlerDropReason = GateDropReason | 'killed';

export interface GateHandlerOptions {
  /** Each product's catalogue, keyed by product slug. */
  catalogs: Record<string, Catalog>;
  /** product slug → lowercase SHA-256 hex of that product's bearer token. */
  tokens: Record<string, string>;
  /** Products whose telemetry is switched off right now. */
  killed: () => ReadonlySet<string>;
  /** Persists accepted events. Throwing answers 503. */
  store: (events: GateEvent[]) => Promise<void>;
  onAccepted?: (product: string, count: number) => void;
  onDropped?: (product: string, reason: GateHandlerDropReason, count: number) => void;
}

const BEARER = /^Bearer\s+(\S+)\s*$/i;

async function authenticate(req: Request, tokens: Record<string, string>): Promise<string | null> {
  const header = req.headers.get('authorization');
  const m = header ? BEARER.exec(header) : null;
  if (!m) return null;
  const digest = await sha256Hex(m[1]);
  let product: string | null = null;
  // Compare against every entry so timing does not reveal which one matched.
  for (const [slug, expected] of Object.entries(tokens)) {
    if (typeof expected !== 'string') continue;
    if (timingSafeEqual(digest, expected.toLowerCase()) && product === null) product = slug;
  }
  return product;
}

/** Builds the gate's ingest handler. */
export function createGateHandler(opts: GateHandlerOptions): (req: Request) => Promise<Response> {
  async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return empty(405, { allow: 'POST' });

    const product = await authenticate(req, opts.tokens);
    if (!product) return json(401, { error: 'unauthorized' });

    let killed = false;
    try {
      killed = opts.killed().has(product);
    } catch {
      killed = false;
    }
    if (killed) {
      safeCall(opts.onDropped, product, 'killed', 1);
      return json(202, { accepted: 0, dropped: { killed: 1 } });
    }

    const body = await readCappedBody(req, GATE_BODY_MAX_BYTES);
    if (!body.ok) {
      return body.reason === 'too_large' ? json(413, { error: 'too_large' }) : json(400, { error: 'bad_batch' });
    }
    const parsed = parseJson(body.text);
    if (isRecord(parsed) && parsed.product !== product) return json(401, { error: 'unauthorized' });

    const own: Record<string, Catalog> = {};
    if (Object.prototype.hasOwnProperty.call(opts.catalogs, product)) own[product] = opts.catalogs[product];
    const result = checkGateBatch(parsed, own);
    if (!result.valid) {
      safeCall(opts.onDropped, product, 'schema', result.dropped.schema);
      return json(400, { error: 'bad_batch' });
    }

    if (result.accepted.length > 0) {
      try {
        await opts.store(result.accepted);
      } catch {
        return json(503, { error: 'store_unavailable' });
      }
    }

    const dropped: Partial<Record<GateHandlerDropReason, number>> = {};
    for (const [reason, n] of Object.entries(result.dropped) as [GateDropReason, number][]) {
      if (n > 0) {
        dropped[reason] = n;
        safeCall(opts.onDropped, product, reason, n);
      }
    }
    if (result.accepted.length > 0) safeCall(opts.onAccepted, product, result.accepted.length);
    return json(202, { accepted: result.accepted.length, dropped });
  }

  return async (req: Request): Promise<Response> => {
    try {
      return await handle(req);
    } catch {
      return json(500, { error: 'internal' });
    }
  };
}

export { checkGateBatch, sha256Hex };
export type { Catalog, GateEvent, GateDropReason };
