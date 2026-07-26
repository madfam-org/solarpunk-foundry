# Solarpunk Foundry Infrastructure Reference Guide

> [!CAUTION]
> **PARTLY HISTORICAL.** Written 2025-12-02 for a single Docker Compose host;
> reviewed 2026-07-25. Sections §3, §4 and §7 describe an architecture that no
> longer exists and must not be followed. Production is bare-metal k3s with
> ArgoCD GitOps and Enclii as the control plane. A per-section status table is
> immediately below. The operational source of truth is the private
> `internal-devops` repository, not this file.

> [!IMPORTANT]
> MADFAM-ENCLII-FIRST-LEGACY-RAW v1: This document contains legacy raw infrastructure command examples.
> Routine production operations must use Enclii web, API, or CLI. Treat raw
> `kubectl`, `helm`, SSH, provider CLI/API, `docker exec`, and direct container
> access as platform bootstrap or documented break-glass only, and record any
> missing Enclii adapter gap.


> **Layer 1: "The Soil"** - Foundation infrastructure for the MADFAM ecosystem

**Document Version**: 1.1
**Written**: 2025-12-02 · **Reviewed and re-labelled**: 2026-07-25
**Classification**: Public-safe reference. Sensitive inventory lives in `internal-devops`.

---

## ⚠ What in this document is current, and what is not

This file was written on 2025-12-02, when the estate ran as Docker Compose on a
single host. **It is now partly historical.** Rather than delete the historical
sections — the ZFS reasoning in particular is real and worth keeping — each is
labelled in place:

| Section | Status |
|---|---|
| §1 Cluster Topology | **Current in shape.** 3-node cluster. Node identity, IPs, hardware and cost are deliberately absent; see `internal-devops/infrastructure/nodes.md` (last verified 2026-05-04). |
| §2 OS & Storage | **Current for the host OS/ZFS layer.** Note that *workload* block storage is Longhorn CSI on Kubernetes, not these ZFS datasets. |
| §3 Container Engine | **HISTORICAL — superseded.** Orchestration is bare-metal k3s + ArgoCD, not Docker Compose. The `172.18.x.x` Docker bridge subnets are not a network model the cluster uses. |
| §4 Application Layer | **HISTORICAL — superseded.** Services run as Kubernetes Deployments in per-app namespaces, not as named containers on host ports. |
| §5 Security & Fixes Log | **Retained as engineering notes.** The admin-bootstrap incident was removed 2026-07-25 (Lane A). |
| §6 Port Allocation | **Superseded — see `../docs/PORT_ALLOCATION.md`.** The block table previously duplicated here disagreed with that document. |
| §7 Maintenance Procedures | **HISTORICAL — superseded and unsafe to follow.** Deploys are GitOps; ArgoCD `selfHeal` reverts hand-applied changes. |

**Nothing here is a substitute for `internal-devops`**, which is the operational
source of truth for topology, capacity, access and runbooks. For how MADFAM
actually ships today, see the table in [`README.md`](./README.md).

---

## Table of Contents

1. [Cluster Topology](#1-cluster-topology-the-bedrock)
2. [OS & Storage Architecture](#2-os--storage-architecture-the-soil)
3. [Container Engine](#3-the-container-engine)
4. [Application Layer](#4-application-layer-the-organs)
5. [Security & Fixes Log](#5-security--fixes-log-tribal-knowledge)
6. [Port Allocation](#6-port-allocation)
7. [Maintenance Procedures](#7-maintenance-procedures)

---

## 1. Cluster Topology ("The Bedrock")

Production runs as a 3-node cluster. Concrete node names, IP addresses,
SSH targets, provider inventory, hardware specs, and cost data are not
published in this repository; see `internal-devops/infrastructure/nodes.md`.

### Public-Safe Node Shape

| Role | Purpose |
|------|---------|
| Control plane | Kubernetes control plane and core platform workloads |
| Worker | Application workloads and shared services |
| Builder | CI/CD build jobs and artifact generation |

---

## 2. OS & Storage Architecture ("The Soil")

### Operating System

| Property | Value |
|----------|-------|
| **Distribution** | Ubuntu 24.04 LTS |
| **Kernel** | Linux 6.x |
| **Init System** | systemd |

### Partitioning Strategy: "Trojan Horse" Method

Some provider provisioning flows require ext4 partitions. The production-specific provisioning notes live in `internal-devops`; the public-safe pattern is:

```
1. Install via `installimage` with standard ext4 partitions (passes validation)
2. Boot into installed system
3. Destroy data partition
4. Replace with ZFS pool
```

### ZFS Pool Configuration

**Pool Name**: `rpool`
**Topology**: Mirror (RAID 1)
**Self-Healing**: Enabled via checksumming

```bash
# Pool status verification
zpool status rpool
```

### Dataset Configuration ("Biological Datasets")

Each dataset is tuned for its specific workload characteristics:

| Dataset | Mount Point | Configuration | Rationale |
|---------|-------------|---------------|-----------|
| `rpool/data/postgres` | `/data/postgres` | `recordsize=16k`, `atime=off`, `logbias=latency` | Aligned to PostgreSQL 16KB page size; prevents write amplification |
| `rpool/data/builds` | `/data/builds` | `compression=lz4` | High compression ratio for build artifacts and text logs |
| `rpool/data/assets` | `/data/assets` | `quota=150G` | Hard cap prevents asset uploads from starving system |
| `rpool/data/registry` | `/data/registry` | `compression=lz4` | Docker registry layer deduplication |

### ZFS Dataset Creation Reference

```bash
# PostgreSQL - Optimized for database workloads
zfs create -o recordsize=16k -o atime=off -o logbias=latency rpool/data/postgres

# Build artifacts - High compression
zfs create -o compression=lz4 rpool/data/builds

# Media assets - Quota-limited
zfs create -o quota=150G rpool/data/assets

# Docker registry - Compressed with dedup potential
zfs create -o compression=lz4 rpool/data/registry
```

### ZFS Advantages for This Deployment

1. **Self-Healing**: Automatic detection and correction of silent data corruption
2. **Instant Snapshots**: Sub-second backup points for rollback capability
3. **Copy-on-Write**: Safe updates without risk of partial writes
4. **Native Compression**: Reduced storage footprint for logs and builds
5. **Docker Integration**: Native ZFS storage driver for efficient container layers

---

## 3. The Container Engine

> **HISTORICAL — superseded.** Describes the pre-Kubernetes Docker Compose era
> as it stood 2025-12-02. Production orchestration is bare-metal k3s with ArgoCD
> GitOps; the Docker daemon config, ZFS storage driver and `172.18.x.x` bridge
> networks below are not how the cluster runs. Retained as a record of what
> preceded it.

### Runtime Configuration

| Component | Value |
|-----------|-------|
| **Runtime** | Docker Engine |
| **Orchestration** | Docker Compose |
| **Storage Driver** | ZFS (Native) |

### Docker Daemon Configuration

**File**: `/etc/docker/daemon.json`

```json
{
  "storage-driver": "zfs",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {
      "base": "172.18.0.0/16",
      "size": 24
    }
  ]
}
```

### ZFS Storage Driver Benefits

- **Instant Container Creation**: Copy-on-write cloning
- **Layer Deduplication**: Shared base images consume minimal space
- **Snapshot Integration**: Container state can be snapshotted with ZFS
- **Performance**: Native filesystem operations without overlay overhead

### Network Configuration

| Network | Subnet | Purpose |
|---------|--------|---------|
| `janua-network` | `172.18.2.0/24` | Janua services internal communication |
| `enclii-network` | `172.18.3.0/24` | Enclii PaaS services |
| `shared-network` | `172.18.1.0/24` | Cross-project shared services |

---

## 4. Application Layer ("The Organs")

> **HISTORICAL — superseded.** Services no longer run as named Docker containers
> on host ports. They run as Kubernetes Deployments in per-app namespaces, with
> ingress via a single Cloudflare Tunnel to a K8s Service on port 80. The
> container-name/host-port pairs below are a 2025-12-02 snapshot of an
> architecture that no longer exists. Note in particular that `enclii-core`
> below is a *container name*, not a node name — later docs mistakenly promoted
> it into a hostname.

### Shared Infrastructure Services

| Service | Container | Port | Volume Mount |
|---------|-----------|------|--------------|
| PostgreSQL | `postgres-shared` | 5432 | `/data/postgres` |
| Redis | `redis-shared` | 6379 | `/data/redis` |

### Janua (Identity & Authentication)

**Purpose**: OAuth2/OIDC identity platform for the MADFAM ecosystem

| Component | Container | Port | Domain |
|-----------|-----------|------|--------|
| API | `janua-api` | 4100 | `api.janua.dev` |
| Dashboard | `janua-dashboard` | 4101 | `app.janua.dev` |
| Admin | `janua-admin` | 4102 | `admin.janua.dev` |
| Docs | `janua-docs` | 4103 | `docs.janua.dev` |
| Website | `janua-website` | 4104 | `janua.dev` |

**Database**: `janua_prod` on `postgres-shared`

### Enclii (PaaS Platform)

**Purpose**: Container deployment and management platform

| Component | Container | Port | Volume Mount |
|-----------|-----------|------|--------------|
| Core | `enclii-core` | 4200 | - |
| Registry | `enclii-registry` | 4201 | `/data/registry` |
| Builder | `enclii-builder` | - | `/data/builds` |

### Inter-Service Communication

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                          │
│              (DNS + WAF + DDoS Protection)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Cloudflare Tunnel (cloudflared)                │
│                  Zero-Trust Ingress                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Docker Networks                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Janua     │  │   Enclii    │  │   Shared    │         │
│  │  Network    │  │  Network    │  │  Services   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┴────────────────┘                 │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │   postgres-shared     │                      │
│              │   redis-shared        │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Security & Fixes Log (Tribal Knowledge)

### Firewall Configuration (UFW)

**Policy**: Default Deny Incoming

```bash
# Current ruleset
ufw status verbose

# Standard configuration
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp    # HTTP (Cloudflare)
ufw allow 443/tcp   # HTTPS (Cloudflare)
```

> **Note**: Application ports (4100-4199, 4200-4299) are NOT exposed directly.
> All traffic routes through Cloudflare Tunnel.

### CORS Configuration Fix

**Issue**: Dashboard unable to communicate with API
**Symptom**: CORS preflight failures in browser console

**Resolution**: Added Dashboard origin to API CORS configuration

```python
# apps/api/app/main.py
CORS_ORIGINS = [
    "https://janua.dev",
    "https://app.janua.dev",      # Dashboard
    "https://admin.janua.dev",    # Admin panel
    "https://api.janua.dev",
]
```

### Content Security Policy Fix

**Issue**: Swagger UI documentation page blank
**Symptom**: CSP blocking CDN resources for Swagger UI

**Resolution**: Updated CSP headers to allow Swagger UI CDN sources

```python
# Security headers middleware
"script-src": "'self' 'unsafe-inline' https://cdn.jsdelivr.net",
"style-src": "'self' 'unsafe-inline' https://cdn.jsdelivr.net",
```

### TrustedHostMiddleware Fix

**Issue**: Container-to-container communication blocked
**Symptom**: Dashboard API routes returning 400 Bad Request

**Resolution**: Added Docker internal hostnames to allowed hosts

```python
# apps/api/app/main.py
allowed_hosts = [
    "janua.dev",
    "*.janua.dev",
    "localhost",
    "127.0.0.1",
    # Docker internal hostnames
    "janua-api",
    "janua-api:8000",
]
```

### The Key Ceremony (Admin Bootstrap)

**Removed 2026-07-25.** This subsection described an admin-bootstrap incident,
named the default admin identity, and named the credential store in use. Incident
evidence trails and credential-retrieval detail are Lane A under
`internal-devops/docs/repo-boundary-contract.md`. The record is retained
privately.

The generalizable lesson, which needs none of that detail: create the first
administrative user through the application's own user-creation code path, never
by direct SQL `INSERT`. Password hashing format (algorithm, salt, cost) is an
application concern, and a hand-written row will not match what the verifier
expects.

### Database Permissions Fix

**Issue**: API returning DATABASE_ERROR on queries
**Root Cause**: Tables owned by `postgres` user, `janua` user lacked permissions

**Resolution**:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO janua;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO janua;
```

---

## 6. Port Allocation

**Superseded — see [`../docs/PORT_ALLOCATION.md`](../docs/PORT_ALLOCATION.md).**

The block table that used to sit here assigned 4300-4399 to Dhanam and
4400-4499 to Avala. `PORT_ALLOCATION.md` assigns those to Fortuna and ForgeSight,
and puts Dhanam at 4700-4799 and AVALA at 4600-4699. Two public documents in one
repository disagreeing about the same registry is worse than one document, so
this copy is retired rather than corrected.

Read `PORT_ALLOCATION.md` for the scheme, its honest compliance count, and — more
useful than either — the explanation of why container port choice has no effect
in production and the two narrow cases where it does.

---

## 7. Maintenance Procedures

> **HISTORICAL — superseded, and unsafe to follow against production.**
> These are 2025-12-02 single-host Docker procedures. Two reasons not to run them:
> (a) there is no build-on-server flow — images are built by CI, pushed to GHCR,
> and pinned by digest into `kustomization.yaml`, which ArgoCD then syncs; and
> (b) ArgoCD runs with `selfHeal` enabled, so anything changed by hand on the
> cluster is reverted. Permanent changes go through the app repo.
>
> Routine production operations belong on the Enclii control plane
> (`enclii ops apps`, `ops pods`, `ops storage`, `ops secrets`). Raw `kubectl`,
> SSH and `docker exec` are for platform bootstrap or documented break-glass
> only, and each such use has to be recorded with actor, reason, target,
> commands, result and the missing-adapter note. Current break-glass procedures
> are in `internal-devops`, not here.
>
> The ZFS commands below still describe the host storage layer and remain
> accurate as reference; the Docker and deploy commands do not.

### ZFS Health Check

```bash
# Check pool status
zpool status rpool

# Check for errors
zpool status -x

# Scrub (monthly recommended)
zpool scrub rpool
```

### ZFS Snapshots

```bash
# Create snapshot
zfs snapshot rpool/data/postgres@$(date +%Y%m%d-%H%M%S)

# List snapshots
zfs list -t snapshot

# Rollback (CAUTION: destroys newer data)
zfs rollback rpool/data/postgres@<snapshot-name>
```

### Container Management

```bash
# View all Janua containers
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep janua

# View logs
docker logs janua-api --tail 100 -f

# Restart service
docker restart janua-api
```

> The "rebuild and deploy" block that used to follow — `git pull` on the server,
> `docker build`, `docker run` — was removed on 2026-07-25. It described building
> images on the production host, which is the opposite of the current model
> (CI builds → GHCR → digest pin → ArgoCD pull) and would be reverted or
> overwritten if attempted. It also referenced an on-server checkout path that no
> longer exists.

### Backup Procedures

```bash
# PostgreSQL logical backup
docker exec postgres-shared pg_dump -U janua janua_prod > backup.sql

# ZFS snapshot (preferred - instant, consistent)
zfs snapshot rpool/data/postgres@backup-$(date +%Y%m%d)

# Send snapshot to remote (disaster recovery)
zfs send rpool/data/postgres@backup-20251202 | ssh backup-server zfs recv backup/postgres
```

### Escalation

Operator escalation paths, on-call ownership and the credential-custody model
are maintained in `internal-devops` and are deliberately not published here.

One caveat worth carrying in public, because it changes how you should read any
"alerts will tell you" assumption: as of the 2026-07-16 internal launch-readiness
assessment, **alert delivery was recorded as not working**. Do not assume an
alerting backstop exists without checking the private record first.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-02 | Claude/MADFAM | Initial documentation |
| 1.1 | 2026-07-25 | Truthfulness pass | Labelled §3/§4/§7 historical; retired the duplicate port table in favour of `docs/PORT_ALLOCATION.md`; removed the admin-bootstrap incident and credential-store reference (Lane A); removed the build-on-server deploy block. |

---

*Public-safe. Contains no node identifiers, IP addresses, hardware specifications, capacity or cost figures, tunnel identifiers, or secret paths.*
