# Solarpunk Foundry - CLAUDE.md

> **The Single Source of Truth for the MADFAM Ecosystem**

## Overview

**Status**: 🟢 Active Execution (v0.1.0 - The Blueprint)  
**Purpose**: Ecosystem orchestration hub, design system foundation, and organizational constants  
**License**: See individual packages (MIT for @madfam/core)

Solarpunk Foundry is the **central nervous system** of the MADFAM ecosystem. It provides:
- 🎯 **Ecosystem Orchestration** - `./madfam` script for running all services
- 📦 **Shared Packages** - `@madfam/core` with brand, locales, currencies, events
- 📚 **Centralized Documentation** - Port allocation, dogfooding guides, architecture
- 🛠️ **Operations Tooling** - Debug scripts, verification tools, shared infrastructure

---

## Quick Start

```bash
# Recommended: Use enclii local CLI (from enclii/packages/cli)
enclii local up        # Start infra + all services
enclii local infra     # Start only PostgreSQL, Redis, MinIO, MailHog
enclii local status    # Check all service ports
enclii local down      # Stop everything

# Alternative: Legacy madfam script (from ~/labspace root)
./madfam start       # Start core ecosystem (Janua, Enclii, databases)
./madfam full        # Start full ecosystem (all 18 services)
./madfam status      # Check running services
./madfam logs janua  # View service logs
./madfam stop        # Stop all services
```

---

## Project Structure

```
solarpunk-foundry/
├── README.md                    # Vision, architecture, repo strategy
├── CLAUDE.md                    # This file - development guide
├── packages/
│   └── core/                    # @madfam/core - organizational constants
│       ├── src/
│       │   ├── brand/           # Colors, typography, logos
│       │   ├── locales/         # Supported languages (es, en, pt-BR)
│       │   ├── currencies/      # 30+ supported currencies
│       │   ├── events/          # Analytics event taxonomy
│       │   └── products/        # Product definitions
│       └── package.json
├── ops/
│   ├── bin/
│   │   ├── madfam.sh           # Main orchestration script
│   │   ├── debug_logs.sh       # Log debugging
│   │   ├── verify-ports.sh     # Port verification
│   │   └── verify_databases.sh # Database health checks
│   ├── local/
│   │   └── docker-compose.shared.yml  # Shared infrastructure
│   └── db/
│       └── init-shared-dbs.sql # Database initialization
├── docs/
│   ├── PORT_ALLOCATION.md      # Port registry (quick reference)
│   ├── DOGFOODING_GUIDE.md     # Local development guide
│   ├── ENCLII_MIGRATION_PLAN.md # 13-week migration plan
│   └── architecture/
│       └── port_registry.md    # Comprehensive port documentation
├── templates/                   # Project templates
└── scripts/                     # Build and utility scripts
```

---

## Development Commands

### Ecosystem Management
```bash
# Navigate to labspace root
cd ~/labspace

# Core services (databases + auth + infrastructure)
./madfam start

# Full ecosystem (all services)
./madfam full

# Individual service control
./madfam start janua
./madfam stop forgesight
./madfam logs enclii -f

# Status and health
./madfam status
./madfam health
```

### Package Development (@madfam/core)
```bash
cd packages/core

# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Publish (requires npm.madfam.io credentials)
pnpm publish
```

### Operations Scripts
```bash
cd ops/bin

# Verify all ports are correctly configured
./verify-ports.sh

# Check database connectivity
./verify_databases.sh

# Debug service logs
./debug_logs.sh <service-name>
```

---

## Port Allocation (Quick Reference)

Each service gets a 100-port block. Pattern: API at +00, Web at +01, Admin at +02.

| Layer | Service | API | Web | Notes |
|-------|---------|-----|-----|-------|
| **Soil** | Janua | 4100 | 4101 | +02 Admin, +03 Docs, +04 Website |
| | Enclii | 4200 | 4201 | +02 Agent |
| **Roots** | ForgeSight | 4300 | 4301 | +10 Crawler |
| | Fortuna | 4400 | 4401 | +10 Analyzer |
| **Stem** | Cotiza | 4500 | 4501 | +02 Admin |
| | AVALA | 4600 | 4601 | +02 Admin, +03 Assess |
| **Fruit** | Dhanam | 4700 | 4701 | +02 Admin |
| | Sim4D | 4800 | 4801 | +20 Collaboration WS |
| | Forj | 4900 | 4901 | +02 Admin |
| | Coforma | 5050 | 5051 | Skips 5000 (Flask conflict) |
| | Galvana | 5150 | 5151 | +60 Compute |
| **Content** | BloomScroll | 5200 | 5201 | +10 Crawler |
| | Compendium | 5300 | 5301 | almanac.solar |
| | Blueprint | 5400 | 5401 | +10 Indexer |
| **Sites** | madfam-site | 5500 | 5501 | |
| | aureo-labs | 5600 | 5601 | |
| | primavera3d | 5700 | 5701 | |

**Infrastructure**: PostgreSQL (5432), Redis (6379), MinIO (9000/9001), MailHog (1025/8025)

See `docs/PORT_ALLOCATION.md` for complete registry with sub-port schema.

---

## Architecture: The Solarpunk Stack

### 🪨 Layer 1: The Soil (Infrastructure)
- **Enclii** - Sovereign PaaS on Hetzner + Cloudflare
- **Janua** - Identity, SSO, and revenue management

### 🌿 Layer 2: The Roots (Sensing & Input)
- **Fortuna** - Problem intelligence and market gaps
- **ForgeSight** - Global manufacturing pricing data
- **BlueprintTube** - 3D model indexing and analysis
- **BloomScroll** - Slow web content aggregation

### 🪵 Layer 3: The Stem (Core Standards)
- **geom-core** - C++ geometry analysis (WASM/Python)
- **AVALA** - Learning verification (EC/CONOCER, DC-3)

### 🍎 Layer 4: The Fruit (User Platforms)
- **Sim4D** - Web-based parametric CAD
- **Forj** - Decentralized fabrication storefronts
- **Cotiza Studio** - Automated quoting engine
- **Dhanam** - Budget and wealth tracking
- **Coforma Studio** - Customer advisory boards
- **Galvana** - Electrochemistry simulation

---

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Vision, architecture, licensing strategy |
| `docs/INFRASTRUCTURE_STATUS.md` | Current local + production infrastructure state |
| `ops/local/docker-compose.shared.yml` | Shared infrastructure (PostgreSQL, Redis, MinIO) |
| `ops/local/init-databases.sql` | Multi-tenant database initialization |
| `docs/PORT_ALLOCATION.md` | Service port registry |
| `docs/DOGFOODING_GUIDE.md` | Local development setup |
| `docs/ENCLII_MIGRATION_PLAN.md` | Vercel/Railway → Enclii plan |
| `.env.example` | Environment template |
| `.enclii.yml` | Enclii deployment configuration |

---

## Environment Variables

```bash
# Copy example and configure
cp .env.example .env
```

Key variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `NPM_MADFAM_TOKEN` - Private registry access
- `HETZNER_API_TOKEN` - Enclii infrastructure
- `CLOUDFLARE_API_TOKEN` - DNS and tunnels

---

## NPM Registry

All `@madfam/*` packages use the private registry:

```bash
# ~/.npmrc or project .npmrc
@madfam:registry=https://npm.madfam.io
//npm.madfam.io/:_authToken=${NPM_MADFAM_TOKEN}
```

---

## Related Documentation

- **Infrastructure Status**: `docs/INFRASTRUCTURE_STATUS.md` (Local + Production state)
- **Port Registry**: `docs/PORT_ALLOCATION.md`
- **Dogfooding**: `docs/DOGFOODING_GUIDE.md`
- **Migration**: `docs/ENCLII_MIGRATION_PLAN.md`
- **Architecture**: `docs/architecture/`
- **Ecosystem Overview**: See README.md sections I-IV

---

## Contributing

1. All ecosystem-wide changes go through solarpunk-foundry
2. Update `@madfam/core` for shared constants
3. Document port changes in `PORT_ALLOCATION.md`
4. Test with `./madfam full` before committing

---

## Agent Session Protocol (Level 5 Autonomy)

This section defines the operating protocol for AI agents (Claude Code, GitHub Copilot, etc.) when working in this repository.

### Session Start
1. **READ AI_CONTEXT.md** in the repository root for critical paths and directives
2. Run `git status && git branch` to verify clean state and current branch
3. Check for existing TodoWrite items from previous sessions
4. Load any Serena memories: `list_memories()` → `read_memory()`

### During Session
1. **ALWAYS use feature branches** - never commit directly to main/master
2. **ALWAYS run validation** before commits:
   - TypeScript: `pnpm typecheck && pnpm lint`
   - Package publish: `./scripts/publish-ui.sh --dry-run`
3. **UPDATE TodoWrite** after completing each task
4. **CHECKPOINT every 30 minutes** via `write_memory()` for session persistence

### Secret Management Protocols (Safe-Patch Mode)
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
   - `your_key_here`, `placeholder`, `example`, `xxx`, `TODO`
   into active config files (`.env`, `.env.local`)

### Session End
1. Verify all TodoWrite items completed or documented
2. Run final validation: `pnpm build`
3. Save session state: `write_memory("session_summary", outcomes)`
4. **DO NOT leave uncommitted changes** without explicit user approval

### Validation Requirements
| Change Type | Required Validation |
|-------------|---------------------|
| Package code | `pnpm build` in package directory |
| Publish | `./scripts/publish-ui.sh --dry-run` |
| Scripts | `bash -n <script>` for syntax check |
| Documentation | Manual review required |

---

*Solarpunk Foundry v0.1.0 | The Blueprint | From Bits to Atoms*
