# MADFAM Infrastructure — declared configuration

**Last verified: 2026-07-25**

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

> **Read the framing before the tables.** This document describes **declared
> configuration** — what the files in this repository and the private
> operational record say is configured. It does **not** describe observed
> production health, and it no longer pretends to.
>
> A public repository cannot honestly carry live status. It has no way to probe
> production, and a checked-in green dot is a claim that ages into a lie. Every
> row below is therefore traceable to a file, with the date that file was last
> verified. Where something can only be settled by a probe, the probe is named.

## How to read a claim in this document

| Label | Meaning |
|---|---|
| **Verified 2026-07-25** | Checked in this pass against a named file in a working tree on disk. Self-verifying — you can re-run the check. |
| **Documented (date)** | Recorded in `internal-devops` on that date; not re-checked since. Treat the date as the age of the evidence. |
| **Unverified** | Appears in a source but with no dated verification anywhere. Do not build on it. |
| **Not asserted here** | Live health. Deliberately absent. Absence is not a health claim in either direction. |

The previous revision of this file carried "Last Verified: January 11, 2026" —
196 days stale at the time of this rewrite — over present-tense pod tables and
systemd status rows. Those tables are gone; see [What was removed](#what-was-removed).

---

## Local development environment

This section is **verified 2026-07-25** against files in this repository. It is
the most trustworthy part of this document precisely because it is
self-checking: run the same commands and you get the same answer.

### Preferred path

```bash
enclii local up          # shared infra + Janua + Enclii
enclii local infra       # shared infrastructure only
enclii local status
enclii local logs [service]
enclii local down
```

Those five subcommands (`up`, `down`, `status`, `logs`, `infra`) are the
complete set. *Verified 2026-07-25 against
`enclii/packages/cli/internal/cmd/local.go`.*

`enclii local up` with no arguments starts `janua` and `enclii`.
`enclii local infra` starts **PostgreSQL, Redis, MinIO and MailHog** — the
command's own help text says exactly that, and it matches the compose file.
Verdaccio is **not** part of local infra; the private npm registry runs in the
cluster (see below).

### Shared infrastructure containers

Declared in `ops/local/docker-compose.shared.yml`. *Verified 2026-07-25 by
parsing that file.*

| Service | Container name | Host ports |
|---|---|---|
| PostgreSQL | `madfam-postgres-shared` | 5432 |
| Redis | `madfam-redis-shared` | 6379 |
| MinIO (API + console) | `madfam-minio-shared` | 9000, 9001 |
| MinIO provisioner | `madfam-minio-provisioner` | — |
| MailHog (SMTP + UI) | `madfam-mailhog` | 1025, 8025 |

Docker network: `madfam-shared-network`. *Verified 2026-07-25 in the same file.*

> Note for anyone reconciling docs: the root-level `docker-compose.yml` in this
> repository declares a **different** network name (`madfam-network`) and a
> different Postgres password than `.env.example`. `ops/local/` is the path the
> CLI actually uses. Root-level files are outside this document's scope.

### Databases created by the local init script

Declared in `ops/local/init-databases.sql`. *Verified 2026-07-25 by reading the
`CREATE DATABASE` statements.* Nine databases, all with a `_dev` suffix:

| Database | Owner | Purpose |
|---|---|---|
| `janua_dev` | `janua` | Identity |
| `enclii_dev` | `enclii` | PaaS control plane |
| `forgesight_dev` | `forgesight` | Fabrication industry intelligence |
| `fortuna_dev` | `fortuna` | Problem intelligence |
| `cotiza_dev` | `cotiza` | Quoting (repo `digifab-quoting`) |
| `avala_dev` | `avala` | Learning verification |
| `dhanam_dev` | `dhanam` | Billing and payments |
| `sim4d_dev` | `sim4d` | CAD/simulation |
| `forj_dev` | `forj` | Fabrication commerce |

Local credentials are development-only values of the form `<service>_dev`,
readable in the init script. They are not secrets and they do not exist in
production. Any doc naming `janua_db`, `cotiza_db`, `blueprint_db` or similar
is using a superseded scheme — those databases are created nowhere.

### Local ports

This document deliberately does **not** restate the port scheme. It has drifted
in three separate places in the past. The registry, including its own honest
statement about how much of the scheme is actually followed, is
[`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md); each repo's `enclii.yaml` /
`.enclii.yml` is the per-service source.

---

## Production — public-safe shape

Everything in this section is **documented** in `internal-devops`, with the
verification date of the private source. Node identity, addresses, hardware,
capacity figures, costs and tunnel identifiers are Lane A and are not here.

### Cluster

| Property | Value | Source and date |
|---|---|---|
| Distribution | k3s, `v1.33.7+k3s3` | `internal-devops/infrastructure/nodes.md`, verified **2026-05-04** |
| Nodes | 3: 2 dedicated bare-metal (control plane + workload, and worker) + 1 cloud VPS as CI builder | same, **2026-05-04** |
| Builder isolation | Taint `builder=true:NoSchedule`, label `role=builder`; only ARC runners schedule there | same, **2026-05-04** |
| Namespaces | 22 at the last topology snapshot | `internal-devops/infrastructure/topology.md`, **2026-05-04** |
| ArgoCD Applications | 28 declared (11 infrastructure + 2 ARC OCI + 15 project ApplicationSet) | same, **2026-05-04** — but see the contradiction note below |
| Control-plane HA | **None.** Single control-plane node. | Documented privately; multi-server k3s is listed as future work, not done |

> **Contradiction, unresolved.** The topology record says 28 ArgoCD Applications
> (2026-05-04); a dashboard-truthfulness roadmap dated 2026-04-29 reports
> "18 of ~50" synced-and-healthy. Newest-wins does not settle it — the two are
> measuring different things (declared apps vs an App-of-Apps health view).
> **What would settle it:** one `enclii ops apps list` (or `argocd app list`)
> with the output and date recorded.

> **Staleness note.** The k3s version has no verification newer than
> 2026-05-04 — 82 days at the time of writing. **What would settle it:** a node
> listing through Enclii, recorded with a date.

### Ingress

| Property | Value | Source and date |
|---|---|---|
| Path | Internet → Cloudflare edge → cloudflared pods → K8s Service :80 → container port | `internal-devops/ecosystem/domain-map.md`, verified **2026-07-01** |
| TLS | Terminates at the Cloudflare edge; origin leg is plain HTTP on port 80 | `internal-devops/ECOSYSTEM.md`, **2026-05-04** |
| Tunnels | **One** named Cloudflare Tunnel carries all ingress — every HTTP product route plus the SSH jumphost | domain-map, **2026-07-01** |
| cloudflared deployment | Deployment `cloudflared` in namespace `cloudflare-tunnel` | domain-map + private runbooks, **2026-07-01** |
| cloudflared replicas | Documented as 2 — **not re-verified since 2026-02** | `internal-devops/audits/ecosystem-audit-2026-02.md`; no 2026-05-or-later document restates the count |
| Exposed node ports | Zero, for application ingress | nodes.md + topology.md, **2026-05-04** |

> **Correction carried forward.** Earlier public docs described *two* tunnels
> (a product tunnel and an SSH tunnel). That split **never existed** in the live
> infrastructure. Any doc still saying "production tunnels" plural is wrong.

> **"Zero exposed node ports" means no NodePort application ingress.** It does
> not mean nothing listens on the nodes; operator access paths exist and are
> documented privately. See [`SSH_ACCESS.md`](./SSH_ACCESS.md).

> **cloudflared replica count is the clearest open item in this section.**
> **What would settle it:** read the live Deployment's replica count via
> `enclii ops pods` and record the date.

### Storage

| Property | Value | Source and date |
|---|---|---|
| Block storage | Longhorn CSI, 2-replica across the two non-tainted nodes, `longhorn` StorageClass | `internal-devops/ECOSYSTEM.md` + `audits/2026-04-enclii-platform-audit.md`, **2026-05-04** |
| Longhorn version | Stated once as "v1.7+" | `internal-devops/ECOSYSTEM.md` — **unverified**, no dated source anywhere |
| Object storage | Cloudflare R2 (zero egress cost); destination for logical backups, WAL archiving, repo backups, per-product asset buckets | `internal-devops/ECOSYSTEM.md`, DR runbook, **2026-06-03** |
| PostgreSQL | Single in-cluster instance on a Longhorn PVC. No auto-failover. | `audits/2026-04-enclii-platform-audit.md`, **2026-05-04** |
| Redis | Single instance; Sentinel staged, not deployed | same, **2026-05-04** |

> **What would settle the Longhorn version:** `enclii ops storage` version
> output, or the Longhorn Helm chart pin in the GitOps source.

### GitOps and CI/CD

| Property | Value | Source and date |
|---|---|---|
| GitOps | ArgoCD, App-of-Apps plus ApplicationSets | `internal-devops/infra/argocd/`, read directly **2026-04-24** |
| Self-heal | **On.** Every Application manifest in the platform repo sets `syncPolicy.automated` with `prune: true` and `selfHeal: true` | verified by reading the manifests, **2026-04-24** |
| Deploy flow | push → CI build → GHCR → cosign keyless signature → `kustomize edit set image` digest pin → CI commits the pin → ArgoCD syncs | `internal-devops/ecosystem/deployment-conventions.md`; cosign step verified end-to-end **2026-07-07** |
| Preview environments | ArgoCD ApplicationSet with the GitHub pullRequest generator, opt-in by label, one Application + namespace per PR | manifest read directly; **dormant by design** as of **2026-07-07** because the preview DNS zone was never bootstrapped |
| CI runners | Actions Runner Controller self-hosted, namespace `arc-runners`, pools `madfam-runners-blue` / `madfam-runners-green` | `internal-devops/runbooks/arc-runner-image-rebuild.md` + topology, **2026-05-04** |

Self-heal being on is load-bearing, not trivia: a live `kubectl patch` will be
reverted. Permanent configuration changes must be committed to the app repo.

> **Fleet-wide pipeline health is not established.** The full chain was proven
> for three named platform services on 2026-07-07; the Q2 retrospective records
> auto-digest restoration as "not assessed" across the fleet. **What would
> settle it:** the date of the most recent digest commit on each repo's
> production `kustomization.yaml`.

### Admission policy (image tags)

Three Kyverno image-tag policies exist and **only one fail-closes**:

| Policy | Mode | Scope |
|---|---|---|
| `disallow-latest-tag` | **Audit** — warns, does not block | excludes infrastructure-labelled namespaces |
| `block-latest-ifnotpresent` | **Enforce** | blocks only `:latest` **with** `imagePullPolicy: IfNotPresent` |
| `require-image-digest` | **Audit** | application-labelled namespaces |

Direct consequence: a pod using `:latest` with `imagePullPolicy: Always`
passes admission. At the 2026-05-04 snapshot, 6 active deployments were still
running `:latest`.

Digest pinning is nevertheless the org rule, enforced mostly **CI-side**: a
ratchet check fails the build on any tag-only image reference in infra
manifests, and roughly 99% of MADFAM-org images were digest-pinned at the
2026-05-04 provisioning audit.

*Source: `internal-devops/ECOSYSTEM.md` and
`internal-devops/audits/2026-05-04-enclii-provisioning-audit.md`, **2026-05-04**.*

> **Two open items here, both 82 days old.** (1) The two private records
> disagree on the PolicyException count (8 vs 13), both dated 2026-05-04, so
> newest-wins does not resolve it. (2) Whether `require-image-digest` is Audit
> or Enforce *today* is genuinely unclear — the ecosystem template says Audit,
> while an undated production-readiness runbook shows an Enforce-style admission
> denial as an expected symptom. **What would settle both:** reading the
> ClusterPolicy `validationFailureAction` values and the exception manifests in
> the platform repo's Kyverno directories at a named commit, or
> `enclii ops policy`.

### Secret delivery

Mechanism only; paths and names are Lane A.

Vault (KV v2) → External Secrets Operator via a ClusterSecretStore → per-app
ExternalSecret materialises a native Kubernetes Secret → Deployment consumes it
via `envFrom`/`secretRef`. ESO refresh interval is 15 minutes. Stakater Reloader
rolls consumers on change. The operator surface is `enclii secrets`.

**Not all services are Vault-backed.** At least two recent go-lives provisioned
plain Kubernetes Secrets out-of-band, because there is no CLI surface to write
Vault after onboarding — an Enclii adapter gap recorded 2026-07-10 and
re-confirmed 2026-07-25. Those secrets sit outside the ESO refresh loop.

*Sources: `internal-devops/runbooks/vault-bootstrap.md`,
`internal-devops/ecosystem/deployment-conventions.md`,
`internal-devops/runbooks/2026-07-10-periplo-repo-extraction.md`; **2026-07-15**,
re-confirmed **2026-07-25**.*

---

## Where manifests live

*Verified 2026-07-25 against the working trees on disk.*

| Purpose | Path |
|---|---|
| Enclii Kubernetes manifests | `enclii/infra/k8s/` (with `base/` and `production/` overlays) |
| ArgoCD applications and ApplicationSets | `enclii/infra/argocd/` |
| Janua Kubernetes manifests | `janua/k8s/` |
| Dhanam Kubernetes manifests | `dhanam/infra/k8s/` |
| Per-app production manifests, generally | `<app>/infra/k8s/production/` |
| Local dev compose + DB init | `solarpunk-foundry/ops/local/` |
| Enclii CLI `local` implementation | `enclii/packages/cli/internal/cmd/local.go` |

The previous revision of this file pointed at `enclii/k8s/`, which does not
exist.

The governing convention is *"core repos define the platform; client repos
define themselves"* — a service's deployment configuration lives in the
service's own repository, and onboarding must not require editing the platform
repos. *Source: `internal-devops/ecosystem/deployment-conventions.md` and
RFC 0014 zero-touch onboarding, **2026-04-26**.*

---

## Production access

Routine production inventory and health go through **Enclii** (web, API, or
CLI). Raw `kubectl` / SSH / provider CLIs are bootstrap or documented
break-glass only, and every such use must be recorded with the operator,
reason, target, commands, result, and an adapter-gap or incident link.

*Source: `internal-devops/README.md` and `internal-devops/AGENTS.md`, both
carrying Last Updated **2026-07-25**.*

SSH targets, kubeconfig handling and break-glass procedure are documented only
in `internal-devops`. See [`SSH_ACCESS.md`](./SSH_ACCESS.md) for the public
pointer.

---

## What was removed

Recorded so this is a rewrite and not a quiet deletion.

| Removed | Reason |
|---|---|
| Production pod tables (5 Janua rows, 3 Enclii rows, with names and ages) | Pod names carry ReplicaSet hashes that change on every rollout. A January 2026 name is certainly wrong now and is unfalsifiable from a public repo. It was also the one place this repo leaked per-pod runtime identity. |
| `janua-port-forward.service` "Active" row | The string `janua-port-forward` returns zero hits across the whole of `internal-devops`. No readable source exists. If it is real, it needs a private source before it can be referenced publicly. |
| "production tunnels" (plural), Active | There is one tunnel. See the ingress table. |
| ✅/❌ health columns on the local-dev tables | Those were a snapshot of one laptop in January. The underlying container names, ports and databases were correct and are kept — only the unverifiable status column is gone. |
| `enclii/k8s/` manifest path | Does not exist; corrected above. |
| Local connection-string block with inline passwords | Development-only values, but reproducing them added nothing over pointing at `ops/local/init-databases.sql`, which is the source. |
| Local troubleshooting section built on `docker exec` | Superseded by `enclii local status` / `enclii local logs`. |

---

## Related

- [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md) — service and route inventory,
  including retired and broken endpoints
- [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md) — port registry, with its own
  honest compliance statement
- [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md) — what may and may not
  appear in this repo
- [`runbooks/`](./runbooks/) — public-safe summaries plus pointers
