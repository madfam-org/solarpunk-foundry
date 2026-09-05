# Solarpunk Foundry Agent Operating Guide

> [!IMPORTANT]
> MADFAM-ENCLII-FIRST-LEGACY-RAW v1: This document contains legacy raw infrastructure command examples.
> Routine production operations must use Enclii web, API, or CLI. Treat raw
> `kubectl`, `helm`, SSH, provider CLI/API, `docker exec`, and direct container
> access as platform bootstrap or documented break-glass only, and record any
> missing Enclii adapter gap.
> Last Updated: 2026-09-04

<!-- MADFAM-AGENTS-CANONICAL v1 -->

This is the canonical instruction file for Claude, Codex, and any other LLM
agent working in this repository. `CLAUDE.md` is kept only as a compatibility
redirect and should not become the source of truth again.

## Required operating doctrine

- Read this file before making repo changes.
- Prefer existing repo conventions, scripts, and docs over introducing new
  patterns.
- Preserve user work and never revert unrelated changes.
- Treat production operations as Enclii-first: use Enclii web, API, or CLI for
  provisioning, deployment, observability, domains, secrets, provider
  operations, scaling, rollback, and remediation.
- Use direct `kubectl`, `helm`, SSH, provider CLIs/APIs, `docker exec`, or
  direct container access only for platform bootstrap or documented break-glass
  emergencies when Enclii is unavailable or lacks an implemented adapter.
- Record any missing Enclii adapter gap instead of normalizing raw production
  access in docs or runbooks.
- **Date every factual claim you write into this repo.** State the source you
  read and when that source was last verified. Distinguish *verified*,
  *documented but unverified*, and *aspirational*. If you cannot establish
  something, say so and name what would settle it — an honest gap beats a
  confident guess. `docs/PORT_ALLOCATION.md` is the model to copy.
- **Never invent verification.** You cannot probe production from this repo. If
  the private repo last verified a route on 2026-08-24, write "last verified
  2026-08-24" — not "live", not "currently".
- **No marketing language.** No superlatives, no invented metrics, no adoption
  or performance numbers you did not measure.

## Repo entrypoints

- `README.md` — the front door: what this repo is (Lane B, the public ecosystem
  contract hub), what it is not, how the lanes divide, and the reading order.
- `ECOSYSTEM.md` — the standalone, agent-oriented ecosystem map, cross-repo
  conventions, sanitized production topology, and the Enclii CLI reference.
- `MADFAM.md` — the fuller per-platform master reference.
- `docs/` — port registry, licensing, integration and architecture material.
- `packages/` — the `@madfam/*` shared package set: 15 packages and one tombstone
  (`ui/`, retired 2026-09-05). `ls packages | wc -l` returns 16. Every package
  extends `@madfam/tsconfig` and `@madfam/eslint-config`, and
  `scripts/check-shared-configs.mjs` fails CI if one stops.
- `.github/workflows/` — CI: doc lint, package quality, production-readiness
  ratchet, public hygiene, repository hygiene, package publish.
- `templates/ci/README.md` — the **consumer CI contract**: the seven checks a
  repo consuming these packages must run, the exact commands, and the exit-code
  contract (0 pass / 1 findings / **2 UNDETERMINED, which is also a failure**).

## LLM context files

- `llms.txt` is the compact context index.
- `llms-full.txt` is the durable full-context map and operating contract.
- `AGENTS.md` is canonical for agent instructions.
- `CLAUDE.md` redirects here for Claude compatibility.
- `docs/PUBLIC_REPO_BOUNDARY.md` defines public-facing documentation limits.

## Repo-boundary contract

- `internal-devops` is the private canonical source for production topology,
  node identity, capacity, costs, secrets, incident evidence, and operational
  runbooks. It is Lane A.
- This repo is the public ecosystem contract (Lane B). Keep sensitive
  operational, pricing, and audit context out.
- **This repo is permanently public** by owner decision of 2026-09-04: it stays
  the public-facing ecosystem hub, sharing the non-sensitive aspects of how the
  MADFAM substrate operates, sanitized as necessary. Sanitize; do not plan for a
  flip to private.
- Use redacted summaries and canonical links when cross-referencing private
  context. Never copy Vault paths, secret names with retrieval detail, or
  break-glass `kubectl`/SSH into this repo.
- If uncertain, place operational detail in `internal-devops` and keep only a
  short pointer here.
- Any public doc carrying ecosystem context must include one short boundary note
  with a canonical link target.
- Canonical policy: `internal-devops/docs/repo-boundary-contract.md`
  (last updated 2026-06-14).

**Never publish from this repo:** node hostnames, any public IP, hardware model
numbers or capacity figures, the Cloudflare tunnel identifier, cost or
procurement data, Vault paths or secret names with retrieval detail, raw
break-glass `kubectl`/SSH procedures, incident evidence trails.

**Already public and stays public:** the topology *shape* — a **4-node** bare-metal
k3s cluster on Hetzner (one control-plane node, one worker and two CI builders —
one cloud instance, one dedicated box added 2026-08-06, which removed the
single-builder SPOF), ingress via a single Cloudflare Tunnel with zero exposed
node ports, Longhorn CSI block storage, Cloudflare R2 object storage, ArgoCD
GitOps with self-heal. See [`MADFAM.md`](MADFAM.md) §1.2 and
[`ECOSYSTEM.md`](ECOSYSTEM.md) §4 for the maintained statement of this shape.

CI covers part of this for you, but not all of it. As of 2026-09-04
(`scripts/public-hygiene-check.sh`, read 2026-09-05):

- The scan is `git ls-files` filtered to text files — **every tracked text
  file**, not the former `.md`/`.mdx`/`.txt` subset.
- Public IPv4 literals are a pattern class, with RFC1918, loopback, link-local,
  TEST-NET and reserved ranges excluded so illustrative addresses stay usable.
- Node identity — hostnames, node IPs and hardware SKUs — is checked against a
  private pattern file read through `MADFAM_HYGIENE_PATTERNS`, defaulting to
  `../internal-devops/security/public-hygiene-private-patterns.txt`. The
  literals are not in this repo by design. Matches print `file:line` only,
  never the matched text, because this repo's CI logs are public.
- **When that file is unreadable the class is not checked at all**: the run
  prints `node-identity class SKIPPED` and ends with `classes_skipped=1`. Read
  the trailing `files_scanned=<n> classes_skipped=<n>` line before trusting a
  green run — `classes_skipped=1` is not a clean bill of health for that class.

Passing CI is still not proof a change is boundary-clean: human review against
the "never publish" list above is the control that matters. Coverage detail:
[`docs/PUBLIC_REPO_BOUNDARY.md`](docs/PUBLIC_REPO_BOUNDARY.md).

## Maintenance

Inspect drift in these files with `python3 internal-devops/scripts/sync-agent-docs.py`
— run bare, it prints a diff and writes nothing. Read that diff before going
further.

`--apply` **wraps, never replaces**: `AGENTS.md` keeps its handcrafted body under
a canonical header; `CLAUDE.md` becomes the redirect shim; `llms.txt` and
`llms-full.txt` are written only when absent or still template-shaped — a
curated file is kept and reported as `agent_doc_curated_kept=`. Ineligible
checkouts are refused as `agent_doc_skip=`. Read the dry-run diff first.

## Cursor IDE

- Use `labspace/madfam-platform.code-workspace` with **enclii** and
  **internal-devops** for cross-repo platform work.
- Packages: `packages/`; ports: `docs/PORT_ALLOCATION.md`.
- Playbook: `internal-devops/ecosystem/cursor-usage-playbook.md`.

---

## Repo-specific guidance

> Originally imported from a legacy `CLAUDE.md` on 2026-05-13 and left unrevised;
> **rewritten in place on 2026-07-25** because several of its statements had gone
> wrong rather than merely stale — the package list was three short, the
> inference endpoint had moved, `@madfam/ui` was presented as the live design
> system after being deprecated, and the service count in the local-dev section
> was nearly double the real one. Where a claim below carries a date, that date
> is when it was verified.

### What this repo is

Solarpunk Foundry is the **public ecosystem contract hub** (Lane B) for MADFAM:

- **Shared packages** (`packages/`) — the `@madfam/*` set, published to `npm.madfam.io`
- **Port registry** (`docs/PORT_ALLOCATION.md`) — the 100-port-block scheme and an
  honest account of how little of it is followed
- **Local dogfooding scaffolds** (`ops/`) — shared docker-compose infra, boot scripts
- **Public architecture narrative** (`README.md`, `ECOSYSTEM.md`, `MADFAM.md`, `docs/architecture/`)
- **Integration and contract patterns** (`docs/*.md`)

It ships **no application deployable**. It is **permanently public** (owner
decision, 2026-09-04) and deliberately holds no production identity, secrets,
costs, hostnames, competitive intelligence, or sensitive audits — those live in
the private `internal-devops` repo.

### Quick start

*Verified against `enclii/packages/cli/internal/cmd/local.go` and this repo's
compose files on 2026-07-25.*

```sh
# Preferred: the enclii CLI
enclii local up         # shared infra, then Janua + Enclii (NOT "all services")
enclii local infra      # shared infra only: PostgreSQL, Redis, MinIO, MailHog
enclii local status
enclii local logs [service]
enclii local down

# Fallback: the legacy orchestration script (symlink → ops/bin/madfam.sh)
cd ~/labspace
./madfam start          # core: janua, forgesight, digifab-quoting, madfam-site
./madfam full           # 10 declared services; 2 of them have no local checkout
./madfam status
./madfam stop --clean
```

Two corrections worth carrying, because earlier editions of this file got both wrong:

- `enclii local infra` starts PostgreSQL, Redis, MinIO and MailHog. **It does not
  include Verdaccio.**
- `./madfam full` declares **10** services (`janua`, `forgesight`,
  `digifab-quoting`, `madfam-site`, `madfam`, `primavera3d`, `dhanam`, `fortuna`,
  `sim4d`, `electrochem-sim`), not 18. Two of them — `madfam` and
  `electrochem-sim` — have no checkout under `~/labspace`, so `full` cannot start
  them.

The **root `docker-compose.yml` is currently broken** and is not the canonical
local path: its `janua` service targets a build stage that does not exist, its
`enclii-api` service points at a Dockerfile that does not exist, and it declares
a different Docker network than the canonical stack. Use `enclii local up`.

### Repo layout

*Verified against the working tree 2026-07-25.*

```
solarpunk-foundry/
├── README.md                        # Front door — what this repo is/isn't, lanes, platform map
├── AGENTS.md                        # This file — canonical agent instructions
├── CLAUDE.md                        # Compatibility redirect to AGENTS.md
├── ECOSYSTEM.md                     # Standalone ecosystem map + Enclii CLI reference
├── MADFAM.md                        # Per-platform master reference
├── AI_CONTEXT.md                    # Package/registry quick reference
├── llms.txt / llms-full.txt         # LLM context index + durable map
├── packages/                        # 16 directories: 15 packages + 1 tombstone
│   ├── core/                        # @madfam/core — brand, locales, currencies, events, product registry
│   ├── ui/                          # @madfam/ui — RETIRED 2026-09-05, tombstone only (packages/ui/README.md)
│   ├── analytics/                   # @madfam/analytics — PostHog + event schema
│   ├── auth-resilience/             # @madfam/auth-resilience — Janua circuit breaker
│   ├── sentry/                      # @madfam/sentry — Sentry init
│   ├── logging/                     # @madfam/logging — pino config
│   ├── env/                         # @madfam/env — Zod env loader
│   ├── constants/                   # @madfam/constants — shared enums
│   ├── error-boundary/              # @madfam/error-boundary — Next.js route boundaries
│   ├── types/                       # @madfam/types — cross-repo shared types
│   ├── telemetry/                   # @madfam/telemetry — OTel tracing + W3C trace context
│   ├── webhook-attribution/         # @madfam/webhook-attribution — the signed-fan-out contract, packaged
│   ├── ecosystem-banner/            # @madfam/ecosystem-banner — landing-page ticker
│   ├── tsconfig/                    # @madfam/tsconfig — shared TypeScript baseline
│   ├── eslint-config/               # @madfam/eslint-config — shared ESLint baseline
│   └── prettier-config/             # @madfam/prettier-config — shared Prettier baseline
├── ops/
│   ├── bin/                         # madfam.sh orchestration + debug scripts
│   ├── local/                       # docker-compose.shared.yml (the canonical local stack), init-databases.sql
│   ├── db/                          # init-shared-dbs.sql (older, superseded naming)
│   ├── docker/ · env/ · k8s/ · scripts/
├── docs/
│   ├── PORT_ALLOCATION.md           # Port scheme — aspirational, honestly labelled
│   ├── PUBLIC_REPO_BOUNDARY.md      # Public-repo boundary checklist
│   ├── OPERATIONAL_REDIRECTS.md     # Where operational content moved to
│   ├── LICENSING_STRATEGY.md        # Per-repo license rationale (matrix is stale — see README §V)
│   ├── DOGFOODING_GUIDE.md          # Local dev setup
│   ├── JANUA_INTEGRATION.md         # Wiring Janua into a service
│   ├── INTEGRATION_TESTING.md       # Cross-service test patterns
│   ├── CROSS_REPO_NAVIGATION.md     # Where to find things across the ecosystem
│   ├── ECOSYSTEM_STATUS.md          # Point-in-time service roster
│   ├── INFRASTRUCTURE_STATUS.md     # Infra shape (pointer to internal-devops)
│   ├── ECOSYSTEM_BANNER.md          # Banner + footer contract
│   ├── MONETIZATION_PATH_READINESS.md
│   ├── SSH_ACCESS.md                # Pointer to internal-devops
│   ├── architecture/                # SYMBIOSIS, cluster shape, federated + self-contained services
│   └── runbooks/                    # Legacy; under review for removal in favour of internal-devops
├── templates/                       # Project + doc templates (incl. HONEST_STATUS_SCORECARD.md)
├── scripts/                         # Build, publish, hygiene, ratchet utilities
├── tests/                           # Smoke + integration
├── infrastructure/                  # Legacy tree, largely superseded — under review
├── docker-compose.yml               # Root compose — currently broken, not canonical
├── .enclii.yml                      # Enclii service spec — unreconciled with live manifests
└── pnpm-workspace.yaml
```

### The cross-repo contracts

Every MADFAM service participates in these. If you are building or editing a
service, verify you are not breaking them. Full statements with sources and
dates: `README.md` §IV.

**1. Identity — Janua only.** Every authenticated service verifies **RS256**
JWTs against `https://auth.madfam.io/.well-known/jwks.json`. **HS256 is
fail-closed** since the 2026-04-23 audit (H3/H4). No custom auth, password
login, or session store. Claims: `sub`, `email`, `roles`, `org_id`, `rfc`
(fiscal only). Janua is single-issuer per deployment — never route a second
Janua hostname. *Conformance across the fleet is not uniform; the 2026-07-16
audit rates it YELLOW.*

**2. Inference — Selva `/v1`, no direct provider calls.** The endpoint is
**`https://inference.selva.town`** as of the 2026-07-07 cutover. The proxy was
extracted out of `nexus-api` into `selva-inference-gateway` and the `nexus-api`
`/v1` mount was removed. Provider credentials are intended to live only on
Selva; the 2026-07-09 phynd-crm audit recorded a service failing open to
`api.openai.com`, so treat this as the rule rather than the verified state.

**3. Billing — Dhanam.** Metering, entitlements, invoices and the ledger flow
through Dhanam. Read via API; keep no local mirror.

**4. Payment attribution — signed fan-out.** Header
`x-madfam-signature: t=<ts>,v1=<hex>` over `"${ts}.${body}"`, per-target secret,
5-minute replay window. Receivers: dhanam `POST /v1/billing/madfam-events` and
phynd-crm `POST /api/webhooks/routecraft`, both idempotent by emitter
`event_id`. **As built the emitter is `routecraft`; the ratified target moves
emission to Dhanam. As of 2026-07-08 the fan-out was verified to be a silent
no-op in production.** `@madfam/webhook-attribution` packages the signing
contract; no repo had adopted it as of that date.

**5. CORS — explicit allowlist, wildcards banned** (audit 2026-04-23, H2/H5/H6).

**6. Deployment — Enclii is the control plane.** Push to `main` → CI builds →
GHCR → cosign keyless signature → `kustomize edit set image` pins the digest →
CI commits it back → ArgoCD pulls and syncs. Nothing pushes to the cluster.
Self-heal is on, so a live `kubectl patch` gets reverted; commit permanent
changes.

**7. Data boundaries — own once, query everywhere.**

| Dataset | Owner | Everyone else |
|---|---|---|
| Identity / sessions | Janua | federate, never duplicate |
| Bank transactions + billing ledger | Dhanam | API read; no local mirror |
| Mexican law + compliance rules | Tezca | query `/api/v1/laws`; no fork |
| CFDI / SAT / tax filings | Karafiel | single authority |
| 3D geometry kernel | geom-core | used by Sim4D + Yantra4D |

### Agent session protocol

**Session start**

1. Read `README.md` §0–§II for the current ecosystem shape and the lane split.
2. Run `git status && git branch` to verify a clean state.
3. Check existing TodoWrite items from previous sessions.
4. Load Serena memories if available: `list_memories()` → `read_memory()`.

**During session**

1. **Feature branches only.** Never commit directly to `main`.
2. **Validate before commit:** `pnpm typecheck && pnpm lint && pnpm format:check`;
   `bash -n <script>` for shell; `node scripts/check-shared-configs.mjs` after
   touching any package's `tsconfig.json`, `.eslintrc.cjs` or manifest.
3. Update TodoWrite after each task; checkpoint roughly every 30 minutes.
4. **Prefer the `enclii` CLI over `kubectl`** for any operational task — it
   routes through the Switchyard API with audit logging and lifecycle tracking.
5. **Before writing a status claim, find its source and its date.** If the
   newest source you can read is three months old, say three months old.

**Secret management (safe-patch mode)**

You may edit `.env` and `.env.local` files, but:

1. **Back up first:** `cp .env .env.bak` before any modification.
2. **Patch, don't purge:** never `> .env`. Use `sed -i '' 's/OLD/NEW/' .env` or
   `echo "NEW_KEY=value" >> .env`.
3. **Placeholder ban:** never write `your_key_here`, `placeholder`, `example`,
   `xxx`, or `TODO` into active config files.
4. Never paste a production credential into agent chat. Human handoff goes
   through `enclii secrets intake`.

**Session end**

1. Verify all TodoWrite items are completed or documented.
2. Run final validation: `pnpm build`.
3. `write_memory("session_summary", outcomes)`.
4. Do not leave uncommitted changes without explicit user approval.

### Validation requirements

| Change type | Required validation |
|---|---|
| Package code | `pnpm build` in the package directory |
| Package publish | `.github/workflows/publish-package.yml` with `dry_run: true` first |
| A package's tsconfig / eslintrc / manifest | `node scripts/check-shared-configs.mjs` |
| Shell scripts | `bash -n <script>` syntax check |
| `.enclii.yml` / docker-compose | `enclii local status` round-trip |
| Docs | Manual review. If it touches a cross-repo contract, cross-check every affected service. If it asserts a status, it must carry a source and a verification date. |

CI on this repo: `doc-lint`, `package-quality`, `production-readiness-ratchet`,
`public-hygiene`, `repository-hygiene`, `publish-package` (manual dispatch).

### Proof-of-life standard

> No deployment, refactor, or fix is "complete" until you have successfully
> `curl`ed the public endpoint and received the expected response.

- **"K8s applied" is NOT "done."** "Endpoint reachable" is "done."
- **Failure protocol:** if the curl fails (502/503/connection refused), diagnose
  logs immediately. Do not report success.
- **Corollary for docs:** if you did not run the curl, do not write a status
  glyph. Write the date of the newest verification you can actually cite.

### What this repo is NOT

Do not add to solarpunk-foundry:

- Node hostnames, public IPs, hardware models or capacity figures, provider
  account numbers, costs, SSH targets, the Cloudflare tunnel identifier →
  `internal-devops`
- Literal secrets, or Vault paths and secret names with retrieval detail →
  nowhere public; use ExternalSecret + Vault
- Raw break-glass `kubectl`/SSH procedures → `internal-devops`
- Strategic, competitive or pricing briefs → `internal-devops/ecosystem/`
- Ecosystem audits carrying revenue, customer or cost data → `internal-devops/audits/`
- Incident evidence trails → `internal-devops/incidents/`
- Per-session remediation plans or cutover runbooks → `internal-devops/runbooks/`,
  or the consuming repo when the runbook is product-owned

If you find any of these leaking in, sanitize by moving the detail into
`internal-devops` and leaving a one-to-three-sentence public summary plus a
canonical link, per `internal-devops/docs/repo-boundary-contract.md` §Migration
workflow. `docs/OPERATIONAL_REDIRECTS.md` is where such moves are recorded.

---

*Solarpunk Foundry · the public ecosystem contract · From bits to atoms*
