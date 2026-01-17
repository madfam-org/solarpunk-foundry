# AI_CONTEXT.md - Solarpunk Foundry Shared Substrate

## Architecture
- **Stack**: TypeScript monorepo (pnpm workspace) + Verdaccio registry
- **Pattern**: Shared packages published to npm.madfam.io
- **Design**: φ-based golden ratio design system with glassmorphism

## God Files (Critical Paths)
| Purpose | Path |
|---------|------|
| Workspace Config | `pnpm-workspace.yaml` |
| Registry Config | `.npmrc` |
| UI Package | `packages/ui/` |
| Core Constants | `packages/core/` |
| Publish UI | `scripts/publish-ui.sh` |
| Link Ecosystem | `scripts/link-ecosystem.sh` |
| Enclii Config | `.enclii.yml` |

## Packages Published
- @madfam/core (v0.1.0) → Brand constants, currencies, locales
- @madfam/ui (v0.2.0) → Design system components
- @madfam/analytics (v0.1.0) → PostHog instrumentation
- @madfam/auth-resilience (v0.1.0) → Circuit breaker for Janua
- @madfam/sentry (v0.1.0) → Error tracking

## Port Allocation
- 4873: npm.madfam.io (Verdaccio registry)

## The Tripod
- **Provides**: @madfam/* packages to entire ecosystem
- **Hosts**: npm.madfam.io private registry
- **Consumed By**: All 14 MADFAM ecosystem projects
- **Links**: `scripts/link-ecosystem.sh` for local development

## Agent Directives
1. ALWAYS run `pnpm build` before publishing
2. ALWAYS bump version in package.json before publish
3. USE `scripts/publish-ui.sh --dry-run` to test publishing
4. READ this file at session start
5. **The "Proof of Life" Standard:** No deployment, refactor, or fix is considered "Complete" until you have successfully `curl`ed the public endpoint (e.g., `https://npm.madfam.io/-/ping`) and received a `200 OK` (or expected response for the service).
   - **Principle:** "Kubernetes Applied" is NOT "Done." "Endpoint Reachable" is "Done."
   - **Failure Protocol:** If the curl fails (502/503/Connection Refused), you MUST diagnose the logs immediately. Do not report success.

## Secret Management Protocols (Safe-Patch Mode)
**High-Value Targets**: You are PERMITTED to edit `.env` and `.env.local` files, but MUST adhere to:

1. **Backup First**: Before ANY modification to a secret file:
   ```bash
   cp .env .env.bak  # Create immediate restore point
   ```

2. **Patch, Don't Purge**: NEVER overwrite with `> .env` (deletes existing keys). ALWAYS use:
   ```bash
   sed -i '' 's/OLD_VALUE/NEW_VALUE/' .env  # Modify specific key
   echo "NEW_KEY=value" >> .env             # Append new key
   ```

3. **Placeholder Ban**: FORBIDDEN from writing values containing:
   - `your_key_here`
   - `placeholder`
   - `example`
   - `xxx` or `TODO`
   into active config files (`.env`, `.env.local`)

## Testing Commands
```bash
# Build all packages
pnpm build

# TypeScript validation
pnpm typecheck
pnpm lint

# Test publishing (dry run)
./scripts/publish-ui.sh --dry-run
```

## Package Publishing
```bash
# Link for local development
./scripts/link-ecosystem.sh

# Publish to npm.madfam.io
./scripts/publish-ui.sh
```

## Local Development
```bash
# Start Verdaccio registry
docker compose up -d verdaccio

# Link all packages locally
./scripts/link-ecosystem.sh
```
