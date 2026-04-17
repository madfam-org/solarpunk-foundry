# AI_CONTEXT — Solarpunk Foundry shared substrate

> Quick reference for agents working in this repo. Full agent protocol
> lives in [CLAUDE.md](CLAUDE.md); the public ecosystem narrative is
> in [README.md](README.md).

## Repo purpose

- Ecosystem orchestration hub for MADFAM.
- Home of the `@madfam/*` shared package set (published to `npm.madfam.io`).
- Hosts the Verdaccio private registry.
- Holds the local-dev `madfam` orchestration script + shared docker-compose.
- **Public repo** — no secrets, no IPs, no hardware specs, no costs.

## Architecture

- **Stack:** TypeScript monorepo (pnpm workspace) + Verdaccio + φ-ratio design system.
- **Pattern:** Shared packages published to `npm.madfam.io`, consumed by every app.
- **Design:** Glassmorphism + golden-ratio tokens.

## Critical paths

| Purpose | Path |
|---|---|
| Workspace config | `pnpm-workspace.yaml` |
| Registry config | `.npmrc` |
| UI package | `packages/ui/` |
| Core constants | `packages/core/` |
| Publish helper | `scripts/publish-ui.sh` |
| Local linking | `scripts/link-ecosystem.sh` |
| Enclii service spec | `.enclii.yml` |
| Orchestration script | `ops/bin/madfam.sh` (→ symlinked to `../madfam` at labspace root) |
| Shared docker-compose | `ops/local/docker-compose.shared.yml` |

## Published `@madfam/*` packages

All published to `https://npm.madfam.io`:

| Package | Purpose |
|---|---|
| `@madfam/core` | Brand, locales, currencies, event taxonomy, product definitions |
| `@madfam/ui` | shadcn/ui + Radix + Tailwind design system |
| `@madfam/analytics` | PostHog instrumentation + event schema |
| `@madfam/auth-resilience` | Janua circuit breaker + retry |
| `@madfam/sentry` | Sentry init + context enrichment |
| `@madfam/logging` | Pino structured logger config |
| `@madfam/env` | Zod env loader |
| `@madfam/constants` | Shared enums |
| `@madfam/error-boundary` | Next.js route boundary components |
| `@madfam/types` | Cross-repo shared types (events, webhooks, attribution) |

## Ports (local dev only)

Local-dev port usage is a mix of **scheme-compliant** services (Janua
4100-4104, Enclii 4200-4201) and **framework-default** services
(everything else uses `3000` / `4200` / `8000`). See
[`docs/PORT_ALLOCATION.md`](docs/PORT_ALLOCATION.md) for the honest
per-repo breakdown. In production, K8s + Cloudflare Tunnel make
container ports invisible.

## The Tripod

- **Provides:** `@madfam/*` packages to entire ecosystem
- **Hosts:** `npm.madfam.io` private registry
- **Consumed by:** all MADFAM apps
- **Local linking:** `scripts/link-ecosystem.sh` for dev

## Agent directives

1. **Feature branches only.** Never commit directly to `main`.
2. **`pnpm build` before publish.**
3. **Bump `package.json` version before publish.**
4. **`./scripts/publish-ui.sh --dry-run` to test publishing.**
5. **Proof-of-life standard:** no deployment/refactor/fix is "complete" until you `curl` the public endpoint and get the expected response. "K8s applied" is not "done"; "endpoint reachable" is "done". If the curl fails (502/503/connection refused), diagnose logs — do not report success.
6. **Read [CLAUDE.md](CLAUDE.md) + [README.md](README.md) at session start.**

## Secret management (safe-patch mode)

Permitted to edit `.env` / `.env.local` but:

1. **Backup first**: `cp .env .env.bak`.
2. **Patch, don't purge**: never `> .env`. Use `sed -i '' 's/OLD/NEW/' .env` or `echo "KEY=value" >> .env`.
3. **Placeholder ban**: never write `your_key_here`, `placeholder`, `example`, `xxx`, `TODO` into active config.

## Common commands

```sh
# Build all packages
pnpm build

# Validate
pnpm typecheck
pnpm lint

# Publish (dry-run first, always)
./scripts/publish-ui.sh --dry-run
./scripts/publish-ui.sh

# Local linking for cross-repo dev
./scripts/link-ecosystem.sh

# Start shared infra
docker compose -f ops/local/docker-compose.shared.yml up -d
```

## Out-of-scope for this repo

Don't add:

- Prod IPs, hardware, hostnames, costs, SSH targets → `internal-devops`
- Literal secrets → ExternalSecret / Vault
- Strategic / competitive / pricing briefs → `internal-devops/ecosystem/`
- Ecosystem audits with revenue/customer/cost data → `internal-devops/audits/`
- Per-session remediation plans or cutover runbooks → `internal-devops/runbooks/` or the consuming repo
