# Janua Kubernetes Infrastructure

> **Sustainable, GitOps-ready Kubernetes manifests for Janua authentication service**

## Overview

This directory contains Kustomize-based Kubernetes manifests for deploying Janua to production. These manifests capture all runtime configuration fixes and provide a reproducible, version-controlled deployment path.

## Directory Structure

```
janua/
├── base/                           # Base manifests (shared across environments)
│   ├── kustomization.yaml          # Base kustomization
│   ├── namespace.yaml              # Namespace definition
│   ├── configmap.yaml              # Non-sensitive configuration
│   ├── deployment.yaml             # Core deployment spec
│   └── service.yaml                # ClusterIP service
│
├── overlays/                       # Environment-specific overlays
│   ├── production/                 # Production (auth.madfam.io)
│   │   ├── kustomization.yaml      # Production kustomization
│   │   ├── configmap-patch.yaml    # OIDC issuer, CORS config
│   │   ├── deployment-patch.yaml   # RS256 keys, volume mounts
│   │   └── secrets.yaml.template   # Secret structure (DO NOT COMMIT VALUES)
│   │
│   └── staging/                    # Staging environment
│       └── kustomization.yaml
│
├── scripts/
│   └── deploy.sh                   # Deployment script
│
└── README.md                       # This file
```

## Quick Start

### Prerequisites

- `kubectl` configured with cluster access
- `kustomize` (or use `kubectl kustomize`)
- Secrets already created in cluster (see Secrets Management)

### Deploy to Production

```bash
# Preview changes
./scripts/deploy.sh production diff

# Apply changes
./scripts/deploy.sh production apply

# Generate manifests only (for review)
./scripts/deploy.sh production build > manifests.yaml
```

### Deploy to Staging

```bash
./scripts/deploy.sh staging apply
```

---

## Secrets Management

### Required Secrets

Janua requires three secrets in the `janua` namespace:

| Secret Name | Description | Keys |
|------------|-------------|------|
| `janua-secrets` | Core application secrets | `secret-key`, `jwt-secret`, `database-url`, `redis-url` |
| `janua-jwt-keys` | RS256 signing keys | `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` |
| `ghcr-credentials` | Container registry auth | `.dockerconfigjson` |

### Creating Secrets Manually

#### 1. Core Application Secrets

```bash
# Generate random strings
SECRET_KEY=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Create secret
kubectl create secret generic janua-secrets \
  --from-literal=secret-key="$SECRET_KEY" \
  --from-literal=jwt-secret="$JWT_SECRET" \
  --from-literal=database-url="postgresql://janua:PASSWORD@postgres-shared:5432/janua_prod" \
  --from-literal=redis-url="redis://:PASSWORD@redis-shared:6379/0" \
  -n janua
```

#### 2. RS256 JWT Signing Keys

```bash
# Generate RSA key pair
openssl genrsa -out /tmp/private.pem 2048
openssl rsa -in /tmp/private.pem -pubout -out /tmp/public.pem

# Create secret
kubectl create secret generic janua-jwt-keys \
  --from-file=JWT_PRIVATE_KEY=/tmp/private.pem \
  --from-file=JWT_PUBLIC_KEY=/tmp/public.pem \
  -n janua

# Clean up local keys
rm /tmp/private.pem /tmp/public.pem
```

#### 3. Container Registry Credentials

```bash
kubectl create secret docker-registry ghcr-credentials \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_PAT \
  --docker-email=YOUR_EMAIL \
  -n janua
```

### Verifying Secrets

```bash
# List secrets
kubectl get secrets -n janua

# Verify secret keys (without showing values)
kubectl get secret janua-secrets -n janua -o jsonpath='{.data}' | jq 'keys'
kubectl get secret janua-jwt-keys -n janua -o jsonpath='{.data}' | jq 'keys'
```

---

## Configuration Reference

### Environment Variables

| Variable | Description | Default | Override Location |
|----------|-------------|---------|-------------------|
| `BASE_URL` | OIDC issuer URL | `https://janua.dev` | `configmap-patch.yaml` |
| `JWT_ISSUER` | JWT issuer claim | `https://janua.dev` | `configmap-patch.yaml` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `15` | `configmap.yaml` (480) |
| `JWT_PRIVATE_KEY` | RS256 private key | - | `janua-jwt-keys` secret |
| `JWT_PUBLIC_KEY` | RS256 public key | - | `janua-jwt-keys` secret |

### Port Configuration

| Port | Purpose | Description |
|------|---------|-------------|
| `8000` | Container port | FastAPI application |
| `4100` | Service port | Cloudflare Tunnel target |

### Health Probes

The deployment includes health probes configured for Janua's TrustedHostMiddleware:

```yaml
httpGet:
  path: /health
  port: 8000
  httpHeaders:
    - name: Host
      value: janua-api.janua.svc.cluster.local
```

**Critical**: The `Host` header is required because Janua's TrustedHostMiddleware rejects requests with unknown hosts.

---

## Troubleshooting

### Pod CrashLoopBackOff

1. **Check logs**: `kubectl logs -n janua deployment/janua-api`
2. **Common causes**:
   - Missing secrets (check `kubectl get secrets -n janua`)
   - Invalid database URL (check connectivity)
   - Malformed JWT keys (ensure PEM format)

### Health Probe Failures

1. **400 Bad Request**: TrustedHostMiddleware rejecting probe
   - Fix: Ensure `Host` header is set in probe config
2. **404 Not Found**: Wrong endpoint path
   - Fix: Use `/health`, not `/health/ready`
3. **Connection Refused**: Wrong port
   - Fix: Probe port should be `8000`, not `8080`

### OIDC Authentication Errors

1. **"id token issued by different provider"**:
   - Check: `BASE_URL` and `JWT_ISSUER` must match `https://auth.madfam.io`
   - Verify: `kubectl get configmap janua-config -n janua -o yaml`

2. **"unexpected signature algorithm HS256"**:
   - Check: `janua-jwt-keys` secret exists with valid RSA keys
   - Verify: `kubectl get secret janua-jwt-keys -n janua`

### Viewing Current Configuration

```bash
# See deployed configuration
kubectl get configmap janua-config -n janua -o yaml

# See environment variables in pod
kubectl exec -n janua deployment/janua-api -- env | grep -E 'JWT|BASE_URL|ISSUER'
```

---

## Roadmap: Enclii Reconciler Integration

### Current State (Kustomize)

- Manifests stored in git
- Manual deployment via `deploy.sh`
- Secrets managed via kubectl
- Changes require git commit + manual apply

### Target State (Enclii-Managed)

```
┌─────────────────────────────────────────────────────────┐
│                   Enclii Platform                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   GitHub    │───▶│  Switchyard │───▶│ Reconciler  │ │
│  │   Webhook   │    │     API     │    │ Controller  │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                            │                    │       │
│                            ▼                    ▼       │
│                     ┌─────────────┐      ┌───────────┐ │
│                     │  Database   │      │ Kubernetes│ │
│                     │  (Releases) │      │  Cluster  │ │
│                     └─────────────┘      └───────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Integration Steps

1. **Phase 1: Kustomize Overlay Support** (Weeks 1-2)
   - Add `deployment_template` field to Service model
   - Reconciler reads Kustomize overlay from git repo
   - Applies overlay on top of standard deployment

2. **Phase 2: Secret Reference Support** (Weeks 3-4)
   - Add `external_secrets` field to Service model
   - Reconciler injects secret references into deployment
   - Integrate with External Secrets Operator or Vault

3. **Phase 3: Full GitOps** (Weeks 5-6)
   - ArgoCD or Flux integration option
   - Automatic sync from git to cluster
   - Drift detection and alerting

### Interim Solution

Until Enclii supports custom deployment templates:

1. Enclii manages image builds and releases
2. Kustomize overlays patch Enclii-created deployments
3. Deploy script applies overlays after Enclii deployment

---

## Related Documentation

- [Janua Repository](https://github.com/madfam-io/janua)
- [Enclii CLAUDE.md](../../enclii/CLAUDE.md)
- [Port Allocation](../../docs/PORT_ALLOCATION.md)
- [Cloudflare Tunnel Config](../production/cloudflared.yaml)

---

*Janua Infrastructure v1.0.0 | Sustainable Kubernetes Deployment | MADFAM Ecosystem*
