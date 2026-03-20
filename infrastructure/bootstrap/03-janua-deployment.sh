#!/bin/bash
set -euo pipefail

# Solarpunk Foundry - Janua Deployment Script
# Purpose: Deploy Janua (Auth/Monetization Gatekeeper) with ZFS-backed PostgreSQL

echo "==============================================="
echo "  SOLARPUNK FOUNDRY - JANUA DEPLOYMENT"
echo "  Phase 3: Deploying the Gatekeeper"
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

JANUA_DIR="/opt/solarpunk/janua"
JANUA_REPO="https://github.com/madfam-io/janua.git"

# 1. Clone Janua repository
log_info "Cloning Janua repository..."

if [ -d "$JANUA_DIR" ]; then
    log_warn "Janua directory exists, pulling latest changes..."
    cd "$JANUA_DIR"
    git pull
else
    git clone "$JANUA_REPO" "$JANUA_DIR"
    cd "$JANUA_DIR"
fi

# 2. Verify ZFS dataset for PostgreSQL
log_info "Verifying ZFS dataset for PostgreSQL..."

if ! zfs list rpool/postgres &>/dev/null; then
    log_error "PostgreSQL ZFS dataset not found! Expected at /data/postgres"
    exit 1
fi

# Verify optimal settings for PostgreSQL
zfs set recordsize=16k rpool/postgres
zfs set primarycache=metadata rpool/postgres
zfs set logbias=throughput rpool/postgres
zfs set atime=off rpool/postgres

log_info "PostgreSQL ZFS dataset configured optimally"

# 3. Create production environment file
log_info "Creating Janua environment configuration..."

cat > "$JANUA_DIR/.env.production" << 'EOF'
# Janua Production Configuration
# Generated for Solarpunk Foundry

# Core Settings
NODE_ENV=production
PORT=8000
API_PORT=8000
LOG_LEVEL=info

# Database - CRITICAL: Using ZFS-backed PostgreSQL
DATABASE_URL=postgresql://janua:JANUA_DB_PASSWORD@postgres-shared:5432/janua_prod
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis (using shared Redis, DB 0 for Janua sessions)
REDIS_URL=redis://redis-shared:6379/0
REDIS_SESSION_TTL=86400

# Security - CRITICAL: Generate strong secrets
JWT_SECRET=JANUA_JWT_SECRET
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600
COOKIE_SECRET=JANUA_COOKIE_SECRET
ENCRYPTION_KEY=JANUA_ENCRYPTION_KEY

# OAuth Providers (configure as needed)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# Email Configuration
SMTP_HOST=smtp.madfam.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=janua@madfam.io
SMTP_PASS=JANUA_SMTP_PASSWORD
SMTP_FROM=Janua <noreply@janua.dev>

# Feature Flags
ENABLE_MFA=true
ENABLE_PASSKEYS=true
ENABLE_SAML=true
ENABLE_SCIM=true
ENABLE_AUDIT_LOG=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
METRICS_ENABLED=true
METRICS_PORT=9090
TRACING_ENABLED=false

# Enclii Integration
ENCLII_API_URL=http://enclii-api:8001

# Public URLs (update with your domain)
PUBLIC_URL=https://auth.madfam.io
ALLOWED_ORIGINS=https://auth.madfam.io,https://enclii.madfam.io
EOF

# 4. Create Docker Compose production configuration
log_info "Creating Docker Compose production configuration..."

cat > "$JANUA_DIR/docker-compose.production.yml" << 'EOF'
version: "3.8"

services:
  # Janua API Service
  api:
    image: janua-api:latest
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: production
    container_name: janua-api
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    volumes:
      - ./keys:/app/keys:ro  # JWT keys
    networks:
      - solarpunk-network
      - janua-network
    depends_on:
      postgres-shared:
        condition: service_healthy
      redis-shared:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Janua Dashboard
  dashboard:
    image: janua-dashboard:latest
    build:
      context: .
      dockerfile: apps/dashboard/Dockerfile
      target: production
    container_name: janua-dashboard
    restart: unless-stopped
    ports:
      - "8010:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://95.217.198.239:8000
    networks:
      - solarpunk-network
    depends_on:
      - api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Janua Admin Panel
  admin:
    image: janua-admin:latest
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
      target: production
    container_name: janua-admin
    restart: unless-stopped
    ports:
      - "8011:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://95.217.198.239:8000
    networks:
      - solarpunk-network
    depends_on:
      - api
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Shared PostgreSQL (ZFS-backed)
  postgres-shared:
    image: postgres:15-alpine
    container_name: postgres-shared
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=POSTGRES_ROOT_PASSWORD
      - POSTGRES_DB=postgres
      - POSTGRES_INITDB_ARGS=--encoding=UTF8 --data-checksums
      - POSTGRES_HOST_AUTH_METHOD=md5
    volumes:
      - /data/postgres:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - solarpunk-network
      - janua-network
      - enclii-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    # PostgreSQL tuning for ZFS
    command:
      - "postgres"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "effective_cache_size=1GB"
      - "-c"
      - "maintenance_work_mem=64MB"
      - "-c"
      - "checkpoint_completion_target=0.9"
      - "-c"
      - "wal_buffers=16MB"
      - "-c"
      - "default_statistics_target=100"
      - "-c"
      - "random_page_cost=1.1"
      - "-c"
      - "effective_io_concurrency=200"
      - "-c"
      - "work_mem=4MB"
      - "-c"
      - "min_wal_size=1GB"
      - "-c"
      - "max_wal_size=4GB"

  # Shared Redis
  redis-shared:
    image: redis:7-alpine
    container_name: redis-shared
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --appendfsync everysec
    volumes:
      - redis_data:/data
    networks:
      - solarpunk-network
      - janua-network
      - enclii-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  redis_data:
    driver: local

networks:
  solarpunk-network:
    external: true
  janua-network:
    external: true
  enclii-network:
    external: true
EOF

# 5. Create database initialization script
log_info "Creating database initialization script..."

cat > "$JANUA_DIR/init-db.sql" << 'EOF'
-- Shared Database Initialization
-- Creates databases for both Janua and Enclii

-- Create Janua database and user
CREATE DATABASE janua_prod;
CREATE USER janua WITH ENCRYPTED PASSWORD :'janua_password';
GRANT ALL PRIVILEGES ON DATABASE janua_prod TO janua;

-- Create Enclii database and user
CREATE DATABASE enclii_prod;
CREATE USER enclii WITH ENCRYPTED PASSWORD :'enclii_password';
GRANT ALL PRIVILEGES ON DATABASE enclii_prod TO enclii;

-- Switch to Janua database
\c janua_prod;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Janua schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Basic auth tables
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    password_hash TEXT,
    name VARCHAR(255),
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX idx_sessions_token ON auth.sessions(token);
CREATE INDEX idx_organizations_slug ON auth.organizations(slug);
EOF

# 6. Generate secrets
log_info "Generating secure secrets..."

cat > "$JANUA_DIR/generate-secrets.sh" << 'EOF'
#!/bin/bash
# Generate secure secrets for Janua

generate_secret() {
    openssl rand -hex 32
}

generate_password() {
    openssl rand -base64 24
}

echo "Generating Janua secrets..."

# Generate secrets
JANUA_DB_PASSWORD=$(generate_password)
JANUA_JWT_SECRET=$(generate_secret)
JANUA_COOKIE_SECRET=$(generate_secret)
JANUA_ENCRYPTION_KEY=$(generate_secret)
JANUA_SMTP_PASSWORD=$(generate_password)
POSTGRES_ROOT_PASSWORD=$(generate_password)
ENCLII_DB_PASSWORD=$(generate_password)

# Update .env.production file
sed -i "s/JANUA_DB_PASSWORD/${JANUA_DB_PASSWORD}/g" .env.production
sed -i "s/JANUA_JWT_SECRET/${JANUA_JWT_SECRET}/g" .env.production
sed -i "s/JANUA_COOKIE_SECRET/${JANUA_COOKIE_SECRET}/g" .env.production
sed -i "s/JANUA_ENCRYPTION_KEY/${JANUA_ENCRYPTION_KEY}/g" .env.production
sed -i "s/JANUA_SMTP_PASSWORD/${JANUA_SMTP_PASSWORD}/g" .env.production

# Update docker-compose file
sed -i "s/POSTGRES_ROOT_PASSWORD/${POSTGRES_ROOT_PASSWORD}/g" docker-compose.production.yml

# Save secrets to secure location
cat > /opt/solarpunk/secrets/janua-secrets.env << EOL
# Janua Secrets - Generated $(date)
JANUA_DB_PASSWORD=${JANUA_DB_PASSWORD}
JANUA_JWT_SECRET=${JANUA_JWT_SECRET}
JANUA_COOKIE_SECRET=${JANUA_COOKIE_SECRET}
JANUA_ENCRYPTION_KEY=${JANUA_ENCRYPTION_KEY}
JANUA_SMTP_PASSWORD=${JANUA_SMTP_PASSWORD}
POSTGRES_ROOT_PASSWORD=${POSTGRES_ROOT_PASSWORD}
ENCLII_DB_PASSWORD=${ENCLII_DB_PASSWORD}
EOL

chmod 600 /opt/solarpunk/secrets/janua-secrets.env
echo "Secrets generated and saved to /opt/solarpunk/secrets/janua-secrets.env"

# Create variables file for database init
cat > init-vars.sh << EOL
export janua_password='${JANUA_DB_PASSWORD}'
export enclii_password='${ENCLII_DB_PASSWORD}'
EOL
EOF

chmod +x "$JANUA_DIR/generate-secrets.sh"
"$JANUA_DIR/generate-secrets.sh"

# 7. Generate JWT keys for production
log_info "Generating JWT keys..."

mkdir -p "$JANUA_DIR/keys"
openssl genrsa -out "$JANUA_DIR/keys/private.pem" 4096
openssl rsa -in "$JANUA_DIR/keys/private.pem" -pubout -out "$JANUA_DIR/keys/public.pem"
chmod 600 "$JANUA_DIR/keys/private.pem"
chmod 644 "$JANUA_DIR/keys/public.pem"

# 8. Build Janua images
log_info "Building Janua Docker images..."

cd "$JANUA_DIR"

# Build API
docker build -t janua-api:latest -f apps/api/Dockerfile --target production .

# Build Dashboard
if [ -d "apps/dashboard" ]; then
    docker build -t janua-dashboard:latest -f apps/dashboard/Dockerfile --target production .
fi

# Build Admin
if [ -d "apps/admin" ]; then
    docker build -t janua-admin:latest -f apps/admin/Dockerfile --target production .
fi

# 9. Create systemd service for Janua
log_info "Creating systemd service..."

cat > /etc/systemd/system/janua.service << 'EOF'
[Unit]
Description=Janua - Authentication Gatekeeper
Requires=docker.service
After=docker.service

[Service]
Type=simple
Restart=unless-stopped
RestartSec=10
WorkingDirectory=/opt/solarpunk/janua
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 10. Create health check script
log_info "Creating health check script..."

cat > "$JANUA_DIR/health-check.sh" << 'EOF'
#!/bin/bash
# Janua Health Check

echo "Checking Janua services..."

# Check API
if curl -f http://localhost:8000/health &>/dev/null; then
    echo "✓ API is healthy"
else
    echo "✗ API is not responding"
    exit 1
fi

# Check PostgreSQL
if docker exec postgres-shared pg_isready &>/dev/null; then
    echo "✓ PostgreSQL is healthy"
else
    echo "✗ PostgreSQL is not responding"
fi

# Check Redis
if docker exec redis-shared redis-cli ping &>/dev/null; then
    echo "✓ Redis is healthy"
else
    echo "✗ Redis is not responding"
fi

# Check ZFS dataset
if zfs list rpool/postgres &>/dev/null; then
    echo "✓ PostgreSQL ZFS dataset healthy"
    zfs get used,available,referenced rpool/postgres
else
    echo "✗ PostgreSQL ZFS dataset issue"
fi
EOF

chmod +x "$JANUA_DIR/health-check.sh"

# 11. Set permissions
chown -R solarpunk:solarpunk "$JANUA_DIR"
chown -R 999:999 /data/postgres  # PostgreSQL user in container

# 12. Reload systemd
systemctl daemon-reload
systemctl enable janua

log_info "Janua deployment prepared successfully!"
log_info "Next step: Run 04-start-services.sh to start all services"

echo ""
echo "Janua Configuration Summary:"
echo "----------------------------"
echo "API Port: 8000"
echo "Dashboard Port: 8010"
echo "Admin Port: 8011"
echo "PostgreSQL Port: 5432 (ZFS-backed at /data/postgres)"
echo "Redis Port: 6379"
echo ""
echo "Secrets saved to: /opt/solarpunk/secrets/janua-secrets.env"
echo "JWT keys saved to: $JANUA_DIR/keys/"