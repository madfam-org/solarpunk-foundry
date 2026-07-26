# Monetization-Path Readiness — ecosystem contracts

**Last verified: 2026-07-25**

**Scope:** public-safe. This repository owns the cross-service *contracts* and
the shared `@madfam/*` packages that implement them. Operational detail,
production topology, secret values and the cross-repo execution sequence live
in `internal-devops`.

> ## Standing of this document
>
> The assessment this document was built on is dated **2026-06-13** and has
> been **overtaken twice**. Both supersessions are recorded below rather than
> quietly folded in, because the direction of the correction matters: the
> earlier version described the monetization spine in the present tense as
> "built and live" with one remaining gap, and both later checks found
> materially less than that.

---

## Timeline of assessments

| Date | Assessment | Standing |
|---|---|---|
| **2026-06-13** | Architecture review: monetization spine "built and live"; the signed payment-attribution contract identified as the one Critical integration gap. | **Superseded.** Accurate as a package/contract-design finding; wrong as a funnel-level claim. |
| **2026-07-08** | Payment-emission separation-of-concerns plan, verified directly against `routecraft` at a named commit. | **The current word on the fan-out.** See below. |
| **2026-07-16** | Holistic launch-readiness audit — 8 platforms, 7 integration edges. | **Verdict: NO-GO.** The revenue funnel was assessed as structurally dead at four consecutive hops, with `billing_events = 0` — no real charge has ever completed end to end. Sixteen enumerated blockers across eight funnel hops. |

Nothing dated after 2026-07-16 was found that revises the NO-GO. The blocker
list itself is operator/product material and lives in
`internal-devops/roadmaps/2026-07-16-launch-remediation-roadmap.md`.

---

## The four contracts (monetization view)

| Contract | Owner | Monetization role | Enforced by |
|---|---|---|---|
| Identity | Janua | Customer/session identity; never holds money | Janua SDK + **RS256 JWKS** verification |
| Inference | **`inference.selva.town`** (standalone gateway) | LLM cost routing; no provider keys in product code | Config (`base_url`) + doc |
| Payment attribution | RouteCraft → Dhanam + PhyndCRM | Signed `payment.succeeded` fan-out | `@madfam/webhook-attribution` + `@madfam/types` |
| Data boundaries | Dhanam owns the billing ledger | Own once, query everywhere | `@madfam/types` federation types |

> **Inference row corrected 2026-07-25.** Earlier revisions named "Selva `/v1`".
> The OpenAI-compatible proxy was extracted out of `nexus-api` into a standalone
> gateway on **2026-07-07**; the `nexus-api` `/v1` mount was removed. See
> [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md#inference).

---

## Payment-attribution contract

### As designed

`routecraft` emits `payment.succeeded` and fans out to two receivers:

- `dhanam` → `POST /v1/billing/madfam-events` → a `BillingEvent` row
- `phynd-crm` → `POST /api/webhooks/routecraft` → a `conversions` row plus
  source-agent credit

Each request carries
`x-madfam-signature: t=<unix-seconds>,v1=<hex hmac-sha256>` over the literal
`` `${t}.${rawBody}` ``, with a per-target secret, a **5-minute replay window**,
and idempotency keyed on the emitter's `event_id`.

### As built — verified 2026-07-08

**The fan-out is a silent no-op today.** Verified directly against `routecraft`
at commit `a71512a`:

| Finding | Consequence |
|---|---|
| Only the Conekta webhook emits; the Stripe path emits nothing | Most payments produce no event at all |
| The `attribution` sub-object is never populated | Even a delivered event carries no attribution |
| No `payment.refunded` on the routecraft side | Refunds leave no trace downstream |
| Emitter target secrets are **absent from production manifests** | Nothing would authenticate even if it fired |

The 2026-07-16 audit scored the same edge independently: fan-out targets have
the wrong route, wrong secret and wrong header, so *"the first sale leaves zero
trace"*.

**Do not read the "as designed" section as a description of running behaviour.**

### The ratified target differs from what is built

The decision of record (2026-05-04, reaffirmed verbatim in the 2026-07-08
execution plan) is:

> **Dhanam is the sole payment emitter; routecraft becomes a payment
> *consumer* plus an *attribution* emitter.**

So the RouteCraft-as-emitter arrangement in the contract table above is the
**as-built debt state**, not the destination. Recording only the as-built
arrangement is how a public contract document ends up validating the very
design an ADR is trying to retire.

| | Emitter of `payment.succeeded` | PSP keys held by |
|---|---|---|
| **As built (2026-07-08)** | routecraft (Conekta path only) | routecraft **and** dhanam |
| **Ratified target** | dhanam, solely | dhanam |

---

## Shared package status

*Package presence and versions verified 2026-07-25 by reading the manifests in
`packages/`.*

| Package | Version | Monetization role | Status |
|---|---|---|---|
| `@madfam/webhook-attribution` | 0.1.0 | Payment-attribution HMAC + idempotency: `signPayload`, constant-time `verifySignature` with replay window and multi-secret rotation, `parseSignatureHeader`, `ensureFirstDelivery` | Built and unit-tested. **Zero consumers.** |
| `@madfam/types` | 0.1.0 | Cross-service event shapes including `MadfamPaymentEvent`, the `MADFAM_SIGNATURE_HEADER` constant, `routecraft` in `MadfamService` | Ready |
| `@madfam/core` | 0.1.0 | MXN-first currency, product and legal constants | Ready |
| `@madfam/logging`, `env`, `sentry`, `telemetry` | 0.1.0 | Operability substrate for billing services | Ready |
| `@madfam/ui` | 0.2.0 | — | **Deprecated.** `packages/ui/README.md` opens "This package is deprecated." Do not adopt for new work. |

Event *shapes* live in `@madfam/types`; *verification* lives in
`@madfam/webhook-attribution`. Keep that split.

### Adoption: no movement

*Verified 2026-07-25 by searching every `package.json` in `~/labspace` for a
dependency on `@madfam/webhook-attribution`. The only match is the package's own
manifest.*

- [ ] Dhanam `MadfamEventsController` verifies via `@madfam/webhook-attribution`
      against the raw body, with idempotency backed by a durable store.
- [ ] PhyndCRM `routecraft` webhook adopts the same verifier.
- [ ] RouteCraft `emitPaymentSucceeded` signs via `signPayload`.
- [ ] Publish `@madfam/webhook-attribution@0.1.0` to `npm.madfam.io`.

**Both sides have instead hardened their own in-repo implementations.** Dhanam
carries `apps/api/src/modules/billing/madfam-events.sig.ts` (`signEnvelope` /
`verifyEnvelope`) and RouteCraft carries `packages/payments/src/events.ts`
(`signBody`) — both present on disk, verified 2026-07-25. The 2026-07-08 review
found the two implementations byte-identical in signing behaviour, which is
precisely the drift risk the shared package exists to remove.

The checklist above has not moved since 2026-06-13. It is listed unchecked so
it does not imply momentum it does not have.

> Whether `@madfam/webhook-attribution@0.1.0` is actually published to
> `npm.madfam.io` was **not** verified — that needs a registry query or a dated
> operator attestation. Treat "ready to publish" as exactly that.

---

## Known gaps (public-safe)

- **Port referencing.** Dhanam's local-dev port is cited inconsistently across
  documents, and the aspirational 4700 block is claimed by more than one
  service. Production is unaffected — namespace and hostname routing make
  container ports invisible. Source of truth is `enclii local up` plus each
  repo's own `enclii.yaml`. See [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md).
- **Registry drift.** `publishConfig` targets vary across `@madfam/*` packages;
  they should all point at `npm.madfam.io`. Separately,
  `@madfam/ecosystem-banner` declares `"license": "UNLICENSED"` while every
  other package declares `MIT` — see
  [`LICENSING_STRATEGY.md`](./LICENSING_STRATEGY.md).
- **CI coverage.** Most packages lack `test` and `lint` scripts.
  `webhook-attribution` ships both and is the template to follow.
- **Observability of the money path.** The 2026-07-16 audit recorded alert
  delivery as not working and the synthetic revenue probe as disabled. A
  contract that fails silently and is not alerted on fails invisibly.

---

## Verify locally

```sh
pnpm --filter @madfam/webhook-attribution build
pnpm --filter @madfam/webhook-attribution test
pnpm --filter @madfam/types typecheck
```

---

## Related

- [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md) — the four ecosystem-wide
  contracts in full
- [`JANUA_INTEGRATION.md`](./JANUA_INTEGRATION.md) — the identity contract
- [`OPERATIONAL_REDIRECTS.md`](./OPERATIONAL_REDIRECTS.md) — where the operator
  sequencing lives
