# AI_CONTEXT — Solarpunk Foundry shared substrate

> Quick reference for agents working in this repo. The full agent protocol lives
> in [AGENTS.md](AGENTS.md), which is canonical — [CLAUDE.md](CLAUDE.md) is only
> a compatibility redirect. The public ecosystem narrative is in
> [README.md](README.md).

**Last updated:** 2026-08-24
**Last verified:** 2026-08-24 — package directories, names and versions read
from `packages/*/package.json`; script and compose paths read from the working
tree; registry ownership cross-checked against `internal-devops/ecosystem/domain-map.md`
(*Last Verified 2026-08-24*).

> **Boundary note.** Public repo, Lane B. No secrets, no node identity, no IPs,
> no hardware or capacity figures, no costs. Canonical policy:
> `internal-devops/docs/repo-boundary-contract.md` (2026-06-14); public
> checklist: [docs/PUBLIC_REPO_BOUNDARY.md](docs/PUBLIC_REPO_BOUNDARY.md).

## Repo purpose

- The **public ecosystem contract hub** for MADFAM (Lane B). See [README.md](README.md) §0
  for what that means and what it excludes.
- Home of the `@madfam/*` shared package set, **published to** the private
  `npm.madfam.io` Verdaccio registry.
- Holds the local-dev `madfam` orchestration script and the shared docker-compose stack.
- Ships **no application deployable**.

**It does not host the Verdaccio registry.** This repo publishes to it. The
registry runs in the `enclii` namespace, routed `npm.madfam.io → verdaccio`
(verified 2026-07-01), from manifests in the `enclii` repo under
`infra/k8s/base/verdaccio/`. Three files in this repo previously disagreed on
this; the manifests are the ground truth.

## Architecture

- **Stack:** TypeScript monorepo (pnpm workspace).
- **Pattern:** shared packages published to `npm.madfam.io`, consumed by ecosystem apps.
- **Design tokens:** φ-ratio scale and glassmorphism surfaces, originally carried by
  `@madfam/ui` — which is now deprecated in favour of a per-app "incubator" model.

## Critical paths

*All verified present 2026-07-25.*

| Purpose | Path |
|---|---|
| Workspace config | `pnpm-workspace.yaml` |
| Registry config | `.npmrc` |
| Core constants | `packages/core/` |
| UI package (deprecated) | `packages/ui/` |
| Publish `@madfam/ui` | `scripts/publish-ui.sh` |
| Publish per-platform client SDKs | `scripts/publish-all-sdks.sh` (`pnpm publish:all`) |
| CI publish (manual dispatch, has `dry_run`) | `.github/workflows/publish-package.yml` |
| Local cross-repo linking | `scripts/link-ecosystem.sh` |
| Public-hygiene scan | `scripts/public-hygiene-check.sh` |
| Enclii service spec (unreconciled — see note) | `.enclii.yml` |
| Orchestration script | `ops/bin/madfam.sh` (symlinked to `../madfam` at labspace root) |
| Canonical local stack | `ops/local/docker-compose.shared.yml` |
| Local DB provisioning | `ops/local/init-databases.sql` |

Two caveats on that table:

- `.enclii.yml` describes an `npm-registry` service whose replica count, volume
  size and storage class do not match the live Verdaccio manifests in the
  `enclii` repo. Treat it as unreconciled, not as a source of truth.
- The root `docker-compose.yml` is **currently broken** (two of its services
  reference build targets/Dockerfiles that do not exist) and declares a
  different Docker network than the canonical stack. Use `enclii local up`.

## `@madfam/*` packages

Thirteen packages, intended for `https://npm.madfam.io`. Versions are what
`package.json` declares in the working tree as of 2026-08-24. **Registry
reality (checked 2026-08-24): only `@madfam/core@0.1.0` is published on public
npmjs.org; the other twelve 404 there**, and their presence on the private
`npm.madfam.io` is still unverified (needs a registry query or a dated operator
attestation). `publishConfig` targets are inconsistent across the set.

| Package | Version | Purpose |
|---|---|---|
| `@madfam/core` | 0.1.0 | Brand, locales, currencies, event taxonomy, product registry (generated from the vendored projection; see `scripts/check-product-projection.mjs`) |
| `@madfam/ui` | 0.2.0 | **Deprecated** — UI moved to a per-app "incubator" model (`packages/ui/README.md`) |
| `@madfam/analytics` | 0.1.0 | PostHog instrumentation + event schema |
| `@madfam/auth-resilience` | 0.1.0 | Janua circuit breaker + retry |
| `@madfam/sentry` | 0.1.0 | Sentry init + context enrichment |
| `@madfam/logging` | 0.1.0 | Pino structured logger config |
| `@madfam/env` | 0.1.0 | Zod env loader |
| `@madfam/constants` | 0.1.0 | Shared enums |
| `@madfam/error-boundary` | 0.1.0 | Next.js route boundary components |
| `@madfam/types` | 0.1.0 | Cross-repo shared types (events, webhooks, attribution) |
| `@madfam/telemetry` | 0.1.0 | OpenTelemetry tracing + W3C trace-context propagation |
| `@madfam/webhook-attribution` | 0.1.0 | Signed payment-attribution HMAC sign/verify + idempotency |
| `@madfam/ecosystem-banner` | 0.1.4 | Bottom ticker for ecosystem offers/links on product landings — **not** a footer; product footers exclude platform links ([docs/ECOSYSTEM_BANNER.md](docs/ECOSYSTEM_BANNER.md)) |

`@madfam/webhook-attribution` packages the ecosystem's signed payment-attribution
contract so it is not reimplemented per repo. As of the 2026-07-08 internal
verification, **no repo had adopted it** — Dhanam and routecraft each carry their
own byte-identical implementation.

## Ports (local dev only)

Local-dev ports are a mix of scheme-compliant and framework-default services.
The 4xxx/5xxx block scheme in [`docs/PORT_ALLOCATION.md`](docs/PORT_ALLOCATION.md)
is **aspirational** — read that document before trusting any port number, then
check the owning repo's `enclii.yaml`.

In production, hostname routing makes container ports invisible to callers, but
they are not irrelevant: the Enclii control plane generates NetworkPolicies from
`enclii.yaml`'s `network.services[].port`. If that number does not intersect the
pod's actual `containerPort`, the CNI drops traffic silently.

## What this repo provides to the ecosystem

- **Provides:** the `@madfam/*` packages
- **Publishes to:** `npm.madfam.io` (operated from the `enclii` repo)
- **Consumed by:** MADFAM apps across the org
- **Local linking:** `scripts/link-ecosystem.sh`

## Agent directives

1. **Read [AGENTS.md](AGENTS.md) and [README.md](README.md) at session start.**
   AGENTS.md is canonical.
2. **Feature branches only.** Never commit directly to `main`.
3. `pnpm build` before publish; bump the package version first.
4. `./scripts/publish-ui.sh --dry-run` to test a `@madfam/ui` publish.
5. **Date every factual claim.** Name the source and when it was last verified.
   Distinguish *verified* / *documented but unverified* / *aspirational*. Never
   invent verification — you cannot probe production from this repo.
6. **Proof-of-life standard:** no deployment, refactor or fix is "complete" until
   you `curl` the public endpoint and get the expected response. "K8s applied" is
   not "done"; "endpoint reachable" is. If the curl fails, diagnose logs — do not
   report success. If you did not run it, do not write a status glyph.

## Secret management (safe-patch mode)

You may edit `.env` / `.env.local`, but:

1. **Back up first:** `cp .env .env.bak`.
2. **Patch, don't purge:** never `> .env`. Use `sed -i '' 's/OLD/NEW/' .env` or
   `echo "KEY=value" >> .env`.
3. **Placeholder ban:** never write `your_key_here`, `placeholder`, `example`,
   `xxx`, or `TODO` into active config.
4. Never paste a production credential into agent chat; use `enclii secrets intake`.

## Common commands

```sh
# Build all packages
pnpm build

# Validate
pnpm typecheck
pnpm lint

# Publish @madfam/ui (dry-run first, always)
./scripts/publish-ui.sh --dry-run
./scripts/publish-ui.sh

# Local cross-repo linking
./scripts/link-ecosystem.sh

# Start the canonical shared infra
enclii local infra
# equivalently, directly:
docker compose -f ops/local/docker-compose.shared.yml up -d
```

## Out-of-scope for this repo

- Node identity, IPs, hardware, capacity, hostnames, costs, SSH targets, tunnel
  identifiers → `internal-devops`
- Literal secrets, Vault paths, secret names with retrieval detail → ExternalSecret / Vault
- Raw break-glass `kubectl` / SSH procedures → `internal-devops`
- Strategic, competitive or pricing briefs → `internal-devops/ecosystem/`
- Ecosystem audits with revenue/customer/cost data → `internal-devops/audits/`
- Incident evidence trails → `internal-devops/incidents/`
- Per-session remediation plans or cutover runbooks → `internal-devops/runbooks/`
