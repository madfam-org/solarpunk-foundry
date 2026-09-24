# `docs/` — index and verification state

**Last verified: 2026-07-25** · index re-organised 2026-09-23

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

*Re-organised 2026-09-23 (coherence audit B-B13): one tier of truth. The current
ecosystem facts live in the root [`README.md`](../README.md) and
[`ECOSYSTEM.md`](../ECOSYSTEM.md); the documents below are the current supporting set.
Superseded point-in-time documents moved to [`archive/`](./archive/README.md).*

### Contracts and integration

| Document | Covers | Last verified / updated |
|---|---|---|
| [`JANUA_INTEGRATION.md`](./JANUA_INTEGRATION.md) | The auth contract — **RS256/JWKS only**, the one env contract, `@madfam/janua-next`, account switching, verifier patterns | verified 2026-07-25; updated 2026-09-23 |
| [`INTEGRATION_TESTING.md`](./INTEGRATION_TESTING.md) | Janua ↔ Enclii integration tests, all local | 2026-07-25 |
| [`ECOSYSTEM_BANNER.md`](./ECOSYSTEM_BANNER.md) | Shared banner/footer contract for product landings | 2026-07-25 |
| [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md) | Port registry and its honest compliance statement | see the document |

### Development

| Document | Covers | Last verified |
|---|---|---|
| [`DOGFOODING_GUIDE.md`](./DOGFOODING_GUIDE.md) | Local development — `enclii local up` first, compose fallback | 2026-07-25 (service list 2026-09-23) |
| [`CROSS_REPO_NAVIGATION.md`](./CROSS_REPO_NAVIGATION.md) | Where to find the canonical document for a topic | 2026-07-25 |
| [`LICENSING_STRATEGY.md`](./LICENSING_STRATEGY.md) | Licensing tiers and philosophy; the root README §V table is the current per-repo matrix | 2026-07-25 |

### Architecture

| Document | Covers | Status |
|---|---|---|
| [`architecture/SYMBIOSIS.md`](./architecture/SYMBIOSIS.md) | The narrative: Substrate / Trellis / Membrane | Current, verified 2026-07-25 |

Cluster shape: [`ECOSYSTEM.md`](../ECOSYSTEM.md) §4 (the maintained statement).

### Boundary and operations

| Document | Covers | Last verified |
|---|---|---|
| [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md) | What may and may not appear in this repository, and what the CI guard actually catches | 2026-07-25 |
| [`OPERATIONAL_REDIRECTS.md`](./OPERATIONAL_REDIRECTS.md) | Where private operational execution lives | 2026-07-25 |
| [`SSH_ACCESS.md`](./SSH_ACCESS.md) | Node access — pointer only; the supported path | 2026-07-25 (posture 2026-09-23) |
| [`runbooks/`](./runbooks) | Public-safe summaries of five production procedures, plus pointers | 2026-07-25 |

### Archive — superseded, kept as history

| Document | Why archived |
|---|---|
| [`archive/ECOSYSTEM_STATUS.md`](./archive/ECOSYSTEM_STATUS.md) | 2026-07-25 route inventory; superseded by README §II and ECOSYSTEM.md |
| [`archive/INFRASTRUCTURE_STATUS.md`](./archive/INFRASTRUCTURE_STATUS.md) | 2026-07-25 declared configuration; superseded by ECOSYSTEM.md §4 |
| [`archive/MONETIZATION_PATH_READINESS.md`](./archive/MONETIZATION_PATH_READINESS.md) | Pre-first-charge readiness; overtaken on 2026-08-02; contract text lives in README §IV.4 |
| [`archive/CLUSTER_ARCHITECTURE.md`](./archive/CLUSTER_ARCHITECTURE.md) | Describes a 3-node cluster; it has been 4 nodes since 2026-08-06 |
| [`archive/FEDERATED_ARCHITECTURE_README.md`](./archive/FEDERATED_ARCHITECTURE_README.md) | Historical 2025-11-24 local-dev refactor |
| [`archive/SELF_CONTAINED_SERVICES.md`](./archive/SELF_CONTAINED_SERVICES.md) | Position paper the ecosystem partly did not follow |

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

Ecosystem-level open items (cloudflared replicas, Kyverno exception count,
`require-image-digest` mode, Longhorn version, fleet-wide auto-digest health, Janua SSO
matrix, `@madfam/*` on `npm.madfam.io`) are tracked in one place:
[`ECOSYSTEM.md`](../ECOSYSTEM.md) §6. Items specific to the documents here:

| Open item | Where it is recorded |
|---|---|
| PITR restore has never been demonstrated | `runbooks/backup-restore.md` |
| Alert delivery status after the 2026-07-16 assessment | `runbooks/incident-response.md` |
| Redis database-index allocation is unverified convention | `DOGFOODING_GUIDE.md` |
| License compliance gaps — missing files and absent `license` fields | `LICENSING_STRATEGY.md` |
| The Janua verifier list predates the August–September services | `JANUA_INTEGRATION.md` |

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
