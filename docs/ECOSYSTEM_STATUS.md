# MADFAM Ecosystem Status

> **Live Infrastructure Status** - Last updated: January 11, 2026

---

## Cluster Overview

| Property | Value |
|----------|-------|
| **Cluster Type** | K3s (lightweight Kubernetes) |
| **Node** | `foundry-core` (<CONTROL_PLANE_IP>) |
| **Server** | Hetzner dedicated server (single-node) |
| **Ingress** | Cloudflare Tunnel (zero-trust) |
| **Cost** | see internal-devops |

---

## Service Status

### Layer 1: Soil (Infrastructure)

#### Janua (Identity Platform) - 4100-4199
| Service | Status | Domain | Notes |
|---------|--------|--------|-------|
| janua-api | 🟢 Running | auth.madfam.io | OAuth2/OIDC provider |
| janua-dashboard | 🟢 Running | app.janua.dev | User management |
| janua-admin | 🟢 Running | admin.janua.dev | Admin console |
| janua-docs | 🟢 Running | docs.janua.dev | Documentation |
| janua-website | 🟢 Running | janua.dev | Marketing site |

**Janua Summary**: 5/5 pods healthy, 202 REST endpoints, 8 SDKs

#### Enclii (PaaS Platform) - 4200-4299
| Service | Status | Domain | Notes |
|---------|--------|--------|-------|
| switchyard-api | 🟢 Running | api.enclii.dev | Control plane API |
| switchyard-ui | 🟢 Running | app.enclii.dev | Web dashboard |
| roundhouse | 🟢 Running | - | Build worker |
| roundhouse-api | 🟢 Running | - | Build coordination |
| waybill | 🟢 Running | - | Cost tracking |
| landing-page | 🟢 Running | enclii.dev | Marketing site |
| docs-site | 🟢 Running | docs.enclii.dev | Documentation |

**Enclii Summary**: 7/7 pods healthy, SSO logout fix deployed (Jan 2026)

---

### Data Layer

| Service | Status | Port | Notes |
|---------|--------|------|-------|
| postgres-0 | 🟢 Running | 5432 | Self-hosted in-cluster |
| redis | 🟢 Running | 6379 | Session cache |

---

### Monitoring Stack

| Service | Status | Purpose |
|---------|--------|---------|
| prometheus | 🟢 Running | Metrics collection |
| grafana | 🟢 Running | Dashboards (pending config) |
| alertmanager | 🟢 Running | Alert routing |

---

### Cloudflare Tunnel

| Pod | Status | Notes |
|-----|--------|-------|
| cloudflared-5fc7cbc8d8-2znpt | 🟢 Running | Active tunnel |
| cloudflared-5fc7cbc8d8-469b4 | 🟢 Running | Active tunnel |

**Tunnel Summary**: 2/2 pods healthy, traffic routing operational

---

## Known Issues

**All issues resolved as of January 10, 2026 (21:55 CST)**

### Resolved: docs-site Deployment
- **Issue**: Deployment spec had wrong port (8080) vs container port (4203)
- **Fix**: Patched deployment with correct port config and health probes
- **Status**: 🟢 Resolved - docs.enclii.dev operational

### Resolved: cloudflared Deployment
- **Issue**: Deployment was missing ConfigMap volume mount for `/etc/cloudflared/config.yaml`
- **Fix**: Added volume and volumeMount back to deployment spec
- **Status**: 🟢 Resolved - 2/2 pods healthy, tunnel operational

---

## Domain Routing

> **Note**: Janua uses both `*.janua.dev` (product branding) and `*.madfam.io` (MADFAM ecosystem) domains.

| Domain | Service | Status |
|--------|---------|--------|
| auth.madfam.io | janua-api | 🟢 |
| api.janua.dev | janua-api | 🟢 (alias) |
| app.janua.dev | janua-dashboard | 🟢 |
| admin.janua.dev | janua-admin | 🟢 |
| docs.janua.dev | janua-docs | 🟢 |
| janua.dev | janua-website | 🟢 |
| api.enclii.dev | switchyard-api | 🟢 |
| app.enclii.dev | switchyard-ui | 🟢 |
| enclii.dev | landing-page | 🟢 |
| docs.enclii.dev | docs-site | 🟢 |

---

## Recent Changes

| Date | Change | Impact |
|------|--------|--------|
| Jan 10, 2026 | SSO Logout fix deployed | Janua sessions now terminate on Enclii logout |
| Jan 10, 2026 | switchyard-ui rebuilt with OIDC mode | UI properly redirects to IdP logout |
| Jan 10, 2026 | Landing page redeployed | enclii.dev restored |

---

## Upcoming: AutoChess Deployment

**Port Block**: 5900-5999 (already allocated)
**Project**: `madfam-automation`

| Service | Port | Domain | Status |
|---------|------|--------|--------|
| auto-claude-api | 8080 | agents-api.madfam.io | 🔵 Ready to deploy |
| claudecodeui | 3001 | agents.madfam.io | 🔵 Ready to deploy |

**Prerequisites**:
- [x] Create Janua OAuth client (`jnc_lSGMbQtCGdHSctd4mEQoaklLBCv7xXhe`)
- [x] Create `.enclii.yml` for Auto-Claude backend
- [x] Create `.enclii.yml` for claudecodeui dashboard
- [ ] Deploy via Enclii CLI (requires SSO login for API token)
- [ ] Verify SSO authentication flow

**Deployment Path (Official Way)**:
```bash
# 1. Login to app.enclii.dev via Janua SSO
# 2. Obtain API token from browser session
# 3. Set token and deploy

export ENCLII_API_TOKEN="<token-from-dashboard>"

# Deploy backend
cd ~/labspace/Auto-Claude
~/labspace/enclii/bin/enclii deploy \
  --api-endpoint https://api.enclii.dev \
  -f .enclii.yml -e prod

# Deploy dashboard
cd ~/labspace/claudecodeui
~/labspace/enclii/bin/enclii deploy \
  --api-endpoint https://api.enclii.dev \
  -f .enclii.yml -e prod
```

---

## Quick Commands (Official Way via Enclii)

```bash
# Set API token (obtain from app.enclii.dev after Janua SSO login)
export ENCLII_API_TOKEN="<your-token>"

# List services
~/labspace/enclii/bin/enclii ps --api-endpoint https://api.enclii.dev -e prod

# View logs
~/labspace/enclii/bin/enclii logs <service-name> --api-endpoint https://api.enclii.dev

# Deploy a service
~/labspace/enclii/bin/enclii deploy --api-endpoint https://api.enclii.dev -e prod

# Rollback a service
~/labspace/enclii/bin/enclii rollback <service-name> --api-endpoint https://api.enclii.dev
```

---

*This document reflects live infrastructure state. Use Enclii CLI for official operations.*
