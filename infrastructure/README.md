# Solarpunk Foundry — `infrastructure/`

> **Last reviewed:** 2026-07-25
> **Status:** historical and aspirational material only. **Nothing in this
> directory provisions, configures, or describes MADFAM production today.**

---

## Read this first

This directory is **not** an operations manual, and following anything in it
will not get you a running MADFAM service. It holds two kinds of material:

1. **Historical** — how the estate genuinely ran before it moved to Kubernetes
   (Docker Compose on a single ZFS host, late 2025). Preserved because the
   storage-tuning rationale and the SSH-hardening narrative are still useful
   reading, not because anyone should run it.
2. **Planning** — a design sketch for a project that was never built.

Every file below carries a banner in its first lines saying which it is.
If you find a file here without one, treat it as untrustworthy and say so.

**For the real operational picture, go to the private `internal-devops`
repository.** That is the only place with current node inventory, capacity,
access paths, runbooks and incident history. This public repo deliberately
does not carry them.

---

## How MADFAM actually ships

Stated here so that nothing in this directory is mistaken for the current model:

| Concern | Reality | Where it lives |
|---|---|---|
| Control plane | **Enclii** is the mandatory control plane for routine production operations — provisioning, deploys, secrets, domains, scaling, rollback | `madfam-org/enclii` |
| Orchestration | Bare-metal **k3s**, 3 nodes | inventory in `internal-devops/infrastructure/nodes.md` |
| Deployment | **GitOps**: CI builds → GHCR → digest pinned into `kustomization.yaml` → **ArgoCD** App-of-Apps syncs. Nothing pushes to the cluster; ArgoCD pulls. `selfHeal` is on, so a live `kubectl patch` gets reverted | `enclii/infra/argocd/` |
| App manifests | Each app owns its own, in **its own repo** under `infra/k8s/production/` | the app's repo, never here |
| Ingress | **Cloudflare Tunnel** → `cloudflared` pods → K8s Service:80 → container port. TLS terminates at the Cloudflare edge. No NodePort application ingress | `internal-devops/ecosystem/domain-map.md` |
| Block storage | **Longhorn** CSI, 2-replica, `longhorn` StorageClass | — |
| Object storage | **Cloudflare R2** | — |
| Secrets | Vault → External Secrets Operator → K8s Secret → `envFrom`. Operator surface is `enclii secrets` | `internal-devops/runbooks/vault-bootstrap.md` |
| Onboarding | `enclii onboard --repo madfam-org/<name>` creates namespace, ArgoCD app, tunnel route, DNS, Janua client and NetworkPolicies in one call | RFC 0014, zero-touch |

Sources: `internal-devops/ECOSYSTEM.md`, `ecosystem/deployment-conventions.md`,
`ecosystem/domain-map.md` (routes last verified 2026-07-01),
`infrastructure/nodes.md` and `infrastructure/topology.md` (both last verified
2026-05-04). Ages are stated because they matter: the topology figures are
~3 months old and have not been re-verified from this repository.

The corollary worth stating plainly: **no application's manifests belong in
`solarpunk-foundry`.** If you are about to add a Deployment here, you are in
the wrong repo.

---

## What is actually in this directory

| Path | Kind | Notes |
|---|---|---|
| `INFRASTRUCTURE.md` | Mixed | §1–§2 (node shape, OS/ZFS) still current in shape; §3–§4 and §7 describe the pre-k3s Docker era. Banner-labelled per section. |
| `bootstrap/` | **Historical** | Six scripts, ~2,170 lines, from 2025-12-02. Provisioned a single Docker Compose host. Contains zero references to k3s, kubectl, ArgoCD, Helm or Longhorn — which is the clearest evidence of what era it belongs to. Superseded by k3s + ArgoCD. |
| `docs/SSH_SECURITY_EVOLUTION.md` | **Historical** | Three-phase SSH hardening narrative. Sanitized 2026-07-25 (see below). |
| `autochess/` | **Planning, never built** | Self-labelled "Status: Planning" with an entirely unticked roadmap. Absent from the ecosystem repo registry, which is consistent with never having been built. |
| `monitoring/grafana-dashboard.json` | **Unverified** | See `monitoring/README.md`. |

---

## Removal ledger — 2026-07-25

The following were removed because they described infrastructure MADFAM does
not have, could not be run as written, or both. Recording them here so the
deletion is discoverable rather than silent; the content remains in git history.

| Removed | Why |
|---|---|
| `terraform/` | Provisioned **AWS** (EKS, RDS, ElastiCache, S3, WAF, CloudWatch). Production is bare-metal k3s on Hetzner. Not runnable either way: 5 of the 6 referenced modules (`eks`, `rds`, `elasticache`, `waf`, `monitoring`) had no directory — only `modules/vpc` existed — and `main.tf:336` called `templatefile()` on a `helm-values.yaml` that was not in the tree, so `terraform init` failed immediately. `cloudflare.tf` declared a **second** Cloudflare tunnel routing to `localhost` ports, contradicting the live single-tunnel, Service:80 model, with the provider, the zone data source and several variables all undeclared. `terraform.tfvars.example` configured a third, Hetzner-Cloud generation whose variables matched nothing in `variables.tf`, and carried a monthly **cost estimate** — cost data is not permitted in this public repo. |
| `backup/` | Claimed continuous WAL archiving, a 5-minute RPO, 7-year Glacier retention, cross-region DR and quarterly drills. The private platform audit records no PITR, WAL archiving not wired, and restore never tested; every storage target named (S3, Glacier, AWS Secrets Manager) is fictional. A false retention commitment is worse than no document, and a banner does not fix it — a bannered file still states 7-year compliance retention that does not exist. `postgres-backup.sh` also aborted on line 19 under `set -u` (unbound `DB_PASSWORD`). |
| `database/` | A Postgres primary/replica HA topology that cannot ever have run: it wrote `standby_mode`/`recovery.conf` (removed in PostgreSQL 12) against a `postgres:15` image, called `pg_basebackup -W` (interactive prompt) in a non-interactive container, and mounted 7 files that were not in the directory. `postgresql-primary.conf` demanded synchronous replication from standbys the compose file never created, and set `stats_temp_directory`, removed in PG 15. Production Postgres is single-instance. |
| `redis/` | A 1-master/2-replica/3-sentinel/HAProxy cluster. Mounted `redis-sentinel.conf` and `redis-haproxy.cfg`; neither existed — the directory held exactly one file. The private record states Sentinel was staged but never deployed. |
| `nginx/` | An origin-TLS termination story competing with Cloudflare edge termination; there is no origin nginx in the ingress path. Structurally invalid besides: four `server { }` blocks at top level *before* the `http { }` block, and an `include` of a file not in the repo. |
| `kubernetes/api-deployment.yml` | An nginx-ingress + cert-manager `Ingress` terminating TLS for a product hostname — a competing ingress story. Wrong namespace, and it put an app's Deployment in this repo, which the deploy convention forbids. |
| `kubernetes/production/cloudflared.yaml` | A second `cloudflared` Deployment for a tunnel that does not exist, routing to container port 8000 rather than Service:80, with an inline `Secret`. Applying it would have stood up a duplicate tunnel. It also had a real rule-ordering bug (a catch-all hostname rule shadowing the later `/health` rules). |
| `kubernetes/foundry/verdaccio.yaml` | Declared namespace `foundry` and instructed `kubectl apply`, which GitOps would revert. The canonical manifests are owned by the enclii repo at `enclii/infra/k8s/base/verdaccio/` (verified present 2026-07-25: `deployment.yaml`, `service.yaml`, `ingress.yaml`, `pvc.yaml`, `namespace.yaml`, `kustomization.yaml`, `networkpolicy.yaml`, `configmap.yaml`, `hpa.yaml`, and token-rotation ExternalSecrets), so this was not the last surviving copy. |
| `monitoring/apm-stack.yml`, `monitoring/prometheus.yml` | Laptop scaffolding competing with the live Grafana/Prometheus/Alertmanager stack. Could not start: 7 mount sources absent. `prometheus.yml` scraped `host.docker.internal`, a Docker-Desktop-only hostname. Both also shipped an `admin123` Grafana default and `--web.enable-admin-api` on a published port. |

Also removed on 2026-07-25, from `docs/SSH_SECURITY_EVOLUTION.md`: a Cloudflare
tunnel name and **tunnel UUID in plaintext**, and a two-person SSH admin email
roster. These are Lane A material and had been logged as a live exposure in
`internal-devops` since 2026-07-16. **Deleting them from `HEAD` does not remove
them from git history — credential rotation remains owed and is tracked
privately.**

---

## Related

- [`INFRASTRUCTURE.md`](./INFRASTRUCTURE.md) — layered reference, per-section staleness labels
- [`bootstrap/README.md`](./bootstrap/README.md) — historical single-host bootstrap
- [`../docs/PORT_ALLOCATION.md`](../docs/PORT_ALLOCATION.md) — why container ports mostly do not matter, and the two cases where they do
- `internal-devops` — the operational source of truth for everything above

---

*Public-safe. Contains no node identifiers, IP addresses, hardware specifications, capacity or cost figures, tunnel identifiers, secret paths, or operator identities.*
