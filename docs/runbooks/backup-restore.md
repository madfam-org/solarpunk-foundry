# Backup & Restore — public-safe summary

**Last verified: 2026-07-25**

> **The operational procedure is not published here.** This page previously
> carried a complete backup/restore procedure built on `docker exec pg_dump`
> over SSH, `sudo zfs snapshot`, and a tar-and-encrypt of an on-disk secrets
> directory. All three are prohibited in this repo (break-glass commands and
> secret paths with retrieval detail), and all three describe an architecture
> that has been superseded. Removed 2026-07-25.
>
> Removed under [`../PUBLIC_REPO_BOUNDARY.md`](../PUBLIC_REPO_BOUNDARY.md) and
> `internal-devops/docs/repo-boundary-contract.md` (2026-06-14), which place raw
> break-glass, secret paths and capacity data in Lane A. The operational procedure
> lives in the private `internal-devops` repo; ask an operator if you need it.

## What is public

**Where data lives.** PostgreSQL and Redis run as in-cluster workloads on
Longhorn-backed persistent volumes (`longhorn` StorageClass, 2-replica).
Object storage — including backup destinations — is Cloudflare R2, chosen for
zero egress cost.
*Source: `internal-devops/ECOSYSTEM.md` and
`internal-devops/audits/2026-04-enclii-platform-audit.md`; storage shape last
verified 2026-05-04, R2 role re-confirmed against the disaster-recovery runbook
2026-06-03.*

**What is proven, and what is not.** This distinction is the useful part, and
the previous version of this page got it exactly backwards by publishing a
7-year retention commitment and a 5-minute RPO that no evidence supports.

| Claim | Standing as of the newest dated private record |
|---|---|
| Daily logical backup to object storage | **Verified.** A restore drill passed on 2026-06-03. |
| Point-in-time recovery via WAL archiving | **Design target, not evidence.** No PITR restore has ever been demonstrated; the WAL half of the 2026-06-03 drill failed its freshness check. |
| Recovery time objectives | **Unverified.** The only measured figure is a logical-restore proxy. |
| Quarterly DR rehearsal | **Not executed.** The Q3 rehearsal scheduled for 2026-07-21 did not run. |

*Source: `internal-devops/runbooks/disaster-recovery.md`, last updated
2026-07-25. Specific objectives, drill logs and operator assignments are Lane A
and are deliberately not reproduced here.*

**No auto-failover exists** for the data layer. Treat any assumption of
automatic database failover as false unless you have checked the private
record.

## Canonical private sources

- `internal-devops/runbooks/disaster-recovery.md`
- `internal-devops/runbooks/postgres-wal-archiving.md`
- `internal-devops/access/storage-box-runbook.md` (off-site target)

## What would settle the open items

A completed PITR restore drill with a recorded date and outcome, appended to
the private DR log. No agent or public reader can perform that; it is an
operator action.
