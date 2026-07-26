# SSH Security Evolution - Solarpunk Foundry

> **What this is:** a historical narrative of how operator SSH access was hardened
> in three phases, kept because the reasoning is reusable. It is **not** a current
> access runbook and not an inventory.
>
> **Last reviewed:** 2026-07-25.
> **Phase 1 / Phase 2 narrative:** historical, describes 2025-12.
> **Phase 3 / current posture:** see the correction note below — the concrete
> configuration in earlier revisions of this file described a tunnel topology
> that never existed in production.
>
> Production SSH targets, node inventory, IP addresses, Cloudflare tunnel names
> and IDs, and the authorized-operator roster live **only** in the private
> `internal-devops` repository. They were removed from this file on 2026-07-25.

## Overview

This document describes the public-safe SSH access pattern for Solarpunk Foundry. Production SSH targets, node inventory, IPs, Cloudflare tunnel IDs, and access policy details live in the private `internal-devops` repo.

### Correction (2026-07-25)

Earlier revisions of this document named two separate Cloudflare tunnels
(a product tunnel and an SSH tunnel) and published one tunnel's ID.
Per `internal-devops/ecosystem/domain-map.md` (last verified 2026-07-01),
**there is a single production Cloudflare Tunnel** carrying all ingress —
every HTTP product route *and* the SSH jumphost. The split this document
described never existed in the live infrastructure.

The tunnel identifiers, the SSH hostname, and the authorized-user roster have
been removed from this file. Deleting them from `HEAD` does not remove them
from git history; credential rotation is tracked privately in `internal-devops`.

---

## Phase 1: Initial Setup (Direct SSH)

**Status**: ✅ Complete
**Security Level**: Basic

```
┌─────────────┐         Port 22         ┌──────────────────┐
│  Developer  │ ──────────────────────► │  Hetzner Server  │
│  Workstation│     SSH (internet)      │ <BOOTSTRAP_HOST> │
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
│  Workstation│  (Zero Trust auth) │  (<SSH_HOST>)     │  (encrypted) │  (port 22 closed)│
└─────────────┘                    └───────────────────┘              └──────────────────┘
                                           │
                                           ▼
                                   ┌───────────────────┐
                                   │   GitHub OAuth    │
                                   │   Identity Check  │
                                   └───────────────────┘
```

**What the Zero Trust path provides** (for connections that use it):
- **Identity verification** via GitHub OAuth before SSH
- **Session audit logging** in Cloudflare dashboard
- **Access policies** — restrict by email, IP, device posture
- **Session recording** (optional) for compliance

> **Do not read this as an absolute posture.** Cloudflare Access with MFA is the
> *supported operator path*, not the only path that exists. `internal-devops/access/`
> (last updated 2026-05-04) documents additional key-only direct paths per node
> that are **not** MFA-gated and **not** Cloudflare-audited. Earlier revisions of
> this file asserted "no direct IP access", "MFA enforced", "no root SSH" and
> "all connections audit-logged" as blanket facts; each is contradicted as an
> absolute by that private record. The specific paths are deliberately not
> enumerated here.
>
> Separately: "zero exposed node ports" in the ecosystem docs means **no NodePort
> application ingress**. It does not mean nothing listens publicly on the nodes.

**Components**:
1. **Cloudflare Tunnel**: a single production tunnel carries all ingress (HTTP routes and the SSH jumphost). Name and ID are maintained in `internal-devops`.
2. **DNS**: SSH hostname CNAME -> `<tunnel-id>.cfargotunnel.com`
3. **Access Application**: Zero Trust SSH app with GitHub IdP
4. **Access Policy**: Email whitelist for authorized team members (roster in `internal-devops`)

---

## Implementation Checklist

### Prerequisites
- [x] Cloudflare account with Zero Trust enabled
- [x] Tunnel created (name and ID in `internal-devops`)
- [x] SSH hardening script created (`05-ssh-hardening.sh`)
- [x] Cloudflared setup script created (`06-cloudflared-setup.sh`)
- [x] Local SSH config updated (`~/.ssh/config`)
- [x] Production DNS managed via Cloudflare
- [x] GitHub OAuth identity provider configured
- [x] Access Application created with automatic cloudflared authentication
- [x] Access Policy configured (email whitelist)
- [x] Port 22 closed on firewall *(as recorded 2025-12-03 for the node this described; see the Phase 3 caveat above — this is not a fleet-wide claim and has not been re-verified in this repository)*

### Server-Side Setup
```bash
# 1. Run SSH hardening (keeps port 22 open initially)
sudo ./05-ssh-hardening.sh

# 2. Test SSH with solarpunk user (CRITICAL - do this first!)
# From local machine:
ssh -i ~/.ssh/id_ed25519 solarpunk@<BOOTSTRAP_HOST>

# 3. Once confirmed working, install cloudflared
TUNNEL_TOKEN='<token-from-cloudflare>' sudo ./06-cloudflared-setup.sh

# 4. Verify tunnel is connected
cloudflared tunnel info

# 5. Test SSH via tunnel
ssh <SSH_HOST>

# 6. Close port 22 (ONLY after tunnel SSH works!)
sudo ufw delete allow 22/tcp
```

### Cloudflare Dashboard Setup
1. **Zero Trust** → **Access** → **Applications**
   - Create SSH application for the host documented in `internal-devops`
   - Type: SSH
   - Session duration: 1 hour

2. **Access Policies**
   - Include: Email matches the operator roster maintained in `internal-devops`
   - Identity Provider: GitHub

3. **Verify Tunnel Health**
   - **Networks** -> **Tunnels** -> production tunnel documented in `internal-devops`
   - Status should show "Healthy"

---

## Client Configuration

### SSH Config (`~/.ssh/config`)
```
# Solarpunk Foundry Server via Cloudflare Zero Trust
Host <SSH_HOST>
  ProxyCommand cloudflared access ssh --hostname %h
  User solarpunk
  IdentityFile ~/.ssh/id_ed25519
```

### Required Software
- `cloudflared` - Install via `brew install cloudflared` (macOS)
- SSH client with ProxyCommand support

### Connection Flow
1. Run `ssh <SSH_HOST>`
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
ssh -i ~/.ssh/id_ed25519 solarpunk@<BOOTSTRAP_HOST>

# Debug cloudflared
sudo journalctl -u cloudflared -f
sudo systemctl restart cloudflared
```

### If Locked Out
1. Use provider console console (rescue mode)
2. Or contact the provider support path documented in internal-devops for KVM access
3. Re-enable port 22 and direct SSH access

---

## Infrastructure-as-code integration

**Removed 2026-07-25.** Earlier revisions pointed at
`infrastructure/terraform/cloudflare.tf` in this repository. That Terraform was
deleted in the same change: it declared a *second* Cloudflare tunnel routing to
`localhost` ports, which contradicts the live single-tunnel model, and it was
not runnable (undeclared provider, undeclared variables, missing data source).
See `infrastructure/README.md` for the removal ledger.

Cloudflare tunnel routes and DNS are managed through the Enclii control plane
(`enclii providers`), not from this repository. Tunnel configuration of record
lives in `internal-devops`.

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
| ~~`terraform/cloudflare.tf`~~ | Removed 2026-07-25 — see "Infrastructure-as-code integration" above |
| `~/.ssh/config` | Local SSH client configuration |

---

## Configuration Details (Phase 3)

Removed from this public repository on 2026-07-25.

The concrete Zero Trust configuration — tunnel name and ID, SSH hostname,
service target, Access application name and session duration, and the
authorized-operator roster — is Lane A material under
`internal-devops/docs/repo-boundary-contract.md`, which forbids copying raw
IPs, SSH details, and host credentials into public repos.

The canonical records are:

| What | Where |
|------|-------|
| Tunnel inventory (name, ID, routes) | `internal-devops/ecosystem/domain-map.md` |
| Node inventory and SSH targets | `internal-devops/infrastructure/nodes.md` |
| Operator access paths and policy | `internal-devops/access/` |

---

*Historical narrative written 2025-12-03. Reviewed and sanitized 2026-07-25.*
*Public-safe: contains no node identifiers, IP addresses, tunnel IDs, or operator identities.*
