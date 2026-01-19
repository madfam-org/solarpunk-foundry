# MADFAM Cluster Architecture

> **Last Updated**: January 19, 2026
> **Status**: Production - Operational

## Overview

The MADFAM platform runs on a **2-Node Hetzner Cluster** with dedicated roles for workloads and CI/CD builds.

## Node Architecture

### Node A: "The Sanctuary" (Production Workloads)

| Attribute | Value |
|-----------|-------|
| **Role** | Production Workloads (Apps/DBs) |
| **Hardware** | Hetzner AX41-NVMe |
| **CPU** | AMD Ryzen 5 3600 (6 cores/12 threads) |
| **RAM** | 64GB DDR4 ECC |
| **Storage** | 2x 512GB NVMe SSD |
| **Network** | 1 Gbit/s |
| **Hostname** | `foundry-core` |
| **Cost** | ~$50/month |

**Workloads:**
- ✅ Enclii Control Plane (`api.enclii.dev`, `app.enclii.dev`)
- ✅ Janua SSO (`auth.madfam.io`)
- ✅ Dhanam Services (`dhanam.com`)
- ✅ PostgreSQL (in-cluster with Longhorn PVC)
- ✅ Redis (in-cluster)
- ✅ Cloudflare Tunnel (2 replicas)

**Taints:** None (accepts all workloads)

### Node B: "The Forge" (CI/CD Builder)

| Attribute | Value |
|-----------|-------|
| **Role** | CI/CD Builder Node |
| **Hardware** | Hetzner VPS (CX41) |
| **CPU** | 4 vCPUs |
| **RAM** | 16GB |
| **Storage** | 160GB NVMe |
| **Network** | 1 Gbit/s |
| **Hostname** | `forge-builder` |
| **Cost** | ~$15/month |

**Workloads:**
- ✅ Roundhouse Build Workers (Kaniko)
- ✅ SBOM Generation Jobs
- ✅ Build Cache Storage

**Taints:**
```yaml
taints:
  - key: "builder"
    value: "true"
    effect: "NoSchedule"
```

**Tolerations (Build Pods Only):**
```yaml
tolerations:
  - key: "builder"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"
```

## Build Pipeline Architecture

### NEXT_PUBLIC_ Environment Variables

For Next.js applications, build-time environment variables are injected via Docker `ARG` in the Dockerfile:

```dockerfile
# Build arguments for NEXT_PUBLIC_ vars (injected by Enclii Builder)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_JANUA_CLIENT_ID
ARG NEXT_PUBLIC_JANUA_ISSUER

# Set as env vars for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_JANUA_CLIENT_ID=$NEXT_PUBLIC_JANUA_CLIENT_ID
ENV NEXT_PUBLIC_JANUA_ISSUER=$NEXT_PUBLIC_JANUA_ISSUER
```

### Build Flow

```
GitHub Push Webhook
        │
        ▼
┌─────────────────┐
│  Switchyard API │  (The Sanctuary)
│  api.enclii.dev │
└────────┬────────┘
         │ Enqueue Build Job
         ▼
┌─────────────────┐
│   Roundhouse    │  (The Forge - Builder Node)
│   Build Worker  │
│   ┌──────────┐  │
│   │  Kaniko  │  │  ← Rootless container builds
│   └──────────┘  │
└────────┬────────┘
         │ Push Image
         ▼
┌─────────────────┐
│     ghcr.io     │
│  Container Reg  │
└────────┬────────┘
         │ Deploy Webhook
         ▼
┌─────────────────┐
│  K8s Reconciler │  (The Sanctuary)
│   Deployment    │
└─────────────────┘
```

## Network Topology

```
Internet
    │
    ▼
┌─────────────────────────────────────────────┐
│           Cloudflare Edge (Global)          │
│  • DDoS Protection                          │
│  • TLS Termination                          │
│  • WAF Rules                                │
└─────────────────┬───────────────────────────┘
                  │ Cloudflare Tunnel (Encrypted)
                  ▼
┌─────────────────────────────────────────────┐
│  The Sanctuary (foundry-core)               │
│  ┌─────────────────────────────────────┐    │
│  │ cloudflared (2 replicas)            │    │
│  │ • auth.madfam.io → janua-api:80     │    │
│  │ • api.enclii.dev → switchyard:80    │    │
│  │ • app.enclii.dev → switchyard-ui:80 │    │
│  │ • dhanam.com → dhanam-web:80        │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Redis   │  │  Apps    │  │
│  │ (Longhorn│  │          │  │          │  │
│  │   PVC)   │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
                  │
                  │ K8s Internal Network
                  ▼
┌─────────────────────────────────────────────┐
│  The Forge (forge-builder)                  │
│  ┌─────────────────────────────────────┐    │
│  │ Roundhouse Build Workers            │    │
│  │ • Kaniko (rootless builds)          │    │
│  │ • SBOM Generation                   │    │
│  │ • Build Cache                       │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## SSO Architecture (Janua OIDC)

All admin interfaces enforce Janua SSO authentication:

| Service | SSO Status | Client ID |
|---------|------------|-----------|
| Enclii Dashboard | ✅ Enforced | `enclii-web` |
| Dispatch (Admin) | ✅ Enforced | `dispatch-admin` |
| Dhanam Web | ✅ Enforced | `dhanam-ledger` |
| Dhanam Admin | ✅ Enforced | `dhanam-admin` |

**Auth Flow:**
```
User → app.enclii.dev → auth.madfam.io (Janua)
                              │
                              ▼
                    GitHub/Google OAuth
                              │
                              ▼
                    JWT (RS256 signed)
                              │
                              ▼
                    app.enclii.dev (authenticated)
```

## Cost Summary

| Component | Monthly Cost |
|-----------|--------------|
| The Sanctuary (AX41-NVMe) | $50 |
| The Forge (CX41 VPS) | $15 |
| Cloudflare (Tunnel, R2) | $5 |
| **Total** | **~$70/month** |

## Scaling Path

When traffic demands exceed single-node capacity:

1. **Add Worker Nodes** → Replicate "The Sanctuary" pattern
2. **Enable Longhorn Replication** → 2-3 replicas for HA
3. **Enable Redis Sentinel** → Manifests staged at `infra/k8s/production/redis-sentinel.yaml`
4. **Add GPU Node** → NVIDIA device plugin ready at `infra/k8s/base/gpu/`

## Related Documentation

- [Port Allocation](../PORT_ALLOCATION.md)
- [Enclii Production Deployment](../../../enclii/docs/production/PRODUCTION_DEPLOYMENT_ROADMAP.md)
- [Janua Integration](../JANUA_INTEGRATION.md)
- [SSH Access](../SSH_ACCESS.md)
