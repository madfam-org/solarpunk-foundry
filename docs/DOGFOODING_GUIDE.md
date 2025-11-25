# 🐕 MADFAM Ecosystem Dogfooding Guide

## Quick Start

### 1. Start Shared Infrastructure
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./madfam.sh start
```

### 2. Verify Infrastructure
```bash
./verify_databases.sh
```

### 3. Start Services (in order)

```bash
# Identity Platform (required for auth)
cd ~/labspace/janua/deployment
docker compose up -d

# Revenue-critical apps
cd ~/labspace/digifab-quoting
docker compose up -d

cd ~/labspace/forgesight
docker compose up -d

# Business site
cd ~/labspace/madfam-site
docker compose up web-dev -d
```

### 4. Debug Issues
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./debug_logs.sh
```

---

## Service Port Map

| Service | Port | URL |
|---------|------|-----|
| **Shared Infrastructure** |||
| PostgreSQL | 5432 | `madfam-postgres-shared:5432` |
| Redis | 6379 | `madfam-redis-shared:6379` |
| MinIO API | 9000 | `madfam-minio-shared:9000` |
| MinIO Console | 9001 | http://localhost:9001 |
| **Identity (Janua)** |||
| Janua API | 8001 | http://localhost:8001 |
| Janua Admin | 3004 | http://localhost:3004 |
| Janua Docs | 3005 | http://localhost:3005 |
| **Quoting (Cotiza)** |||
| Cotiza API | 8200 | http://localhost:8200 |
| Cotiza Web | 3030 | http://localhost:3030 |
| Cotiza Worker | 8201 | http://localhost:8201 |
| **Vendor Intel (Forgesight)** |||
| Forgesight API | 8100 | http://localhost:8100 |
| Forgesight Admin | 3012 | http://localhost:3012 |
| OpenSearch | 9200 | http://localhost:9200 |
| **Business Sites** |||
| MADFAM Site (prod) | 3000 | http://localhost:3000 |
| MADFAM Site (dev) | 3001 | http://localhost:3001 |
| Aureo Labs (prod) | 3010 | http://localhost:3010 |
| Aureo Labs (dev) | 3011 | http://localhost:3011 |
| Primavera3D (prod) | 3020 | http://localhost:3020 |
| Primavera3D (dev) | 3021 | http://localhost:3021 |
| **CAD (BrepFlow)** |||
| Studio | 5173 | http://localhost:5173 |
| Marketing | 3040 | http://localhost:3040 |
| Collaboration WS | 8081 | ws://localhost:8081 |
| **Problem Intel (Fortuna)** |||
| Fortuna API | 8110 | http://localhost:8110 |
| Fortuna NLP | 8111 | http://localhost:8111 |
| OpenSearch | 9201 | http://localhost:9201 |

---

## Redis Database Allocation

| DB | Service | Purpose |
|----|---------|---------|
| 0 | Janua | Sessions, tokens |
| 1 | Cotiza | Cache, queues |
| 2 | Forgesight | Crawler cache |
| 3 | Dhanam | Financial cache |
| 4 | Fortuna | API/Jobs cache |
| 5 | Fortuna | NLP model cache |
| 6 | BrepFlow | Collaboration |
| 7-15 | Reserved | Future services |

---

## PostgreSQL Databases

| Database | Service |
|----------|---------|
| `madfam` | Core/shared operations |
| `janua_db` | Authentication platform |
| `cotiza_db` | Quoting platform |
| `forgesight_db` | Vendor intelligence |
| `dhanam_db` | Financial platform |
| `fortuna_db` | Problem intelligence |
| `avala_db` | Procurement (future) |
| `blueprint_db` | 3D harvester (future) |

---

## Common Commands

### Infrastructure
```bash
# Start everything
./madfam.sh start

# Stop everything
./madfam.sh stop

# Clean restart (removes volumes)
./madfam.sh stop --clean
./madfam.sh start

# Check status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Debugging
```bash
# All logs
./debug_logs.sh

# Specific service
./debug_logs.sh janua
./debug_logs.sh cotiza
./debug_logs.sh forgesight

# Database check
docker exec -it madfam-postgres-shared psql -U madfam -c "\l"

# Redis check
docker exec -it madfam-redis-shared redis-cli -a redis_dev_password ping
```

### Per-Service
```bash
# Janua
cd ~/labspace/janua/deployment
docker compose up -d      # Start
docker compose down       # Stop
docker compose logs -f    # Logs

# Cotiza
cd ~/labspace/digifab-quoting
docker compose up -d
docker compose down
docker compose logs -f api

# Forgesight
cd ~/labspace/forgesight
docker compose up -d
docker compose down
docker compose logs -f api
```

---

## Troubleshooting

### "Network madfam-shared-network not found"
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./madfam.sh start
```

### "Database does not exist"
```bash
./madfam.sh stop --clean
./madfam.sh start
./verify_databases.sh
```

### "Connection refused to postgres/redis"
Check if shared infrastructure is running:
```bash
docker ps | grep madfam
```

### JWT Authentication Failures
Verify JWT secret consistency:
```bash
grep -r "JANUA_JWT_SECRET" ~/labspace/*/docker-compose.yml
# All should show: dev-shared-janua-secret-32chars!!
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :8001

# Kill it
kill -9 <PID>
```

---

## Full Stack Startup Script

Save as `~/labspace/start-all.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Starting MADFAM Ecosystem..."

# 1. Shared Infrastructure
echo "📦 Starting shared infrastructure..."
cd ~/labspace/solarpunk-foundry/ops/bin
./madfam.sh start
sleep 5

# 2. Verify databases
echo "🔍 Verifying databases..."
./verify_databases.sh

# 3. Identity Platform
echo "🔐 Starting Janua..."
cd ~/labspace/janua/deployment
docker compose up -d
sleep 3

# 4. Revenue Apps
echo "💰 Starting Cotiza..."
cd ~/labspace/digifab-quoting
docker compose up -d

echo "📊 Starting Forgesight..."
cd ~/labspace/forgesight
docker compose up -d

# 5. Business Site
echo "🌐 Starting MADFAM Site..."
cd ~/labspace/madfam-site
docker compose up web-dev -d

echo ""
echo "✅ MADFAM Ecosystem Started!"
echo ""
echo "Services available at:"
echo "  - Janua API:     http://localhost:8001"
echo "  - Cotiza Web:    http://localhost:3030"
echo "  - Forgesight:    http://localhost:8100"
echo "  - MADFAM Site:   http://localhost:3001"
echo "  - MinIO Console: http://localhost:9001"
```

---

## Health Check URLs

| Service | Health Endpoint |
|---------|-----------------|
| Janua API | http://localhost:8001/health |
| Cotiza API | http://localhost:8200/health |
| Cotiza Worker | http://localhost:8201/health |
| Forgesight API | http://localhost:8100/health |
| Fortuna API | http://localhost:8110/health |
| MADFAM Site | http://localhost:3001/api/health |

---

*Last Updated: November 25, 2025*
