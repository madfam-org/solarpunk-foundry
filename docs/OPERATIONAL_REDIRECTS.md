# Operational Redirects

**Last verified: 2026-07-25**

`solarpunk-foundry` is public and must not carry private execution detail. Use
these redirects instead of copying sensitive runbook content here.

## Platform and GA operations

| Need | Destination |
|---|---|
| GA runtime execution | `internal-devops/runbooks/ga-ops-execution-pack.md` |
| Enclii adapter gaps | `enclii/docs/ADAPTER_GAPS.md` |
| Enclii GA task queue | `enclii/docs/production/REMAINING_OPS_GA.md` |
| Enclii GA scorecard | `enclii/docs/production/GA_READINESS_SCORECARD.md` |
| Secret rotation | `internal-devops/runbooks/secret-rotation.md` |
| Public/private boundary | [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md) |

## Production runbooks

Added 2026-07-25, when the five procedural runbooks in
[`runbooks/`](./runbooks/) were reduced to public-safe summaries. Each stub
carries its own pointer; this table is the index.

| Need | Public summary | Canonical private source |
|---|---|---|
| Incident response | [`runbooks/incident-response.md`](./runbooks/incident-response.md) | `internal-devops/runbooks/` and `internal-devops/incidents/` |
| Backup, restore, disaster recovery | [`runbooks/backup-restore.md`](./runbooks/backup-restore.md) | `internal-devops/runbooks/disaster-recovery.md`, `internal-devops/runbooks/postgres-wal-archiving.md` |
| Rollback | [`runbooks/rollback.md`](./runbooks/rollback.md) | `internal-devops/ecosystem/deployment-conventions.md` |
| Scaling and capacity | [`runbooks/scaling.md`](./runbooks/scaling.md) | `internal-devops/infrastructure/capacity.md` |
| Certificates, TLS, secret delivery | [`runbooks/certificates.md`](./runbooks/certificates.md) | `internal-devops/runbooks/vault-bootstrap.md`, `internal-devops/runbooks/secret-rotation.md` |
| Node access | [`SSH_ACCESS.md`](./SSH_ACCESS.md) | `internal-devops/access/ssh-runbook.md` |

## Infrastructure records

| Need | Destination |
|---|---|
| Node inventory, hardware, addresses, costs | `internal-devops/infrastructure/nodes.md` |
| Cluster topology, namespaces, policy counts | `internal-devops/infrastructure/topology.md` |
| Capacity measurements and audit history | `internal-devops/infrastructure/capacity.md` |
| Domain → service map, route probes, endpoint gaps | `internal-devops/ecosystem/domain-map.md` |
| Repository registry | `internal-devops/ecosystem/repo-registry.md` |
| Deployment conventions | `internal-devops/ecosystem/deployment-conventions.md` |
| Incident records | `internal-devops/incidents/` |

## The rule

If a public document needs private operational detail, **link to the private
source by path and summarise only the public-safe intent**. Do not reproduce
the detail, and do not paraphrase it so closely that the reproduction is
effective.

When you add a redirect here, give the public-safe summary a `Last verified`
date. A pointer without a date tells the reader where to look but not how much
to trust what they already read.
