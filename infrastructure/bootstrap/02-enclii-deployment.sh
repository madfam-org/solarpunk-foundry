#!/bin/bash
set -euo pipefail

# Solarpunk Foundry - Enclii Deployment Script
# Purpose: Deploy Enclii (Sovereign PaaS) with ZFS-backed storage

echo "==============================================="
echo "  SOLARPUNK FOUNDRY - ENCLII DEPLOYMENT"
echo "  Phase 2: Deploying the PaaS Engine"
echo "==============================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root"
   exit 1
fi

ENCLII_DIR="/opt/solarpunk/enclii"
ENCLII_REPO="https://github.com/madfam-io/enclii.git"

# 1. Clone Enclii repository
log_info "Cloning Enclii repository..."

if [ -d "$ENCLII_DIR" ]; then
    log_warn "Enclii directory exists, pulling latest changes..."
    cd "$ENCLII_DIR"
    git pull
else
    git clone "$ENCLII_REPO" "$ENCLII_DIR"
    cd "$ENCLII_DIR"
fi

# 2. Create Enclii-specific ZFS datasets if needed
log_info "Setting up ZFS datasets for Enclii..."

# Create dataset for Enclii registry
if ! zfs list rpool/registry &>/dev/null; then
    zfs create -o mountpoint=/data/registry rpool/registry
    zfs set compression=lz4 rpool/registry
    zfs set quota=100G rpool/registry
fi

# Create dataset for Enclii builds (already exists but verify)
if ! zfs list rpool/builds &>/dev/null; then
    zfs create -o mountpoint=/data/builds rpool/builds
    zfs set compression=lz4 rpool/builds
fi

# 3. Create production environment file
log_info "Creating Enclii environment configuration..."

cat > "$ENCLII_DIR/.env.production" << 'EOF'
# Enclii Production Configuration
# Generated for Solarpunk Foundry

# Core Settings
ENVIRONMENT=production
HTTP_PORT=8001
GRPC_PORT=9091
METRICS_PORT=9090
LOG_LEVEL=info

# Database (using shared PostgreSQL)
DATABASE_URL=postgresql://enclii:ENCLII_DB_PASSWORD@postgres-shared:5432/enclii_prod

# Redis (using shared Redis, DB 1 for Enclii)
REDIS_URL=redis://redis-shared:6379/1

# Docker Configuration
DOCKER_HOST=unix:///var/run/docker.sock
REGISTRY_URL=http://registry:5000

# Storage Paths (ZFS-optimized)
BUILD_CACHE_DIR=/data/builds
BUILD_WORK_DIR=/data/builds/work
REGISTRY_DATA=/data/registry
MAX_CONCURRENT_BUILDS=3

# Janua Integration (will be configured after Janua deployment)
JANUA_URL=http://janua-api:8000
JANUA_CLIENT_ID=enclii-switchyard
JANUA_CLIENT_SECRET=JANUA_CLIENT_SECRET

# Security
API_KEY=ENCLII_API_KEY
ENCRYPTION_KEY=ENCLII_ENCRYPTION_KEY

# Build Configuration
BUILDPACKS_BUILDER=paketocommunity/builder-ubi-base:latest
BUILD_TIMEOUT=1800

# Resource Limits
MEMORY_LIMIT=4g
CPU_LIMIT=2

# Feature Flags
ENABLE_METRICS=true
ENABLE_TRACING=false
ENABLE_BUILDPACKS=true
ENABLE_NIXPACKS=true
EOF

# 4. Create Docker Compose override for production
log_info "Creating Docker Compose production configuration..."

cat > "$ENCLII_DIR/docker-compose.production.yml" << 'EOF'
version: "3.8"

services:
  # Enclii API Service
  api:
    image: enclii-api:latest
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: enclii-api
    restart: unless-stopped
    ports:
      - "8001:8001"
      - "9091:9091"
    env_file:
      - .env.production
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /data/builds:/data/builds
      - /data/registry:/data/registry
    networks:
      - solarpunk-network
      - enclii-network
    depends_on:
      - registry
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Build Worker
  build-worker:
    image: enclii-worker:latest
    build:
      context: .
      dockerfile: Dockerfile.worker
      target: production
    container_name: enclii-build-worker
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - WORKER_TYPE=build
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /data/builds:/data/builds
      - /data/registry:/data/registry
    networks:
      - enclii-network
    depends_on:
      - api
      - registry
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Deploy Worker
  deploy-worker:
    image: enclii-worker:latest
    container_name: enclii-deploy-worker
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - WORKER_TYPE=deploy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - enclii-network
      - solarpunk-network
    depends_on:
      - api
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Local Docker Registry
  registry:
    image: registry:2
    container_name: enclii-registry
    restart: unless-stopped
    ports:
      - "5000:5000"
    volumes:
      - /data/registry:/var/lib/registry
    environment:
      - REGISTRY_STORAGE_DELETE_ENABLED=true
      - REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY=/var/lib/registry
    networks:
      - enclii-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Enclii UI (Optional - can be deployed separately)
  ui:
    image: enclii-ui:latest
    build:
      context: ./ui
      dockerfile: Dockerfile
      target: production
    container_name: enclii-ui
    restart: unless-stopped
    ports:
      - "8030:8030"
    environment:
      - NODE_ENV=production
      - PORT=8030
      - NEXT_PUBLIC_API_URL=http://95.217.198.239:8001
      - NEXT_PUBLIC_JANUA_URL=http://95.217.198.239:8000
    networks:
      - solarpunk-network
    depends_on:
      - api
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Traefik for routing (production)
  traefik:
    image: traefik:v2.10
    container_name: enclii-traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=ops@madfam.io"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--log.level=INFO"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /data/letsencrypt:/letsencrypt
    networks:
      - solarpunk-network
      - enclii-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  enclii-network:
    external: true
  solarpunk-network:
    external: true
EOF

# 5. Create secrets generation script
log_info "Generating secure secrets..."

cat > "$ENCLII_DIR/generate-secrets.sh" << 'EOF'
#!/bin/bash
# Generate secure secrets for Enclii

generate_secret() {
    openssl rand -hex 32
}

echo "Generating Enclii secrets..."

# Generate secrets
ENCLII_DB_PASSWORD=$(generate_secret)
ENCLII_API_KEY=$(generate_secret)
ENCLII_ENCRYPTION_KEY=$(generate_secret)
JANUA_CLIENT_SECRET=$(generate_secret)

# Update .env.production file
sed -i "s/ENCLII_DB_PASSWORD/${ENCLII_DB_PASSWORD}/g" .env.production
sed -i "s/ENCLII_API_KEY/${ENCLII_API_KEY}/g" .env.production
sed -i "s/ENCLII_ENCRYPTION_KEY/${ENCLII_ENCRYPTION_KEY}/g" .env.production
sed -i "s/JANUA_CLIENT_SECRET/${JANUA_CLIENT_SECRET}/g" .env.production

# Save secrets to secure location
cat > /opt/solarpunk/secrets/enclii-secrets.env << EOL
# Enclii Secrets - Generated $(date)
ENCLII_DB_PASSWORD=${ENCLII_DB_PASSWORD}
ENCLII_API_KEY=${ENCLII_API_KEY}
ENCLII_ENCRYPTION_KEY=${ENCLII_ENCRYPTION_KEY}
JANUA_CLIENT_SECRET=${JANUA_CLIENT_SECRET}
EOL

chmod 600 /opt/solarpunk/secrets/enclii-secrets.env
echo "Secrets generated and saved to /opt/solarpunk/secrets/enclii-secrets.env"
EOF

chmod +x "$ENCLII_DIR/generate-secrets.sh"
"$ENCLII_DIR/generate-secrets.sh"

# 6. Build Enclii images
log_info "Building Enclii Docker images..."

cd "$ENCLII_DIR"

# Build API
docker build -t enclii-api:latest -f Dockerfile --target production .

# Build Worker
if [ -f "Dockerfile.worker" ]; then
    docker build -t enclii-worker:latest -f Dockerfile.worker --target production .
else
    log_warn "Worker Dockerfile not found, using main image"
    docker tag enclii-api:latest enclii-worker:latest
fi

# Build UI
if [ -d "ui" ]; then
    cd ui
    docker build -t enclii-ui:latest -f Dockerfile --target production .
    cd ..
fi

# 7. Initialize database
log_info "Initializing Enclii database..."

# Wait for PostgreSQL to be ready (will be deployed with shared services)
# For now, we'll prepare the SQL

cat > "$ENCLII_DIR/init-db.sql" << 'EOF'
-- Enclii Database Initialization
CREATE DATABASE IF NOT EXISTS enclii_prod;
CREATE USER IF NOT EXISTS enclii WITH ENCRYPTED PASSWORD :'password';
GRANT ALL PRIVILEGES ON DATABASE enclii_prod TO enclii;

\c enclii_prod;

-- Create schema
CREATE SCHEMA IF NOT EXISTS enclii;

-- Basic tables
CREATE TABLE IF NOT EXISTS enclii.apps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    repo_url TEXT,
    branch VARCHAR(100) DEFAULT 'main',
    build_command TEXT,
    start_command TEXT,
    environment JSONB DEFAULT '{}',
    domains TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enclii.builds (
    id SERIAL PRIMARY KEY,
    app_id INTEGER REFERENCES enclii.apps(id) ON DELETE CASCADE,
    commit_sha VARCHAR(40),
    status VARCHAR(50) DEFAULT 'pending',
    log_path TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enclii.deployments (
    id SERIAL PRIMARY KEY,
    app_id INTEGER REFERENCES enclii.apps(id) ON DELETE CASCADE,
    build_id INTEGER REFERENCES enclii.builds(id) ON DELETE SET NULL,
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deployed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_apps_slug ON enclii.apps(slug);
CREATE INDEX idx_builds_app_id ON enclii.builds(app_id);
CREATE INDEX idx_deployments_app_id ON enclii.deployments(app_id);
EOF

# 8. Create systemd service for Enclii
log_info "Creating systemd service..."

cat > /etc/systemd/system/enclii.service << 'EOF'
[Unit]
Description=Enclii - Sovereign PaaS
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=unless-stopped
RestartSec=10
WorkingDirectory=/opt/solarpunk/enclii
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 9. Create health check script
log_info "Creating health check script..."

cat > "$ENCLII_DIR/health-check.sh" << 'EOF'
#!/bin/bash
# Enclii Health Check

echo "Checking Enclii services..."

# Check API
if curl -f http://localhost:8001/health &>/dev/null; then
    echo "✓ API is healthy"
else
    echo "✗ API is not responding"
    exit 1
fi

# Check Registry
if curl -f http://localhost:5000/v2/ &>/dev/null; then
    echo "✓ Registry is healthy"
else
    echo "✗ Registry is not responding"
fi

# Check Docker socket access
if docker ps &>/dev/null; then
    echo "✓ Docker socket accessible"
else
    echo "✗ Docker socket not accessible"
fi

# Check ZFS datasets
for dataset in builds registry; do
    if zfs list rpool/$dataset &>/dev/null; then
        echo "✓ ZFS dataset rpool/$dataset exists"
    else
        echo "✗ ZFS dataset rpool/$dataset missing"
    fi
done
EOF

chmod +x "$ENCLII_DIR/health-check.sh"

# 10. Set permissions
chown -R solarpunk:solarpunk "$ENCLII_DIR"
chown -R solarpunk:solarpunk /data/builds
chown -R solarpunk:solarpunk /data/registry

# 11. Reload systemd and prepare service
systemctl daemon-reload
systemctl enable enclii

log_info "Enclii deployment prepared successfully!"
log_info "Note: Enclii will start after shared services (PostgreSQL, Redis) are deployed"
log_info "Next step: Run 03-janua-deployment.sh"

echo ""
echo "Enclii Configuration Summary:"
echo "-----------------------------"
echo "API Port: 8001"
echo "gRPC Port: 9091"
echo "Registry Port: 5000"
echo "UI Port: 8030"
echo "Build Cache: /data/builds"
echo "Registry Data: /data/registry"
echo ""
echo "Secrets saved to: /opt/solarpunk/secrets/enclii-secrets.env"