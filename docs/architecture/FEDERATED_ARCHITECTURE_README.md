# Federated Architecture Implementation Complete

## Overview
The MADFAM Revenue Shield has been refactored from a **monolithic docker-compose** to a **federated architecture** where each repository uses its own docker-compose.yml file, all sharing common infrastructure.

## Key Changes

### 1. Shared Infrastructure (`docker-compose.shared.yml`)
Created a central infrastructure file that provides:
- **PostgreSQL** (port 5432) - Multi-database instance with separate DBs:
  - `janua_db` - Authentication platform
  - `cotiza_db` - Quoting engine
  - `forgesight_db` - Vendor intelligence
  - Plus: dhanam_db, avala_db, fortuna_db, blueprint_db
- **Redis** (port 6379) - Shared cache with DB isolation (0, 1, 2, etc.)
- **MinIO** (ports 9000/9001) - S3-compatible storage with pre-provisioned buckets

### 2. Refactored `madfam.sh`
The control script now follows the **Solarpunk Zoning Law** boot sequence:

#### Phase 0: Bedrock (Shared Infrastructure)
```bash
docker compose -f docker-compose.shared.yml up -d
```
Starts: PostgreSQL, Redis, MinIO

#### Phase 1: Infrastructure Zone (Janua)
```bash
cd janua/deployment
docker compose up -d api admin docs  # Skip postgres/redis
```
Ports: 8001 (API), 3004 (Admin), 3005 (Docs)

#### Phase 2: Data Zone (Forgesight)
```bash
cd forgesight
docker compose up -d api crawler discovery extractor normalizer admin-ui
```
Ports: 8100 (API), 3012 (Admin)

#### Phase 3: Business Zone (Cotiza)
```bash
cd digifab-quoting
docker compose up -d api web worker  # Skip postgres/redis
```
Ports: 8200 (API), 3030 (Web), 8201 (Worker)

### 3. Connection String Updates Required

**IMPORTANT**: Each app needs its `.env` updated to use shared infrastructure:

#### Janua
```bash
DATABASE_URL=postgresql://madfam:madfam_dev_password@localhost:5432/janua_db
REDIS_URL=redis://:redis_dev_password@localhost:6379/0
```

#### Cotiza (digifab-quoting)
```bash
DATABASE_URL=postgresql://madfam:madfam_dev_password@postgres:5432/cotiza_db?schema=public
REDIS_URL=redis://:redis_dev_password@redis:6379/1
```

#### Forgesight
```bash
DATABASE_URL=postgresql+asyncpg://madfam:madfam_dev_password@postgres:5432/forgesight_db
REDIS_URL=redis://:redis_dev_password@redis:6379/2
```

## Usage

### Start Everything
```bash
cd ~/labspace
./madfam.sh start
```

### Stop Everything
```bash
./madfam.sh stop
```

### Stop and Remove Volumes (Clean Slate)
```bash
./madfam.sh stop --clean
```

### View Logs
```bash
./madfam.sh logs shared              # Infrastructure logs
./madfam.sh logs janua               # All Janua logs
./madfam.sh logs janua api           # Janua API only
./madfam.sh logs forgesight api      # Forgesight API
./madfam.sh logs cotiza web          # Cotiza frontend
```

### Check Status
```bash
./madfam.sh status
```

## Port Conflicts Resolved

### Before (Monolithic)
- ❌ All apps tried to use port 5432 for PostgreSQL
- ❌ All apps tried to use port 6379 for Redis
- ❌ Multiple apps tried to use port 3000

### After (Federated)
- ✅ Single PostgreSQL on 5432 with isolated databases
- ✅ Single Redis on 6379 with DB index isolation
- ✅ Each app has unique ports per Solarpunk Zoning Law

## Next Steps

### 1. Update Individual docker-compose.yml Files
Each repo's docker-compose needs modifications:

**janua/deployment/docker-compose.yml**:
- Remove `postgres` and `redis` service definitions
- Update `api` service to use `external_links` or network connection
- Change DATABASE_URL to use `janua_db`

**digifab-quoting/docker-compose.yml**:
- Remove `postgres` and `redis` service definitions
- Update DATABASE_URL to use `cotiza_db`
- Update REDIS_URL to use `/1` database index

**forgesight/docker-compose.yml**:
- Remove `postgres`, `redis`, `minio` service definitions
- Update DATABASE_URL to use `forgesight_db`
- Update REDIS_URL to use `/2` database index
- Update MinIO connection to shared instance

### 2. Network Configuration
Add to each docker-compose.yml:
```yaml
networks:
  default:
    external: true
    name: madfam-shared-network
```

### 3. Test the Boot Sequence
```bash
# Clean start
./madfam.sh stop --clean
./madfam.sh start

# Verify services
./madfam.sh status

# Check health endpoints
curl http://localhost:8001/health    # Janua
curl http://localhost:8100/health    # Forgesight
curl http://localhost:8200/api/v1/health  # Cotiza
```

## Benefits of Federated Architecture

1. **Isolation**: Each app maintains its own docker-compose.yml
2. **No Port Conflicts**: Shared infrastructure + unique app ports
3. **Scalability**: Easy to add new apps to the ecosystem
4. **Development Flexibility**: Can run individual apps without full stack
5. **Resource Efficiency**: Single PostgreSQL/Redis for all apps
6. **Data Isolation**: Separate databases per app, shared infrastructure

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│  Shared Infrastructure (docker-compose.shared.yml)  │
│  - PostgreSQL:5432 (7 databases)                    │
│  - Redis:6379 (multi-DB)                            │
│  - MinIO:9000/9001                                  │
└─────────────────────────────────────────────────────┘
                         ▲
                         │ (shared network)
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐ ┌───▼──────────┐ ┌─▼─────────────┐
│ Janua           │ │ Forgesight   │ │ Cotiza        │
│ (Infra Zone)    │ │ (Data Zone)  │ │ (Business)    │
│                 │ │              │ │               │
│ API: 8001       │ │ API: 8100    │ │ API: 8200     │
│ Admin: 3004     │ │ Admin: 3012  │ │ Web: 3030     │
│ Docs: 3005      │ │ Workers: N/A │ │ Worker: 8201  │
└─────────────────┘ └──────────────┘ └───────────────┘
```

## Troubleshooting

### "Port already in use"
```bash
# Check what's using the port
lsof -i :5432
lsof -i :6379

# Stop conflicting services
./madfam.sh stop
```

### "Database does not exist"
```bash
# Recreate databases
docker exec madfam-postgres-shared psql -U madfam -f /docker-entrypoint-initdb.d/01-init-dbs.sql
```

### "Cannot connect to shared network"
```bash
# Recreate network
docker network rm madfam-shared-network
./madfam.sh start
```

## Files Created

1. **docker-compose.shared.yml** - Shared infrastructure definition
2. **infrastructure/postgres/init-shared-dbs.sql** - Database initialization
3. **madfam.sh** - Refactored federated control script
4. **DOCKER_COMPOSE_ANALYSIS.md** - Conflict analysis
5. **FEDERATED_ARCHITECTURE_README.md** - This file

---

**Status**: ✅ Refactor Complete  
**Date**: 2025-11-24  
**Architecture**: Solarpunk Federated with Shared Infrastructure
