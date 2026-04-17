# Solarpunk Foundry — CLAUDE.md

> **Agent guide** for this repo. The public-facing vision + platform
> map lives in [README.md](README.md); this file is the operating
> protocol for Claude Code / GitHub Copilot / any other agent working
> inside Solarpunk Foundry.

## What this repo is

Solarpunk Foundry is the **ecosystem orchestration hub** for MADFAM:

- **Shared packages** (`packages/`) — `@madfam/*` published to `npm.madfam.io`, consumed by every ecosystem app
- **Port registry** (`docs/PORT_ALLOCATION.md`) — authoritative 100-port-block allocation per platform
- **Local dogfooding scaffolds** (`ops/`) — docker-compose shared infra, boot scripts
- **Public architecture narrative** (`README.md`, `docs/architecture/`)
- **Janua / integration / runbook patterns** (`docs/*.md`)

It is **public**. It deliberately does not hold prod IPs, secrets, costs, hostnames, competitive intelligence, or sensitive audits. Those live in the **private** `internal-devops` repo.

## Quick start

```sh
# Preferred: enclii CLI (from enclii/packages/cli)
enclii local up         # Infra + all services
enclii local infra      # Only shared infra (Postgres, Redis, MinIO, MailHog, Verdaccio)
enclii local status
enclii local down

# Fallback: the legacy orchestration script
cd ~/labspace
./madfam start          # Core services
./madfam full           # All 18 services
./madfam status
./madfam stop --clean
```

## Repo layout

```
solarpunk-foundry/
├── README.md                        # Public master doc — vision, platform map, protocols
├── CLAUDE.md                        # This file — agent protocol
├── AI_CONTEXT.md                    # Package/registry quick reference
├── packages/
│   ├── core/                        # @madfam/core — brand, locales, currencies, events
│   ├── ui/                          # @madfam/ui — shadcn/Radix/Tailwind design system
│   ├── analytics/                   # @madfam/analytics — PostHog + event schema
│   ├── auth-resilience/             # @madfam/auth-resilience — Janua circuit breaker
│   ├── sentry/                      # @madfam/sentry — Sentry init
│   ├── logging/                     # @madfam/logging — pino config
│   ├── env/                         # @madfam/env — Zod env loader
│   ├── constants/                   # @madfam/constants — shared enums
│   ├── error-boundary/              # @madfam/error-boundary — Next.js route boundaries
│   └── types/                       # @madfam/types — cross-repo shared types
├── ops/
│   ├── bin/                         # madfam.sh orchestration + debug scripts
│   ├── local/                       # docker-compose shared infra
│   ├── db/                          # init-shared-dbs.sql
│   └── scripts/                     # one-off tooling
├── docs/
│   ├── PORT_ALLOCATION.md           # Authoritative port registry
│   ├── DOGFOODING_GUIDE.md          # Local dev setup
│   ├── JANUA_INTEGRATION.md         # How to wire Janua into a new service
│   ├── ECOSYSTEM_STATUS.md          # Live service roster (sanitized)
│   ├── INFRASTRUCTURE_STATUS.md     # Infra shape (pointer to internal-devops)
│   ├── CROSS_REPO_NAVIGATION.md     # Where to find things across the ecosystem
│   ├── INTEGRATION_TESTING.md       # Cross-service test patterns
│   ├── LICENSING_STRATEGY.md        # Per-repo license rationale
│   ├── SSH_ACCESS.md                # Pointer to internal-devops
│   ├── architecture/                # SYMBIOSIS, cluster shape, self-contained services
│   └── runbooks/                    # backup-restore, certs, incident-response
├── templates/                       # Project templates
├── scripts/                         # Build + publish utilities
├── tests/                           # Smoke + integration
├── docker-compose.yml               # Root compose (Verdaccio + dev deps)
├── .enclii.yml                      # Enclii service spec
└── pnpm-workspace.yaml              # Monorepo workspace
```

## The four ecosystem-wide contracts

Every MADFAM service participates in these. If you're building or editing a service, verify you're not breaking them.

### 1. Identity — Janua only

No service implements custom auth, password login, or session management. Every service verifies RS256 JWTs against `auth.madfam.io/.well-known/jwks.json`. Claims available: `sub`, `email`, `roles`, `org_id`, `rfc` (fiscal services only).

### 2. Inference — Selva `/v1/` proxy only

Every LLM-consuming service points its OpenAI SDK `base_url` at Selva's `nexus-api` `/v1/` proxy. Provider credentials (Anthropic, OpenAI, DeepInfra, Together, Fireworks, SiliconFlow, Moonshot) live ONLY on Selva. Other services hold no LLM provider secrets.

### 3. Payment attribution — signed fan-out

`routecraft` emits `payment.succeeded` via `@routecraft/payments::emitPaymentSucceeded`. Header `x-madfam-signature: t=<ts>,v1=<hex>` over `"${ts}.${body}"`. Two receivers:

- `dhanam` `POST /v1/billing/madfam-events` → `BillingEvent` row
- `phyne-crm` `POST /api/webhooks/routecraft` → `conversions` row + source-agent credit

Both idempotent by emitter `event_id`. 5-minute replay window.

### 4. Data boundaries — own once, query everywhere

| Dataset | Owner | Everyone else |
|---|---|---|
| Identity / sessions | Janua | federate, never duplicate |
| Bank transactions + billing ledger | Dhanam | API read; no local mirror |
| Mexican law + compliance rules | Tezca | query `/api/v1/laws`; no fork |
| CFDI / SAT / tax filings | Karafiel | single authority |
| 3D geometry kernel | geom-core | used by Sim4D + Yantra4D |

## Agent session protocol

### Session start

1. **Read `README.md`** for current ecosystem shape.
2. **Run `git status && git branch`** to verify clean state.
3. **Check existing TodoWrite items** from previous sessions.
4. **Load Serena memories** (if available): `list_memories()` → `read_memory()`.

### During session

1. **Feature branches only.** Never commit directly to `main`.
2. **Always validate before commit**:
   - TypeScript: `pnpm typecheck && pnpm lint`
   - Package publish: `./scripts/publish-ui.sh --dry-run`
   - Scripts: `bash -n <script>` for syntax
3. **Update TodoWrite** after each task.
4. **Checkpoint every 30 min** via `write_memory()`.
5. **Prefer `enclii` CLI over `kubectl`** for any operational task — `enclii` routes through the Switchyard API with audit logging and lifecycle tracking.

### Secret management (safe-patch mode)

You are PERMITTED to edit `.env` and `.env.local` files, but:

1. **Backup first**: `cp .env .env.bak` before any modification.
2. **Patch, don't purge**: never `> .env` (deletes everything). Always `sed -i '' 's/OLD/NEW/' .env` or `echo "NEW_KEY=value" >> .env`.
3. **Placeholder ban**: never write `your_key_here`, `placeholder`, `example`, `xxx`, or `TODO` into active config files.

### Session end

1. Verify all TodoWrite items completed or documented.
2. Run final validation: `pnpm build`.
3. `write_memory("session_summary", outcomes)`.
4. **Do not leave uncommitted changes** without explicit user approval.

## Validation requirements

| Change type | Required validation |
|---|---|
| Package code | `pnpm build` in package directory |
| Publish | `./scripts/publish-ui.sh --dry-run` |
| Shell scripts | `bash -n <script>` syntax check |
| `.enclii.yml` / docker-compose | `enclii local status` round-trip |
| Docs | Manual review — if it touches a §IV contract, cross-check all affected services |

## Proof-of-life standard

> No deployment, refactor, or fix is "complete" until you have successfully `curl`ed the public endpoint and received the expected response.

- **"K8s applied" is NOT "done."** "Endpoint reachable" is "done."
- **Failure protocol:** if the curl fails (502/503/connection refused), diagnose logs immediately. Do not report success.

## What this repo is NOT

Do not add to solarpunk-foundry:

- Production IPs, hardware specs, hostnames, provider account numbers, costs, SSH targets → belong in `internal-devops`
- Literal secrets → belong nowhere (use ExternalSecret or Vault)
- Strategic / competitive / pricing briefs → `internal-devops/ecosystem/`
- Ecosystem audits with revenue / customer / cost data → `internal-devops/audits/`
- Per-session remediation plans or cutover runbooks → `internal-devops/runbooks/` or the consuming repo (e.g. `autoswarm-office/REBRAND_CUTOVER_RUNBOOK.md`)

If you find any of these leaking in, sanitize via the 2026-04-17 pattern (see git history of `docs/SSH_ACCESS.md`).

---

*Solarpunk Foundry v0.1.0 · The Blueprint · From bits to atoms*
