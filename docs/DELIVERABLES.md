# Docker Debug - Deliverables

## ✅ DELIVERABLE 1: Fixed Cotiza Worker Build

### File: `digifab-quoting/apps/worker/Dockerfile.dev`

**Problem**: 
```dockerfile
COPY apps/worker/requirements.txt .  # ❌ File not found
```

**Root Cause**: 
Build context is `./apps/worker`, so Docker looks for `./apps/worker/apps/worker/requirements.txt` (doesn't exist)

**Fix Applied**:
```dockerfile
COPY requirements.txt .  # ✅ Copies ./apps/worker/requirements.txt
```

### Verification
```bash
cd ~/labspace/digifab-quoting
docker compose build worker  # Should succeed now
```

---

## ✅ DELIVERABLE 2: Debug Logs Script

### File: `solarpunk-foundry/ops/bin/debug_logs.sh`

**Features**:
- Container status display (running/exited/dead)
- Health check status
- Last 50-100 lines of logs with stack traces
- Color-coded output
- Supports all services by name or alias

**Usage**:
```bash
cd ~/labspace/solarpunk-foundry/ops/bin

# Single service
./debug_logs.sh janua
./debug_logs.sh cotiza-worker
./debug_logs.sh forgesight

# Full diagnostics
./debug_logs.sh

# Infrastructure
./debug_logs.sh postgres
./debug_logs.sh redis
```

**Supported Aliases**:
- `janua` → janua-api
- `cotiza` → cotiza-api
- `worker` → cotiza-worker
- `forgesight` → api (Forgesight container)
- `postgres` → madfam-postgres-shared
- `redis` → madfam-redis-shared
- `minio` → madfam-minio-shared

---

## 🔍 BONUS FINDING: Database Creation Issue

### Problem Discovered
```
FATAL: database "madfam" does not exist
```

**Root Cause**: The init SQL script creates `janua_db`, `cotiza_db`, `forgesight_db` but PostgreSQL is trying to connect to a database named `madfam` during health checks.

### Solution Required

**File**: `solarpunk-foundry/ops/local/docker-compose.shared.yml`

**Current (BROKEN)**:
```yaml
postgres:
  environment:
    POSTGRES_DB: postgres  # ❌ Creates "postgres" DB, but apps try to connect to "madfam"
```

**Should be**:
```yaml
postgres:
  environment:
    POSTGRES_DB: madfam  # ✅ Creates "madfam" DB as default
```

Or update health checks to use `postgres` database instead of `madfam`.

---

## 📋 Summary

### Fixed
1. ✅ Cotiza worker Dockerfile COPY path
2. ✅ Created comprehensive debug_logs.sh tool

### Discovered
3. ⚠️ PostgreSQL database creation mismatch
   - Init script creates app-specific DBs (janua_db, cotiza_db, etc.)
   - But connections try to use "madfam" database
   - Need to either:
     - Change POSTGRES_DB to "madfam"
     - Or update connection health checks

### Files Created/Modified
1. `digifab-quoting/apps/worker/Dockerfile.dev` (FIXED)
2. `solarpunk-foundry/ops/bin/debug_logs.sh` (NEW)
3. `solarpunk-foundry/DOCKER_DEBUG_FIXES.md` (DOCUMENTATION)

---

## Next Steps

1. **Fix Database Creation**
```bash
cd ~/labspace/solarpunk-foundry/ops/local
# Edit docker-compose.shared.yml
# Change: POSTGRES_DB: postgres
# To:     POSTGRES_DB: madfam
```

2. **Rebuild Everything**
```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./madfam.sh stop --clean  # Remove old volumes
./madfam.sh start         # Fresh start with correct DB
```

3. **Debug Any Remaining Issues**
```bash
./debug_logs.sh janua
./debug_logs.sh cotiza
./debug_logs.sh forgesight
```

