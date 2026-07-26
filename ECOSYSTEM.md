# solarpunk-foundry — Ecosystem Context

> [!IMPORTANT]
> MADFAM-ENCLII-FIRST-LEGACY-RAW v1: This document contains legacy raw infrastructure command examples.
> Routine production operations must use Enclii web, API, or CLI. Treat raw
> `kubectl`, `helm`, SSH, provider CLI/API, `docker exec`, and direct container
> access as platform bootstrap or documented break-glass only, and record any
> missing Enclii adapter gap.

> **Last updated:** 2026-07-25
> **Verification anchors:**
> - Repo names / visibility / roles — `internal-devops/ecosystem/repo-registry.md`, *Last Verified 2026-07-04*; org counts re-checked live 2026-07-25.
> - Routes and domains — `internal-devops/ecosystem/domain-map.md`, *Last Verified 2026-07-01*.
> - Topology, storage, GitOps, image policy — `internal-devops/infrastructure/topology.md` and `nodes.md`, *verified 2026-05-04*, i.e. **82 days old as of today**.
> - Enclii CLI surface — read from `enclii/packages/cli/internal/cmd/` on 2026-07-25.
> - Inference endpoint — `internal-devops` cutover record, 2026-07-07.
>
> This document was **not** verified by probing production. Where something is documented but
> unverified, or contradicted between sources, it says so rather than picking a winner.

> **Boundary note.** This is a public repo (Lane B). Node hostnames, IPs, hardware and
> capacity figures, costs, the Cloudflare tunnel identifier, Vault paths and break-glass
> procedures live only in the private `internal-devops` repo. Canonical policy:
> `internal-devops/docs/repo-boundary-contract.md` (2026-06-14). Public checklist:
> [`docs/PUBLIC_REPO_BOUNDARY.md`](docs/PUBLIC_REPO_BOUNDARY.md).

This file is intended to stand alone: an agent on a fresh machine can orient in the MADFAM
ecosystem by reading only this document. The one thing it cannot give you is current
operational state — for that, see the private repo or `status.madfam.io`.

---

## 1. What this repo is

`solarpunk-foundry` is the **public ecosystem contract hub** (Lane B): the ecosystem map at a
platform-public level, the cross-repo conventions, the `@madfam/*` shared packages, the port
registry (`docs/PORT_ALLOCATION.md`), local dogfooding scaffolds, and sanitized pointers into
the private `internal-devops` repo.

**Pillar**: Ecosystem contract hub
**Type**: docs + shared packages
**Status**: active

### Deployed services

**This repo ships no application deployable.** It is a docs + shared-package monorepo.

One clarification, because three files in this repo previously disagreed: the private
`npm.madfam.io` **Verdaccio registry is not deployed from here.** This repo *publishes to* it.
The registry runs in the `enclii` namespace, routed `npm.madfam.io → verdaccio` (verified
2026-07-01), from manifests in the `enclii` repo under `infra/k8s/base/verdaccio/`. This
repo's own `.enclii.yml` describes a `npm-registry` service whose replica count and volume
size do not match those manifests; treat `.enclii.yml` as unreconciled, not as a source of truth.

**Kubernetes namespace**: none (not deployed)
**Cluster**: bare-metal k3s on Hetzner — shape only, in §4 below.

### Upstream dependencies (this repo consumes)

- none at runtime

### Downstream consumers (this repo is consumed by)

- every ecosystem repo that reads `docs/PORT_ALLOCATION.md` for a port block
- consumers of the `@madfam/*` packages
- `@madfam/ecosystem-banner` — bottom marquee on product landings ([docs/ECOSYSTEM_BANNER.md](docs/ECOSYSTEM_BANNER.md))

### Key environment variables

- none — this is a library/docs repo with no runtime

---

## 2. MADFAM ecosystem map

### The platforms every repo should know about

Roles and repo names follow `internal-devops/ecosystem/repo-registry.md`, **Last Verified
2026-07-04**. Visibility re-checked against the GitHub API on **2026-07-25** — five of the
twelve repos below are private, so their `github.com/madfam-org/...` links **404 without org
access**. That is stated here because an earlier edition of this table linked all twelve as if
they were public.

| Platform | Repo | Visibility | Role |
|---|---|---|---|
| **Enclii** | `madfam-org/enclii` | public | PaaS control plane — every deploy goes through it. Surfaces: Switchyard API, Switchyard UI, Dispatch admin, Roundhouse, Status pages. |
| **Janua** | `madfam-org/janua` | public | OIDC / OAuth 2.0 provider — RS256 JWKS at `auth.madfam.io/.well-known/jwks.json`. Single-issuer per deployment. |
| **Dhanam** | `madfam-org/dhanam` | **private** (flipped between 2026-07-16 and 2026-07-25) | Billing, entitlements, payment gateways (Stripe, Mercado Pago, SPEI). Hosts `POST /v1/billing/madfam-events`. AGPLv3 open core published separately as `dhanam-core` (public). |
| **Selva** | `madfam-org/selva-office` | public | LLM inference routing + agent orchestration. Repo rename to `selva` still pending. |
| **Karafiel** | `madfam-org/karafiel` | **private** | Operational compliance — CFDI, NOM-151, e.firma, SAT-adjacent. Single authority for CFDI/SAT/tax filings. Absorbed the archived `legal-ops` document generation as `legalgen`. |
| **Tezca** | `madfam-org/tezca` | public | Mexican law oracle (informational only; feeds Karafiel). |
| **Cotiza** | `madfam-org/digifab-quoting` | public | Quoting engine for fabrication and services. Product name Cotiza, repo name `digifab-quoting`. |
| **Forgesight** | `madfam-org/forgesight` | **private** | Digital-fabrication industry intelligence — pricing/vendor feed into Cotiza. |
| **Pravara MES** | `madfam-org/pravara-mes` | public | Fabrication-node routing and dispatch for physical jobs. |
| **PhyndCRM** | `madfam-org/phynd-crm` | public | Client-facing deliverables portal — one pane of glass per engagement. Hosts `POST /api/webhooks/routecraft`. |
| **Fortuna** | `madfam-org/fortuna` | **private** | Problem intelligence / zeitgeist analysis. |
| **Avala** | `madfam-org/avala` | **private** (flipped 2026-07-16) | Learning-verification platform (EC/CONOCER, DC-3). |

Two platforms other docs in this repo treat as load-bearing but which are missing from the
table above by convention rather than by accident:

- **`routecraft`** (private) — today's canonical payment-event producer (§3.4). The ratified
  target moves emission to Dhanam; see §3.4.
- **`meridian`** (public, created 2026-07-25, AGPL-3.0) — migration law and logistics.
  **Not deployed**, no operator gates run, no pathway counsel-reviewed.

The full public/private repo inventory is in `internal-devops/ecosystem/repo-registry.md`;
`README.md` §II in this repo carries the public-safe restatement with counts.

---

## 3. Cross-repo conventions

### 3.1 Auth — Janua OIDC, RS256 via JWKS

Every authenticated service verifies Janua JWTs against the JWKS at
`https://auth.madfam.io/.well-known/jwks.json`. **RS256 only — HS256 is fail-closed** since
the 2026-04-23 audit (findings H3/H4). No service implements custom auth, password login, or
session management. Claims: `sub`, `email`, `roles`, `org_id`, `rfc` (fiscal services only).

Janua is single-issuer per deployment — the issuer is derived from `JANUA_CUSTOM_DOMAIN`, not
the request `Host`. Never route a second Janua hostname (this is why `auth.selva.town` must
not exist).

*Contract, not a verified fleet state:* the 2026-07-16 launch-readiness audit rates
per-surface SSO conformance YELLOW. The matrix behind that rating is recorded in
`internal-devops` as a session artifact that was never committed, so per-surface enforcement
is currently **unestablished**.

### 3.2 Billing — Dhanam

Credit metering, entitlements and invoices flow through Dhanam. The billing ledger and bank
transactions are Dhanam-owned; other services read via API and keep no local mirror.

### 3.3 Inference — Selva `/v1`, no direct provider calls

Every LLM call routes through Selva's OpenAI-compatible `/v1` surface. Service code must not
talk directly to OpenAI, Anthropic, or any other provider.

**The endpoint is `https://inference.selva.town`** as of the 2026-07-07 cutover (RFC 0034 P2).
The proxy was extracted out of `nexus-api` into its own deployable,
`selva-inference-gateway`, and the `nexus-api` `/v1` mount was **removed** (selva-office#217).
Live-verified 2026-07-07: gateway `/health` → 200, unauthenticated `/v1/chat/completions` →
401, `api.selva.town/v1` → 404. Three real callers were repointed that day (dhanam, forj,
tezca). Any doc naming `nexus-api` or `selva.town/v1` as the inference endpoint is stale.

Provider credential isolation (Anthropic, OpenAI, DeepInfra, Together, Fireworks,
SiliconFlow, Moonshot on Selva only) is the rule. **Known deviation:** the 2026-07-09
phynd-crm audit found its reddit-bot fails open to `api.openai.com` when its base URL is
unset — recorded as an ecosystem violation, fix ranked #3 on that audit's list. Deviations
are tracked privately.

`inference.selva.town` is declared in `selva-office/enclii.yaml` and was live-verified on
2026-07-07, but it does **not** appear in the private domain map's route table — a gap in that
map, not evidence the route is absent.

### 3.4 Payment attribution — signed fan-out

Header `x-madfam-signature: t=<unix-seconds>,v1=<hex-hmac-sha256>` over `"${ts}.${raw-body}"`,
per-target secret, 5-minute replay window. Two receivers, both idempotent by the emitter's
`event_id`:

- `dhanam` `POST /v1/billing/madfam-events` → `BillingEvent` row
- `phynd-crm` `POST /api/webhooks/routecraft` → `conversions` row + source-agent credit

**As built:** `routecraft` emits, via `@routecraft/payments::emitPaymentSucceeded`.
**Ratified target:** `internal-devops/decisions/2026-05-04-payment-emission-soc.md` — *Dhanam
becomes the sole payment emitter; routecraft becomes a consumer and attribution emitter.*
Reaffirmed by the 2026-07-08 execution plan; none of it had landed as of that date.

**Not flowing as of 2026-07-08:** that plan, verified against routecraft at HEAD, records
that only the Conekta webhook emits (Stripe emits nothing), `attribution` is never populated,
there is no `payment.refunded`, and the emitter target secrets are absent from production
manifests — the fan-out is a silent no-op. The 2026-07-16 audit scores this edge RED.

`@madfam/webhook-attribution` in this repo packages the signing contract so it is not
reimplemented per repo. As of 2026-07-08, **no repo had adopted it**.

### 3.5 CORS — explicit allowlist, wildcards banned

Explicit origin allowlist per service. Wildcards banned (audit 2026-04-23, H2/H5/H6). The
newest service does it literally: `meridian`'s API requires `CORS_ALLOWED_ORIGINS` and
refuses to start without it.

### 3.6 Images — digest pinning is the org rule; admission is mostly Audit

Active production overlays should pin first-party images by digest. Enforcement is **mostly
CI-side, not admission-side**:

- CI ratchet F1 (`check-image-pinning.py` under `scripts/ratchet/` in both the `enclii` and
  `internal-devops` repos, per RFC 0021) fails the build on any image ref in infra manifests
  that is not pinned by `@sha256:` digest. Both copies verified present 2026-07-25.
- Of the three Kyverno image-tag policies recorded at the 2026-05-04 snapshot, only one
  fail-closes, and narrowly: `disallow-latest-tag` is **Audit**; `block-latest-ifnotpresent`
  is **Enforce** but only for `:latest` *with* `imagePullPolicy: IfNotPresent`;
  `require-image-digest` is **Audit**. A pod using `:latest` with `imagePullPolicy: Always`
  therefore passes admission. At that snapshot, 6 active deployments were still on `:latest`.
- A separate cosign signature-verification policy exists but has been routinely bypassed by
  namespace-wide PolicyExceptions. A "Cosign enforce phase" remained an open backlog item at
  2026-07-11, explicitly not a first-charge blocker.

*All of the above is dated 2026-05-04 to 2026-07-11 and is 82+ days old on the image-policy
half. Before making any enforcement claim, verify the current source of truth in
`internal-devops/ECOSYSTEM.md` and the Kyverno policy manifests in the `enclii` repo.*
Two records disagree on the PolicyException count (8 vs 13, both dated 2026-05-04); reading
the exception manifests at a named commit would settle it.

### 3.7 Onboarding — zero-touch by contract

`enclii onboard --repo madfam-org/<name> [--db-name <db>] [--secrets-file .env]` is equivalent
to `POST /v1/admin/onboard` on switchyard-api. In one call it creates the K8s namespace and
labels, the ArgoCD Application, the Cloudflare tunnel route and DNS record, a Janua OAuth/OIDC
client, and NetworkPolicies generated from the repo's own `enclii.yaml`. The
`ghcr-credentials` image-pull secret is auto-created.

What it does **not** do:

- **It does not populate secrets.** A documented failure class is a new namespace with an
  empty or placeholder Secret because the ExternalSecret was never wired.
- With `--db-name` it provisions a database and user **inside the existing shared cluster
  PostgreSQL** — not a new isolated instance. No managed-DB addon API, no PITR at onboard
  time, no branch/fork DBs for previews.
- It is operator-initiated. There is no self-serve signup, so time-to-first-deploy for an
  external user is undefined.

Governing contract, RFC 0014: adding a service must **not** require editing the `enclii`,
`janua` or `dhanam` repos. All deploy config lives in the app repo. NetworkPolicies are
generated and applied via the K8s API and deliberately not committed to git. If an onboarding
cannot be done without a platform-repo edit, that is a platform gap to file, not to route around.

### 3.8 Deploy — GitOps, ArgoCD pulls

Push to `main` → CI builds the image → GHCR → image signed with cosign keyless (Sigstore
Fulcio/Rekor OIDC) → `kustomize edit set image` pins the digest → CI commits that back to the
app repo → **ArgoCD detects the commit and syncs**. Nothing pushes to the cluster.

ArgoCD self-heal is **on** — verified by reading the manifests, not the prose. Checked
2026-07-25: all 23 Application manifests in `enclii/infra/argocd/apps/` and all 3 in
`internal-devops/infra/argocd/` set `syncPolicy.automated` with `prune: true` and
`selfHeal: true`; none was found without it. This is load-bearing: a live `kubectl patch`
will be reverted. Permanent config changes must be committed to the app repo.

The pipeline was proven end-to-end for **three named platform services** on 2026-07-07. That
is a per-service proof, not a fleet-wide one — the Q2 retrospective records "auto-digest
restoration: not assessed". Checking the most recent digest-commit date on each repo's
production `kustomization.yaml` would settle it fleet-wide.

Per-PR preview environments exist as an ArgoCD ApplicationSet using the GitHub pullRequest
generator (opt-in via a `preview` label, one Application + namespace per PR, cascade
teardown). As of 2026-07-07 previews are **dormant by design** — their DNS zone was never
bootstrapped, and CI self-skips green.

### 3.9 Data boundaries — own once, query everywhere

| Dataset | Owner | Everyone else |
|---|---|---|
| Identity / sessions / roles | Janua | federate, never duplicate |
| Bank transactions + billing ledger | Dhanam | API read; no local mirror |
| Mexican law + compliance rules | Tezca | query `/api/v1/laws`; no fork |
| CFDI / SAT / tax filings | Karafiel | single authority |
| Fabrication node capacity + pricing | Forj | consume ForgeSight |
| Manufacturing execution telemetry | Pravara MES | feeds PhyndCRM federation |
| 3D geometry kernel | geom-core | used by Sim4D + Yantra4D |

---

## 4. Production topology — shape only

> Boundary checkpoint: node hostnames, IPs, hardware models, capacity figures, costs and the
> Cloudflare tunnel identifier are documented **only** in `internal-devops`. This section
> keeps shape.
>
> **All figures below carry the 2026-05-04 verification date of
> `internal-devops/infrastructure/nodes.md` and `topology.md` unless stated otherwise — 82
> days old as of 2026-07-25.**

**Cluster.** Bare-metal k3s (recorded at v1.33.7+k3s3, *verified 2026-05-04; no newer
verification exists*), 3 nodes, all at Hetzner:

- one control-plane node — control plane + primary workload
- one worker node — workloads + the Longhorn second replica
- one CI builder node — a Hetzner **Cloud** instance, not dedicated hardware, tainted
  `builder=true:NoSchedule` and labelled `role=builder`; only ARC GitHub Actions runners
  schedule there

**Ingress.** Internet → Cloudflare edge → cloudflared pods → K8s Service:80 → container port.
TLS terminates at the Cloudflare edge, which also handles DDoS mitigation; the origin leg from
cloudflared to the Service is plain HTTP on port 80.

A **single** named Cloudflare Tunnel carries all ingress — every HTTP product route plus the
SSH jumphost. Earlier docs describing separate product/SSH tunnels described a split that
never existed in the live infrastructure (`domain-map.md`, verified 2026-07-01).

`cloudflared` runs as a Deployment named `cloudflared` in a dedicated `cloudflare-tunnel`
namespace. **Replica count: documented as 2, but not verified since the 2026-02 ecosystem
audit** — no 2026-05-or-later document restates it. Treat "2 replicas" as documented-but-unverified.

**Zero exposed node ports** for application ingress — all public application traffic arrives
through the tunnel. Read precisely: this means no NodePort application ingress. It does not
mean nothing listens publicly on the nodes; the k3s API server and node SSH paths are
documented privately.

**Storage.** Longhorn CSI in 2-replica mode across the two non-tainted nodes, exposed as the
`longhorn` StorageClass. Corroborated independently by a 2026-04 platform audit and by
manifests requesting `storageClass: longhorn`. The Longhorn **version** appears in exactly one
place, undated — treat the version as **unverified**. Object storage is Cloudflare R2, chosen
for zero egress cost; it is the destination for PostgreSQL logical backups, WAL archiving,
repo backups, and per-product asset buckets.

**GitOps.** ArgoCD App-of-Apps plus ApplicationSets, self-heal on (§3.8). App and namespace
counts: `topology.md` records **28 ArgoCD apps across 22 namespaces** (2026-05-04). A separate
private document dated 2026-04-29 reports "18 of ~50" apps Synced+Healthy — the two are
measuring different things (declared apps vs an App-of-Apps health view) and **newest-wins does
not resolve it**. One `enclii ops apps list` with the output and date recorded would.

**Service count.** Three sources disagree: "~40 services" (undated, generated template),
93 declared / 76 healthy (2026-04-29 control-plane analysis), ~90 routed hostnames
(domain map, 2026-07-01). They are not the same measurement. **No service count in this repo
should be treated as authoritative** until one Enclii control-plane query is recorded with a
date and an explicit definition of "service".

**Secrets path — mechanism only.** HashiCorp Vault (KV v2) is the home; External Secrets
Operator reads it through a ClusterSecretStore; a per-app ExternalSecret materializes a native
K8s Secret in the app namespace; the Deployment consumes it via `envFrom`/`secretRef`. ESO
refresh interval is 15 minutes; Stakater Reloader rolls consumers when the Secret changes.
Human-supplied production secrets go through `enclii secrets intake` rather than chat or git.

*Important qualifier:* **not all services are Vault-backed.** At least two recent go-lives
provision plain K8s Secrets out-of-band because the platform has no CLI surface to write Vault
after onboarding — an Enclii adapter gap recorded 2026-07-10 and re-verified 2026-07-25. Those
secrets sit outside the ESO refresh loop.

Access policy: no credentials in chat, commits, logs, docs or agent memories. Human access is
`enclii login` (browser SSO via Janua) creating an audited, revocable session; non-interactive
CI access uses a short-lived scoped revocable token, never a human SSO password. Any credential
seen in a transcript is treated as compromised and rotated (decision of record, 2026-06-13).

**Operational access** (SSH, kubeconfigs, node identity, cost ledger): private repo
`madfam-org/internal-devops`. Not in any public repo.

---

## 5. Enclii CLI — DevOps reference

**Enclii is the required control plane for routine production operations.** The CLI routes
through the Switchyard API, which gives audit logging, lifecycle event tracking, and
service-scoped context.

> **Caveat on this section, stated because it has bitten before.** The commands below were
> read from the CLI source at `enclii/packages/cli/internal/cmd/` on **2026-07-25**. Documented
> CLI surfaces in this ecosystem have drifted from shipped binaries — a private 2026-07-22 CLI
> audit found commands asserted by a drift-check script that the then-current build did not
> implement. Before scripting against anything here, run `enclii <group> --help` on your
> installed version. That is the only thing that settles it for your binary.

### Install

```bash
# macOS
brew install enclii/tap/enclii

# Linux
curl -sSL https://get.enclii.dev | bash

# From source (in the enclii repo)
make build-cli && ./bin/enclii --version
```

### Auth

```bash
enclii login                  # browser SSO (Janua) — audited, revocable session
enclii whoami                 # verify active session
enclii logout                 # clear local creds
```

Env vars: `ENCLII_API_URL` (default `https://api.enclii.dev`), `ENCLII_TOKEN` (short-lived
scoped token for CI; never a human SSO password), `ENCLII_PROJECT`, `ENCLII_ENV`.

### Day-to-day

`solarpunk-foundry` has **no deployed service**, so there is no service name to substitute
here. The examples below use `<service>` — replace it with a real Switchyard service name from
another repo.

```bash
# Status + placement
enclii ps --wide
enclii ps <service> --env production

# Logs
enclii logs <service> -f                          # live tail
enclii logs <service> --since 1h --level error
enclii logs <service> --env staging -f

# Deploy
enclii deploy --env preview                       # from current branch
enclii deploy --env staging
enclii deploy --env production --strategy canary --canary-percent 10

# Rollback
enclii rollback <service>                         # previous release
enclii rollback <service> --to-revision 5

# Releases
enclii releases <service>
enclii releases <service> --latest --output json

# Secrets (routed Lockbox → Vault → ESO → K8s)
enclii secrets list
enclii secrets get KEY
enclii secrets set KEY=VALUE --service <service> --secret
enclii secrets delete KEY
enclii secrets intake targets   # chat-safe credential handoff; never paste secrets in agent chat

# Domains, tunnel routes, DNS
enclii domains list <service>
enclii domains add <service> my.example.com       # auto-provisions tunnel route + DNS

# Jobs, routing, serverless
enclii jobs list
enclii jobs run <job-name>
enclii junctions list <service>
enclii functions list

# Local dev (see README §VII for what each actually starts)
enclii local up
enclii local infra
enclii local status
enclii local logs
enclii local down
```

### Onboarding a brand-new service

```bash
enclii onboard --repo madfam-org/<name> --db-name <db> --secrets-file .env
```

See §3.7 for exactly what this does and — more importantly — what it does not do.

### Enclii-first production operations

Use the web UI, API, or CLI before reaching for raw infrastructure tools. The operational
surface intended to replace raw tooling (`enclii ops`, verified present in the CLI source
2026-07-25):

- `enclii ops apps` — ArgoCD sync / diff / rollback
- `enclii ops pods` — logs, diagnosis, safe restarts
- `enclii ops jobs` — CronJob inspection and audited triggers
- `enclii ops storage` — PVC / PV / Longhorn workflows
- `enclii ops policy` — Kyverno violations and time-bound waivers
- `enclii ops secrets` — ExternalSecrets, Vault readiness, reconciliation
- `enclii ops runners` — ARC / CI runner inspection and drain
- `enclii providers` — DNS, tunnels, SaaS hostnames, repo automation

Provider custody model (which owner holds which financial and shared-service credentials) is
documented privately in `internal-devops/decisions/2026-06-16-ecosystem-provider-custody-model.md`.
No secret-store paths or secret names belong in this repo.

### Break-glass-only access

Raw `kubectl`, `helm`, SSH, provider CLIs/APIs, `docker exec` and direct container access are
allowed **only** for platform bootstrap or documented break-glass when Enclii is unavailable
or lacks an implemented adapter. Record the actor, reason, target service/environment,
commands executed, result, and the follow-up Enclii adapter gap or incident link. Recording
the adapter gap is mandatory — the stated intent is to avoid normalizing raw access in docs.

Enforcement is **documentary, not technical**: a banner convention plus a docs-linting script
in `internal-devops`. There is no admission-time or CLI-time block on raw `kubectl`.

### Cluster access

kubeconfig and SSH keys live in `madfam-org/internal-devops` (private) for bootstrap and
break-glass use only. Routine production operations go through Enclii.

### Exit codes (scripting against the CLI)

| Code | Meaning |
|---|---|
| 0 | success |
| 10 | validation error |
| 20 | build failed |
| 30 | deploy failed |
| 40 | timeout |
| 50 | auth error |

---

## 6. Known gaps in this document

Stated explicitly so nobody has to rediscover them:

| Gap | What would settle it |
|---|---|
| ArgoCD app count contradicted (28 declared, 2026-05-04 vs "18 of ~50" health view, 2026-04-29) | one `enclii ops apps list` with output + date |
| `cloudflared` replica count unverified since 2026-02 | read the live Deployment's replica count via `enclii ops pods`, record the date |
| Kyverno PolicyException count: 8 vs 13, both dated 2026-05-04 | `enclii ops policy`, or read the exception manifests at a named commit |
| Whether `require-image-digest` is Audit or Enforce today | read the ClusterPolicy `validationFailureAction` in the enclii repo at HEAD |
| Longhorn version (`v1.7+`, single undated mention) | `enclii ops storage` version output, or the Helm chart pin in GitOps |
| k3s version unverified since 2026-05-04 | a dated node-version read through Enclii |
| Whether the auto-digest pipeline is healthy fleet-wide | most recent digest-commit date per repo's production `kustomization.yaml` |
| Service count (~40 / 93 / ~90 across three sources) | one Enclii control-plane query, dated, with "service" defined |
| Per-surface Janua SSO enforcement | commit the SSO uniformity matrix to `internal-devops` and cite it by path |
| Whether the published `@madfam/*` versions are actually on `npm.madfam.io` | a registry query or a dated operator attestation |

---

## Document provenance

This document was originally generated on 2026-04-23 as part of the "each repo stands alone"
docs sweep, and was **hand-corrected on 2026-07-25** against the sources listed in the header.
The corrections it needed included: a Selva inference endpoint that had moved (2026-07-07), a
platform table that linked private repos as public, a claim that this repo hosts the Verdaccio
registry, a secret-store path that should never have been public, and an unsubstituted
template variable that left roughly twenty example commands literally broken.

If the ecosystem map or CLI reference drifts again, fix the generator at
`madfam-org/enclii/docs/templates/ecosystem/generator.py` and re-render — **note that the path
this document previously cited (`enclii/docs/templates/ECOSYSTEM.md.template`) does not
exist**, checked 2026-07-25. Do not edit per-repo copies in isolation, and do not let the
generator re-introduce the corrections above.
