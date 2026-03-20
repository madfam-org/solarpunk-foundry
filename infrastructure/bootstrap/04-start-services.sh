#!/bin/bash
set -euo pipefail

# Solarpunk Foundry - Service Orchestration Script
# Purpose: Start all services in correct order with health checks

echo "==============================================="
echo "  SOLARPUNK FOUNDRY - SERVICE ORCHESTRATION"
echo "  Phase 4: Starting the Ecosystem"
echo "==============================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root"
   exit 1
fi

# Function to wait for service
wait_for_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=30
    local attempt=0

    log_info "Waiting for $service_name to be ready..."

    while [ $attempt -lt $max_attempts ]; do
        if eval "$check_command" &>/dev/null; then
            log_info "$service_name is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    log_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# 1. Start shared infrastructure first (PostgreSQL & Redis)
log_step "Starting shared infrastructure services..."

cd /opt/solarpunk/janua

# Start only PostgreSQL and Redis first
docker-compose -f docker-compose.production.yml up -d postgres-shared redis-shared

# Wait for PostgreSQL
wait_for_service "PostgreSQL" "docker exec postgres-shared pg_isready -U postgres"

# Wait for Redis
wait_for_service "Redis" "docker exec redis-shared redis-cli ping"

# 2. Initialize databases
log_step "Initializing databases..."

# Source the init variables
source ./init-vars.sh

# Initialize databases using psql
docker exec -i postgres-shared psql -U postgres << EOF
-- Create Janua database and user
CREATE DATABASE IF NOT EXISTS janua_prod;
CREATE USER IF NOT EXISTS janua WITH ENCRYPTED PASSWORD '${janua_password}';
GRANT ALL PRIVILEGES ON DATABASE janua_prod TO janua;

-- Create Enclii database and user
CREATE DATABASE IF NOT EXISTS enclii_prod;
CREATE USER IF NOT EXISTS enclii WITH ENCRYPTED PASSWORD '${enclii_password}';
GRANT ALL PRIVILEGES ON DATABASE enclii_prod TO enclii;

-- Enable extensions in Janua database
\c janua_prod;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOF

log_info "Databases initialized"

# 3. Start Janua (Authentication must be up first)
log_step "Starting Janua services..."

docker-compose -f docker-compose.production.yml up -d api dashboard admin

# Wait for Janua API
wait_for_service "Janua API" "curl -f http://localhost:8000/health"

log_info "Janua is running"

# 4. Configure Enclii to use Janua
log_step "Configuring Enclii with Janua integration..."

cd /opt/solarpunk/enclii

# Update Enclii's environment with Janua's actual URL
sed -i "s|JANUA_URL=.*|JANUA_URL=http://janua-api:8000|g" .env.production

# Load Janua client secret from saved secrets
source /opt/solarpunk/secrets/janua-secrets.env
sed -i "s|JANUA_CLIENT_SECRET=.*|JANUA_CLIENT_SECRET=${JANUA_JWT_SECRET}|g" .env.production

# 5. Start Enclii services
log_step "Starting Enclii services..."

docker-compose -f docker-compose.production.yml up -d

# Wait for Enclii API
wait_for_service "Enclii API" "curl -f http://localhost:8001/health"

# Wait for Registry
wait_for_service "Docker Registry" "curl -f http://localhost:5000/v2/"

log_info "Enclii is running"

# 6. Verify all services
log_step "Verifying all services..."

echo ""
echo "Service Status:"
echo "==============="

# Check each service
services=(
    "postgres-shared:PostgreSQL:docker exec postgres-shared pg_isready"
    "redis-shared:Redis:docker exec redis-shared redis-cli ping"
    "janua-api:Janua API:curl -sf http://localhost:8000/health"
    "janua-dashboard:Janua Dashboard:curl -sf http://localhost:8010"
    "enclii-api:Enclii API:curl -sf http://localhost:8001/health"
    "enclii-registry:Docker Registry:curl -sf http://localhost:5000/v2/"
)

all_healthy=true

for service_info in "${services[@]}"; do
    IFS=: read -r container_name display_name check_cmd <<< "$service_info"

    echo -n "$display_name: "
    if eval "$check_cmd" &>/dev/null; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${RED}✗ Not responding${NC}"
        all_healthy=false
    fi
done

# 7. Display connection information
echo ""
echo "==============================================="
echo "  DEPLOYMENT COMPLETE!"
echo "==============================================="
echo ""
echo "Access Points:"
echo "--------------"
echo "Janua API:        http://95.217.198.239:8000"
echo "Janua Dashboard:  http://95.217.198.239:8010"
echo "Janua Admin:      http://95.217.198.239:8011"
echo "Enclii API:       http://95.217.198.239:8001"
echo "Enclii UI:        http://95.217.198.239:8030"
echo "Docker Registry:  http://95.217.198.239:5000"
echo ""
echo "Health Checks:"
echo "--------------"
echo "Janua:  /opt/solarpunk/janua/health-check.sh"
echo "Enclii: /opt/solarpunk/enclii/health-check.sh"
echo ""
echo "Logs:"
echo "-----"
echo "Janua:  docker-compose -f /opt/solarpunk/janua/docker-compose.production.yml logs -f"
echo "Enclii: docker-compose -f /opt/solarpunk/enclii/docker-compose.production.yml logs -f"
echo ""

# 8. Create convenience scripts
log_step "Creating convenience scripts..."

# Create status script
cat > /opt/solarpunk/scripts/status.sh << 'EOF'
#!/bin/bash
echo "Solarpunk Foundry Status"
echo "========================"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "ZFS Datasets:"
zfs list -t filesystem | grep rpool
EOF

# Create logs script
cat > /opt/solarpunk/scripts/logs.sh << 'EOF'
#!/bin/bash
service=${1:-all}
case $service in
    janua)
        docker-compose -f /opt/solarpunk/janua/docker-compose.production.yml logs -f
        ;;
    enclii)
        docker-compose -f /opt/solarpunk/enclii/docker-compose.production.yml logs -f
        ;;
    all)
        docker-compose -f /opt/solarpunk/janua/docker-compose.production.yml logs -f &
        docker-compose -f /opt/solarpunk/enclii/docker-compose.production.yml logs -f
        ;;
    *)
        echo "Usage: $0 [janua|enclii|all]"
        ;;
esac
EOF

# Create restart script
cat > /opt/solarpunk/scripts/restart.sh << 'EOF'
#!/bin/bash
service=${1:-all}
case $service in
    janua)
        cd /opt/solarpunk/janua
        docker-compose -f docker-compose.production.yml restart
        ;;
    enclii)
        cd /opt/solarpunk/enclii
        docker-compose -f docker-compose.production.yml restart
        ;;
    all)
        cd /opt/solarpunk/janua
        docker-compose -f docker-compose.production.yml restart
        cd /opt/solarpunk/enclii
        docker-compose -f docker-compose.production.yml restart
        ;;
    *)
        echo "Usage: $0 [janua|enclii|all]"
        ;;
esac
EOF

chmod +x /opt/solarpunk/scripts/*.sh

# 9. Create first admin user in Janua
log_step "Creating first admin user..."

cat > /tmp/create-admin.sh << 'EOF'
#!/bin/bash
# Create initial admin user

docker exec -i janua-api python << PYTHON
import os
import sys
sys.path.insert(0, '/app')

from app.models.user import User
from app.core.database import SessionLocal
from app.core.security import get_password_hash

db = SessionLocal()

admin_email = "admin@madfam.io"
admin_password = "ChangeMeImmediately!"

# Check if admin exists
existing = db.query(User).filter(User.email == admin_email).first()
if not existing:
    admin = User(
        email=admin_email,
        hashed_password=get_password_hash(admin_password),
        is_active=True,
        is_superuser=True,
        email_verified=True
    )
    db.add(admin)
    db.commit()
    print(f"Admin user created: {admin_email}")
    print(f"Temporary password: {admin_password}")
    print("IMPORTANT: Change this password immediately!")
else:
    print("Admin user already exists")

db.close()
PYTHON
EOF

# Note: This will fail if the API isn't Python-based, adjust as needed
bash /tmp/create-admin.sh 2>/dev/null || log_warn "Could not auto-create admin user, please create manually"

# 10. Save deployment summary
cat > /opt/solarpunk/DEPLOYMENT_SUMMARY.md << 'EOF'
# Solarpunk Foundry - Deployment Summary

## Server Information
- **IP**: 95.217.198.239
- **Location**: Hetzner Finland
- **OS**: Ubuntu 24.04 LTS
- **Hardware**: AX41-NVMe

## ZFS Configuration
- **Pool**: rpool (Mirror/RAID1)
- **Datasets**:
  - `/data/postgres` - PostgreSQL data (16k recordsize)
  - `/data/builds` - Enclii builds (LZ4 compression)
  - `/data/assets` - Blob storage (150GB quota)
  - `/data/registry` - Docker registry (100GB quota)

## Services

### Janua (The Gatekeeper)
- **API**: Port 8000
- **Dashboard**: Port 8010
- **Admin Panel**: Port 8011
- **Database**: PostgreSQL on ZFS
- **Sessions**: Redis DB 0

### Enclii (The PaaS Engine)
- **API**: Port 8001
- **UI**: Port 8030
- **gRPC**: Port 9091
- **Registry**: Port 5000
- **Cache**: Redis DB 1

## Security
- **Firewall**: UFW configured
- **Docker**: ZFS storage driver
- **Secrets**: `/opt/solarpunk/secrets/`

## Management Commands
```bash
# Status
/opt/solarpunk/scripts/status.sh

# Logs
/opt/solarpunk/scripts/logs.sh [janua|enclii|all]

# Restart
/opt/solarpunk/scripts/restart.sh [janua|enclii|all]

# Health checks
/opt/solarpunk/janua/health-check.sh
/opt/solarpunk/enclii/health-check.sh
```

## Next Steps
1. Configure DNS for production domains
2. Set up SSL certificates with Let's Encrypt
3. Configure backup strategy for PostgreSQL
4. Set up monitoring and alerts
5. Configure OAuth providers in Janua
6. Deploy additional Foundry services

## Maintenance
- ZFS snapshots: `zfs snapshot -r rpool@$(date +%Y%m%d)`
- PostgreSQL backup: `pg_dump -h localhost -U postgres`
- Docker cleanup: `docker system prune -a`
EOF

if $all_healthy; then
    log_info "All services are running successfully!"
    log_info "Deployment summary saved to: /opt/solarpunk/DEPLOYMENT_SUMMARY.md"
else
    log_warn "Some services are not responding. Check logs for details."
fi

echo ""
echo "The Solarpunk Foundry is now operational! 🌱"
echo "From Bits to Atoms. High Tech, Deep Roots."