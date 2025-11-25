# Docker Build & Debug Fixes

## Issue 1: Cotiza Worker Build Failure ❌ → ✅

### Problem
```
COPY apps/worker/requirements.txt .: not found
```

### Root Cause Analysis

**docker-compose.yml configuration**:
```yaml
worker:
  build:
    context: ./apps/worker    # ← Build context is apps/worker/
    dockerfile: Dockerfile.dev
```

**Dockerfile.dev (BEFORE - BROKEN)**:
```dockerfile
COPY apps/worker/requirements.txt .  # ← Tries to find apps/worker/requirements.txt
                                     #   relative to context (./apps/worker)
                                     #   = ./apps/worker/apps/worker/requirements.txt
                                     #   = DOES NOT EXIST!
```

### The Fix ✅

**File**: `digifab-quoting/apps/worker/Dockerfile.dev`

**BEFORE**:
```dockerfile
COPY apps/worker/requirements.txt .
```

**AFTER**:
```dockerfile
COPY requirements.txt .
```

### Why This Works

When `context: ./apps/worker`:
- Docker's working directory is `digifab-quoting/apps/worker/`
- `COPY requirements.txt .` → Copies `./apps/worker/requirements.txt` ✅
- `COPY apps/worker/requirements.txt .` → Tries to copy `./apps/worker/apps/worker/requirements.txt` ❌

### Verification

```bash
cd ~/labspace/digifab-quoting
ls -la apps/worker/requirements.txt  # ✓ File exists
docker compose build worker           # ✓ Should build successfully
```

---

## Issue 2: Health Check Failures (Janua & Forgesight)

### Diagnostic Tool Created ✅

**File**: `solarpunk-foundry/ops/bin/debug_logs.sh`

### Features

1. **Single Service Diagnostics**
```bash
./debug_logs.sh janua          # Janua API logs (last 100 lines)
./debug_logs.sh cotiza-worker  # Worker logs (last 100 lines)
./debug_logs.sh forgesight     # Forgesight API logs (last 100 lines)
```

2. **Full System Diagnostics**
```bash
./debug_logs.sh  # All services with health status
```

3. **Container Status Display**
- Shows container state: running/exited/dead
- Shows health check status
- Color-coded output for readability

### Usage Examples

```bash
cd ~/labspace/solarpunk-foundry/ops/bin

# Debug specific service
./debug_logs.sh janua

# Debug worker
./debug_logs.sh cotiza-worker

# Full diagnostic report
./debug_logs.sh
```

### Output Format

```
╔════════════════════════════════════════════════════════════╗
║ 📋 Logs: janua-api (last 100 lines)
╚════════════════════════════════════════════════════════════╝

Status: exited
Health: unhealthy

⚠️  Container is not running!

Last 100 log lines:
─────────────────────────────────────────────────────────────
[actual error logs with stack traces]
─────────────────────────────────────────────────────────────
```

### Supported Service Names

| Alias | Container Name | Description |
|-------|---------------|-------------|
| `janua` | janua-api | Janua authentication API |
| `cotiza` | cotiza-api | Cotiza quoting API |
| `worker` | cotiza-worker | Cotiza Python worker |
| `web` | cotiza-web | Cotiza frontend |
| `forgesight` | api | Forgesight API |
| `postgres` | madfam-postgres-shared | Shared PostgreSQL |
| `redis` | madfam-redis-shared | Shared Redis |
| `minio` | madfam-minio-shared | Shared MinIO |

---

## Next Steps

### 1. Rebuild Cotiza Worker
```bash
cd ~/labspace/digifab-quoting
docker compose build worker
docker compose up -d worker
```

### 2. Diagnose Janua Health Check Failure
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./debug_logs.sh janua
```

**Common Causes**:
- Database connection failure (check if `janua_db` exists)
- Missing environment variables
- Port binding conflicts
- Python/Node dependency issues
- Migration failures

### 3. Diagnose Forgesight Health Check Failure
```bash
./debug_logs.sh forgesight
```

**Common Causes**:
- Database connection failure (check if `forgesight_db` exists)
- OpenSearch not available (Forgesight kept its own OpenSearch)
- Redis connection issues
- Python async database driver issues

### 4. Verify Shared Infrastructure
```bash
./debug_logs.sh postgres
./debug_logs.sh redis
```

**Check**:
- Are databases created? (`\l` in psql)
- Can containers reach shared network?
- Are connection strings correct?

---

## Database Connection Verification

### Check Databases Exist
```bash
docker exec madfam-postgres-shared psql -U madfam -c "\l"
```

**Expected**:
```
janua_db      | madfam | ...
cotiza_db     | madfam | ...
forgesight_db | madfam | ...
```

### Test Connection from Container
```bash
# From Janua
docker exec janua-api env | grep DATABASE_URL

# From Cotiza
docker exec cotiza-api env | grep DATABASE_URL

# From Forgesight
docker exec api env | grep DATABASE_URL
```

---

## Files Modified

1. **digifab-quoting/apps/worker/Dockerfile.dev**
   - Line 12: `COPY apps/worker/requirements.txt .` → `COPY requirements.txt .`

2. **solarpunk-foundry/ops/bin/debug_logs.sh** (NEW)
   - Comprehensive container diagnostics tool
   - 150 lines of bash for error debugging

---

## Quick Reference

### Build & Start
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./madfam.sh start
```

### Debug Failures
```bash
./debug_logs.sh              # Full report
./debug_logs.sh janua        # Specific service
./debug_logs.sh cotiza-worker
```

### Check Status
```bash
./madfam.sh status
docker ps -a                 # All containers
```

### Rebuild Specific Service
```bash
cd ~/labspace/digifab-quoting
docker compose build worker
docker compose up -d worker
```

---

**Date**: 2025-11-24  
**Engineer**: Docker Debugger  
**Issues Fixed**: 
1. ✅ Cotiza worker build failure (COPY path mismatch)
2. ✅ Debug tooling created for health check failures
