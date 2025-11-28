# MADFAM Ecosystem Port Allocation

Standardized port assignments for all services to prevent conflicts during local development.

## Port Range Strategy

| Range | Category | Services |
|-------|----------|----------|
| 3000-3099 | Web Frontends | All Next.js/React/Vue web apps |
| 5173 | Vite Dev | Sim4D Studio |
| 8000-8099 | Auth & Core | Janua, Core platform APIs |
| 8100-8199 | Revenue APIs | Forgesight |
| 8200-8299 | Revenue APIs | Forgesight extensions |
| 8300-8399 | Quote APIs | Digifab Quoting |
| 8400-8499 | CAD APIs | Sim4D/Sim4D |
| 8500-8599 | Finance APIs | Dhanam |
| 8600-8699 | Analytics APIs | Fortuna |
| 8700-8799 | Simulation APIs | Galvana/Electrochem-sim |
| 8800-8899 | Education APIs | AVALA |
| 9000-9099 | Object Storage | MinIO |
| 9200-9299 | Search | OpenSearch |

## Complete Port Map

### Shared Infrastructure (solarpunk-foundry)
| Port | Service | Container |
|------|---------|-----------|
| 5432 | PostgreSQL | madfam-postgres-shared |
| 6379 | Redis | madfam-redis-shared |
| 9000 | MinIO API | madfam-minio-shared |
| 9001 | MinIO Console | madfam-minio-shared |

### Authentication (janua)
| Port | Service | Container |
|------|---------|-----------|
| 8001 | Janua API | janua-api |
| 3005 | Janua Admin UI | janua-admin |

### Business Site (madfam-site)
| Port | Service | Container |
|------|---------|-----------|
| 3000 | MADFAM Site (prod) | madfam-site-web |
| 3001 | MADFAM Site (dev) | madfam-site-web-dev |

### Revenue Apps

#### Forgesight
| Port | Service | Container |
|------|---------|-----------|
| 8200 | Forgesight API | forgesight-api |
| 3002 | Forgesight Web | forgesight-web |
| 9200 | OpenSearch | forgesight-opensearch |
| 9600 | OpenSearch Perf | forgesight-opensearch |

#### Digifab Quoting
| Port | Service | Container |
|------|---------|-----------|
| 8300 | Digifab API | digifab-api |
| 3003 | Digifab Web | digifab-web |

### Portfolio Sites

#### Aureo Labs
| Port | Service | Container |
|------|---------|-----------|
| 3010 | Aureo Labs (prod) | aureo-labs-web |
| 3011 | Aureo Labs (dev) | aureo-labs-web-dev |

#### Primavera3D
| Port | Service | Container |
|------|---------|-----------|
| 3020 | Primavera3D (prod) | primavera3d-web |
| 3021 | Primavera3D (dev) | primavera3d-web-dev |

### Platform Apps

#### Dhanam (Finance)
| Port | Service | Container |
|------|---------|-----------|
| 8500 | Dhanam API | dhanam-api |
| 3030 | Dhanam Web | dhanam-web |
| 1025 | MailHog SMTP | dhanam-mailhog |
| 8025 | MailHog UI | dhanam-mailhog |
| 4566 | LocalStack | dhanam-localstack |

#### Fortuna (Analytics)
| Port | Service | Container |
|------|---------|-----------|
| 8600 | Fortuna API | fortuna-api |
| 3004 | Fortuna Web | fortuna-web |
| 9201 | OpenSearch | fortuna-opensearch |
| 9601 | OpenSearch Perf | fortuna-opensearch |

#### Sim4D/Sim4D (CAD)
| Port | Service | Container |
|------|---------|-----------|
| 5173 | Sim4D Studio | sim4d-studio |
| 3040 | Sim4D Marketing | sim4d-marketing |
| 8081 | Collaboration WS | sim4d-collaboration |

### Utilities

#### Galvana/Electrochem-sim
| Port | Service | Container |
|------|---------|-----------|
| 8700 | Galvana API | galvana-api |
| 3050 | Galvana Web | galvana-web |

### Education Apps

#### AVALA (Competency Certification)
| Port | Service | Container |
|------|---------|-----------|
| 8800 | AVALA API | avala-api |
| 3060 | AVALA Web | avala-web |

## Redis Database Allocation

| DB | Service | Purpose |
|----|---------|---------|
| 0 | Janua | Auth sessions, tokens |
| 1 | Reserved | Future use |
| 2 | Forgesight | Document processing cache |
| 3 | Dhanam | Financial data cache |
| 4 | Fortuna | Analytics cache |
| 5 | Digifab | Manufacturing queue |
| 6 | Sim4D | Collaboration sessions |
| 7 | Galvana | Simulation jobs |
| 8 | AVALA | Training sessions, quiz state |

## Environment Variables Reference

All services should use these standardized environment variables:

```bash
# Shared Infrastructure
DATABASE_HOST=madfam-postgres-shared
DATABASE_PORT=5432
REDIS_HOST=madfam-redis-shared
REDIS_PORT=6379
MINIO_HOST=madfam-minio-shared
MINIO_PORT=9000

# Janua Auth (all services)
JANUA_ENABLED=true
JANUA_JWT_SECRET=dev-shared-janua-secret-32chars!!
JANUA_API_URL=http://janua-api:8001
```

## Conflict Prevention Rules

1. **Web frontends**: Always use 3xxx ports
2. **APIs**: Always use 8xxx ports
3. **Infrastructure**: Reserved 5432, 6379, 9000-9001
4. **Search**: Use 9200+ range (increment by 1 for each service)
5. **Dev servers**: Use base port + 1 (e.g., 3010 prod → 3011 dev)

## Verification Commands

```bash
# Check for port conflicts
docker ps --format "table {{.Names}}\t{{.Ports}}" | sort

# Check specific port
lsof -i :3000

# List all MADFAM containers
docker ps --filter "network=madfam-shared-network"
```
