# MADFAM Cluster Architecture

**Last verified: 2026-07-25** — repository paths checked on disk on that date;
cluster facts carry the verification date of the private source they came from.

The MADFAM platform runs on a **3-node k3s cluster**: two dedicated bare-metal
servers (control plane + workload, and worker) plus one cloud VPS used solely
as a CI builder. Node identity, addresses, hardware, capacity and costs are in
the private `internal-devops/infrastructure/nodes.md` record and are not
published here.

> **This document describes declared architecture, not observed health.** It
> cannot report whether anything is currently up. Where a claim can only be
> settled by a probe, the probe is named. See
> [`../ECOSYSTEM_STATUS.md`](../ECOSYSTEM_STATUS.md) for the route inventory and
> [`../INFRASTRUCTURE_STATUS.md`](../INFRASTRUCTURE_STATUS.md) for the
> configuration detail.
>
> The previous revision was dated "January 19, 2026" with the status line
> "Production - Operational" — 188 days stale at rewrite, and asserting a
> health state a public repository cannot know.

---

## Node roles

| Node role | Responsibility | Taints |
|---|---|---|
| Control plane + workload (dedicated) | Kubernetes control plane and production workloads | None |
| Worker (dedicated) | Application workloads, shared services, second Longhorn replica | None |
| Builder (cloud VPS) | CI build jobs and artifact generation | `builder=true:NoSchedule` |

Builder isolation, verbatim from the manifests:

```yaml
taints:
  - key: "builder"
    value: "true"
    effect: "NoSchedule"
```

```yaml
tolerations:
  - key: "builder"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"
```

Only ARC GitHub Actions runners carry that toleration and schedule there.
*Source: `internal-devops/infrastructure/nodes.md`, verified **2026-05-04**.*

> **Single control plane, no HA.** If the control-plane node fails, the
> Kubernetes API is unavailable and pods cannot be rescheduled — though
> already-running pods on the other node keep serving. Multi-server k3s with
> embedded etcd is listed privately as future mitigation, not as done.

---

## Network topology

```
Internet
   │
   ▼
Cloudflare Edge
   • TLS termination
   • DDoS mitigation
   │
   ▼  single named Cloudflare Tunnel (all ingress: HTTP + the SSH jumphost)
cloudflared  (Deployment `cloudflared`, namespace `cloudflare-tunnel`)
   │
   ▼  plain HTTP, port 80
Kubernetes Service :80
   │
   ▼
Container port (per service, namespace-internal)
```

| Property | Value | Verified |
|---|---|---|
| Tunnel count | **One.** Earlier docs describing a split product/SSH tunnel pair describe a topology that never existed. | 2026-07-01 |
| cloudflared namespace | `cloudflare-tunnel` (a legacy per-namespace deployment elsewhere was scaled to zero and flagged for deletion in 2026-05) | 2026-07-01 |
| cloudflared replicas | Documented as 2 — **no verification newer than 2026-02** | 2026-02 |
| Exposed node ports | Zero, for application ingress | 2026-05-04 |

> **What would settle the replica count:** read the live Deployment's replica
> count through `enclii ops pods` and record the date. Every document dated
> 2026-05 or later mentions the Deployment and never its replica count.

**Container ports have a production consequence, contrary to a common
simplification.** Routing does not care about them — namespaces isolate ports
and the tunnel routes by hostname. But the Enclii control plane **generates
NetworkPolicies from the service port declared in `enclii.yaml`** and applies
them via the Kubernetes API (they are deliberately not committed to git). If
the declared port does not intersect the pod's actual `containerPort`, the CNI
drops traffic **silently** — no error, presenting as a rendering or timeout bug
rather than a network one. Keep `runtime.port` and `network.services[].port`
consistent with the container.

---

## Storage

| Layer | Implementation | Verified |
|---|---|---|
| Block | Longhorn CSI, 2-replica across the two non-tainted nodes, `longhorn` StorageClass | 2026-05-04 |
| Object | Cloudflare R2 — backups, WAL archiving, repo backups, per-product asset buckets | 2026-06-03 |
| PostgreSQL | **Single in-cluster instance** on a Longhorn PVC. CNPG is deployed but was carrying no managed Cluster resources at the last audit. **No auto-failover.** | 2026-05-04 |
| Redis | **Single instance.** Sentinel staged, not deployed. | 2026-05-04 |

The Longhorn version appears exactly once in the private record, as "v1.7+",
with no dated verification anywhere. **Treat the version as unverified.**
*What would settle it:* `enclii ops storage` version output, or the Helm chart
pin in the GitOps source.

---

## Build pipeline

```
Push to main
    │
    ▼
CI builds the container image
    │
    ▼
GHCR
    │
    ▼
cosign keyless signature (Sigstore Fulcio / Rekor OIDC)
    │
    ▼
`kustomize edit set image` pins the digest
    │
    ▼
CI commits the updated kustomization.yaml to the app repo
    │
    ▼
ArgoCD observes the commit and syncs
```

*Source: `internal-devops/ecosystem/deployment-conventions.md`; the cosign step
verified end-to-end **2026-07-07**.*

Nothing pushes to the cluster — **ArgoCD pulls**. Every Application manifest in
the platform repository sets `syncPolicy.automated` with `prune: true` and
`selfHeal: true` (*verified by reading the manifests, 2026-04-24*). A live
`kubectl patch` will be reverted.

> **Fleet-wide pipeline health is not established.** The chain was proven for
> three named platform services on 2026-07-07; the Q2 retrospective records
> auto-digest restoration as "not assessed" across the fleet. *What would settle
> it:* the date of the most recent digest commit on each repo's production
> `kustomization.yaml`.

### Build-time environment variables for Next.js

`NEXT_PUBLIC_*` values must exist at build time, so they are injected as Docker
build arguments:

```dockerfile
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_JANUA_CLIENT_ID
ARG NEXT_PUBLIC_JANUA_ISSUER

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_JANUA_CLIENT_ID=$NEXT_PUBLIC_JANUA_CLIENT_ID
ENV NEXT_PUBLIC_JANUA_ISSUER=$NEXT_PUBLIC_JANUA_ISSUER
```

A `NEXT_PUBLIC_*` variable is compiled into the client bundle and is therefore
public by construction. Never put a client **secret** behind that prefix — an
OIDC client id is a public identifier; a client secret is not.

---

## SSO

All admin interfaces are **intended** to enforce Janua SSO. Authentication flow:

```
User → product surface → auth.madfam.io (Janua)
                              │
                              ▼
                    upstream identity provider
                              │
                              ▼
                    JWT, RS256-signed
                              │
                              ▼
                    product surface (authenticated)
```

Verification is RS256 against `https://auth.madfam.io/.well-known/jwks.json`.
See [`../JANUA_INTEGRATION.md`](../JANUA_INTEGRATION.md).

> **Per-surface enforcement is not published here, and cannot currently be
> established.** The previous revision carried a table of four surfaces each
> marked "✅ Enforced", alongside their OIDC client ids. Both were removed on
> 2026-07-25:
>
> - **The enforcement claims are unverifiable.** The private SSO uniformity
>   matrix that first recorded per-surface status is itself recorded in
>   `internal-devops` as unavailable — a session artifact that was never
>   committed. A private gate file separately records at least one ecosystem
>   surface currently serving unauthenticated content.
> - **The client ids were inconsistent with this repository's own policy.** A
>   real Janua client id was deliberately scrubbed from a public template in
>   this repo in July 2026, and other public docs use a placeholder. A client id
>   is a public identifier rather than a secret, but publishing four concrete
>   ones here while scrubbing one two directories away is not a coherent
>   convention. One convention, applied consistently.
>
> **What would settle the enforcement question:** commit the SSO uniformity
> matrix to `internal-devops` and cite it by path with a date; or probe each
> admin surface unauthenticated and record whether it returns content or a
> redirect to login.

---

## Cost

This repository is public and does not publish infrastructure costs. The cost
ledger is in `internal-devops`.

---

## Scaling path

| Step | Current state | Where the manifests are |
|---|---|---|
| Add worker nodes | Available | — |
| Longhorn replication | **Already at 2 replicas** | in-cluster StorageClass `longhorn` |
| Redis Sentinel | **Staged, not deployed** — further along than "manifests written": a directory, an ArgoCD app, and a migration runbook all exist | `enclii/infra/k8s/redis-sentinel/`, `enclii/infra/argocd/apps/redis-sentinel.yaml`, `enclii/docs/runbooks/redis-sentinel-migration.md` — *all three verified present 2026-07-25* |
| PostgreSQL HA (CNPG) | Deployed, **carrying no managed Cluster resources** at the 2026-05-04 audit. The HA RFC still reads `Status: Draft` and no post-cutover failover drill has been recorded. | private RFC |
| GPU node | NVIDIA device plugin manifest present | `enclii/infra/k8s/base/gpu/nvidia-device-plugin.yaml` — *verified present 2026-07-25* |

> The previous revision cited `infra/k8s/production/redis-sentinel.yaml`. **That
> path does not exist** (verified 2026-07-25). It also gave bare `infra/...`
> paths in a document that spans repositories — all paths above name their
> repository.

---

## Related

- [`../INFRASTRUCTURE_STATUS.md`](../INFRASTRUCTURE_STATUS.md) — declared
  configuration, admission policy, secret delivery
- [`../ECOSYSTEM_STATUS.md`](../ECOSYSTEM_STATUS.md) — routes, including retired
  and not-live
- [`../JANUA_INTEGRATION.md`](../JANUA_INTEGRATION.md) — auth contract
- [`../PORT_ALLOCATION.md`](../PORT_ALLOCATION.md) — port registry
- [`../SSH_ACCESS.md`](../SSH_ACCESS.md) — node access pointer
- [`SYMBIOSIS.md`](./SYMBIOSIS.md) — the architecture narrative
