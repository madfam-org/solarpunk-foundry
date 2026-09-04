# Cross-Repository Navigation Guide

**Last verified: 2026-07-25** — every path in this document was checked for
existence on that date against the working trees in `~/labspace`.

> [!WARNING]
> **SUPERSEDED — stamped 2026-09-04.** This document is a point-in-time record
> from **2026-07-25** and has not been re-verified since. Newer sources in this
> repository contradict parts of it. For current facts read
> [`README.md`](../README.md) §II (platform map and repo counts) and
> [`ECOSYSTEM.md`](../ECOSYSTEM.md) §4 (cluster and infrastructure shape), both
> anchored to the **2026-08-24** live enumeration and probe set. Where this
> document and those disagree, the newer source wins — that is this repo's own
> evidence rule ([`../llms.txt`](../llms.txt)). Individual rows corrected on
> 2026-09-04 say so inline; everything else is unrefreshed.

**Purpose:** find the canonical document for a topic, across the MADFAM
repositories.

**Scope, honestly stated:** this guide covers the **core platform** —
Enclii, Janua, Dhanam and the shared-package monorepo — plus the ecosystem-wide
contracts. It is *not* a map of all 113 non-fork repositories in the
organisation (count as of 2026-08-29; corrected 2026-09-04). The repository registry lives privately at
`internal-devops/ecosystem/repo-registry.md`; the public platform map is
[`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md).

> The previous revision carried "Last Verified: February 3, 2026" — 172 days
> stale — and four of roughly twenty-five paths were dead. Those are corrected
> below and listed at the end so the corrections are auditable.

---

## By topic

### Ports and networking

| Document | Location | What it is |
|---|---|---|
| Port registry | `solarpunk-foundry/docs/PORT_ALLOCATION.md` | The port scheme **and its own honest statement of how little of it is followed**. Read the TL;DR before treating any block as authoritative. |
| Per-service declared ports | `<repo>/enclii.yaml` (or legacy `<repo>/.enclii.yml`) | The actual source of truth per service |
| Enclii deployment notes | `enclii/infra/DEPLOYMENT.md` | Service routing for production |
| Cloudflare Tunnel ingress | `enclii/infra/k8s/production/cloudflared-unified.yaml` | Production ingress route definitions |

> **This document deliberately does not restate the port block table.**
> Duplicating it is how three public documents ended up disagreeing with the
> registry they all cited — two of them swapping the Fortuna and ForgeSight
> blocks. One table, one place.

### Authentication (Janua)

| Document | Location | What it is |
|---|---|---|
| Integration guide | `solarpunk-foundry/docs/JANUA_INTEGRATION.md` | RS256/JWKS verification patterns, endpoints, SDKs |
| Janua architecture | `janua/docs/architecture/ARCHITECTURE.md` | Internal design (also `ADR-001_AUTH_FLOW.md`, `SUBDOMAIN_ARCHITECTURE.md` in the same directory) |
| Janua ecosystem contract | `janua/ECOSYSTEM.md` | Current verifier set and cross-repo position |
| Production manifests | `janua/k8s/` | Kubernetes manifests |
| Enclii's use of Janua | `enclii/apps/switchyard-api/internal/auth/` | Reference consumer implementation |

### Infrastructure and deployment

| Document | Location | What it is |
|---|---|---|
| Enclii architecture | `enclii/docs/architecture/ARCHITECTURE.md` | Control plane design |
| Enclii agent guide | `enclii/AGENTS.md` (`enclii/CLAUDE.md` is a shim) | Repo conventions |
| GitOps | `enclii/docs/infrastructure/GITOPS.md` | ArgoCD App-of-Apps pattern |
| Storage | `enclii/docs/infrastructure/STORAGE.md` | Longhorn persistent volumes |
| Disaster recovery | `enclii/docs/production/DR_RUNBOOK.md` | Public-safe DR structure |
| Declared configuration | `solarpunk-foundry/docs/INFRASTRUCTURE_STATUS.md` | Cluster shape, GitOps, admission policy — dated per claim |

**Private counterpart:** the operational source of truth for node inventory,
capacity, incident history, secret custody and break-glass is `internal-devops`.
Nothing in the public tree substitutes for it. See
[`OPERATIONAL_REDIRECTS.md`](./OPERATIONAL_REDIRECTS.md).

### Ecosystem architecture

| Document | Location | Status |
|---|---|---|
| Symbiosis | `solarpunk-foundry/docs/architecture/SYMBIOSIS.md` | Current — Substrate/Trellis/Membrane narrative |
| Cluster architecture | `solarpunk-foundry/docs/architecture/CLUSTER_ARCHITECTURE.md` | Current, with dated caveats |
| Service and route inventory | `solarpunk-foundry/docs/ECOSYSTEM_STATUS.md` | Current — includes retired and not-live endpoints |
| Federated architecture | `solarpunk-foundry/docs/architecture/FEDERATED_ARCHITECTURE_README.md` | **Historical record (2025-11-24), superseded** |
| Self-contained services | `solarpunk-foundry/docs/architecture/SELF_CONTAINED_SERVICES.md` | **Position paper, partly superseded** — labelled in place |

### Local development

| Document | Location | What it is |
|---|---|---|
| Dogfooding guide | `solarpunk-foundry/docs/DOGFOODING_GUIDE.md` | `enclii local up` first; compose fallback |
| CLI implementation | `enclii/packages/cli/internal/cmd/local.go` | What `enclii local` actually does |
| Shared infra compose | `solarpunk-foundry/ops/local/docker-compose.shared.yml` | Postgres, Redis, MinIO, MailHog |
| Local database init | `solarpunk-foundry/ops/local/init-databases.sql` | The nine `*_dev` databases |
| Alternative DB init | `solarpunk-foundry/ops/db/init-shared-dbs.sql` | Second init script; check which one your path uses |
| Legacy control script | `solarpunk-foundry/ops/bin/madfam.sh` | Predates `enclii local`; declares 10 services |

### Billing and payments (Dhanam)

| Document | Location | What it is |
|---|---|---|
| Dhanam README | `dhanam/README.md` | Platform overview (**private repo** as of 2026-07-25) |
| Production manifests | `dhanam/infra/k8s/production/` | Deployment |
| Payment-attribution contract | `solarpunk-foundry/docs/MONETIZATION_PATH_READINESS.md` | The signed fan-out contract and its current standing |

---

## Repository locations on disk

```
~/labspace/
├── solarpunk-foundry/     # public ecosystem hub + shared @madfam/* packages
├── internal-devops/       # PRIVATE — operational source of truth
├── enclii/                # PaaS control plane, UI, CLI
├── janua/                 # identity provider
├── dhanam/                # billing and payments (private repo)
├── selva-office/          # inference routing + agent orchestration
├── digifab-quoting/       # Cotiza quoting engine
├── forgesight/            # fabrication industry intelligence (private repo)
├── tezca/                 # Mexican law oracle
├── karafiel/              # operational compliance (private repo)
├── pravara-mes/           # manufacturing execution
├── phynd-crm/             # client deliverables portal
├── routecraft/            # trip engine; payment-attribution emitter (private repo)
└── … 30 further repos cloned locally, of 113 non-fork in the organisation
```

*Local-checkout count verified 2026-07-25: 43 repositories cloned locally, and
every local directory with a `.git` maps to a real organisation repository.
Absence from disk is a checkout-hygiene fact, not an inventory fact. The
organisation total is **113 non-fork** (44 private + 69 public) of **116** as of
2026-08-29 — corrected 2026-09-04; the "96" this document carried was the
2026-07-25 figure.*

---

## Key infrastructure paths

| Purpose | Canonical location |
|---|---|
| Enclii Kubernetes manifests | `enclii/infra/k8s/` (`base/` + `production/`) |
| ArgoCD applications | `enclii/infra/argocd/` |
| Longhorn Helm values | `enclii/infra/helm/longhorn/` |
| Janua Kubernetes manifests | `janua/k8s/` |
| Dhanam Kubernetes manifests | `dhanam/infra/k8s/` |
| Per-app production manifests | `<app>/infra/k8s/production/` |

The governing convention: *"core repos define the platform; client repos define
themselves."* A service's manifests belong in that service's repository — not
here, and not in the platform repos.

---

## Getting help

| Problem | Start here |
|---|---|
| Port conflict on your laptop | `docs/PORT_ALLOCATION.md`, then the repo's own `enclii.yaml` |
| Token rejected / auth failing | `docs/JANUA_INTEGRATION.md` troubleshooting table |
| Local stack will not start | `docs/DOGFOODING_GUIDE.md` |
| Deployment or rollback question | `docs/runbooks/rollback.md`, then `enclii ops apps` |
| "Is this hostname live?" | `docs/ECOSYSTEM_STATUS.md` — including the retired and not-live lists |
| Anything requiring production access | `internal-devops`; see `docs/OPERATIONAL_REDIRECTS.md` |

---

## Corrections applied 2026-07-25

Recorded so the fixes are auditable rather than silent.

| Was | Now |
|---|---|
| `enclii/docs/guides/DOGFOODING_GUIDE.md` | **Did not exist.** Removed; local dev is covered by this repo's `DOGFOODING_GUIDE.md` and `enclii/packages/cli/internal/cmd/local.go`. |
| `enclii/dogfooding/` | **Did not exist.** Removed. |
| `janua/docs/ARCHITECTURE.md` | **Did not exist.** Correct path is `janua/docs/architecture/ARCHITECTURE.md`. |
| `solarpunk-foundry/ops/postgres/init-databases.sql` | **Did not exist.** Correct paths are `ops/local/init-databases.sql` and `ops/db/init-shared-dbs.sql`. |
| "PORT_ALLOCATION.md — **single source of truth** for all port assignments" | That document explicitly disclaims the label in its own TL;DR. Described accurately above. |
| A port-block table listing ForgeSight 4300-4399 and Fortuna 4400-4499 | **Swapped** relative to the registry it cited. Table removed rather than corrected — see the note under "Ports and networking". |
| Production domains table (4 rows) | Superseded by the full inventory in `ECOSYSTEM_STATUS.md`, which also lists retired and not-live hostnames. |

**Suggested follow-up (not applied here):** add a link-existence check to this
repository's documentation CI. A navigation document is the one place where a
dead path is guaranteed to waste someone's time, and this class of defect is
mechanically detectable.
