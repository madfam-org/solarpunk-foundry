#!/bin/bash
set -euo pipefail

# Solarpunk Foundry - System Bootstrap Script
# Server: Hetzner AX41-NVMe (95.217.198.239)
# OS: Ubuntu 24.04 LTS
# Purpose: System hardening, Docker setup with ZFS storage driver

echo "==============================================="
echo "  SOLARPUNK FOUNDRY - SYSTEM BOOTSTRAP"
echo "  Phase 1: System Hardening & Docker Setup"
echo "==============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root"
   exit 1
fi

log_info "Starting system update..."

# 1. Update system packages
apt-get update -y
apt-get upgrade -y
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    fail2ban \
    ufw \
    unattended-upgrades \
    htop \
    vim \
    git \
    jq \
    net-tools

log_info "System packages updated"

# 2. Basic security hardening
log_info "Configuring firewall..."

# Configure UFW (Uncomplicated Firewall)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw allow 8001/tcp # Enclii API
ufw allow 8000/tcp # Janua API
ufw allow 8030/tcp # Enclii UI
ufw --force enable

log_info "Firewall configured"

# Configure automatic security updates
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

# 3. Install Docker with official repository
log_info "Installing Docker..."

# Remove any existing Docker installations
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
    apt-get remove -y $pkg 2>/dev/null || true
done

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

log_info "Docker installed"

# 4. CRITICAL: Configure Docker to use ZFS storage driver
log_info "Configuring Docker with ZFS storage driver..."

# Stop Docker service
systemctl stop docker
systemctl stop containerd

# Clean up any existing Docker data
rm -rf /var/lib/docker/*

# Create ZFS dataset for Docker if it doesn't exist
if ! zfs list rpool/docker &>/dev/null; then
    log_info "Creating ZFS dataset for Docker..."
    zfs create -o mountpoint=/var/lib/docker rpool/docker
    zfs set compression=lz4 rpool/docker
    zfs set atime=off rpool/docker
fi

# Configure Docker daemon to use ZFS
cat > /etc/docker/daemon.json << 'EOF'
{
  "storage-driver": "zfs",
  "storage-opts": [
    "zfs.fsname=rpool/docker"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "10"
  },
  "metrics-addr": "127.0.0.1:9323",
  "experimental": true,
  "live-restore": true,
  "default-address-pools": [
    {
      "base": "172.17.0.0/16",
      "size": 24
    },
    {
      "base": "172.18.0.0/16",
      "size": 24
    }
  ]
}
EOF

# Start Docker with new configuration
systemctl start containerd
systemctl start docker
systemctl enable docker
systemctl enable containerd

# Verify ZFS is being used
log_info "Verifying Docker ZFS configuration..."
docker info | grep -i "storage driver"

# 5. Create Docker networks for our services
log_info "Creating Docker networks..."

docker network create --driver bridge solarpunk-network 2>/dev/null || true
docker network create --driver bridge enclii-network 2>/dev/null || true
docker network create --driver bridge janua-network 2>/dev/null || true

# 6. Create dedicated user for services (non-root operations)
log_info "Creating service user..."

if ! id -u solarpunk &>/dev/null; then
    useradd -m -s /bin/bash -G docker solarpunk
    usermod -aG sudo solarpunk
fi

# 7. Set up directory structure
log_info "Creating directory structure..."

# Create project directories
mkdir -p /opt/solarpunk/{enclii,janua,configs,secrets,scripts}
mkdir -p /var/log/solarpunk

# Set permissions
chown -R solarpunk:solarpunk /opt/solarpunk
chown -R solarpunk:solarpunk /var/log/solarpunk

# 8. Install Docker Compose standalone (for compatibility)
log_info "Installing Docker Compose..."

DOCKER_COMPOSE_VERSION="2.24.0"
curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 9. Configure system limits for containers
log_info "Configuring system limits..."

cat >> /etc/sysctl.conf << 'EOF'
# Docker optimizations
net.ipv4.ip_forward=1
net.bridge.bridge-nf-call-iptables=1
net.bridge.bridge-nf-call-ip6tables=1
vm.max_map_count=524288
fs.file-max=2097152
EOF

sysctl -p

# 10. Set up log rotation for Docker
cat > /etc/logrotate.d/docker-containers << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size 100M
    missingok
    delaycompress
    copytruncate
}
EOF

# 11. Create environment file template
cat > /opt/solarpunk/configs/.env.template << 'EOF'
# Solarpunk Foundry Environment Configuration
# Generated: $(date +"%Y-%m-%d %H:%M:%S")

# System
NODE_ENV=production
LOG_LEVEL=info

# Database
POSTGRES_HOST=/data/postgres
POSTGRES_PORT=5432
POSTGRES_USER=solarpunk
POSTGRES_PASSWORD=CHANGEME
POSTGRES_DB=solarpunk

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGEME

# JWT/Security
JWT_SECRET=CHANGEME
COOKIE_SECRET=CHANGEME
ENCRYPTION_KEY=CHANGEME

# Janua Configuration
JANUA_URL=http://janua:8000
JANUA_CLIENT_ID=enclii-switchyard
JANUA_CLIENT_SECRET=CHANGEME

# Enclii Configuration
ENCLII_REGISTRY=localhost:5000
ENCLII_BUILD_CACHE=/data/builds
ENCLII_ASSETS_PATH=/data/assets
EOF

# Final verification
log_info "Running system verification..."

echo ""
echo "System Status:"
echo "--------------"
echo -n "Docker: "
if systemctl is-active --quiet docker; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

echo -n "ZFS Storage Driver: "
if docker info 2>/dev/null | grep -q "Storage Driver: zfs"; then
    echo -e "${GREEN}✓ Configured${NC}"
else
    echo -e "${RED}✗ Not configured${NC}"
fi

echo -n "Firewall: "
if ufw status | grep -q "Status: active"; then
    echo -e "${GREEN}✓ Active${NC}"
else
    echo -e "${RED}✗ Not active${NC}"
fi

echo -n "ZFS Datasets: "
if zfs list | grep -q rpool; then
    echo -e "${GREEN}✓ Available${NC}"
    zfs list -t filesystem | grep rpool
else
    echo -e "${RED}✗ Not found${NC}"
fi

echo ""
log_info "System bootstrap completed successfully!"
log_info "Next step: Run 02-enclii-deployment.sh"