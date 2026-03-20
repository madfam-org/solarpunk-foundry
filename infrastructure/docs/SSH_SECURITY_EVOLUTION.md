# SSH Security Evolution - Solarpunk Foundry

## Overview

This document describes the evolution of SSH access to the Solarpunk Foundry bare-metal server, progressing from direct SSH access to Cloudflare Zero Trust tunneling.

---

## Phase 1: Initial Setup (Direct SSH)

**Status**: ✅ Complete
**Security Level**: Basic

```
┌─────────────┐         Port 22         ┌──────────────────┐
│  Developer  │ ──────────────────────► │  Hetzner Server  │
│  Workstation│     SSH (internet)      │  95.217.198.239  │
└─────────────┘                         └──────────────────┘
```

**Configuration**:
- Port 22 exposed to internet
- Root login enabled
- Key-based authentication (id_ed25519)
- Basic UFW firewall

**Risks**:
- Direct exposure to internet (bot scanning, brute force)
- Root account accessible remotely
- No audit trail for access
- No centralized identity management

---

## Phase 2: SSH Hardening

**Status**: ✅ Complete
**Security Level**: Intermediate

**Changes Applied**:
1. **Root login disabled** - `PermitRootLogin no`
2. **Non-root user only** - `AllowUsers solarpunk`
3. **Password auth disabled** - `PasswordAuthentication no`
4. **Strong ciphers enforced**:
   - KexAlgorithms: curve25519-sha256, ecdh-sha2-nistp521, etc.
   - Ciphers: chacha20-poly1305, aes256-gcm, etc.
   - MACs: hmac-sha2-512-etm, hmac-sha2-256-etm
5. **fail2ban active** - 3 attempts = 1 hour ban
6. **Session limits** - MaxAuthTries 3, MaxSessions 3

**Implementation Script**: `bootstrap/05-ssh-hardening.sh`

---

## Phase 3: Cloudflare Zero Trust SSH (Current)

**Status**: ✅ Complete
**Security Level**: Enterprise
**Completed**: 2025-12-03

```
┌─────────────┐    cloudflared     ┌───────────────────┐    tunnel    ┌──────────────────┐
│  Developer  │ ─────────────────► │  Cloudflare Edge  │ ───────────► │  Hetzner Server  │
│  Workstation│  (Zero Trust auth) │  (ssh.madfam.io)  │  (encrypted) │  (port 22 closed)│
└─────────────┘                    └───────────────────┘              └──────────────────┘
                                           │
                                           ▼
                                   ┌───────────────────┐
                                   │   GitHub OAuth    │
                                   │   Identity Check  │
                                   └───────────────────┘
```

**Benefits**:
- **Port 22 closed** to internet entirely
- **Identity verification** via GitHub OAuth before SSH
- **Session audit logging** in Cloudflare dashboard
- **Access policies** - restrict by email, IP, device posture
- **Session recording** (optional) for compliance

**Components**:
1. **Cloudflare Tunnel**: `foundry-prod` (ID: `d3d867f8-5617-48cd-8e08-a2a44fbdac71`)
2. **DNS**: `ssh.madfam.io` CNAME → `<tunnel-id>.cfargotunnel.com`
3. **Access Application**: Zero Trust SSH app with GitHub IdP
4. **Access Policy**: Email whitelist for authorized team members

---

## Implementation Checklist

### Prerequisites
- [x] Cloudflare account with Zero Trust enabled
- [x] Tunnel created (`foundry-prod`)
- [x] SSH hardening script created (`05-ssh-hardening.sh`)
- [x] Cloudflared setup script created (`06-cloudflared-setup.sh`)
- [x] Local SSH config updated (`~/.ssh/config`)
- [x] madfam.io DNS managed via Cloudflare
- [x] GitHub OAuth identity provider configured
- [x] Access Application created with automatic cloudflared authentication
- [x] Access Policy configured (email whitelist)
- [x] Port 22 closed on firewall

### Server-Side Setup
```bash
# 1. Run SSH hardening (keeps port 22 open initially)
sudo ./05-ssh-hardening.sh

# 2. Test SSH with solarpunk user (CRITICAL - do this first!)
# From local machine:
ssh -i ~/.ssh/id_ed25519 solarpunk@95.217.198.239

# 3. Once confirmed working, install cloudflared
TUNNEL_TOKEN='<token-from-cloudflare>' sudo ./06-cloudflared-setup.sh

# 4. Verify tunnel is connected
cloudflared tunnel info

# 5. Test SSH via tunnel
ssh ssh.madfam.io

# 6. Close port 22 (ONLY after tunnel SSH works!)
sudo ufw delete allow 22/tcp
```

### Cloudflare Dashboard Setup
1. **Zero Trust** → **Access** → **Applications**
   - Create SSH application for `ssh.madfam.io`
   - Type: SSH
   - Session duration: 1 hour

2. **Access Policies**
   - Include: Email matches `admin@madfam.io` (or team emails)
   - Identity Provider: GitHub

3. **Verify Tunnel Health**
   - **Networks** → **Tunnels** → `foundry-prod`
   - Status should show "Healthy"

---

## Client Configuration

### SSH Config (`~/.ssh/config`)
```
# Solarpunk Foundry Server via Cloudflare Zero Trust
Host ssh.madfam.io
  ProxyCommand cloudflared access ssh --hostname %h
  User solarpunk
  IdentityFile ~/.ssh/id_ed25519
```

### Required Software
- `cloudflared` - Install via `brew install cloudflared` (macOS)
- SSH client with ProxyCommand support

### Connection Flow
1. Run `ssh ssh.madfam.io`
2. `cloudflared` initiates connection to Cloudflare edge
3. Browser opens for GitHub OAuth authentication
4. After auth, SSH session established through tunnel
5. All traffic encrypted end-to-end

---

## Security Comparison

| Aspect | Phase 1 (Direct) | Phase 2 (Hardened) | Phase 3 (Zero Trust) |
|--------|------------------|--------------------|-----------------------|
| Port 22 exposure | Internet | Internet | Closed |
| Root access | Enabled | Disabled | Disabled |
| Identity provider | SSH keys only | SSH keys only | GitHub OAuth + Keys |
| Brute force protection | None | fail2ban | No port to attack |
| Audit logging | Local syslog | Local syslog | Cloudflare dashboard |
| Session recording | No | No | Optional |
| Access revocation | Manual key removal | Manual key removal | Instant policy update |
| Bot scanning | Vulnerable | Protected by fail2ban | Invisible |

---

## Rollback Procedures

### If Tunnel Fails
```bash
# Re-enable port 22 temporarily
sudo ufw allow 22/tcp

# Connect via direct SSH
ssh -i ~/.ssh/id_ed25519 solarpunk@95.217.198.239

# Debug cloudflared
sudo journalctl -u cloudflared -f
sudo systemctl restart cloudflared
```

### If Locked Out
1. Use Hetzner Robot console (rescue mode)
2. Or contact Hetzner support for KVM access
3. Re-enable port 22 and direct SSH access

---

## Terraform Integration

The SSH tunnel configuration is managed in `infrastructure/terraform/cloudflare.tf`:

```hcl
# SSH ingress rule in tunnel config
ingress_rule {
  hostname = "ssh.${var.ssh_domain}"
  service  = "ssh://localhost:22"
}

# SSH DNS record (conditional)
resource "cloudflare_record" "ssh" {
  count   = var.ssh_zone_id != "" ? 1 : 0
  zone_id = var.ssh_zone_id
  name    = "ssh"
  value   = "${cloudflare_tunnel.janua.id}.cfargotunnel.com"
  type    = "CNAME"
  proxied = true
}

# Zero Trust Access application
resource "cloudflare_access_application" "ssh" {
  zone_id          = var.ssh_zone_id
  name             = "Server SSH Access"
  domain           = "ssh.${var.ssh_domain}"
  type             = "ssh"
  session_duration = "1h"
}
```

---

## Monitoring & Maintenance

### Health Checks
```bash
# Check tunnel status
cloudflared tunnel info

# View real-time logs
sudo journalctl -u cloudflared -f

# Check service status
sudo systemctl status cloudflared
```

### Cloudflare Dashboard
- **Access** → **Logs**: View all SSH access attempts
- **Networks** → **Tunnels**: Monitor tunnel health
- **Zero Trust** → **Devices**: See connected devices

### Regular Tasks
- Review access logs weekly
- Update allowed emails as team changes
- Rotate tunnel credentials annually
- Keep cloudflared updated

---

## Related Files

| File | Purpose |
|------|---------|
| `bootstrap/05-ssh-hardening.sh` | Server SSH hardening |
| `bootstrap/06-cloudflared-setup.sh` | Cloudflared installation |
| `terraform/cloudflare.tf` | Tunnel and DNS infrastructure |
| `~/.ssh/config` | Local SSH client configuration |

---

## Configuration Details (Phase 3)

### Cloudflare Zero Trust Components

| Component | Value |
|-----------|-------|
| Tunnel Name | `foundry-prod` |
| Tunnel ID | `d3d867f8-5617-48cd-8e08-a2a44fbdac71` |
| SSH Hostname | `ssh.madfam.io` |
| Service Target | `ssh://localhost:22` |
| Access Application | "Foundry SSH Access" |
| Session Duration | 24 hours |
| Identity Provider | GitHub OAuth |

### Authorized Users

| Email | Role | Added |
|-------|------|-------|
| `admin@madfam.io` | Admin | 2025-12-03 |
| `innovacionesmadfam@proton.me` | Admin | 2025-12-03 |

### Key Settings

- **Automatic Cloudflared Authentication**: Enabled
- **Browser Rendering**: Disabled (CLI-based SSH)
- **fail2ban**: Active (legacy, no longer needed with port 22 closed)

---

*Last Updated: 2025-12-03*
*Solarpunk Foundry Infrastructure Team*
