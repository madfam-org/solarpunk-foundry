#!/bin/bash
# Boundary checkpoint (2026-09-04, platform ops): public operator tooling.
# Public-safe abstractions only; node identities, credentials, provider account
# detail and cost data stay in internal-devops.
# Policy: docs/PUBLIC_REPO_BOUNDARY.md

# =============================================================================
#  HISTORICAL — DO NOT RUN AGAINST MADFAM PRODUCTION.  Superseded 2026.
#  Reviewed 2026-07-25.
#
#  This script is part of the 2025-12-02 single-host bootstrap: it provisioned
#  ONE Ubuntu server running Docker Compose with a ZFS storage driver.
#
#  MADFAM production is now bare-metal k3s with ArgoCD GitOps. Images are built
#  by CI, pushed to GHCR, pinned by digest into kustomization.yaml, and pulled
#  by ArgoCD. Nothing is built or deployed on the server. Services are onboarded
#  with `enclii onboard`. ArgoCD runs with selfHeal enabled, so hand-applied
#  changes are reverted.
#
#  Kept as a record of how the estate actually ran, and because the ZFS tuning
#  and SSH hardening here remain useful reference. See ../README.md for the
#  current model, and the private internal-devops repo for real procedures.
# =============================================================================
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

# Database passwords: supplied from the secret store at run time; the
# historical secret-generation step was removed 2026-10-01.

# Initialize databases using psql
docker exec -i postgres-shared psql -U postgres << EOF
-- Create Janua database and user
CREATE DATABASE IF NOT EXISTS janua_prod;
CREATE USER IF NOT EXISTS janua WITH ENCRYPTED PASSWORD '<SECRET_FROM_VAULT>';
GRANT ALL PRIVILEGES ON DATABASE janua_prod TO janua;

-- Create Enclii database and user
CREATE DATABASE IF NOT EXISTS enclii_prod;
CREATE USER IF NOT EXISTS enclii WITH ENCRYPTED PASSWORD '<SECRET_FROM_VAULT>';
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

# Janua client credentials: REMOVED 2026-10-01. This historical step copied a
# signing secret into a client secret, which is the wrong architecture: an
# OAuth client secret is issued by Janua per client and is never a signing key.
# Client credentials are issued through Enclii into the secret store.

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
echo "Janua API:        http://<BOOTSTRAP_HOST>:8000"
echo "Janua Dashboard:  http://<BOOTSTRAP_HOST>:8010"
echo "Janua Admin:      http://<BOOTSTRAP_HOST>:8011"
echo "Enclii API:       http://<BOOTSTRAP_HOST>:8001"
echo "Enclii UI:        http://<BOOTSTRAP_HOST>:8030"
echo "Docker Registry:  http://<BOOTSTRAP_HOST>:5000"
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

# 9. First admin user — REMOVED 2026-10-01. This historical step created a
# superuser with a fixed temporary password. Admin bootstrap is a Janua
# operation and is documented privately, not in this public repository.

# 10. Save deployment summary
cat > /opt/solarpunk/DEPLOYMENT_SUMMARY.md << 'EOF'
# Solarpunk Foundry - Deployment Summary

## Server Information
- **Inventory**: See `internal-devops` for node IPs, hostnames, provider metadata, and SSH targets
- **Topology**: 4-node cluster since 2026-08-06 (inventory in internal-devops)
- **OS**: Ubuntu 24.04 LTS

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
