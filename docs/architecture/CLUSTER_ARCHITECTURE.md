# MADFAM Cluster Architecture

> **Last Updated**: January 19, 2026
> **Status**: Production - Operational

## Overview

The MADFAM platform runs on a **3-node K3s cluster** with dedicated
roles for workloads and CI/CD builds. Hardware specs, IPs, hostnames,
and costs are in the private `internal-devops/infrastructure/nodes.md`
registry.

## Node Architecture

### Control Plane / Workload Node

| Attribute | Value |
|-----------|-------|
| **Role** | Kubernetes control plane and production workloads |
| **Inventory** | See `internal-devops` |

**Workloads:**
- ✅ Enclii Control Plane (`api.enclii.dev`, `app.enclii.dev`)
- ✅ Janua SSO (`auth.madfam.io`)
- ✅ Dhanam Services (`dhan.am`)
- ✅ PostgreSQL (in-cluster with Longhorn PVC)
- ✅ Redis (in-cluster)
- ✅ Cloudflare Tunnel (2 replicas)

**Taints:** None (accepts all workloads)

### Worker Node

| Attribute | Value |
|-----------|-------|
| **Role** | Application workloads and shared services |
| **Inventory** | See `internal-devops` |

### Builder Node

| Attribute | Value |
|-----------|-------|
| **Role** | CI/CD build jobs and artifact generation |
| **Inventory** | See `internal-devops` |

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
│  Switchyard API │  (Cluster workloads)
│  api.enclii.dev │
└────────┬────────┘
         │ Enqueue Build Job
         ▼
┌─────────────────┐
│   Roundhouse    │  (Builder node)
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
│  K8s Reconciler │  (Cluster workloads)
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
│  Control plane / workload nodes             │
│  ┌─────────────────────────────────────┐    │
│  │ cloudflared (2 replicas)            │    │
│  │ • auth.madfam.io → janua-api:80     │    │
│  │ • api.enclii.dev → switchyard:80    │    │
│  │ • app.enclii.dev → switchyard-ui:80 │    │
│  │ • dhan.am → dhanam-web:80           │    │
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
│  Builder node                               │
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

This repo is public and does not publish infrastructure costs. The cost
ledger lives in the private `internal-devops` repo.

## Scaling Path

When traffic demands exceed single-node capacity:

1. **Add Worker Nodes** → Replicate the dedicated workload-node pattern
2. **Enable Longhorn Replication** → 2-3 replicas for HA
3. **Enable Redis Sentinel** → Manifests staged at `infra/k8s/production/redis-sentinel.yaml`
4. **Add GPU Node** → NVIDIA device plugin ready at `infra/k8s/base/gpu/`

## Related Documentation

- [Port Allocation](../PORT_ALLOCATION.md)
- [Enclii Production Deployment](../../../enclii/docs/production/PRODUCTION_DEPLOYMENT_ROADMAP.md)
- [Janua Integration](../JANUA_INTEGRATION.md)
- [SSH Access](../SSH_ACCESS.md)
