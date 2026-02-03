# Cross-Repository Navigation Guide

> **Last Verified**: February 3, 2026
> **Purpose**: Navigate documentation across the MADFAM ecosystem repositories

---

## Quick Links by Topic

### Port Allocation & Networking
| Document | Location | Description |
|----------|----------|-------------|
| **PORT_ALLOCATION.md** | `solarpunk-foundry/docs/` | **Single source of truth** for all port assignments |
| Service Routing | `enclii/infra/DEPLOYMENT.md` | K8s service routing for production |
| Cloudflare Tunnel | `enclii/infra/k8s/production/cloudflared-unified.yaml` | Production ingress routes |

### Authentication (Janua)
| Document | Location | Description |
|----------|----------|-------------|
| Integration Guide | `solarpunk-foundry/docs/JANUA_INTEGRATION.md` | SDK integration patterns |
| Janua Architecture | `janua/docs/ARCHITECTURE.md` | Internal Janua design |
| OIDC Configuration | `janua/k8s/base/` | Production K8s manifests |
| Enclii SSO Config | `enclii/apps/switchyard-api/internal/auth/` | How Enclii uses Janua |

### Infrastructure & Deployment
| Document | Location | Description |
|----------|----------|-------------|
| Enclii CLAUDE.md | `enclii/CLAUDE.md` | Complete Enclii architecture overview |
| GitOps Setup | `enclii/docs/infrastructure/GITOPS.md` | ArgoCD App-of-Apps pattern |
| Storage (Longhorn) | `enclii/docs/infrastructure/STORAGE.md` | Persistent volume configuration |
| Migration Plan | `solarpunk-foundry/docs/ENCLII_MIGRATION_PLAN.md` | Service migration status |
| DR Runbook | `enclii/docs/production/DR_RUNBOOK.md` | Disaster recovery procedures |

### Ecosystem Architecture
| Document | Location | Description |
|----------|----------|-------------|
| Symbiosis | `solarpunk-foundry/docs/architecture/SYMBIOSIS.md` | Substrate/Trellis/Membrane architecture |
| Federated Architecture | `solarpunk-foundry/docs/architecture/FEDERATED_ARCHITECTURE_README.md` | Service federation design |
| Cluster Architecture | `solarpunk-foundry/docs/architecture/CLUSTER_ARCHITECTURE.md` | K8s cluster design |
| Ecosystem Status | `solarpunk-foundry/docs/ECOSYSTEM_STATUS.md` | Live service status |

### Dogfooding & Development
| Document | Location | Description |
|----------|----------|-------------|
| Dogfooding Guide | `solarpunk-foundry/docs/DOGFOODING_GUIDE.md` | Local development setup |
| Enclii Dogfooding | `enclii/docs/guides/DOGFOODING_GUIDE.md` | Enclii-specific dogfooding |
| Service Specs | `enclii/dogfooding/` | Enclii service definitions |

### Financial Services (Dhanam)
| Document | Location | Description |
|----------|----------|-------------|
| Dhanam README | `dhanam/README.md` | Financial platform overview |
| K8s Manifests | `dhanam/infra/k8s/production/` | Production deployment |

---

## Repository Locations

```
~/labspace/
├── solarpunk-foundry/     # Ecosystem orchestration & shared packages
├── enclii/                # PaaS platform (control plane, UI, CLI)
├── janua/                 # Identity & authentication service
├── dhanam/                # Financial management platform
├── forgesight/            # Manufacturing intelligence
├── digifab-quoting/       # Cotiza quoting engine
├── sim4d/                 # CAD/CAM simulation
└── [other MADFAM repos]
```

---

## Key Infrastructure Files

### Kubernetes Configuration
| Purpose | Canonical Location |
|---------|-------------------|
| Enclii K8s | `enclii/infra/k8s/` |
| Janua K8s | `janua/k8s/` |
| Dhanam K8s | `dhanam/infra/k8s/` |
| ArgoCD | `enclii/infra/argocd/` |
| Longhorn | `enclii/infra/helm/longhorn/` |

### Shared Infrastructure
| Purpose | Location |
|---------|----------|
| Docker Compose (dev) | `solarpunk-foundry/ops/local/docker-compose.shared.yml` |
| Database Init | `solarpunk-foundry/ops/postgres/init-databases.sql` |
| madfam.sh Control | `solarpunk-foundry/ops/bin/madfam.sh` |

---

## Service Port Quick Reference

Per `PORT_ALLOCATION.md`:

| Service | Port Range | Example |
|---------|------------|---------|
| Janua | 4100-4199 | 4100 (API) |
| Enclii | 4200-4299 | 4200 (API), 4201 (UI) |
| ForgeSight | 4300-4399 | 4300 (API) |
| Fortuna | 4400-4499 | 4400 (API) |
| Cotiza | 4500-4599 | 4500 (API) |
| AVALA | 4600-4699 | 4600 (API) |
| Dhanam | 4700-4799 | 4700 (API), 4701 (Web) |
| Sim4D | 4800-4899 | 4800 (API) |

---

## Production Domains

| Service | Domain | Source Config |
|---------|--------|---------------|
| Enclii API | api.enclii.dev | `enclii/infra/k8s/production/cloudflared-unified.yaml` |
| Enclii UI | app.enclii.dev | `enclii/infra/k8s/production/cloudflared-unified.yaml` |
| Janua Auth | auth.madfam.io | `enclii/infra/k8s/production/cloudflared-unified.yaml` |
| Dhanam | app.dhanam.dev | `dhanam/infra/k8s/production/` |

---

## Getting Help

1. **Port conflicts**: Check `solarpunk-foundry/docs/PORT_ALLOCATION.md`
2. **Auth issues**: Check `solarpunk-foundry/docs/JANUA_INTEGRATION.md`
3. **Deployment issues**: Check `enclii/docs/production/DR_RUNBOOK.md`
4. **Local dev setup**: Check `solarpunk-foundry/docs/DOGFOODING_GUIDE.md`

---

*This document should be updated whenever major documentation is added or relocated.*
