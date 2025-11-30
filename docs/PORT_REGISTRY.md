# MADFAM Ecosystem Port Registry

Central registry of port assignments for all MADFAM applications and services.

**Last Updated**: 2025-11-29

## Port Allocation Scheme

| Range | Category | Description |
|-------|----------|-------------|
| 3000-3099 | Web Frontends | User-facing web applications |
| 4000-4099 | Application APIs | Backend REST/GraphQL APIs |
| 8000-8099 | Platform Services | Core infrastructure (auth, PaaS) |
| 8100-8199 | Workers & Jobs | Background processing services |
| Standard | Infrastructure | Databases, caches, observability |

---

## Web Frontends (3000-3099)

| Port | App | Repository | Description |
|------|-----|------------|-------------|
| 3000 | madfam-site | madfam-site | Marketing website |
| 3001 | janua-web | janua | Auth dashboard & admin |
| 3010 | avala-web | avala | Competency training platform |
| 3020 | forgesight-web | forgesight | Business analytics dashboard |
| 3030 | cotiza-web | digifab-quoting | Manufacturing quoting app |
| 3040 | dhanam-web | dhanam | Finance management |
| 3050 | forj-web | forj | Project management |
| 3051 | forj-dashboard | forj | Admin dashboard |
| 3060 | electrochem-web | electrochem-sim | Electrochemistry simulator UI |
| 3070 | fortuna-web | fortuna | Lottery platform (reserved) |
| 3080 | sim4d-web | sim4d | 4D simulation viewer |
| 3090 | bloom-scroll-web | bloom-scroll | Content discovery |
| 3093 | primavera3d-web | primavera3d | 3D model viewer |
| 3094 | primavera3d-docs | primavera3d | Documentation site |
| 3095 | blueprint-harvester | blueprint-harvester | Data harvesting tool |

**Reserved**: 3002-3009, 3071-3079, 3096-3099

---

## Application APIs (4000-4099)

| Port | App | Repository | Description |
|------|-----|------------|-------------|
| 4000 | avala-api | avala | Competency training API |
| 4010 | dhanam-api | dhanam | Finance API |
| 4020 | forj-api | forj | Project management API |
| 4030 | cotiza-api | digifab-quoting | Quoting engine API |
| 4040 | forgesight-api | forgesight | Analytics API |
| 4050 | electrochem-api | electrochem-sim | Simulation API |
| 4060 | fortuna-api | fortuna | Lottery API |
| 4070 | sim4d-api | sim4d | 4D simulation API (reserved) |
| 4080 | bloom-scroll-api | bloom-scroll | Content API |
| 4090 | primavera3d-api | primavera3d | 3D processing API (reserved) |

**Reserved**: 4001-4009, 4091-4099

---

## Platform Services (8000-8099)

Core infrastructure services that other apps depend on.

| Port | App | Repository | Description |
|------|-----|------------|-------------|
| 8000 | janua-api | janua | Authentication & authorization |
| 8001 | enclii-api | enclii | PaaS control plane |
| 8010 | enclii-roundhouse | enclii | Build service |
| 8020 | enclii-waybill | enclii | Deployment service |
| 8030 | enclii-switchyard-ui | enclii | PaaS dashboard |

**Reserved**: 8002-8009, 8031-8099

---

## Workers & Background Jobs (8100-8199)

| Port | App | Repository | Description |
|------|-----|------------|-------------|
| 8100 | cotiza-worker | digifab-quoting | Quote processing worker |
| 8110 | fortuna-nlp | fortuna | NLP processing service |
| 8111 | fortuna-jobs | fortuna | Job scheduler service |
| 8120 | forgesight-worker | forgesight | Analytics pipeline worker |

**Reserved**: 8101-8109, 8121-8199

---

## Infrastructure (Standard Ports)

These services use their well-known default ports. **Do not change these.**

### Databases

| Port | Service | Description |
|------|---------|-------------|
| 5432 | PostgreSQL | Primary relational database |
| 27017 | MongoDB | Document database |

### Caching & Messaging

| Port | Service | Description |
|------|---------|-------------|
| 6379 | Redis | Cache & session store |

### Search & Analytics

| Port | Service | Description |
|------|---------|-------------|
| 9200 | OpenSearch | Full-text search |
| 19530 | Milvus | Vector database |

### Object Storage

| Port | Service | Description |
|------|---------|-------------|
| 9000 | MinIO | S3-compatible storage |
| 9001 | MinIO Console | MinIO admin UI |

### Observability

| Port | Service | Description |
|------|---------|-------------|
| 9090 | Prometheus | Metrics collection |
| 9411 | Zipkin | Distributed tracing |
| 3100 | Loki | Log aggregation (if used) |
| 16686 | Jaeger | Tracing UI (if used) |

### Development Tools

| Port | Service | Description |
|------|---------|-------------|
| 1025 | Mailhog SMTP | Local email testing |
| 8025 | Mailhog UI | Email viewer |
| 4873 | Verdaccio | Local npm registry |

---

## Environment Variable Conventions

### Naming Pattern

```bash
# Web applications
PORT=3010                    # Primary port (for single-port apps)
WEB_PORT=3010               # Explicit web port
NEXT_PUBLIC_PORT=3010       # Next.js public port

# APIs
API_PORT=4000               # API server port
PORT=4000                   # Primary port (for single-port apps)

# Workers
WORKER_PORT=8100            # Background worker port

# External URLs (for inter-service communication)
JANUA_URL=http://localhost:8000
AVALA_API_URL=http://localhost:4000
```

### Example .env File

```bash
# Application
NODE_ENV=development
PORT=3010
API_PORT=4000

# External Services
JANUA_URL=http://localhost:8000
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp
REDIS_URL=redis://localhost:6379

# Infrastructure (standard ports - rarely need to change)
POSTGRES_PORT=5432
REDIS_PORT=6379
```

---

## Docker Compose Port Mapping

When running in Docker, map container ports to host ports:

```yaml
services:
  web:
    ports:
      - "${WEB_PORT:-3010}:3000"  # Host:Container
  
  api:
    ports:
      - "${API_PORT:-4000}:4000"
  
  postgres:
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
```

---

## Adding New Applications

1. **Check this registry** for the next available port in the appropriate range
2. **Reserve the port** by adding it to this document
3. **Update your .env.example** with the assigned port
4. **Submit a PR** to update this registry

### Port Request Template

```
App Name: [name]
Repository: [repo]
Category: [Web Frontend | API | Platform | Worker]
Requested Port: [port]
Description: [brief description]
```

---

## Migration Status

All `.env.example` files have been updated to match this registry:

| App | Port | Status |
|-----|------|--------|
| madfam-site | 3000 | ✅ Updated |
| janua-web | 3001 | ✅ Updated |
| avala-web | 3010 | ✅ Updated |
| forgesight-web | 3020 | ✅ Updated |
| cotiza-web | 3030 | ✅ Updated |
| dhanam-web | 3040 | ✅ Updated |
| forj-web | 3050 | ✅ Updated |
| electrochem-web | 3060 | ✅ Updated |
| fortuna-web | 3070 | ✅ Updated |
| sim4d-web | 3080 | ✅ Updated |
| avala-api | 4000 | ✅ Updated |
| dhanam-api | 4010 | ✅ Updated |
| forj-api | 4020 | ✅ Updated |
| cotiza-api | 4030 | ✅ Updated |
| forgesight-api | 4040 | ✅ Updated |
| electrochem-api | 4050 | ✅ Updated |
| fortuna-api | 4060 | ✅ Updated |
| janua-api | 8000 | ✅ Updated |
| enclii-api | 8001 | ✅ Updated |
| cotiza-worker | 8100 | ✅ Updated |
| fortuna-nlp | 8110 | ✅ Updated |

---

## Changelog

### 2025-11-29
- Initial port registry created
- Defined port ranges for all categories
- Documented all current applications
- Identified migration needs

---

## Questions?

Contact the platform team or open an issue in solarpunk-foundry.
