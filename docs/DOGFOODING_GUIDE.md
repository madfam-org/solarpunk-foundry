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

| Service | Port | URL | Block |
|---------|------|-----|-------|
| **Shared Infrastructure** ||||
| PostgreSQL | 5432 | `madfam-postgres:5432` | Infra |
| Redis | 6379 | `madfam-redis:6379` | Infra |
| MinIO API | 9000 | `madfam-minio:9000` | Infra |
| MinIO Console | 9001 | http://localhost:9001 | Infra |
| **Identity (Janua)** | | | 4100-4199 |
| Janua API | 4100 | http://localhost:4100 | |
| Janua Dashboard | 4101 | http://localhost:4101 | |
| Janua Admin | 4102 | http://localhost:4102 | |
| Janua Docs | 4103 | http://localhost:4103 | |
| **Platform (Enclii)** | | | 4200-4299 |
| Enclii API | 4200 | http://localhost:4200 | |
| Enclii UI | 4201 | http://localhost:4201 | |
| **Data (ForgeSight)** | | | 4300-4399 |
| ForgeSight API | 4300 | http://localhost:4300 | |
| ForgeSight Web | 4301 | http://localhost:4301 | |
| **Intelligence (Fortuna)** | | | 4400-4499 |
| Fortuna API | 4400 | http://localhost:4400 | |
| Fortuna Web | 4401 | http://localhost:4401 | |
| **Quoting (Cotiza)** | | | 4500-4599 |
| Cotiza API | 4500 | http://localhost:4500 | |
| Cotiza Web | 4501 | http://localhost:4501 | |
| **Finance (Dhanam)** | | | 4700-4799 |
| Dhanam API | 4700 | http://localhost:4700 | |
| Dhanam Web | 4701 | http://localhost:4701 | |
| **CAD (Sim4D)** | | | 4800-4899 |
| Sim4D API | 4800 | http://localhost:4800 | |
| Sim4D Studio | 4801 | http://localhost:4801 | |

> **Note**: See `PORT_ALLOCATION.md` for the complete port registry

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
| 6 | Sim4D | Collaboration |
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
echo "  - Janua API:     http://localhost:4100"
echo "  - Janua Dashboard: http://localhost:4101"
echo "  - Enclii API:    http://localhost:4200"
echo "  - Enclii UI:     http://localhost:4201"
echo "  - ForgeSight:    http://localhost:4300"
echo "  - MinIO Console: http://localhost:9001"
```

---

## Health Check URLs

| Service | Health Endpoint |
|---------|-----------------|
| Janua API | http://localhost:4100/health |
| Janua Dashboard | http://localhost:4101 |
| Enclii API | http://localhost:4200/health |
| Enclii UI | http://localhost:4201 |
| Cotiza API | http://localhost:4500/health |
| ForgeSight API | http://localhost:4300/health |
| Fortuna API | http://localhost:4400/health |
| Dhanam API | http://localhost:4700/health |

---

## Production Ingress

> **Note**: Production services use Cloudflare Tunnel instead of direct port exposure.

| Service | Production URL |
|---------|----------------|
| Enclii API | https://api.enclii.dev |
| Enclii UI | https://app.enclii.dev |
| Janua API | https://auth.madfam.io |
| Janua Dashboard | https://dashboard.madfam.io |

See `PORT_ALLOCATION.md` for complete production routing via Cloudflare Tunnel.

---

*Last Updated: January 2026*
