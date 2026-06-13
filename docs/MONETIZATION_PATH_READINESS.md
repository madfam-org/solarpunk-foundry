# Monetization-Path Readiness — Ecosystem Contracts

**Last Updated:** 2026-06-13
**Scope:** Public-safe. This repo owns the cross-service *contracts* and shared
`@madfam/*` packages. Sensitive operational detail, prod topology, and the
cross-repo execution sequence live in `internal-devops`
(`roadmaps/2026-06-13-first-pesos-execution-roadmap.md`).

## Why this doc exists

The 2026-06-13 architecture review found the ecosystem's monetization spine
built and live, with the **signed payment-attribution contract** as the one
Critical integration gap that lived only as prose: every receiver re-derived
HMAC handling. This doc records the contract and the shared package that now
implements it.

## The four contracts (monetization view)

| Contract | Owner | Monetization role | Enforced by |
|---|---|---|---|
| Identity | Janua | Customer/session identity; never holds money | Janua SDK + RS256 JWKS |
| Inference | Selva `/v1` | LLM cost routing; no provider keys in product code | Doc + base_url config |
| **Payment attribution** | RouteCraft → Dhanam + PhyndCRM | Signed `payment.succeeded` fan-out | **`@madfam/webhook-attribution`** (new) + `@madfam/types` |
| Data boundaries | Dhanam owns billing ledger | Own once, query everywhere | `@madfam/types` federation types |

## Payment-attribution contract (now packaged)

`routecraft` emits `payment.succeeded` and fans out to:

- `dhanam` `POST /v1/billing/madfam-events` → `BillingEvent` row
- `phynd-crm` `POST /api/webhooks/routecraft` → `conversions` row + source-agent credit

Each request carries `x-madfam-signature: t=<unix-seconds>,v1=<hex hmac-sha256>`
over the literal `` `${t}.${rawBody}` ``, per-target secret, **5-minute replay
window**, idempotent by emitter `event_id`.

### What shipped 2026-06-13

- **`packages/webhook-attribution/`** — `@madfam/webhook-attribution`: the single
  audited implementation of `signPayload` / `verifySignature` (constant-time,
  replay-window, multi-secret rotation) / `parseSignatureHeader` /
  `ensureFirstDelivery` idempotency. Built (CJS+ESM+DTS), unit-tested.
- **`@madfam/types`** — added `routecraft` to `MadfamService`, the
  `MADFAM_SIGNATURE_HEADER` constant, and the `MadfamPaymentEvent` inbound event
  shape (`RouteCraftEventType`). Event *shapes* live in types; *verification*
  lives in webhook-attribution.

### Adoption tasks (tracked in consuming repos)

- [ ] Dhanam `MadfamEventsController` verifies via `@madfam/webhook-attribution`
      against the raw body; idempotency backed by a durable store.
- [ ] PhyndCRM `routecraft` webhook adopts the same verifier.
- [ ] RouteCraft `emitPaymentSucceeded` signs via `signPayload`.
- [ ] Publish `@madfam/webhook-attribution@0.1.0` to `npm.madfam.io`.

> Closing these also retires the dual-emitter / PSP-key debt tracked in
> `internal-devops/decisions/2026-05-04-payment-emission-soc.md`.

## Shared-package monetization readiness

| Package | Monetization role | Status |
|---|---|---|
| `@madfam/webhook-attribution` | Payment-attribution HMAC + idempotency | **New, ready to publish** |
| `@madfam/types` | Cross-service event shapes incl. payment events | Updated; routecraft + payment event added |
| `@madfam/core` | MXN-first currencies, product/legal constants | Ready |
| `@madfam/logging` / `env` / `sentry` / `telemetry` | Operability substrate for billing services | Ready |
| `@madfam/ui` | **Deprecated** → use `@dhanam/ui` for checkout UI | Do not adopt for new work |

## Known gaps to track (public-safe)

- **Port allocation:** Dhanam's local-dev port is referenced inconsistently
  (`4200` / `4700` / `3030` across docs), and `4700` overlaps fortuna/phynd-crm/
  rondelio. Source of truth is `enclii local up` + the repo `.enclii.yml`;
  production is unaffected (namespace + hostname routing). Pick a non-overlapping
  local port and align `.enclii.yml` + `DOGFOODING_GUIDE.md` in a dedicated change.
  See the clarification in `docs/PORT_ALLOCATION.md`.
- **Publish/registry drift:** mixed `publishConfig` targets across packages;
  align all `@madfam/*` to `npm.madfam.io`.
- **CI:** most packages lack `test`/`lint` scripts; webhook-attribution ships
  with a `test` script and unit tests as the template to follow.

## Verify locally

```sh
pnpm --filter @madfam/webhook-attribution build
pnpm --filter @madfam/webhook-attribution test
pnpm --filter @madfam/types typecheck
```
