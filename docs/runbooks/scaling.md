# Scaling — public-safe summary

**Last verified: 2026-07-25**

> **The operational procedure is not published here.** This page previously
> carried `ssh … "sudo kubectl scale …"`, `kubectl patch` of resource limits,
> `docker exec` into the database, `sudo zpool list`, and a capacity-planning
> table of invented figures. Removed 2026-07-25 — break-glass commands and
> capacity data are both Lane A, and two of those commands would have been
> reverted by ArgoCD anyway.

## What is public

**Scaling is a GitOps change, not a live command.** ArgoCD runs with
`selfHeal: true` on every Application manifest held in the platform repo
(*verified by reading the manifests, 2026-04-24*), so a live `kubectl scale` or
`kubectl patch` is reverted. Replica counts and resource requests/limits belong
in the app repo's `infra/k8s/production/` manifests and reach the cluster
through the normal reconcile. The supported operator surface is
`enclii ops apps`.

*Source: `internal-devops/ecosystem/deployment-conventions.md`;
`internal-devops/runbooks/2026-07-09-operator-activation-script.md`.*

**Requests, not usage, are the binding constraint.** The one measured capacity
observation that can be summarised publicly: at the last live measurement, both
production workload nodes were near-saturated on *CPU requested* while actual
CPU usage was under 10% of what was requested. A cross-repo request
right-sizing pass reduced the requested figure materially. The lesson
generalises — before asking for more hardware, check whether requests are
simply over-declared.

*Source: `internal-devops/audits/2026-07-07-selva-gateway-and-cluster-rightsizing-session.md`,
verified 2026-07-07. The concrete node figures are Lane A and are not
reproduced.*

**Data-layer scaling has a hard ceiling today.** PostgreSQL is a single
in-cluster instance; Redis is single-instance with Sentinel staged but not
deployed. There is no automatic failover. Horizontal scaling of the data layer
is not currently available and any doc implying otherwise is describing a plan.

*Source: `internal-devops/audits/2026-04-enclii-platform-audit.md` and
`internal-devops/audits/2026-05-04-enclii-provisioning-audit.md`, verified
2026-05-04.*

## Canonical private sources

- `internal-devops/infrastructure/capacity.md` — node capacity, allocation,
  and the audit history behind it
- `internal-devops/infrastructure/nodes.md` — canonical node record

## What would settle current capacity

An `enclii ops pods`-derived allocation report with a recorded date. The
private capacity record notes that any figure predating the 2026-05-04 builder
replacement needs a fresh audit before use.
