# `docs/` — index and verification state

**Last verified: 2026-07-25**

This directory is the public documentation set for the MADFAM ecosystem. It is
Lane B: canonical ecosystem map, architecture narrative, shared contract
surfaces, and sanitized pointers into the private `internal-devops` repository.

## The rules this directory is held to

1. **No claim without a source and a date.** Every factual assertion should be
   traceable to a file someone actually read, carrying the date that source was
   last verified.
2. **Never invent verification.** A public repository cannot probe production.
   If a route was last verified on a given date, the doc says that date — not
   "live", not "currently".
3. **Aspirational content is labelled in place, not deleted.**
   [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md) is the model: it opens by
   declaring its own scheme aspirational and stating how few services follow it.
   That honesty is what makes it useful.
4. **No marketing language.** No superlatives, no invented metrics, no adoption
   numbers.
5. **Where something cannot be established, say so and name what would settle
   it.** An honest gap beats a confident guess.

## Three kinds of claim

Documents here distinguish:

| Kind | Meaning |
|---|---|
| **Verified** | Checked against a named file, with the date of the check |
| **Documented but unverified** | Recorded in a source, not re-checked; the date tells you the age of the evidence |
| **Aspirational** | A plan or intent; labelled as such, in place |

## Index

### Status and inventory

| Document | Covers | Last verified |
|---|---|---|
| [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md) | Service and route inventory, **retired and not-live endpoints**, ecosystem-wide contracts, repository counts | 2026-07-25 |
| [`INFRASTRUCTURE_STATUS.md`](./INFRASTRUCTURE_STATUS.md) | Declared configuration: cluster shape, ingress, storage, GitOps, admission policy, secret delivery, local dev | 2026-07-25 |
| [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md) | Port registry and its honest compliance statement | see the document |

### Contracts and integration

| Document | Covers | Last verified |
|---|---|---|
| [`JANUA_INTEGRATION.md`](./JANUA_INTEGRATION.md) | The auth contract — **RS256/JWKS only**, endpoints, SDKs, verifier patterns | 2026-07-25 |
| [`INTEGRATION_TESTING.md`](./INTEGRATION_TESTING.md) | Janua ↔ Enclii integration tests, all local | 2026-07-25 |
| [`MONETIZATION_PATH_READINESS.md`](./MONETIZATION_PATH_READINESS.md) | Payment-attribution contract: as designed, as built, ratified target | 2026-07-25 |
| [`ECOSYSTEM_BANNER.md`](./ECOSYSTEM_BANNER.md) | Shared banner/footer contract for product landings | 2026-07-25 |

### Development

| Document | Covers | Last verified |
|---|---|---|
| [`DOGFOODING_GUIDE.md`](./DOGFOODING_GUIDE.md) | Local development — `enclii local up` first, compose fallback | 2026-07-25 |
| [`CROSS_REPO_NAVIGATION.md`](./CROSS_REPO_NAVIGATION.md) | Where to find the canonical document for a topic | 2026-07-25 |
| [`LICENSING_STRATEGY.md`](./LICENSING_STRATEGY.md) | Licensing tiers, the (partial) matrix, and measured compliance gaps | 2026-07-25 |

### Architecture

| Document | Covers | Status |
|---|---|---|
| [`architecture/SYMBIOSIS.md`](./architecture/SYMBIOSIS.md) | The narrative: Substrate / Trellis / Membrane | Current, verified 2026-07-25 |
| [`architecture/CLUSTER_ARCHITECTURE.md`](./architecture/CLUSTER_ARCHITECTURE.md) | Node roles, network topology, build pipeline, scaling path | Current, verified 2026-07-25 |
| [`architecture/FEDERATED_ARCHITECTURE_README.md`](./architecture/FEDERATED_ARCHITECTURE_README.md) | Local-dev compose federation | **Historical (2025-11-24), superseded** |
| [`architecture/SELF_CONTAINED_SERVICES.md`](./architecture/SELF_CONTAINED_SERVICES.md) | HTTP-first integration argument | **Position paper, partly superseded** |

### Boundary and operations

| Document | Covers | Last verified |
|---|---|---|
| [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md) | What may and may not appear in this repository, and what the CI guard actually catches | 2026-07-25 |
| [`OPERATIONAL_REDIRECTS.md`](./OPERATIONAL_REDIRECTS.md) | Where private operational execution lives | 2026-07-25 |
| [`SSH_ACCESS.md`](./SSH_ACCESS.md) | Node access — pointer only, with a corrected security posture | 2026-07-25 |
| [`runbooks/`](./runbooks/) | Public-safe summaries of five production procedures, plus pointers | 2026-07-25 |

## What this directory deliberately does not contain

Node hostnames, IP addresses, hardware models or capacity figures, Cloudflare
tunnel identifiers, cost or procurement data, Vault paths or secret names with
retrieval detail, raw break-glass commands, SSH access rosters, or incident
evidence trails. Those are Lane A. See
[`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md).

It also does not contain **live status**. Absence of a health claim is not a
claim of health in either direction. The live surfaces are `status.enclii.dev`
and `status.madfam.io`.

## Open items this directory has recorded rather than resolved

Each of these is stated in the document that raises it, together with the probe
or action that would settle it. Collected here so they are visible in one place.

| Open item | Where it is recorded |
|---|---|
| cloudflared replica count — no verification since 2026-02 | `INFRASTRUCTURE_STATUS.md`, `architecture/CLUSTER_ARCHITECTURE.md` |
| ArgoCD Application count — two private records disagree | `INFRASTRUCTURE_STATUS.md` |
| Kyverno PolicyException count — 8 vs 13, same date | `INFRASTRUCTURE_STATUS.md` |
| Whether `require-image-digest` is Audit or Enforce today | `INFRASTRUCTURE_STATUS.md` |
| Longhorn version — one undated mention | `INFRASTRUCTURE_STATUS.md` |
| Fleet-wide auto-digest pipeline health | `INFRASTRUCTURE_STATUS.md`, `runbooks/rollback.md` |
| `eido.cam` live status — private record contradicts itself; one incidental 2026-07-25 data point weakens the "pre-deploy" side | `ECOSYSTEM_STATUS.md` |
| `tulana.madfam.io` and `dash.madfam.io` live status and auth posture | `ECOSYSTEM_STATUS.md` |
| Per-surface Janua SSO enforcement — the matrix was never committed | `architecture/CLUSTER_ARCHITECTURE.md`, `JANUA_INTEGRATION.md` |
| Whether `@madfam/*` package versions are actually published to `npm.madfam.io` | `JANUA_INTEGRATION.md`, `ECOSYSTEM_BANNER.md`, `MONETIZATION_PATH_READINESS.md` |
| PITR restore has never been demonstrated | `runbooks/backup-restore.md` |
| Alert delivery status after the 2026-07-16 assessment | `ECOSYSTEM_STATUS.md`, `runbooks/incident-response.md` |
| Redis database-index allocation is unverified convention | `DOGFOODING_GUIDE.md` |
| License compliance gaps — missing files and absent `license` fields | `LICENSING_STRATEGY.md` |
| CI hygiene guard does not scan for tunnel IDs, IPs, or hostnames | `PUBLIC_REPO_BOUNDARY.md` |

## Maintaining this directory

When you edit a document here:

- Update its `Last verified` line, and state **what** you verified against.
- Date each status claim individually where a document mixes evidence of
  different ages.
- If you find a claim you cannot verify, do not delete it silently — label it
  unverified and name the probe that would settle it.
- Run `scripts/public-hygiene-check.sh`, and then check the boundary by eye
  anyway; the guard's coverage gaps are listed in
  [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md).
