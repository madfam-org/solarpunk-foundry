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

### 2026-09-05 — one product filter, no second copy (Wave 2.7)

- **`@madfam/ecosystem-banner` consumes `@madfam/core/products`.**
  `DEFAULT_ECOSYSTEM_PLATFORMS` is now `getBannerProducts()` mapped into the
  ticker's `{ keyword, name, url }` shape, evaluated at import time.
  `packages/ecosystem-banner/src/platforms.generated.ts` — the second file
  rendered from the same projection, added hours earlier by #46 — is **deleted**.
  One registry projected into two rendered files is still two files that can
  disagree; the estate now has one vendored JSON, one committed hash and one
  filter. The 19-platform membership is unchanged by this: the same products in
  the same order, from the same projection.
- **The filter moved into `@madfam/core` as `getBannerProducts()`**, exported
  from `@madfam/core` and `@madfam/core/products`, so downstream repos apply the
  shared filter instead of re-implementing it. `@madfam/core` is now a runtime
  dependency of `@madfam/ecosystem-banner`.
- **The guard changed shape with it.** `scripts/check-product-projection.mjs` no
  longer renders a banner module; it now fails if `platforms.generated.ts`
  reappears, if `platforms.ts` stops importing the core filter, or if a literal
  ticker row is typed into it, and it still fails when a selected product carries
  no `site.banner_keyword`. The read-proof gained `banner_module_checked=`.
- **The membership is cross-checked by two implementations over one source.**
  `packages/ecosystem-banner/src/__tests__/platforms.spec.ts` applies the guard's
  `selectBannerPlatforms` (JavaScript, over the raw vendored JSON) as an oracle
  against the TypeScript filter in `@madfam/core`, asserting name, URL, keyword
  and order one for one — the freshness property the deleted byte-compare used to
  carry.
- **`vendor-ecosystem-banner.sh` vendors no product facts.** It copies three
  source files, requires the consumer to depend on `@madfam/core`, and prints a
  read-proof (`files=3 platform_lists=0 madfam_core_dependency=present|absent|undetermined`)
  rather than a bare "done".
- **`packages/core/README.md` states the downstream contract** consumed by
  `madfam-site` in its own migration step: the export names, the `Product` and
  `RetiredProduct` shapes, the lifecycle/surface filters (with the "public
  surface is not repo visibility" rule), and how a downstream freshness check
  pins `PRODUCT_PROJECTION.registryVersion` and `.sourceSha256` rather than
  asserting a product count or a slug list.
- **`templates/env/madfam-integrations.env`** stopped naming example product IDs:
  the line named `sim4d`, a retired brand with a tombstone, and `primavera3d`,
  which has no registry entry. It now points at `productIds` in `@madfam/core`.
- Not migrated, deliberately: `packages/types`' `MadfamService` union is the
  event-schema registry's service vocabulary (`internal-devops/ecosystem/event-schemas.yaml`),
  not the product registry's. Deriving it from `products` would silently equate
  two different records; it stays where it is until that registry is projected
  too.

### 2026-09-05 — the product registry becomes generated (`@madfam/core`)

- **Vendored the public product projection.**
  `packages/core/src/products/projection.public.json` is a verbatim copy of the
  public-safe projection of the one private product registry (registry version
  4), committed alongside its `.sha256`. Nothing in this repo hand-types a
  product fact any more.
- **`packages/core/src/products.ts` is now the hand-kept half only** — the
  `Product` type, the licence / layer / lifecycle vocabularies and the lookups.
  Every product fact lives in the generated `products.generated.ts`.
- **New guard, wired into Package Quality:**
  `scripts/check-product-projection.mjs` (with a `node --test` self-test) fails
  when the vendored projection is edited in place (hash), when the generated
  module drifts from it (byte diff), when a `lifecycle: retired` product or a
  tombstone slug would render, when a licence leaves the enum documented in
  `docs/LICENSING_STRATEGY.md`, or when the projection carries an IP literal, an
  undeclared hostname, a private-only field or a credential shape. Every run
  prints a read-proof (`products_scanned=`, `hosts_checked=`), so "I read
  nothing" cannot look like "I read everything and it was clean".
- **Consumer-visible changes to `@madfam/core`'s product exports**: product keys
  are registry slugs (`geom-core`, not `geomCore`); the registry now carries 28
  products instead of 16; `PENNY` and `Sim4D` moved out of `products` into
  `retiredProducts` tombstones; `Product` gained `lifecycle`,
  `lifecycleVerified`, `hosts`, `infraHosts`, `site` and `commerce`, and lost
  `description`, `defaultPort` and `phase`; `getProductsByPhase` is gone and
  `getProductsByLifecycle` / `getSurfaceProducts` / `getRetiredProduct` are new;
  `getProductGitHubUrl` now returns `string | null`.
- **The ecosystem banner's platform list is generated from the same projection.**
  `packages/ecosystem-banner/src/platforms.generated.ts` is a filter over the
  vendored projection — public product surface ∧ lifecycle live/beta ∧ not
  retired ∧ `site.show_in_banner` ∧ primary domain not one of the product's own
  infra hosts, ordered by `site.order`. `platforms.ts` keeps the public
  `EcosystemPlatform` type and the re-export, so no consumer import changes and
  `@madfam/ecosystem-banner` stays at `0.1.4`.
  13 hand-kept entries become 19: `avala`, `voxa`, `acervo`, `kalya`, `nauta`,
  `fashion-cabinet` and `factlas` join; `routecraft` leaves because no registry
  entry selects it (O25). A selected product with no `site.banner_keyword` fails
  the check rather than being dropped from the list — a shorter ticker that
  renders cleanly is indistinguishable from a correct one.
- URLs re-probed 2026-09-05 (HEAD): 17 of the 19 answered 200, `dhan.am` 307,
  `cto.madfam.io` 404, and `forgesight.quest` returned no status at all from the
  probing environment (recorded as unverified, not down). Those are registry
  facts, not banner edits.

### 2026-09-05 — foundation hygiene: `@madfam/ui` retired, shared configs adopted (Wave 4.5)

- **`@madfam/ui` is retired.** Deprecated in its README since 2026-05; this is
  the formal act. `packages/ui/` keeps a tombstone — a README recording the
  retirement date, the successor (`@dhanam/ui`, the per-app incubator) and where
  the source went, plus a `private: true` manifest with the same metadata — and
  no source, no build, no publish path. The directory stays for the reason a
  retired product keeps a registry tombstone: so a consumer that meets the name
  recognises it as dead instead of treating a stale copy as current. It is **not
  counted** in the package set.
- **`scripts/publish-ui.sh` and `scripts/link-ecosystem.sh` moved to
  `scripts/archive/`**, each with a "RETIRED — DO NOT RUN" banner and the
  executable bit removed. `link-ecosystem.sh` existed only to link `@madfam/ui`
  into other checkouts. `scripts/archive/README.md` states the convention:
  retired, not deleted; the record of how a thing was released answers questions
  that deleting it does not.
- **Three shared config packages, publishable-shaped and NOT published:**
  `@madfam/tsconfig` (`base`, `library`, `react-library`, `next`, `node`,
  `vite`), `@madfam/eslint-config` (eslintrc shape, ESLint 8) and
  `@madfam/prettier-config`. Each is versioned, `private: false`, has `files`,
  `publishConfig` and a README, and each has its own `node --test` suite.
- **The foundry adopts them on itself first.** Every package extends
  `@madfam/tsconfig/*` and `@madfam/eslint-config`; the root `.eslintrc.cjs`
  extends the shared config it publishes; the root `package.json` points
  `prettier` at `@madfam/prettier-config`. Thirteen hand-written tsconfigs across
  two `target`s and four strictness sets became one baseline plus each package's
  genuine deltas, and the baseline is *stricter* than what most packages carried
  (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`,
  `noFallthroughCasesInSwitch`, `isolatedModules`) with no source change needed.
- **New guard, wired into Package Quality:** `scripts/check-shared-configs.mjs`
  (with a 14-case `node --test` self-test) fails when a package stops extending
  the shared configs, extends one without declaring it, when the root stops using
  them, when a second Prettier config appears, or when a package tsconfig carries
  a **dead override** — a value the shared config already sets, which makes a
  package look adopted and behave forked. Its exemption list is reasoned and
  cannot rot: an entry naming a package that does not exist, or one that has
  since gained the config it is excused from, is itself a failure.
- **Prettier is a ratchet, deliberately.** `pnpm format:check` gates the paths
  this change makes conformant (the three config packages, the tombstone,
  `templates/ci/README.md`). 126 files in the tree do not match the baseline;
  reformatting them in the PR that introduces the config would produce a diff
  nobody can review. Widening the scope is a separate PR whose diff is a reformat
  and nothing else. The baseline values were measured from the existing code, not
  chosen.
- **`templates/ci/README.md` carries the consumer CI contract**: the seven checks
  a consuming repo must run (typecheck, lint, test, format, boundary checkpoint,
  action pins, projection freshness), the exact commands, what each proves, and
  the exit-code contract — **0 pass, 1 findings, 2 UNDETERMINED, and 2 is a
  failure**. It also states that `pnpm -r lint` and `pnpm -r test` skip packages
  silently and exit 0, so the coverage guard must run before them.
- **`templates/tsconfig/*.json` are now stubs** that extend `@madfam/tsconfig`
  rather than copies of the settings. A compiler baseline is the one thing in
  `templates/` that should not be copied and owned.
- **The package count is corrected everywhere it is stated** — `README.md`,
  `AGENTS.md`, `AI_CONTEXT.md`, `llms.txt`, `llms-full.txt`: fifteen packages and
  one tombstone. `ls packages | wc -l` returns **16**.
- `scripts/check-package-scripts.mjs` gained its first two reasoned exemptions:
  the `@madfam/ui` tombstone (no source to lint or test) and `@madfam/tsconfig`'s
  `lint` (JSON only; its `test` runs and asserts the configs parse, export and
  stay strict).

### 2026-08-24 — re-verification pass (recon-driven)

Driven by a same-day full refresh of the private registries: live GitHub
enumeration (115 repos), live HTTP probes of every routed domain, and an
`enclii ops apps status` control-plane read (81 Applications). Changes here
restate that evidence at the platform-public level:

- Re-anchored `README.md`, `ECOSYSTEM.md`, `MADFAM.md`, `AGENTS.md`,
  `AI_CONTEXT.md`, `llms.txt`, `llms-full.txt` to the 2026-08-24 verification
  dates of `repo-registry.md` and `domain-map.md` (both refreshed the same day,
  so registry and live org agree for the first time since 2026-07-04).
- **Recorded the first completed end-to-end charge (2026-08-02)** — live
  charge + SAT-stamped CFDI + `billing_events` off zero + entitlement — 
  superseding the "no real charge has ever completed" headline of the
  2026-07-16 audit, which otherwise still stands as the last full funnel audit.
- Status flips, each probed 2026-08-24: **Sim4D archived** (marked in the map,
  licensing table, and `@madfam/core` products with a dated note);
  **phynd.app registered and live** (was "not registered"); **eido.cam live**
  (was "contradicted and unresolved"); **meridian partially live** — landing/
  app/admin serve, API 502 (was "not deployed, no DNS"); **voxa.madfam.io
  live** (was documented-but-unverified); periplo still NXDOMAIN.
- Added the platforms that went live since 2026-07-25 to the map at
  platform-public level: **Fashion Cabinet** (re-probed), **Kalya**, **Acervo**,
  **Nauta**; listed the new private supporting repos (hyperobjects-spec,
  migration-platform, marca, angelia, games cluster, delivery tooling) and the
  policy that client-engagement repos are counted but not mapped.
- Updated topology shape: **4 nodes** (second CI builder 2026-08-06, SPOF
  removed); settled the long-open ArgoCD-count gap with a dated control-plane
  read (81 apps); k3s version re-attested 2026-08-06.
- §II.7 / §1.3 counts rebuilt from the 2026-08-24 enumeration: 112 non-fork =
  43 private + 69 public, 8 archived; reconciled +16 (all private) against
  2026-07-25.
- Packages: registry reality stated — only `@madfam/core@0.1.0` is on public
  npm; `@madfam/ecosystem-banner` corrected to 0.1.4 here and in
  `docs/ECOSYSTEM_BANNER.md`.
- Templates: default Janua URL corrected `api.janua.madfam.io` →
  `auth.madfam.io` (and AVALA/ForgeSight URLs to their real domains) in
  `templates/env/` + `templates/providers/` — anyone copying them previously
  got a wrong-by-default auth host.
- `ops/` truth labels: DO-NOT-USE banners on `docker-compose.production.yml`
  (no Compose production exists; shared-JWT anti-pattern) and
  `init-shared-dbs.sql` (superseded `*_db` names); `ops/local/README.md`
  banned-placeholder (`JANUA_JWT_SECRET`) block replaced with the RS256/JWKS
  statement and a staleness note.
- §IX exposure note updated: the `infrastructure/` scrub landed 2026-07-25
  (removal ledger in-tree); identifier rotation remains an owed operator
  action; the public-hygiene scanner's file-type gap is restated.
- Added the Trivy CVE gate (fleet rollout 2026-08-21; verified in enclii +
  janua CI at HEAD) to the deployment convention.

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
