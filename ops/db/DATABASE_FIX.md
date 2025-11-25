# Database Creation Fix

## Issue Discovered
While testing the debug_logs.sh script, PostgreSQL logs showed repeated errors:
```
FATAL: database "madfam" does not exist
```

## Root Cause
The init script created only app-specific databases:
- janua_db
- cotiza_db
- forgesight_db
- dhanam_db
- avala_db
- fortuna_db
- blueprint_db

However, no "madfam" core database was created. This caused issues when:
1. Legacy code referenced the "madfam" database
2. Health checks or connection poolers tried to connect to default "madfam" database
3. Admin tools expected a core operational database

## Fix Applied
Updated `init-shared-dbs.sql` to create "madfam" database:

```sql
-- Madfam Core Database (for shared/legacy references)
CREATE DATABASE madfam OWNER madfam;

-- Extensions
\c madfam
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Privileges
GRANT ALL PRIVILEGES ON DATABASE madfam TO madfam;
```

## Database Architecture
After fix, the shared PostgreSQL instance contains:

| Database | Purpose |
|----------|---------|
| postgres | PostgreSQL default (required) |
| madfam | Core/shared operational database |
| janua_db | Authentication platform |
| cotiza_db | Quoting platform |
| forgesight_db | Vendor intelligence |
| dhanam_db | Financial platform |
| avala_db | Procurement platform |
| fortuna_db | NLP platform |
| blueprint_db | Harvester data |

## Testing the Fix
To apply the fix, rebuild the shared infrastructure:

```bash
# Stop and clean shared infrastructure
./madfam.sh stop --clean

# Start with new init script
./madfam.sh start

# Verify databases created
docker exec -it madfam-postgres-shared psql -U madfam -c "\l"
```

Expected output should show all databases including "madfam".

## Migration Notes
- **Zero downtime**: Apps using app-specific databases (janua_db, cotiza_db, etc.) are unaffected
- **Backwards compatible**: Legacy code referencing "madfam" database will now work
- **No data loss**: Volume-backed databases persist through recreations (unless --clean used)
- **Extensions**: All databases have uuid-ossp and pgcrypto extensions enabled
