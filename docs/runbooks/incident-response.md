# Incident Response — public-safe summary

**Last verified: 2026-07-25**

> **The operational procedure is not published here.** This page previously
> carried raw break-glass (`ssh … "sudo kubectl …"`, `docker restart`,
> `sudo journalctl`) against a host-Docker architecture that no longer exists.
> That content was removed on 2026-07-25 under
> [`../PUBLIC_REPO_BOUNDARY.md`](../PUBLIC_REPO_BOUNDARY.md) and
> `internal-devops/docs/repo-boundary-contract.md` (2026-06-14).

## What is public

**Severity model.** Three levels, unchanged and still in use:

| Level | Definition | Target response |
|---|---|---|
| SEV1 | Complete outage — API down, auth broken, data loss | Immediate |
| SEV2 | Degraded service — elevated latency, partial failures | < 1 hour |
| SEV3 | Minor issue — UI defects, non-critical errors | < 4 hours |

**Escalation shape.** Attempt a safe restart of the affected service → check
dependencies (database, cache, ingress) → roll back if a recent deploy is
implicated → address capacity → escalate to the on-call operator for SEV1/SEV2.

**Tooling.** Diagnosis and safe restarts go through `enclii ops pods`; ArgoCD
sync/diff/rollback through `enclii ops apps`. Raw `kubectl` is break-glass only
and must be recorded (see [`README.md`](./README.md)).

**Post-incident.** Timeline, root cause, prevention measures, and runbook
updates are recorded in `internal-devops/incidents/` — not here. Incident
evidence trails are explicitly Lane A.

## One thing worth stating plainly

Alerting is not something this public repo can vouch for. The internal
launch-readiness assessment dated **2026-07-16** recorded the operations hop as
failing, with alert delivery not working and the synthetic revenue probe
disabled. Nothing dated after that establishes recovery. If you are relying on
"we would be paged", verify it against
`internal-devops/roadmaps/2026-07-16-launch-remediation-roadmap.md` (blocker 9)
before assuming.

## Canonical private sources

- Per-incident runbooks: `internal-devops/runbooks/`
- Incident record and evidence: `internal-devops/incidents/`
- Disaster recovery: `internal-devops/runbooks/disaster-recovery.md`
  (last updated 2026-07-25)

## Contact

`admin@madfam.io`.
