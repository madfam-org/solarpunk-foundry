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
# From ~/labspace root
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

| Service | API Port | Web Port |
|---------|----------|----------|
| Janua | 4100 | 4101 |
| Enclii | 4200 | 4201 |
| ForgeSight | 4300 | 4301 |
| Cotiza Studio | 4400 | 4401 |
| Dhanam | 4500 | 4501 |
| Galvana | 4600 | 4601 |
| Fortuna | 4700 | 4701 |
| Sim4D | 4800 | 4801 |
| AVALA | 4900 | 4901 |
| Forj | 5000 | 5001 |
| Coforma | 5100 | 5101 |
| BloomScroll | 5200 | 5201 |

**Databases**: PostgreSQL (5432), Redis (6379), MinIO (9000/9001)

See `docs/PORT_ALLOCATION.md` for complete registry.

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
| `ops/bin/madfam.sh` | Main orchestration script (17KB) |
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

- **Ecosystem Overview**: See README.md sections I-IV
- **Port Registry**: `docs/PORT_ALLOCATION.md`
- **Dogfooding**: `docs/DOGFOODING_GUIDE.md`
- **Migration**: `docs/ENCLII_MIGRATION_PLAN.md`
- **Architecture**: `docs/architecture/`

---

## Contributing

1. All ecosystem-wide changes go through solarpunk-foundry
2. Update `@madfam/core` for shared constants
3. Document port changes in `PORT_ALLOCATION.md`
4. Test with `./madfam full` before committing

---

*Solarpunk Foundry v0.1.0 | The Blueprint | From Bits to Atoms*
