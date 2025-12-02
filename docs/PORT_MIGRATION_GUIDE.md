# Port Migration Guide

Step-by-step guide for migrating services from legacy ports to the unified 4xxx-5xxx standard.

---

## Overview

The MADFAM ecosystem is standardizing on port allocation per `docs/PORT_ALLOCATION.md`. This guide covers migrating existing services from their current ports to the new standard.

---

## Migration Priority

| Priority | Service | Current Ports | Target Ports | Complexity |
|----------|---------|---------------|--------------|------------|
| 1 | **Janua** | 8000, 8010, 3001 | 4100-4104 | HIGH |
| 2 | **Enclii** | 8080, 3000 | 4200-4201 | MEDIUM |
| 3 | **AVALA** | 4900, 3060 | 4600-4601 | LOW |
| 4 | **Dhanam** | 4000, 3000 | 4700-4701 | MEDIUM |
| 5 | **Coforma** | 5100 | 5050-5051 | LOW |

---

## Pre-Migration Checklist

- [ ] Read the full `PORT_ALLOCATION.md` standard
- [ ] Identify all places where ports are configured (see checklist below)
- [ ] Create a feature branch: `git checkout -b chore/port-migration`
- [ ] Notify team members of planned migration
- [ ] Schedule a maintenance window (for production)
- [ ] Backup current configurations

---

## Files to Update Per Service

### 1. Docker Configuration

```bash
# docker-compose.yml / docker-compose.production.yml
services:
  service-name:
    ports:
      - "NEW_PORT:INTERNAL_PORT"  # Update external port
```

### 2. Environment Files

```bash
# .env, .env.local, .env.production
API_URL=http://localhost:NEW_PORT
NEXT_PUBLIC_API_URL=http://localhost:NEW_PORT
```

### 3. CLAUDE.md

Update the Port Allocation section to match the new standard.

### 4. Application Code

Search for hardcoded ports:

```bash
# Find all port references
grep -rn "8000\|8010\|3001\|3000" --include="*.ts" --include="*.tsx" --include="*.py" --include="*.yml" .
```

### 5. Cloudflare Tunnel (if applicable)

Update `/etc/cloudflared/config.yml` on the server:

```yaml
ingress:
  - hostname: api.service.dev
    service: http://localhost:NEW_PORT
```

### 6. CI/CD Workflows

Update GitHub Actions:

```yaml
# .github/workflows/*.yml
env:
  API_URL: http://localhost:NEW_PORT
```

### 7. Documentation

Update any README files or docs that reference ports.

---

## Janua Migration (Priority 1)

### Current State

| Service | Current Port | Target Port |
|---------|-------------|-------------|
| API | 8000 | 4100 |
| Dashboard | 8010 | 4101 |
| Website | 3001 | 4104 |
| Docs | 3001 (shared) | 4103 |

### Files to Update

1. **deployment/production/docker-compose.production.yml**
   ```yaml
   janua-api:
     ports:
       - "4100:8000"  # Internal port stays 8000 (FastAPI)

   janua-dashboard:
     ports:
       - "4101:3000"  # Internal port stays 3000 (Next.js)

   janua-website:
     ports:
       - "4104:3000"  # Internal port stays 3000 (Next.js)
   ```

2. **deployment/production/README.md**
   - Update all port references
   - Update Cloudflare tunnel documentation

3. **Server: /etc/cloudflared/config.yml**
   ```yaml
   ingress:
     - hostname: api.janua.dev
       service: http://localhost:4100
     - hostname: app.janua.dev
       service: http://localhost:4101
     - hostname: janua.dev
       service: http://localhost:4104
     - hostname: www.janua.dev
       service: http://localhost:4104
   ```

4. **Restart Cloudflare tunnel**
   ```bash
   systemctl restart cloudflared
   ```

### Migration Commands

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@95.217.198.239

# Pull latest code
cd /opt/solarpunk/janua
git pull origin main

# Update tunnel config
nano /etc/cloudflared/config.yml
# Change localhost:8000 → localhost:4100
# Change localhost:8010 → localhost:4101
# Change localhost:3001 → localhost:4104

# Restart tunnel
systemctl restart cloudflared

# Rebuild and restart containers
docker-compose -f deployment/production/docker-compose.production.yml down
docker-compose -f deployment/production/docker-compose.production.yml up -d --build

# Verify
curl http://localhost:4100/health
curl http://localhost:4101/health
curl http://localhost:4104/health
```

---

## AVALA Migration (Priority 3)

### Current State

| Service | Current Port | Target Port |
|---------|-------------|-------------|
| API | 4900 | 4600 |
| Web | 3060 | 4601 |

### Files to Update

1. **docker-compose.yml**
2. **.env / .env.local**
3. **CLAUDE.md**
4. **package.json scripts** (if ports are in npm scripts)

### Migration Commands

```bash
cd ~/labspace/avala
git checkout -b chore/port-migration

# Update docker-compose.yml ports
# Update .env files
# Update CLAUDE.md

git add -A
git commit -m "chore: migrate ports to ecosystem standard (4600/4601)"
git push origin chore/port-migration
```

---

## Dhanam Migration (Priority 4)

### Current State

| Service | Current Port | Target Port |
|---------|-------------|-------------|
| API | 4000 | 4700 |
| Web | 3000 | 4701 |

### Special Considerations

- Port 3000 conflicts with React defaults - high priority to change
- LocalStack at 4566 can stay (not in conflict range)

---

## Coforma Migration (Priority 5)

### Current State

| Service | Current Port | Target Port |
|---------|-------------|-------------|
| Full App | 5100 | 5050 (API), 5051 (Web) |

### Special Considerations

- May need to split into separate API/Web containers
- Meilisearch stays at 7700 (not in conflict range)

---

## Verification Checklist

After migration, verify:

- [ ] Service starts without port conflicts
- [ ] Health endpoints respond: `curl http://localhost:PORT/health`
- [ ] External domains work (if applicable)
- [ ] Inter-service communication works
- [ ] No hardcoded old ports in logs/errors
- [ ] CI/CD pipelines pass
- [ ] Documentation is updated

---

## Rollback Procedure

If migration fails:

```bash
# Revert code changes
git checkout main

# Revert tunnel config (if changed)
# Restore from backup or revert changes

# Restart services with old config
docker-compose down
docker-compose up -d

# Verify old ports work
curl http://localhost:OLD_PORT/health
```

---

## Post-Migration

1. **Update ecosystem memory**: Write a Serena memory noting migration complete
2. **Close tracking issue**: If a GitHub issue tracks this work
3. **Notify team**: Send update about new port assignments
4. **Update monitoring**: Ensure Prometheus/Grafana dashboards use new ports

---

## FAQ

**Q: Do I need to change internal container ports?**
A: No, only the external (host) port mapping needs to change. Internal ports (what the app listens on inside the container) can stay the same.

**Q: What if a port is already in use?**
A: Check with `lsof -i :PORT`. Kill the conflicting process or change its port first.

**Q: Can I migrate incrementally?**
A: Yes, but ensure all references are updated together to avoid partial failures.

---

*Last updated: 2025-12-02*
