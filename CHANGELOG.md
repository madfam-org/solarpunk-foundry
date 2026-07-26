# Changelog

Notable changes to `solarpunk-foundry`. Dates are ISO-8601 and anchored to the
commits that made the change, not to when the entry was written.

This repository is a `private: true` pnpm workspace at version `0.1.0` — the
repo itself is not released as a versioned artifact. The `@madfam/*` packages
under `packages/` version independently; see each package's `package.json`.

Entries before 2026-07-25 were reconstructed from git history on 2026-07-25,
because the changelog until then consisted of a single undated `Unreleased`
section. They are therefore accurate as to *what changed and when*, but are not
a contemporaneous record.

## Unreleased

### 2026-07-25 — root-document truth pass

- Rewrote the root documents (`README.md`, `ECOSYSTEM.md`, `MADFAM.md`,
  `AGENTS.md`, `AI_CONTEXT.md`, `llms.txt`, `llms-full.txt`, this file) so every
  factual claim carries its source and the date that source was last verified,
  and so *verified*, *documented but unverified*, and *aspirational* are
  distinguished rather than blurred.
- Added an explicit statement of what this repo is (Lane B, the public ecosystem
  contract hub) and what it is not (the operational source of truth, which is
  the private `internal-devops` repo), plus the four-lane map and a reading
  order for newcomers.
- Corrected the Selva material throughout: the domain cutover to `*.selva.town`
  **executed and is complete** (verified 2026-07-01), and `agents-*.madfam.io`
  is retired and returns 502. An earlier edition instructed readers that
  `agents-*` "remain authoritative" — that was the most actively harmful error
  in the set.
- Corrected the inference endpoint in four places: the OpenAI-compatible `/v1`
  proxy was extracted out of `nexus-api` into `selva-inference-gateway` at
  `inference.selva.town` on 2026-07-07, and the `nexus-api` mount was removed.
- Restated "no other repo holds LLM provider credentials" as the contract it is,
  with the 2026-07-09 deviation recorded rather than papered over.
- Replaced the claim that the revenue-loop probe runs hourly and pages: as of
  the 2026-07-16 launch-readiness audit the probe was off and alert delivery had
  been dead ≥31 days. Recorded the payment fan-out as designed-but-not-flowing
  (verified 2026-07-08) and named the ratified target that supersedes the
  as-built arrangement.
- Replaced "no production checkout UI on any platform yet" with the actual
  recorded position: checkout exists, and `billing_events = 0` — no real charge
  has ever completed end to end (2026-07-16, verdict NO-GO).
- Reconciled the ecosystem map with `internal-devops/ecosystem/repo-registry.md`
  (*Last Verified 2026-07-04*) plus `meridian` (public, created 2026-07-25, not
  deployed). Added the four public repos that were missing entirely (`voxa`,
  `eido`, `coupler`, `meridian`) with honest not-deployed status where that
  applies; removed deleted and archived repos from the live tables and moved
  them to a dated archived section; marked the five platform repos that are
  private and whose links 404 without org access.
- Added a live GitHub API repo count (2026-07-25: 96 non-fork = 27 private + 69
  public, 8 archived) stated *alongside* the registry's own 2026-07-04 count,
  with the delta reconciled, rather than silently replacing one with the other.
- Replaced the licensing table's strategic classes with what each repo's LICENSE
  file actually says (checked 2026-07-25) — ForgeSight is AGPL-3.0, not
  Proprietary — and recorded the org-wide licensing compliance gap.
- Corrected the local-dev section: `./madfam full` declares 10 services, not 18,
  and two of them have no local checkout; `enclii local up` starts Janua and
  Enclii, not "all services"; `enclii local infra` does not include Verdaccio;
  the root `docker-compose.yml` cannot build two of its five services and is not
  the canonical path.
- Corrected registry ownership: this repo *publishes to* `npm.madfam.io`; the
  Verdaccio deployment lives in the `enclii` repo and runs in the `enclii`
  namespace.
- Removed a secret-store path from `ECOSYSTEM.md` and replaced it with a pointer
  to the private custody decision record, per the repo-boundary contract.
- Removed roughly twenty unrunnable example commands from `ECOSYSTEM.md` caused
  by an unsubstituted generator variable, and corrected the generator path the
  document cited (the cited template file does not exist).
- Replaced `MADFAM.md` §5's "these are the only open items blocking full
  ecosystem stability" (false at any date after 2026-04-17, and Lane A material
  regardless) with a pointer, keeping the three specific corrections as history.
- Switched the private-repo pointer tables from per-file to per-directory, since
  per-file pointers had gone months out of date.
- Made `AGENTS.md` carry the evidence standard as operating doctrine, refreshed
  its package list (13, not 10), marked `@madfam/ui` deprecated there too, and
  replaced a dead runbook path used as an example.
- Pointed `AI_CONTEXT.md` at `AGENTS.md` rather than `CLAUDE.md` for the agent
  protocol, matching what both of those files already said.
- Rewrote `llms.txt` and `llms-full.txt` and verified every path they reference
  exists in the working tree.
- Disclosed, rather than omitted, the known open exposure under `infrastructure/`
  and the fact that `scripts/public-hygiene-check.sh` does not scan for
  infrastructure identifiers.

Scope note: `docs/` and `infrastructure/` were **not** touched by this pass and
are owned by separate remediation work. Statements in this changelog about those
trees describe their state, not changes to them.

### Earlier, undated in the original changelog

- Added public security, contribution, and code-of-conduct documents.
- Added an explicit public/private repository boundary for operational details.
- Replaced credential-looking example values in public docs with non-secret
  placeholders.

## 2026-07-06 — boundary scrub and entry-point refresh

- Scrubbed a real Janua `client_id` from a public template (#22).
- Refreshed the eagle-eye entry point in `README.md` and scrubbed further
  boundary leaks (#21).

## 2026-07-04 — honest-status scorecard

- Added `templates/HONEST_STATUS_SCORECARD.md`, the status-reporting template
  (RFC 0024 P3) (#20).

## 2026-06 — contract packages and custody pointers

- `@madfam/webhook-attribution` — shared HMAC payment-attribution
  sign/verify + idempotency (#16), the packaged form of the signed-fan-out
  contract.
- `@madfam/types` — completed payment-attribution event types and the
  monetization docs that reference them (#15).
- `@madfam/ecosystem-banner` v0.1.3 marquee ticker (#17), plus the public
  banner/footer contract in `docs/ECOSYSTEM_BANNER.md` (#18).
- Pointed public docs at the private ecosystem provider-custody decision and at
  `enclii secrets intake` for credential handoff (#19).
- Enforced public boundary hygiene in CI.

## 2026-05 — sanitization, agent-doc standardization, telemetry

- **2026-05-12 — sanitize public infra docs.** The pass that moved production
  identifiers out of this repo. It did not catch everything: a boundary re-audit
  on 2026-07-25 found a remaining infrastructure identifier under
  `infrastructure/`, which is tracked as an open incident in `internal-devops`.
- **2026-05-13** — standardized the agent docs (`AGENTS.md` canonical,
  `CLAUDE.md` as a redirect, `llms.txt` / `llms-full.txt`) and the Enclii-first
  guidance; removed tracked `node_modules` from `packages/core`.
- **2026-05-22 / 05-25** — further public-repo boundary hardening; published the
  `npm-madfam-auth` composite CI action (#12); noted `aureo-labs` removed from
  the labspace checkout and CI scope (#11).
- **2026-05-04 / 05-05** — added `@madfam/telemetry` for OTel + W3C trace-context
  propagation (#9) and `@madfam/ecosystem-banner` (#8).
- **2026-05-08** — PhyneCRM renamed to PhyndCRM, with the domain migrated to
  `phynd.app` in the docs. *Note, recorded 2026-07-25: `phynd.app` was still
  unregistered as of the 2026-07-01 route verification; `crm.madfam.io` remains
  the live host.*

## 2026-04-23 — MADFAM.md imported

- Imported `MADFAM.md`, the ecosystem master reference, from the labspace root
  (#7). `ECOSYSTEM.md` was generated the same day as part of the "each repo
  stands alone" docs sweep.

## 2026-04-17 — Aureo Labs → MADFAM rebrand and first sanitization

- Retired the Aureo Labs brand across the ecosystem; `aureo.studio` retained for
  brand protection.
- First sanitization pass: production IPs, hardware, hostnames, cost data and
  strategic audits moved out of this repo and into the private `internal-devops`
  repo. This is the event the rest of the root docs refer to as "the 2026-04-17
  pattern".

## 2025-11 — repo established

- **2025-11-20** — repo initialized; README established as the public master
  strategy document.
- **2025-11-22** — Plinto renamed to Janua; Dhanam relicensed to AGPL-3.0.
- **2025-11-25** — `madfam-infrastructure` consolidated into `ops/`; ecosystem
  tooling, dogfooding scaffolds and scripts added; pnpm standardized at 9.15.0.
- **2025-11-26** — `@solarpunk/core` renamed to `@madfam/core`; version corrected
  to `0.1.0` (pre-stable).
