# 🌞 Solarpunk Foundry - Deployment Guide

## Server Bootstrapping on Hetzner Bare-Metal

This guide will help you bootstrap your Hetzner server (95.217.198.239) to host the Solarpunk Foundry infrastructure.

---

## Prerequisites

- **Server**: Hetzner AX41-NVMe (Finland)
- **OS**: Ubuntu 24.04 LTS
- **Storage**: ZFS Mirror (rpool) already configured
- **Access**: Root SSH access with id_ed25519

## ZFS Datasets (Already Created)

```
/data/postgres  - PostgreSQL data (16k recordsize)
/data/builds    - Enclii build cache (LZ4 compression)
/data/assets    - Blob storage (150GB quota)
```

---

## 🚀 Quick Deployment

### Step 1: Connect to Server

```bash
ssh -i ~/.ssh/id_ed25519 root@95.217.198.239
```

### Step 2: Upload Deployment Scripts

From your local machine:
```bash
scp -i ~/.ssh/id_ed25519 bootstrap/*.sh root@95.217.198.239:/root/
```

### Step 3: Execute Deployment

On the server:
```bash
cd /root
chmod +x *.sh

# Execute in order:
./01-system-bootstrap.sh     # System hardening, Docker with ZFS
./02-enclii-deployment.sh     # Deploy Enclii PaaS
./03-janua-deployment.sh      # Deploy Janua Auth
./04-start-services.sh        # Start everything
```

---

## 📋 Detailed Steps

### Phase 1: System Bootstrap (01-system-bootstrap.sh)

**What it does:**
- Updates system packages
- Configures UFW firewall
- Installs Docker with ZFS storage driver (CRITICAL!)
- Creates service user and directories
- Sets up Docker networks

**Verification:**
```bash
# Check Docker is using ZFS
docker info | grep "Storage Driver: zfs"

# Check ZFS datasets
zfs list | grep rpool
```

### Phase 2: Enclii Deployment (02-enclii-deployment.sh)

**What it does:**
- Clones Enclii repository
- Creates ZFS datasets for registry and builds
- Generates secure secrets
- Builds Docker images
- Prepares systemd service

**Key Configurations:**
- API Port: 8001
- Registry Port: 5000
- Build cache: /data/builds
- Registry data: /data/registry

### Phase 3: Janua Deployment (03-janua-deployment.sh)

**What it does:**
- Clones Janua repository
- Configures PostgreSQL on ZFS (optimal settings)
- Generates JWT keys and secrets
- Builds Docker images
- Sets up shared PostgreSQL and Redis

**Key Configurations:**
- API Port: 8000
- PostgreSQL: /data/postgres (ZFS-backed)
- Redis: Shared instance with database separation

### Phase 4: Service Orchestration (04-start-services.sh)

**What it does:**
- Starts services in correct order
- Initializes databases
- Configures Enclii-Janua integration
- Verifies all services
- Creates convenience scripts

---

## 🔑 Required Environment Variables

These will be auto-generated, but you can customize them:

### Janua
```bash
JWT_SECRET          # 64-character hex string
COOKIE_SECRET       # 64-character hex string
DATABASE_URL        # postgresql://janua:password@postgres-shared:5432/janua_prod
REDIS_URL          # redis://redis-shared:6379/0
```

### Enclii
```bash
DATABASE_URL        # postgresql://enclii:password@postgres-shared:5432/enclii_prod
REDIS_URL          # redis://redis-shared:6379/1
JANUA_URL          # http://janua-api:8000
DOCKER_HOST        # unix:///var/run/docker.sock
```

---

## 📊 Service Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Hetzner Bare-Metal Server               │
│                      95.217.198.239                       │
├──────────────────────────────────────────────────────────┤
│                    ZFS Storage Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │/data/    │ │/data/    │ │/data/    │ │/data/    │  │
│  │postgres  │ │builds    │ │assets    │ │registry  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├──────────────────────────────────────────────────────────┤
│                    Docker (ZFS Driver)                    │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────────┐           ┌─────────────────┐      │
│  │     Janua       │           │     Enclii      │      │
│  │  (Port 8000)    │ ◄────────►│  (Port 8001)    │      │
│  └─────────────────┘           └─────────────────┘      │
│          │                              │                 │
│          ▼                              ▼                 │
│  ┌────────────────────────────────────────────────┐     │
│  │         Shared Infrastructure                    │     │
│  │  PostgreSQL (5432)  |  Redis (6379)            │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Post-Deployment Checklist

- [ ] All services responding on health endpoints
- [ ] PostgreSQL on ZFS dataset (/data/postgres)
- [ ] Docker using ZFS storage driver
- [ ] Firewall configured and active
- [ ] Secrets generated and stored securely
- [ ] Admin user created in Janua
- [ ] Convenience scripts available

---

## 🔧 Management Commands

### Check Status
```bash
/opt/solarpunk/scripts/status.sh
```

### View Logs
```bash
# All logs
/opt/solarpunk/scripts/logs.sh all

# Specific service
/opt/solarpunk/scripts/logs.sh janua
/opt/solarpunk/scripts/logs.sh enclii
```

### Health Checks
```bash
/opt/solarpunk/janua/health-check.sh
/opt/solarpunk/enclii/health-check.sh
```

### Restart Services
```bash
/opt/solarpunk/scripts/restart.sh all
```

### ZFS Operations
```bash
# Check datasets
zfs list -t filesystem | grep rpool

# Create snapshot
zfs snapshot -r rpool@$(date +%Y%m%d)

# Check compression ratio
zfs get compressratio rpool/builds
```

---

## 🌐 Access URLs

### MADFAM Standard Port Allocation

Per the [PORT_ALLOCATION.md](../../docs/PORT_ALLOCATION.md), services use 100-port blocks:

| Service | Internal Port | External Port | Domain (via Cloudflare) |
|---------|---------------|---------------|-------------------------|
| Janua API | 8000 | **4100** | api.janua.dev |
| Janua Dashboard | 3000 | **4101** | app.janua.dev |
| Janua Admin | 3000 | **4102** | admin.janua.dev |
| Janua Docs | 3000 | **4103** | docs.janua.dev |
| Janua Website | 3000 | **4104** | janua.dev |
| Enclii API | 8001 | **4200** | api.enclii.madfam.io |
| Enclii Dashboard | 3000 | **4201** | enclii.madfam.io |

### Direct IP Access (Development/Debug Only)

| Service | Direct URL | Notes |
|---------|------------|-------|
| Janua API | http://95.217.198.239:4100 | Use Cloudflare Tunnel in production |
| Janua Dashboard | http://95.217.198.239:4101 | Use Cloudflare Tunnel in production |
| Enclii API | http://95.217.198.239:4200 | Use Cloudflare Tunnel in production |
| PostgreSQL | localhost:5432 | Internal only, not exposed |
| Redis | localhost:6379 | Internal only, not exposed |

> **Production**: All traffic should route through Cloudflare Tunnel for SSL termination, DDoS protection, and Zero Trust access policies.

---

## 🔐 Security Notes

### Secrets Management
- **Secrets Location**: `/opt/solarpunk/secrets/`
- **JWT Keys**: `/opt/solarpunk/janua/keys/`
- **Default Admin**: admin@madfam.io (CHANGE PASSWORD!)

### SSH Security (Critical)

**After initial setup, harden SSH access:**

```bash
# 1. Run the SSH hardening script
./05-ssh-hardening.sh

# 2. Once Cloudflare Zero Trust SSH is configured:
# Close port 22 to internet (SSH only via Cloudflare Tunnel)
ufw delete allow 22/tcp
```

**Zero Trust SSH Access** (Recommended for production):
- Access via: `ssh.madfam.io` (through Cloudflare Tunnel)
- Authentication: GitHub OAuth via Zero Trust
- Audit: All SSH sessions logged in Cloudflare dashboard
- See: `infrastructure/terraform/cloudflare.tf` for configuration

### Firewall Configuration
- Only necessary ports open via UFW
- Application ports (4100-4299) should route through Cloudflare Tunnel
- Direct IP access should be disabled after Cloudflare Tunnel is active

### Backup Strategy
- ZFS snapshots for instant rollback
- Regular PostgreSQL dumps for offsite backup

---

## 📝 Next Steps

1. **Configure DNS**:
   - Point auth.madfam.io to 95.217.198.239
   - Point enclii.madfam.io to 95.217.198.239

2. **SSL Certificates**:
   ```bash
   # Traefik will handle Let's Encrypt automatically
   # Just update the domain configuration
   ```

3. **Backup Strategy**:
   ```bash
   # Daily ZFS snapshots
   0 2 * * * /usr/sbin/zfs snapshot -r rpool@$(date +\%Y\%m\%d)

   # Weekly PostgreSQL dumps
   0 3 * * 0 docker exec postgres-shared pg_dumpall -U postgres > /backup/pg_$(date +\%Y\%m\%d).sql
   ```

4. **Monitoring**:
   - Set up Prometheus/Grafana
   - Configure alerts
   - Monitor ZFS health

5. **Deploy Additional Services**:
   - Fortuna (Problem Intelligence)
   - ForgeSight (Manufacturing Costs)
   - Dhanam (Finance Platform)
   - AVALA (Learning Platform)

---

## 🆘 Troubleshooting

### Docker not using ZFS?
```bash
systemctl stop docker
rm -rf /var/lib/docker/*
systemctl start docker
docker info | grep "Storage Driver"
```

### PostgreSQL not starting?
```bash
# Check ZFS dataset
zfs list rpool/postgres

# Check permissions
ls -la /data/postgres

# Check logs
docker logs postgres-shared
```

### Service not accessible?
```bash
# Check firewall
ufw status

# Check container
docker ps
docker logs <container-name>

# Check network
docker network ls
docker network inspect solarpunk-network
```

---

## 📚 Documentation

- **Enclii Repo**: https://github.com/madfam-io/enclii
- **Janua Repo**: https://github.com/madfam-io/janua
- **Foundry Docs**: See solarpunk-foundry/docs/

---

*The Solarpunk Foundry - From Bits to Atoms. High Tech, Deep Roots.*