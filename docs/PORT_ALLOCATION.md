# MADFAM Ecosystem Port Allocation

> **Single Source of Truth** for all port assignments across the Solarpunk Stack.

---

## Design Principles

1. **100 Ports Per Service**: Each service gets a dedicated 100-port block
2. **Layer-Based Grouping**: Ports organized by Solarpunk Stack layer
3. **Predictable Offsets**: API at +00, Web at +01, Admin at +02, etc.
4. **Collision Avoidance**: Avoids 3000, 5000, 8000, 8080 (common tool conflicts)
5. **Scalability**: Supports 30+ services with room for expansion

---

## Port Range Strategy

| Range | Layer | Services |
|-------|-------|----------|
| 4100-4299 | Soil (Infrastructure) | Janua, Enclii |
| 4300-4499 | Roots (Data/Sensing) | ForgeSight, Fortuna |
| 4500-4699 | Stem (Standards) | Cotiza, AVALA |
| 4700-5199 | Fruit (Platforms) | Dhanam, Sim4D, Forj, Coforma, Galvana |
| 5200-5499 | Content (Publishing) | BloomScroll, Solarpunk Compendium, Blueprint |
| 5500-5799 | Corporate (Sites) | madfam-site, aureo-labs, primavera3d |
| 5800-5899 | Creative (GPU) | ceq |
| 5900-5999 | AI Agents | Autochess |
| 6000-6999 | Reserved | Future expansion (10 service slots) |

**Reserved Ranges (NEVER USE):**
- `4000-4099`: Too close to Webpack HMR (4000)
- `5000-5049`: Flask default port conflict
- `3000-3999`: React/Next.js defaults, high collision risk
- `8000-8999`: Django/Python defaults, high collision risk

---

## Complete Port Map

### Shared Infrastructure

| Port | Service | Container | Notes |
|------|---------|-----------|-------|
| 5432 | PostgreSQL | madfam-postgres | Shared database |
| 6379 | Redis | madfam-redis | Shared cache |
| 9000 | MinIO API | madfam-minio | Object storage |
| 9001 | MinIO Console | madfam-minio | MinIO web UI |
| 1025 | MailHog SMTP | madfam-mailhog | Dev email capture |
| 8025 | MailHog UI | madfam-mailhog | Email viewer |

---

### Layer 1: Soil (Infrastructure) — 4100-4299

#### Janua (Identity & Auth) — 4100-4199

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4100 | API | janua-api | FastAPI backend |
| 4101 | Dashboard | janua-dashboard | User management UI (app.janua.dev) |
| 4102 | Admin | janua-admin | Admin console |
| 4103 | Docs | janua-docs | Documentation site (docs.janua.dev) |
| 4104 | Website | janua-website | Marketing site (janua.dev) |
| 4105 | Demo | janua-demo | Interactive demos |
| 4110 | Email Worker | janua-worker-email | Background email jobs |
| 4111 | Audit Worker | janua-worker-audit | Audit log processing |
| 4120 | WebSocket | janua-ws | Real-time events |
| 4150 | API (Dev) | janua-api-dev | Development variant |
| 4190 | Metrics | janua-metrics | Prometheus endpoint |

#### Enclii (PaaS) — 4200-4299

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4200 | Switchyard API | enclii-api | Control plane |
| 4201 | UI | enclii-ui | Management console |
| 4202 | Agent API | enclii-agent | Node agent |
| 4210 | Registry | enclii-registry | Container registry |
| 4220 | WebSocket | enclii-ws | Live logs/status |
| 4250 | API (Dev) | enclii-api-dev | Development variant |
| 4290 | Metrics | enclii-metrics | Prometheus endpoint |

---

### Layer 2: Roots (Data/Sensing) — 4300-4499

#### ForgeSight (Manufacturing Data) — 4300-4399

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4300 | API | forgesight-api | Data API |
| 4301 | Web | forgesight-web | Dashboard |
| 4310 | Crawler | forgesight-crawler | Data collection |
| 4320 | OpenSearch | forgesight-search | Search engine |
| 4390 | Metrics | forgesight-metrics | Prometheus endpoint |

#### Fortuna (Market Intelligence) — 4400-4499

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4400 | API | fortuna-api | Intelligence API |
| 4401 | Web | fortuna-web | Dashboard |
| 4410 | Analyzer | fortuna-analyzer | ML processing |
| 4420 | OpenSearch | fortuna-search | Search engine |
| 4490 | Metrics | fortuna-metrics | Prometheus endpoint |

---

### Layer 3: Stem (Standards) — 4500-4699

#### Cotiza (Quoting Engine) — 4500-4599

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4500 | API | cotiza-api | Quoting API |
| 4501 | Web | cotiza-web | Quote builder UI |
| 4502 | Admin | cotiza-admin | Admin panel |
| 4510 | Calculator | cotiza-calc | Price calculation |
| 4590 | Metrics | cotiza-metrics | Prometheus endpoint |

#### AVALA (Education) — 4600-4699

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4600 | API | avala-api | NestJS backend |
| 4601 | Web | avala-web | Learning platform |
| 4602 | Admin | avala-admin | Admin console |
| 4603 | Assess | avala-assess | Evaluation engine |
| 4610 | Worker | avala-worker | Background jobs |
| 4690 | Metrics | avala-metrics | Prometheus endpoint |

**Migration Note**: AVALA currently uses 4900/3060. Migrate to 4600/4601.

---

### Layer 4: Fruit (Platforms) — 4700-5199

#### Dhanam (Finance) — 4700-4799

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4700 | API | dhanam-api | Finance API |
| 4701 | Web | dhanam-web | Budget dashboard |
| 4702 | Admin | dhanam-admin | Admin panel |
| 4710 | Sync | dhanam-sync | Bank sync service |
| 4720 | LocalStack | dhanam-localstack | AWS mock (dev) |
| 4790 | Metrics | dhanam-metrics | Prometheus endpoint |

#### Sim4D (CAD) — 4800-4899

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4800 | API | sim4d-api | CAD API |
| 4801 | Studio | sim4d-studio | Web CAD (Vite) |
| 4802 | Marketing | sim4d-marketing | Landing page |
| 4820 | Collaboration | sim4d-collab | WebSocket for collab |
| 4830 | Geometry | sim4d-geom | geom-core WASM |
| 4890 | Metrics | sim4d-metrics | Prometheus endpoint |

#### Forj (Marketplace) — 4900-4999

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4900 | API | forj-api | Marketplace API |
| 4901 | Web | forj-web | Storefront |
| 4902 | Admin | forj-admin | Seller dashboard |
| 4910 | Order Worker | forj-worker | Order processing |
| 4990 | Metrics | forj-metrics | Prometheus endpoint |

**Note**: Skips 5000-5049 to avoid Flask conflict.

#### Coforma (Feedback) — 5050-5149

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5050 | API | coforma-api | Feedback API |
| 5051 | Web | coforma-web | CAB platform |
| 5052 | Admin | coforma-admin | Admin console |
| 5060 | Meilisearch | coforma-search | Search engine |
| 5090 | Metrics | coforma-metrics | Prometheus endpoint |

**Migration Note**: Coforma currently uses 5100. Keep at 5050+ to avoid Flask.

#### Galvana (Simulation) — 5150-5199

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5150 | API | galvana-api | Simulation API |
| 5151 | Web | galvana-web | Visualization UI |
| 5160 | Compute | galvana-compute | Simulation engine |
| 5190 | Metrics | galvana-metrics | Prometheus endpoint |

---

### Layer 5: Content (Publishing) — 5200-5499

#### BloomScroll (Slow Web) — 5200-5299

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5200 | API | bloomscroll-api | Content API |
| 5201 | Web | bloomscroll-web | Reader UI |
| 5202 | Admin | bloomscroll-admin | Curation console |
| 5210 | Crawler | bloomscroll-crawler | Content fetcher |
| 5290 | Metrics | bloomscroll-metrics | Prometheus endpoint |

#### Solarpunk Compendium (Almanac) — 5300-5399

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5300 | API | compendium-api | Content API |
| 5301 | Web | compendium-web | Almanac site (almanac.solar) |
| 5302 | Preview | compendium-preview | Draft preview |
| 5310 | Search | compendium-search | Content search |
| 5390 | Metrics | compendium-metrics | Prometheus endpoint |

#### Blueprint Harvester (3D Index) — 5400-5499

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5400 | API | blueprint-api | Index API |
| 5401 | Web | blueprint-web | Search UI |
| 5410 | Indexer | blueprint-indexer | 3D model crawler |
| 5420 | Renderer | blueprint-renderer | Thumbnail generator |
| 5490 | Metrics | blueprint-metrics | Prometheus endpoint |

---

### Layer 6: Corporate (Sites) — 5500-5799

#### MADFAM Site — 5500-5599

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5500 | Web | madfam-site | Corporate website |
| 5501 | Dev | madfam-site-dev | Development server |
| 5590 | Metrics | madfam-metrics | Prometheus endpoint |

#### Aureo Labs — 5600-5699

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5600 | Web | aureo-web | Product showcase |
| 5601 | Dev | aureo-web-dev | Development server |
| 5690 | Metrics | aureo-metrics | Prometheus endpoint |

#### Primavera3D — 5700-5799

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5700 | Web | primavera3d-web | Factory portfolio |
| 5701 | Dev | primavera3d-dev | Development server |
| 5790 | Metrics | primavera3d-metrics | Prometheus endpoint |

---

### Layer 7: Creative & GPU Services — 5800-5999

#### ceq (Creative Entropy Quantized) — 5800-5899

> *The Skunkworks Terminal for the Generative Avant-Garde*  
> **Domain**: ceq.lol

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5800 | API | ceq-api | FastAPI workflow orchestration |
| 5801 | Studio | ceq-studio | Next.js terminal UI |
| 5802 | Admin | ceq-admin | Template management |
| 5810-5819 | Workers | ceq-worker-{n} | ComfyUI GPU workers |
| 5820 | WebSocket | ceq-ws | Real-time job progress |
| 5850 | API (Dev) | ceq-api-dev | Development variant |
| 5890 | Metrics | ceq-metrics | Prometheus endpoint |

**Dependencies**: Furnace (GPU), Janua (auth), R2 (storage), Redis (queue)

#### Furnace (GPU Infrastructure) — Embedded in Enclii

> Furnace is **not a standalone service** but an extension of Enclii.
> Uses Enclii's port range (4200-4299) for API access.

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 4210 | Gateway | furnace-gateway | Serverless endpoint API |
| 4211 | Scheduler | furnace-scheduler | Job scheduling (internal) |
| 4212 | Registry | furnace-registry | Template/model registry |
| 4215 | Metrics | furnace-metrics | GPU metrics endpoint |

**Note**: Workers run on GPU nodes as Kubernetes deployments, not fixed ports.

---

#### Autochess (Claude Agent Orchestration) — 5900-5999

> *Autonomous Multi-Agent Development Infrastructure*
> **UI**: agents.madfam.io (via ClaudeCodeUI)
> **Engine**: [Auto-Claude](https://github.com/AndyMik90/Auto-Claude)

| Port | Service | Container | Purpose |
|------|---------|-----------|---------|
| 5900 | API | autochess-api | Agent coordination API |
| 5901 | Dashboard | autochess-dashboard | Web control center |
| 5902 | Admin | autochess-admin | Agent configuration |
| 5910 | WebSocket | autochess-ws | Real-time agent communication |
| 5920 | Executor | autochess-executor | Task execution engine |
| 5990 | Metrics | autochess-metrics | Prometheus endpoint |

**Integration Points**:
- Auth via Janua (OAuth client: `jnc_lSGMbQtCGdHSctd4mEQoaklLBCv7xXhe`)
- Deployment triggers via Enclii API
- Git operations via isolated worktrees

---

### Layer 8: Reserved — 6000-6999

Reserved for future services. Each 100-port block can accommodate one service.

Available slots: **10 services** (6000, 6100, 6200, 6300, 6400, 6500, 6600, 6700, 6800, 6900)

---

## Sub-Port Allocation Schema

Every service follows this internal structure within its 100-port block:

| Offset | Purpose | Example (Janua = 4100) |
|--------|---------|------------------------|
| +00 | Primary API | 4100 → janua-api |
| +01 | Primary Web UI | 4101 → janua-dashboard |
| +02 | Admin UI | 4102 → janua-admin |
| +03 | Documentation | 4103 → janua-docs |
| +04 | Marketing/Landing | 4104 → janua-website |
| +05 | Demo Application | 4105 → janua-demo |
| +06-09 | Reserved UI slots | 4106-4109 |
| +10-19 | Background Workers | 4110 → email-worker |
| +20-29 | Real-time (WS/SSE) | 4120 → websocket |
| +30-39 | Internal Services | 4130 → grpc-service |
| +40-49 | Edge/CDN Services | 4140 → edge-verify |
| +50-59 | Development Only | 4150 → api-dev |
| +60-69 | Testing | 4160 → api-test |
| +70-79 | Staging | 4170 → api-staging |
| +80-89 | Feature Flags/A-B | 4180 → feature-api |
| +90-99 | Observability | 4190 → metrics |

---

## Redis Database Allocation

| DB | Service | Purpose |
|----|---------|---------|
| 0 | Janua | Auth sessions, tokens, rate limiting |
| 1 | Enclii | Deployment state, job queues |
| 2 | ForgeSight | Document processing cache |
| 3 | Fortuna | Analytics cache |
| 4 | Cotiza | Quote calculation cache |
| 5 | AVALA | Training sessions, quiz state |
| 6 | Dhanam | Financial data cache |
| 7 | Sim4D | Collaboration sessions |
| 8 | Forj | Order queue, cart state |
| 9 | Coforma | Feedback aggregation |
| 10 | Galvana | Simulation job queue |
| 11 | BloomScroll | Content cache |
| 12 | Compendium | Search cache |
| 13 | Blueprint | Index cache |
| 14 | ceq | Workflow queue, job state |
| 15 | Furnace | GPU job queue (Enclii extension) |

---

## Environment Variables

All services should use these standardized variables:

```bash
# Shared Infrastructure
DATABASE_HOST=madfam-postgres
DATABASE_PORT=5432
REDIS_HOST=madfam-redis
REDIS_PORT=6379
MINIO_HOST=madfam-minio
MINIO_PORT=9000

# Janua Auth (for all services)
JANUA_ENABLED=true
JANUA_API_URL=http://janua-api:4100
JANUA_INTERNAL_KEY=${JANUA_INTERNAL_KEY}
```

---

## Migration Guide

### Priority Order

1. **Janua** (Infrastructure - blocks all other services)
2. **Enclii** (Infrastructure - deployment target)
3. **AVALA** (4900 → 4600)
4. **Dhanam** (4000 → 4700)
5. **Coforma** (5100 → 5050)
6. **Remaining services** (as they come online)

### Migration Steps Per Service

```bash
# 1. Update docker-compose.yml
# 2. Update .env files
# 3. Update CLAUDE.md port references
# 4. Update Cloudflare tunnel config (if applicable)
# 5. Update any hardcoded URLs in code
# 6. Test locally
# 7. Deploy to production
```

---

## Verification Commands

```bash
# Check for port conflicts
docker ps --format "table {{.Names}}\t{{.Ports}}" | sort

# Check specific port
lsof -i :4100

# List all MADFAM containers
docker ps --filter "network=madfam-network"

# Verify no conflicts with common tools
for port in 3000 5000 8000 8080; do
  lsof -i :$port && echo "WARNING: $port in use"
done

# Test service connectivity
curl http://localhost:4100/health  # Janua API
curl http://localhost:4200/health  # Enclii API
```

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-02 | Complete rewrite: Unified 4xxx-5xxx scheme replacing 8xxx/3xxx split | Claude |
| - | Previous: Mixed 8xxx APIs + 3xxx Webs | - |

---

*This document is the single source of truth for port allocation. All repos must conform to this standard.*
