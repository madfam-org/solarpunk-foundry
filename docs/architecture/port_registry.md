# Labspace Port Registry - Grand Census 2025-11-24

**Total Repositories:** 18  
**Total Deployable Units:** 62  
**Registry Status:** ✅ Complete  
**Zoning System:** Solarpunk Zoning Law v1.0

---

## 🎯 Solarpunk Zoning Law

Port assignments follow ecosystem-wide conventions:

- **8000-8099**: Infrastructure & Auth (Janua, Enclii, Plinto)
- **8100-8199**: Data & Sensing Layer (Fortuna, Forge Sight, Blueprint Harvester)
- **8200-8299**: Business Logic & Processing (APIs, Workers, ML Services)
- **3000-3099**: Public Frontends (Marketing, Dashboards, Studios)

---

## 📊 Port Allocation Table

| Repository | App/Service | Path | Default Port | **ASSIGNED PORT** | Zone | Type |
|------------|-------------|------|--------------|-------------------|------|------|
| **janua** | API | `janua/apps/api` | 4000 | **8001** | Infra | Backend |
| janua | Landing | `janua/apps/landing` | 3000 | **3001** | Frontend | Marketing |
| janua | Dashboard | `janua/apps/dashboard` | 3001 | **3002** | Frontend | Admin |
| janua | Demo | `janua/apps/demo` | 3002 | **3003** | Frontend | Demo |
| janua | Admin | `janua/apps/admin` | 3004 | **3004** | Frontend | Admin |
| janua | Docs | `janua/apps/docs` | 3003 | **3005** | Frontend | Docs |
| janua | Marketing | `janua/apps/marketing` | 3003 | **3006** | Frontend | Marketing |
| **enclii** | Switchyard API | `enclii/apps/switchyard-api` | 8080 | **8002** | Infra | Backend |
| enclii | Switchyard UI | `enclii/apps/switchyard-ui` | 3000 | **3007** | Frontend | Dashboard |
| enclii | Reconcilers | `enclii/apps/reconcilers` | N/A | **8003** | Infra | Worker |
| **forgesight** | API | `forgesight/services/api` | 8000 | **8100** | Data | Backend |
| forgesight | WWW | `forgesight/apps/www` | 3000 | **3010** | Frontend | Marketing |
| forgesight | App | `forgesight/apps/app` | 3001 | **3011** | Frontend | Dashboard |
| forgesight | Admin | `forgesight/apps/admin` | N/A | **3012** | Frontend | Admin |
| forgesight | Crawler | `forgesight/services/crawler` | N/A | **8101** | Data | Worker |
| forgesight | Normalizer | `forgesight/services/normalizer` | N/A | **8102** | Data | Worker |
| forgesight | Discovery | `forgesight/services/discovery` | N/A | **8103** | Data | Worker |
| forgesight | Extractor | `forgesight/services/extractor` | N/A | **8104** | Data | Worker |
| **fortuna** | API | `fortuna/services/api` | 8080 | **8110** | Data | Backend |
| fortuna | NLP | `fortuna/services/nlp` | 8001 | **8111** | Data | ML |
| fortuna | Jobs | `fortuna/services/jobs` | N/A | **8112** | Data | Worker |
| **blueprint-harvester** | API | `blueprint-harvester/services/api` | 8000 | **8120** | Data | Backend |
| blueprint-harvester | Web | `blueprint-harvester/apps/web` | 3000 | **3020** | Frontend | Explorer |
| blueprint-harvester | Admin | `blueprint-harvester/apps/admin` | N/A | **3021** | Frontend | Admin |
| blueprint-harvester | Workbench | `blueprint-harvester/apps/workbench` | 3002 | **3022** | Frontend | Studio |
| blueprint-harvester | Ingestion | `blueprint-harvester/services/ingestion` | N/A | **8121** | Data | Worker |
| blueprint-harvester | Processing | `blueprint-harvester/services/processing` | N/A | **8122** | Data | Worker |
| blueprint-harvester | ML | `blueprint-harvester/services/ml` | N/A | **8123** | Data | ML |
| blueprint-harvester | Search | `blueprint-harvester/services/search` | N/A | **8124** | Data | Search |
| blueprint-harvester | Slicing | `blueprint-harvester/services/slicing` | N/A | **8125** | Data | Worker |
| **digifab-quoting** | API | `digifab-quoting/apps/api` | 4000 | **8200** | Business | Backend |
| digifab-quoting | Web | `digifab-quoting/apps/web` | 3002 | **3030** | Frontend | Dashboard |
| digifab-quoting | Admin | `digifab-quoting/apps/admin` | N/A | **3031** | Frontend | Admin |
| digifab-quoting | Worker | `digifab-quoting/apps/worker` | N/A | **8201** | Business | Worker |
| **dhanam** | API | `dhanam/apps/api` | 4000 | **8210** | Business | Backend |
| dhanam | Web | `dhanam/apps/web` | 3000 | **3040** | Frontend | Dashboard |
| dhanam | Mobile | `dhanam/apps/mobile` | 19000 | **19000** | Frontend | Mobile |
| **forj** | API | `forj/apps/api` | 3001 | **8220** | Business | Backend |
| forj | Web | `forj/apps/web` | 3000 | **3050** | Frontend | Storefront |
| forj | Dashboard | `forj/apps/dashboard` | 3002 | **3051** | Frontend | Dashboard |
| **coforma-studio** | Root | `coforma-studio/` | 3000 | **8230** | Business | Monolith |
| **electrochem-sim** | API | `electrochem-sim/services/api` | 8080 | **8240** | Business | Backend |
| electrochem-sim | Web | `electrochem-sim/apps/web` | 3000 | **3060** | Frontend | Dashboard |
| electrochem-sim | HAL | `electrochem-sim/services/hal` | N/A | **8241** | Business | Hardware |
| **avala** | API | `avala/apps/api` | 4000 | **8250** | Business | Backend |
| avala | Web | `avala/apps/web` | 3000 | **3070** | Frontend | Dashboard |
| **sim4d** | Studio | `sim4d/apps/studio` | 3000 | **3080** | Frontend | Studio |
| sim4d | Marketing | `sim4d/apps/marketing` | N/A | **3081** | Frontend | Marketing |
| sim4d | Collab | `sim4d/` | 8080 | **8260** | Business | Collab |
| **madfam-site** | Web | `madfam-site/apps/web` | 3000 | **3090** | Frontend | Marketing |
| madfam-site | CMS | `madfam-site/apps/cms` | 3001 | **3091** | Frontend | CMS |
| **aureo-labs** | Web | `aureo-labs/` | 3000 | **3092** | Frontend | Marketing |
| **primavera3d** | Web | `primavera3d/apps/web` | 3000 | **3093** | Frontend | Portfolio |
| primavera3d | Docs | `primavera3d/apps/docs` | 3001 | **3094** | Frontend | Docs |
| **geom-core** | Root | `geom-core/` | N/A | **N/A** | Library | C++/Python |
| **bloom-scroll** | Root | `bloom-scroll/` | N/A | **3095** | Frontend | Experimental |
| **solarpunk-foundry** | Root | `solarpunk-foundry/` | N/A | **N/A** | Docs | Documentation |

---

## 📈 Statistics

### By Zone
- **Infra (8000-8099)**: 3 services (Janua API, Enclii API, Enclii Reconcilers)
- **Data (8100-8199)**: 15 services (Forge Sight, Fortuna, Blueprint Harvester)
- **Business (8200-8299)**: 13 services (Cotiza, Dhanam, Forj, Galvana, AVALA, Sim4D)
- **Frontends (3000-3099)**: 27 apps (Marketing sites, dashboards, studios)
- **Mobile (19000+)**: 1 app (Dhanam Mobile)
- **Libraries**: 2 (geom-core, solarpunk-foundry - no port needed)

### By Type
- **Backend APIs**: 13
- **Frontend Apps**: 28
- **Workers/Services**: 15
- **ML Services**: 2
- **Hardware Integration**: 1
- **Libraries**: 2
- **Mobile**: 1

### By Repository Status
- **Production**: 7 repos (19 apps)
- **Specification/Planning**: 6 repos (21 apps)
- **Infrastructure**: 3 repos (6 apps)
- **Utility/Library**: 2 repos (2 apps)

---

## 🐳 Docker Compose Strategy Recommendations

### Current Situation
- **62 deployable units** across 18 repositories
- **31 services** require runtime (APIs, workers, frontends)
- **31 supporting services** (databases, redis, search engines)
- **Estimated total containers**: ~45-50 (excluding databases shared across apps)

### ✅ Recommended Strategy: **Layered Compose Architecture**

Split into **4 compose files** by ecosystem layer:

#### 1. `docker-compose.infra.yml` (Infrastructure Layer)
**Services**: Janua, Enclii, shared databases, Redis clusters  
**Port Range**: 8000-8099, 5432-5433 (postgres), 6379-6380 (redis)  
**Boot Order**: First (dependency layer)  
**Containers**: ~8-10

```yaml
# Core infrastructure that all apps depend on
services:
  janua-api:
    ports: ["8001:8001"]
  enclii-api:
    ports: ["8002:8002"]
  postgres-shared:
    ports: ["5432:5432"]
  redis-shared:
    ports: ["6379:6379"]
```

#### 2. `docker-compose.data.yml` (Data & Sensing Layer)
**Services**: Forge Sight, Fortuna, Blueprint Harvester + workers  
**Port Range**: 8100-8199  
**Boot Order**: Second (depends on infra)  
**Containers**: ~15-18

```yaml
# Data collection, processing, ML services
services:
  forgesight-api:
    ports: ["8100:8100"]
  fortuna-api:
    ports: ["8110:8110"]
  blueprint-api:
    ports: ["8120:8120"]
  # + crawler, normalizer, ML workers
```

#### 3. `docker-compose.apps.yml` (Business Logic Layer)
**Services**: Cotiza, Dhanam, Forj, Galvana, AVALA, Sim4D  
**Port Range**: 8200-8299  
**Boot Order**: Third (depends on data + infra)  
**Containers**: ~12-15

```yaml
# Business applications and their APIs
services:
  cotiza-api:
    ports: ["8200:8200"]
  dhanam-api:
    ports: ["8210:8210"]
  forj-api:
    ports: ["8220:8220"]
  galvana-api:
    ports: ["8240:8240"]
```

#### 4. `docker-compose.frontends.yml` (Public Frontends)
**Services**: All marketing sites, dashboards, studios  
**Port Range**: 3000-3099  
**Boot Order**: Last (depends on all APIs)  
**Containers**: ~15-18

```yaml
# All Next.js/React frontends
services:
  janua-landing:
    ports: ["3001:3001"]
  forgesight-app:
    ports: ["3011:3011"]
  cotiza-web:
    ports: ["3030:3030"]
  madfam-site:
    ports: ["3090:3090"]
```

### Master Control File
Create `docker-compose.yml` (master) that includes all layers:

```yaml
include:
  - docker-compose.infra.yml
  - docker-compose.data.yml
  - docker-compose.apps.yml
  - docker-compose.frontends.yml
```

### Usage Patterns

```bash
# Start everything
docker compose up -d

# Start only infrastructure
docker compose -f docker-compose.infra.yml up -d

# Start data layer + dependencies
docker compose -f docker-compose.infra.yml -f docker-compose.data.yml up -d

# Start specific app + all dependencies
docker compose up -d cotiza-api cotiza-web

# Development: start only what you need
docker compose -f docker-compose.infra.yml up -d postgres-shared redis-shared
docker compose up -d janua-api  # then run janua frontend locally
```

---

## 🎛️ Alternative Strategy: **Repository-Level Compose**

If layered approach proves too complex for development:

- Keep existing `docker-compose.yml` per repository
- Use `port_registry.md` to **manually set ports** in each repo's `.env`
- Create **helper scripts** per repo:
  ```bash
  # ~/labspace/janua/dev.sh
  export API_PORT=8001
  export WEB_PORT=3001
  docker compose up -d
  ```

**Trade-off**: Easier development, but full-stack boot requires scripting.

---

## 🔧 Port Conflict Detection Script

Create `~/labspace/check-ports.sh`:

```bash
#!/bin/bash
echo "Checking for port conflicts..."

# Check if any assigned ports are in use
for port in 8001 8002 8003 8100 8110 8120 8200 8210 8220 8230 8240 8250 8260 3001 3002 3003 3004 3005 3006 3007 3010 3011 3012 3020 3021 3022 3030 3031 3040 3050 3051 3060 3070 3080 3081 3090 3091 3092 3093 3094 3095; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "❌ Port $port is in use"
    lsof -Pi :$port -sTCP:LISTEN
  fi
done

echo "✅ Port conflict check complete"
```

---

## 📝 Migration Checklist

- [ ] Update all `.env.example` files with new assigned ports
- [ ] Update all `docker-compose.yml` files with new ports
- [ ] Update all `package.json` dev scripts to use new ports
- [ ] Update CLAUDE.md files with new port assignments
- [ ] Create layered compose files (`infra`, `data`, `apps`, `frontends`)
- [ ] Test boot sequence: infra → data → apps → frontends
- [ ] Update README quick start commands with new ports
- [ ] Add port conflict detection to pre-commit hooks

---

## 🚀 Recommended Next Steps

1. **Immediate**: Copy this registry to each repo's CLAUDE.md
2. **Week 1**: Update `.env.example` files across all repos
3. **Week 2**: Create layered compose files in `~/labspace/compose/`
4. **Week 3**: Test full-stack boot with `docker compose up -d`
5. **Week 4**: Document boot order and dependencies in each README

---

**Registry Maintained By**: Infrastructure Architect  
**Last Updated**: 2025-11-24  
**Next Audit**: 2026-02-24 (Quarterly)
