#!/bin/bash
set -euo pipefail

# Solarpunk Foundry - Cloudflared Tunnel Setup
# Server: Hetzner AX41-NVMe (95.217.198.239)
# Purpose: Install and configure cloudflared for Zero Trust access

echo "==============================================="
echo "  SOLARPUNK FOUNDRY - CLOUDFLARED SETUP"
echo "  Phase 6: Zero Trust Tunnel Configuration"
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

# Tunnel configuration
TUNNEL_NAME="foundry-prod"
TUNNEL_TOKEN="${TUNNEL_TOKEN:-}"

if [ -z "$TUNNEL_TOKEN" ]; then
    log_error "TUNNEL_TOKEN environment variable is required"
    echo ""
    echo "Usage: TUNNEL_TOKEN='your-token-here' ./06-cloudflared-setup.sh"
    echo ""
    echo "Get your tunnel token from Cloudflare Zero Trust dashboard:"
    echo "  Networks → Tunnels → foundry-prod → Configure → Install connector"
    exit 1
fi

# Step 1: Install cloudflared
log_step "1/5 - Installing cloudflared..."

# Add Cloudflare GPG key
mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

# Add Cloudflare apt repository
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | tee /etc/apt/sources.list.d/cloudflared.list

# Install cloudflared
apt-get update
apt-get install -y cloudflared

log_info "cloudflared installed: $(cloudflared --version)"

# Step 2: Create cloudflared configuration directory
log_step "2/5 - Creating configuration..."

mkdir -p /etc/cloudflared
mkdir -p /var/log/cloudflared

# Step 3: Create tunnel configuration file
log_step "3/5 - Configuring tunnel..."

cat > /etc/cloudflared/config.yml << EOF
# Cloudflare Tunnel Configuration
# Tunnel: ${TUNNEL_NAME}
# Generated: $(date -Iseconds)

tunnel: ${TUNNEL_NAME}
credentials-file: /etc/cloudflared/credentials.json

# Ingress rules - what services to expose
ingress:
  # SSH Access (Zero Trust protected)
  - hostname: ssh.madfam.io
    service: ssh://localhost:22

  # Janua API (port 4100)
  - hostname: api.janua.dev
    service: http://localhost:4100
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true

  # Janua Dashboard (port 4101)
  - hostname: app.janua.dev
    service: http://localhost:4101
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true

  # Janua Admin (port 4102)
  - hostname: admin.janua.dev
    service: http://localhost:4102
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true

  # Janua Docs (port 4103)
  - hostname: docs.janua.dev
    service: http://localhost:4103
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true

  # Janua Website (port 4104)
  - hostname: janua.dev
    service: http://localhost:4104
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true

  # Enclii API (port 4200) - when deployed
  - hostname: api.enclii.madfam.io
    service: http://localhost:4200
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true

  # Enclii Dashboard (port 4201) - when deployed
  - hostname: enclii.madfam.io
    service: http://localhost:4201
    originRequest:
      connectTimeout: 30s
      noTLSVerify: true

  # Catch-all (required)
  - service: http_status:404

# Logging
loglevel: info
logfile: /var/log/cloudflared/cloudflared.log

# Metrics (optional, for monitoring)
metrics: localhost:2000
EOF

log_info "Tunnel configuration created"

# Step 4: Install tunnel as systemd service
log_step "4/5 - Installing systemd service..."

# Install the service using the token
cloudflared service install "${TUNNEL_TOKEN}"

log_info "Systemd service installed"

# Step 5: Start and enable the service
log_step "5/5 - Starting cloudflared service..."

systemctl enable cloudflared
systemctl start cloudflared

# Wait a moment for service to start
sleep 3

# Verify service is running
if systemctl is-active --quiet cloudflared; then
    log_info "cloudflared service is running"
else
    log_error "cloudflared service failed to start"
    journalctl -u cloudflared -n 20 --no-pager
    exit 1
fi

# Final status
echo ""
echo "==============================================="
echo "  CLOUDFLARED SETUP COMPLETE"
echo "==============================================="
echo ""
echo "Tunnel Status:"
systemctl status cloudflared --no-pager -l | head -15
echo ""
echo "Configured Hostnames:"
echo "  ✓ ssh.madfam.io      → SSH (Zero Trust)"
echo "  ✓ api.janua.dev      → Janua API (:4100)"
echo "  ✓ app.janua.dev      → Janua Dashboard (:4101)"
echo "  ✓ admin.janua.dev    → Janua Admin (:4102)"
echo "  ✓ docs.janua.dev     → Janua Docs (:4103)"
echo "  ✓ janua.dev          → Janua Website (:4104)"
echo "  ✓ api.enclii.madfam.io → Enclii API (:4200)"
echo "  ✓ enclii.madfam.io   → Enclii Dashboard (:4201)"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Verify tunnel is connected in Cloudflare dashboard"
echo "  2. Create Zero Trust Access policy for ssh.madfam.io"
echo "  3. Test SSH: ssh ssh.madfam.io"
echo "  4. Once verified, close port 22: ufw delete allow 22/tcp"
echo ""
echo "Useful commands:"
echo "  cloudflared tunnel info          # Show tunnel status"
echo "  journalctl -u cloudflared -f     # Follow logs"
echo "  systemctl restart cloudflared    # Restart tunnel"
echo ""
