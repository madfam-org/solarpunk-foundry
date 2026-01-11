# MADFAM Infrastructure Status

> **Last Verified**: January 11, 2026
> **Environment**: Local + Production (foundry-core)

## Quick Reference

### Local Development

```bash
# Start everything with single command
enclii local up

# Or start only infrastructure
enclii local infra

# Check status
enclii local status

# Stop everything
enclii local down
```

### Production Access

```bash
ssh ssh.madfam.io
sudo kubectl get pods -A --kubeconfig=/etc/rancher/k3s/k3s.yaml
```

---

## Local Environment Status

### Infrastructure (Docker Compose)

| Service | Container | Port | Status |
|---------|-----------|------|--------|
| PostgreSQL | madfam-postgres-shared | 5432 | ✅ Healthy |
| Redis | madfam-redis-shared | 6379 | ✅ Healthy |
| MinIO API | madfam-minio-shared | 9000 | ✅ Healthy |
| MinIO Console | madfam-minio-shared | 9001 | ✅ Healthy |
| MailHog SMTP | madfam-mailhog | 1025 | ✅ Running |
| MailHog UI | madfam-mailhog | 8025 | ✅ Running |

### Connection Credentials (Local)

```bash
# PostgreSQL (multi-tenant)
postgres://madfam:madfam_dev_password@localhost:5432/

# Per-app databases:
postgres://janua:janua_dev@localhost:5432/janua_dev
postgres://enclii:enclii_dev@localhost:5432/enclii_dev

# Redis (with auth)
redis://:redis_dev_password@localhost:6379

# MinIO
http://localhost:9000 (minioadmin/minioadmin)
http://localhost:9001 (Console)

# MailHog
smtp://localhost:1025
http://localhost:8025 (Web UI)
```

### Databases Created

| Database | User | Password | Purpose |
|----------|------|----------|---------|
| janua_dev | janua | janua_dev | Auth platform |
| enclii_dev | enclii | enclii_dev | DevOps platform |
| forgesight_dev | forgesight | forgesight_dev | Manufacturing intel |
| fortuna_dev | fortuna | fortuna_dev | Problem intel |
| cotiza_dev | cotiza | cotiza_dev | Quoting engine |
| avala_dev | avala | avala_dev | Learning verification |
| dhanam_dev | dhanam | dhanam_dev | Budget tracking |
| sim4d_dev | sim4d | sim4d_dev | CAD platform |
| forj_dev | forj | forj_dev | Fabrication |

---

## Janua Services

### Local Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| API | 4100 | http://localhost:4100 | ✅ Healthy |
| Dashboard | 4101 | http://localhost:4101 | ✅ Running |
| Admin | 4102 | http://localhost:4102 | ✅ Running |
| Docs | 4103 | http://localhost:4103 | ✅ Running |
| Website | 4104 | http://localhost:4104 | ✅ Running |

### Production Pods

| Pod | Status | Age | Namespace |
|-----|--------|-----|-----------|
| janua-api-5db7596c86-vvdkf | Running | ~2h | janua |
| janua-dashboard-f76b4ff57-9zrlk | Running | 3d | janua |
| janua-admin-5d9b8f8749-xc8kf | Running | 3d | janua |
| janua-docs-65cbf57b86-bqxrw | Running | 27h | janua |
| janua-website-c7bd5747c-8phqm | Running | 3d | janua |

### Production Endpoints

| Service | URL | Status |
|---------|-----|--------|
| API | https://api.janua.dev/health | ✅ Healthy |
| Website | https://janua.dev | ✅ HTTP 200 |
| Dashboard | https://app.janua.dev | ✅ HTTP 200 |
| Admin | https://admin.janua.dev | ✅ HTTP 200 |
| Docs | https://docs.janua.dev | ✅ HTTP 200 |
| Auth Alias | https://auth.madfam.io | ✅ Same as API |

---

## Enclii Services

### Local Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Switchyard API | 4200 | http://localhost:4200 | ✅ Healthy |
| UI | 4201 | http://localhost:4201 | ❌ Not started |

### Production Pods

| Pod | Status | Age | Namespace |
|-----|--------|-----|-----------|
| switchyard-api-67db978596-57ck8 | Running | 20h | enclii |
| switchyard-ui-7fd79848cf-xfqd2 | Running | 20h | enclii |
| enclii-landing-9d6685b8b-6pk86 | Running | 2d | enclii |

---

## Production Infrastructure

### Server Details

| Property | Value |
|----------|-------|
| Hostname | foundry-core |
| IP | 95.217.198.239 |
| SSH Access | ssh.madfam.io |
| Provider | Hetzner Cloud |
| K8s Distribution | K3s (single-node) |

### Cloudflare Tunnel

| Tunnel | Status | Purpose |
|--------|--------|---------|
| foundry-prod | ✅ Active (2h 52m) | SSH access, API routing |
| janua-prod | ✅ Active | Janua service routing |

### SystemD Services

| Service | Status | Purpose |
|---------|--------|---------|
| cloudflared.service | Active | Cloudflare tunnel connector |
| janua-port-forward.service | Active | kubectl port-forward for API |

### Kubernetes Resources

```bash
# Namespaces
kubectl get ns
# - janua
# - enclii
# - kube-system

# All pods
kubectl get pods -A

# Janua services
kubectl get svc -n janua
# NAME        TYPE        CLUSTER-IP     PORT(S)
# janua-api   ClusterIP   10.43.79.234   4100/TCP
```

---

## CLI Commands Reference

### enclii local

```bash
# Start full environment (infra + all apps)
enclii local up

# Start only infrastructure
enclii local infra

# Start specific services
enclii local up janua
enclii local up enclii
enclii local up janua enclii

# Check status
enclii local status

# View logs
enclii local logs
enclii local logs postgres
enclii local logs -f  # follow

# Stop everything
enclii local down
enclii local down --keep-infra  # keep databases running
```

### Environment Variables for Manual Start

```bash
# Janua API
DATABASE_URL=postgresql://janua:janua_dev@localhost:5432/janua_dev
REDIS_URL=redis://localhost:6379/0
ADMIN_BOOTSTRAP_PASSWORD='YS9V9CK!qmR2s&'

# Enclii API
ENCLII_DATABASE_URL=postgres://enclii:enclii_dev@localhost:5432/enclii_dev?sslmode=disable
ENCLII_REDIS_HOST=localhost
ENCLII_REDIS_PORT=6379
ENCLII_REDIS_PASSWORD=redis_dev_password
ENCLII_AUTH_MODE=local
```

---

## File Locations

### Docker Compose

```
~/labspace/solarpunk-foundry/ops/local/docker-compose.shared.yml
~/labspace/solarpunk-foundry/ops/local/init-databases.sql
```

### CLI Source

```
~/labspace/enclii/packages/cli/internal/cmd/local.go
```

### Kubernetes Manifests

```
~/labspace/janua/k8s/
~/labspace/enclii/k8s/
```

---

## Troubleshooting

### Docker containers not starting

```bash
# Check Docker is running
docker ps

# Restart infrastructure
cd ~/labspace/solarpunk-foundry/ops/local
docker compose -f docker-compose.shared.yml down
docker compose -f docker-compose.shared.yml up -d
```

### PostgreSQL connection refused

```bash
# Check container is healthy
docker exec madfam-postgres-shared pg_isready -U madfam

# Check databases exist
docker exec madfam-postgres-shared psql -U madfam -c "\l"
```

### Redis authentication error

```bash
# Test with password
docker exec madfam-redis-shared redis-cli -a redis_dev_password ping
# Expected: PONG
```

### Port already in use

```bash
# Find process using port
lsof -i :4100

# Kill if needed
kill -9 <PID>
```

---

*Last updated: January 11, 2026*
