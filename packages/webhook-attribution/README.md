# @madfam/webhook-attribution

Shared, audited implementation of the MADFAM **signed payment-attribution
fan-out** contract. One package so every emitter and receiver
(`routecraft`, `dhanam`, `phynd-crm`, and future services) shares the same HMAC
handling instead of re-deriving it per repo.

## The contract

`routecraft` emits `payment.succeeded` and fans out in parallel to each receiver
with a per-target signed request:

```
x-madfam-signature: t=<unix-seconds>,v1=<hex hmac-sha256>
```

- **Signed payload** is the literal string `` `${t}.${rawBody}` `` (timestamp,
  a dot, then the *raw, unparsed* request body).
- **Key** is the per-target shared secret (Dhanam and PhyndCRM each hold their own).
- **Replay window** is 5 minutes (`DEFAULT_REPLAY_TOLERANCE_SECONDS = 300`).
- **Idempotency** is keyed by the emitter's `event_id` — duplicate deliveries
  must not double-write.

This mirrors the contract documented in `solarpunk-foundry` `README.md` §"Payment
attribution" and `AGENTS.md`. Verification correctness lives here; event *shapes*
live in `@madfam/types`.

## Receiver usage (NestJS / Fastify)

> Verify against the **raw** body. Capture it before any JSON body parser runs.

```ts
import {
  SIGNATURE_HEADER,
  verifySignature,
  ensureFirstDelivery,
} from '@madfam/webhook-attribution';

const result = verifySignature({
  secret: process.env.DHANAM_WEBHOOK_SECRET!, // or [old, new] during rotation
  body: rawBody,
  header: req.headers[SIGNATURE_HEADER],
});
if (!result.valid) return reply.code(401).send({ error: result.reason });

// Idempotency: back this store with your database in production.
if (!(await ensureFirstDelivery(store, event.event_id))) {
  return reply.code(200).send({ status: 'duplicate_ignored' });
}
```

## Emitter usage

```ts
import { SIGNATURE_HEADER, signPayload } from '@madfam/webhook-attribution';

const header = signPayload({ secret: targetSecret, body: rawBody });
await fetch(targetUrl, {
  method: 'POST',
  headers: { 'content-type': 'application/json', [SIGNATURE_HEADER]: header },
  body: rawBody,
});
```

## API

| Export | Purpose |
|---|---|
| `signPayload({ secret, body, timestamp? })` | Build an `x-madfam-signature` header value. |
| `verifySignature({ secret, body, header, toleranceSeconds?, now? })` | Constant-time verify + replay-window check. `secret` accepts an array for rotation. |
| `parseSignatureHeader(header)` | Parse `t=` / `v1=` fields (returns `null` if malformed). |
| `computeSignature(secret, timestamp, body)` | Low-level hex HMAC-SHA256 of `` `${t}.${body}` ``. |
| `ensureFirstDelivery(store, eventId)` | `true` if new (process it), `false` if duplicate. |
| `InMemoryIdempotencyStore` | Dev/test store. Production uses a durable store. |
| `SIGNATURE_HEADER`, `DEFAULT_REPLAY_TOLERANCE_SECONDS` | Contract constants. |

## Security notes

- Constant-time comparison via `crypto.timingSafeEqual`.
- Never log secrets or raw signatures.
- Always verify the raw body; re-serialized JSON will not match.
- Rotate by passing both secrets to `verifySignature` until the old one is retired.

## Build / test

```sh
pnpm --filter @madfam/webhook-attribution build
pnpm --filter @madfam/webhook-attribution test
```
