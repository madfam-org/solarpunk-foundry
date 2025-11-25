# Docker Compose Conflict Analysis

## Critical Finding: Shared Service Port Conflicts

### PostgreSQL (Port 5432)
All three repositories define PostgreSQL on the same port:
- **janua**: `5432:5432` (container: janua-postgres)
- **digifab-quoting**: `5432:5432` (container: cotiza-postgres)
- **forgesight**: `5432:5432` (postgres)

**Conflict**: ❌ Cannot run simultaneously

### Redis (Port 6379)
All three repositories define Redis on the same port:
- **janua**: `6379:6379` (container: janua-redis)
- **digifab-quoting**: `6379:6379` (container: cotiza-redis)
- **forgesight**: `6379:6379` (redis)

**Conflict**: ❌ Cannot run simultaneously

### Additional Janua Services (No Conflicts)
Janua has extensive monitoring/tooling that others don't:
- MinIO (9000, 9001)
- Elasticsearch (9200)
- Kibana (5601)
- Prometheus (9090)
- Grafana (3002)
- Mailhog (1025, 8025)

**Status**: ✅ No conflicts (unique to Janua)

### Additional Forgesight Services (No Conflicts)
- MinIO (9000, 9001) - ⚠️ Conflicts with Janua if both run
- OpenSearch (9200, 9600) - ⚠️ Conflicts with Janua Elasticsearch

## Recommended Strategy: Shared Infrastructure

### Approach
Create `docker-compose.shared.yml` with:
1. **Single PostgreSQL** on 5432 with multiple databases
2. **Single Redis** on 6379 with multiple DBs (0, 1, 2)
3. **Single MinIO** on 9000/9001 (shared object storage)

### Service Modifications Required
Each repo's docker-compose.yml needs to:
1. **Remove** `postgres` and `redis` service definitions
2. **Update** `depends_on` to use external services
3. **Keep** only application services (api, web, workers)
4. **Update** connection strings to use shared DB names

### Database Isolation Strategy
```yaml
# Shared Postgres with separate databases:
- janua_db (for Janua)
- cotiza_db (for Cotiza/digifab-quoting)
- forgesight_db (for Forgesight)

# Shared Redis with separate DB indices:
- DB 0: Janua
- DB 1: Cotiza
- DB 2: Forgesight
```

## Port Allocation After Refactor

### Shared Infrastructure (docker-compose.shared.yml)
- PostgreSQL: 5432
- Redis: 6379
- MinIO: 9000, 9001

### Janua (janua/deployment/docker-compose.yml)
- API: 8001 (was 8000, now follows Solarpunk port)
- Admin: 3004
- Docs: 3005

### Digifab-Quoting (digifab-quoting/docker-compose.yml)
- API: 8200
- Web: 3030
- Worker: 8201

### Forgesight (forgesight/docker-compose.yml)
- API: 8100
- Admin UI: 3012
- Workers: (no exposed ports, internal only)
