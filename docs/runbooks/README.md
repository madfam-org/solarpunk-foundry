# Production Runbooks — pointer index

**Last verified: 2026-07-25** (this page; the pointers below were checked against
the `internal-devops` working tree on that date)

> **This directory does not contain runnable production procedures, and should
> not.** Production break-glass — raw `kubectl`, SSH, `docker exec`, provider
> CLI calls, secret paths, node identifiers — is Lane A material under
> `internal-devops/docs/repo-boundary-contract.md` (last updated 2026-06-14) and
> under this repo's own [`../PUBLIC_REPO_BOUNDARY.md`](../PUBLIC_REPO_BOUNDARY.md),
> which bans "exact production break-glass commands that expose private
> infrastructure details".

## What changed on 2026-07-25, and why

Until this revision, the five runbooks in this directory carried roughly 87
lines of raw break-glass (`ssh … "sudo kubectl …"`, `sudo zfs`,
`sudo cloudflared tunnel login`), a secret directory path, and a storage
capacity figure. All three categories are prohibited here.

They were also **describing infrastructure that no longer exists**. Those
procedures assumed PostgreSQL and Redis running as Docker containers on a
single host, a ZFS pool for backups, and deploys performed by SSH-ing into a
server and running a build script. None of that is the current architecture:

| Runbook assumption | Current model | Source |
|---|---|---|
| Postgres/Redis as host Docker containers | In-cluster workloads in a dedicated data namespace | `internal-devops/infrastructure/topology.md` (2026-05-04) |
| ZFS pool for backups | Longhorn CSI for block storage; Cloudflare R2 for object storage and backup targets | `internal-devops/ECOSYSTEM.md`; `internal-devops/runbooks/disaster-recovery.md` (2026-07-25) |
| Build-and-deploy over SSH | CI builds → GHCR → cosign signature → digest pin committed → ArgoCD reconciles | `internal-devops/ecosystem/deployment-conventions.md` (2026-04-15) |
| Live `kubectl patch` for config | ArgoCD `selfHeal: true` reverts live edits; permanent change must be committed | `internal-devops/ecosystem/deployment-conventions.md`; `internal-devops/runbooks/2026-07-09-operator-activation-script.md` (2026-07-09) |

Each former runbook is now a short public-safe summary plus a pointer. Nothing
was silently deleted.

## Where the real procedures live

| Need | Canonical location (private) |
|---|---|
| Incident response | `internal-devops/runbooks/` (per-incident) and `internal-devops/incidents/` |
| Backup, restore, disaster recovery | `internal-devops/runbooks/disaster-recovery.md`, `internal-devops/runbooks/postgres-wal-archiving.md` |
| Rollback | `internal-devops/ecosystem/deployment-conventions.md` (GitOps revert) + `enclii ops apps` |
| Scaling / capacity | `internal-devops/infrastructure/capacity.md` |
| Certificates and tunnel credentials | `internal-devops/runbooks/` + `internal-devops/access/` |
| Secret rotation | `internal-devops/runbooks/secret-rotation.md` |

See also [`../OPERATIONAL_REDIRECTS.md`](../OPERATIONAL_REDIRECTS.md), which is
the repo-wide table for this pattern.

## The public-safe operating rule

Routine production operations go through **Enclii** — web, API, or CLI. The
operational surfaces intended to replace raw tooling are `enclii ops apps`
(ArgoCD sync/diff/rollback), `enclii ops pods` (logs, diagnosis, safe restarts),
`enclii ops storage`, `enclii ops policy`, `enclii ops secrets`,
`enclii ops runners`, and `enclii providers`
(source: `internal-devops/ECOSYSTEM.md`, verified 2026-07-25).

Raw `kubectl` / `helm` / SSH / provider CLI / `docker exec` are permitted only
for (a) platform bootstrap or (b) a documented break-glass emergency when
Enclii is unavailable or lacks an implemented adapter. Any such use must record
the operator, the reason, the target service and environment, the commands run,
the result, and a follow-up adapter-gap note or incident link
(source: `internal-devops/README.md` and `internal-devops/AGENTS.md`, both
carrying Last Updated 2026-07-25).

Note that this enforcement is **documentary, not technical**: there is no
admission-time or CLI-time block on raw `kubectl`. The controls are a legacy-raw
banner on documents that still carry raw examples, plus
`scripts/check-enclii-first-docs.py` in `internal-devops`.

## Public-safe infrastructure shape

The shape below is already public and stays public. Anything more specific —
node names, addresses, hardware, capacity, costs, tunnel identifiers — is Lane A.

```
Internet
   │
   ▼  TLS terminates at the Cloudflare edge (DDoS mitigation here too)
Cloudflare Edge
   │
   ▼  single named Cloudflare Tunnel, all ingress
cloudflared pods  (Deployment `cloudflared`, namespace `cloudflare-tunnel`)
   │
   ▼  plain HTTP on port 80
Kubernetes Service :80
   │
   ▼
Container port (per service)
```

- 3-node bare-metal k3s cluster on Hetzner: 2 dedicated servers plus 1 cloud
  VPS used solely as a CI builder, isolated by the taint `builder=true:NoSchedule`.
- Zero exposed node ports for application ingress — all public application
  traffic arrives through the tunnel.
- Block storage: Longhorn CSI, 2-replica, `longhorn` StorageClass.
- Object storage: Cloudflare R2.

Source: `internal-devops/infrastructure/nodes.md` and
`internal-devops/infrastructure/topology.md`, both **last verified 2026-05-04**;
ingress chain from `internal-devops/ecosystem/domain-map.md`, **last verified
2026-07-01**. No production probe was performed for this page — see
[`../ECOSYSTEM_STATUS.md`](../ECOSYSTEM_STATUS.md) for what that means for
status claims.

## Contact

Security and operational reports: `admin@madfam.io`. Do **not** use any
`@innovacionesmadfam.dev` address — that domain was never acquired (owner
confirmation recorded 2026-07-09 in `internal-devops/ecosystem/domain-map.md`).
