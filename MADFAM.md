# MADFAM Ecosystem — Master Reference

**Last updated:** 2026-04-17
**Purpose:** Single public-safe map of every MADFAM platform, repo,
and ecosystem contract. This is the only doc at `labspace/` root; all
operational / strategic / cost / access detail lives in the private
`internal-devops` repo, which every section below links to.

---

## 0. Org at a glance

- **Legal entity:** Innovaciones MADFAM S.A.S. de C.V., Cuernavaca, Morelos, Mexico.
- **Predecessor brand:** Aureo Labs (aureolabs.dev). Retired 2026-04-17; every repo + doc rebranded in the ecosystem sweep. `aureo.studio` held for brand protection only.
- **GitHub org:** [`madfam-org`](https://github.com/madfam-org) (+ `legal-ops` for jurisdictional code-as-law).
- **Primary canonical domain:** [`madfam.io`](https://madfam.io). Status board at [`status.madfam.io`](https://status.madfam.io).
- **Infrastructure shape:** 3-node bare-metal K3s cluster (1 control plane + 1 worker + 1 builder), Cloudflare Zero-Trust Tunnel ingress, GitOps via ArgoCD, Longhorn storage, Prometheus + Grafana + Alertmanager, Kyverno policy enforcement. **All specifics (IPs, hardware, hostnames, costs, SSH targets) live in `internal-devops/infrastructure/nodes.md` — never put them in a public repo.**

---

## 1. Platform layers (what's in production)

The ecosystem is organised into layers. Each platform has its own repo + domain.

### 🪨 Soil — infrastructure

| Platform | Repo | Domain | Role |
|---|---|---|---|
| **Enclii** | [`enclii`](https://github.com/madfam-org/enclii) | `enclii.dev`, `api.enclii.dev`, `app.enclii.dev`, `admin.enclii.dev`, `status.enclii.dev`, `docs.enclii.dev`, `npm.madfam.io` | Sovereign PaaS (Go Switchyard API + Next.js UIs). Handles build, deploy, domain provisioning, ArgoCD onboarding, NetworkPolicy generation, and deployment lifecycle events. |
| **Janua** | [`janua`](https://github.com/madfam-org/janua) | `auth.madfam.io`, `janua.dev`, `docs.janua.dev` | OIDC + RS256 JWT identity platform. Every other MADFAM service defers to Janua — **no custom auth anywhere**. |
| **solarpunk-foundry** | [`solarpunk-foundry`](https://github.com/madfam-org/solarpunk-foundry) | — | Ecosystem orchestration hub, `@madfam/core` design tokens, port registry, dogfooding guides. Sanitized 2026-04-17 — all prod IPs / hardware / hostnames / cost data / strategic audits moved to `internal-devops`. |

### 🌿 Roots — sensing / input

| Platform | Repo | Domain | Role |
|---|---|---|---|
| **Fortuna** | [`fortuna`](https://github.com/madfam-org/fortuna) | `fortuna.tube`, `api.fortuna.tube` | Problem-intelligence: discovers + validates market gaps. Consumes inference through Selva's `/v1/` proxy (no direct provider credentials). |
| **ForgeSight** | [`forgesight`](https://github.com/madfam-org/forgesight) | `forgesight.quest`, `app`, `api`, `admin` | Global manufacturing-pricing data. Launch-wedge per the pricing strategy (lowest objection cost, nearshoring tailwind). |
| **BlueprintTube** | [`blueprint-harvester`](https://github.com/madfam-org/blueprint-harvester) | `blueprint.tube` | 3D-model indexer + analyzer. |
| **BloomScroll** | [`bloom-scroll`](https://github.com/madfam-org/bloom-scroll) | `almanac.solar` | Slow-web content aggregator. |
| **madfam-crawler** | [`madfam-crawler`](https://github.com/madfam-org/madfam-crawler) | — | Internal scraping-as-a-service (Crawl4AI + ScrapegraphAI). Used by Tezca (DOF/RMF fiscal monitoring) and others. |

### 🪵 Stem — core standards

| Platform | Repo | Role |
|---|---|---|
| **geom-core** | [`geom-core`](https://github.com/madfam-org/geom-core) | C++ geometry-analysis core exposed to WASM + Python. Backs Sim4D and any future CAD surface. |
| **AVALA** | [`avala`](https://github.com/madfam-org/avala) | Learning verification (Mexican EC/CONOCER + DC-3 compliance). |
| **routecraft** | [`routecraft`](https://github.com/madfam-org/routecraft) | Trip-engine SaaS. **Emits signed `payment.succeeded` events via `@routecraft/payments::emitPaymentSucceeded`** — see §3. |

### 🍎 Fruit — user platforms

| Platform | Repo | Domain | Role |
|---|---|---|---|
| **Sim4D** | [`sim4d`](https://github.com/madfam-org/sim4d) | (marketing only, no service domain) | Web-first parametric CAD (B-Rep / NURBS via OCCT.wasm). Rebranded from BrepFlow on 2026-04-17. |
| **Forj** | [`forj`](https://github.com/madfam-org/forj) | `forj.design`, `app`, `api`, `admin` | Decentralized fabrication storefronts. 3D-first infinite scroller + blockchain-capable NFT minting. |
| **Cotiza Studio** | [`digifab-quoting`](https://github.com/madfam-org/digifab-quoting) | `cotiza.studio`, `api.cotiza.studio` | Automated quoting engine. Emits billing events into Dhanam via `DhanamRelayService`. |
| **Dhanam** | [`dhanam`](https://github.com/madfam-org/dhanam) | `dhan.am`, `app.dhan.am`, `api.dhan.am`, `admin.dhan.am` | Budget + wealth tracking + **ecosystem billing ledger**. Receiver for all signed MADFAM payment events. |
| **Coforma Studio** | [`coforma-studio`](https://github.com/madfam-org/coforma-studio) | `coforma.studio` | Customer advisory boards as growth engines. |
| **Galvana** | — | (unreleased) | Electrochemistry simulation. |
| **Karafiel** | [`karafiel`](https://github.com/madfam-org/karafiel) | `karafiel.mx`, `app`, `api`, `admin` | Combat-accounting for Mexican tax defense. Consumes Tezca legal data + Dhanam financial data; never duplicates either. |
| **Tezca** | [`tezca`](https://github.com/madfam-org/tezca) | `tezca.mx`, `api.tezca.mx`, `admin.tezca.mx` | Legal-intelligence platform. Source of truth for Mexican law, changelog, compliance rules. |
| **Yantra4D** | [`yantra4d`](https://github.com/madfam-org/yantra4d) | `yantra4d.com`, `app`, `api`, `admin` | Parametric design platform + its commons of OpenSCAD/CadQuery projects (gridfinity, rugged-box, custom-msh, etc.). |
| **Pravara MES** | [`pravara-mes`](https://github.com/madfam-org/pravara-mes) | `mes.madfam.io`, `mes-api.madfam.io` | Manufacturing execution system. |
| **Rondelio** | [`rondelio`](https://github.com/madfam-org/rondelio) | `rondel.io`, `api`, `play` | Tabletop / TCG game-intelligence cloud. |

### 🤝 Glue — cross-platform

| Platform | Repo | Domain | Role |
|---|---|---|---|
| **PhyneCRM** | [`phyne-crm`](https://github.com/madfam-org/phyne-crm) | `crm.madfam.io` | Phygital CRM — "Synthetic Single Pane of Glass" federating data from 6 MADFAM platforms (Janua, Janua Telemetry, Dhanam, Cotiza, Pravara, Forj) without duplication. Hosts ecosystem-attribution receivers — see §3. |
| **AutoSwarm Office** (→ **Selva**) | [`autoswarm-office`](https://github.com/madfam-org/autoswarm-office) | `agents.madfam.io` *(→ `selva.town` post-cutover)* | AI workforce / office simulator. Owns the `/v1/` OpenAI-compatible inference proxy that every ecosystem service routes its LLM calls through. Also hosts the revenue-loop probe, HITL-confidence ledger, and `nexus-api` orchestration engine. **Rename gated by `REBRAND_CUTOVER_RUNBOOK.md`.** |

### Other live platforms

| Repo | Domain | Role |
|---|---|---|
| `madfam-site` | `madfam.io`, `cms.madfam.io` | Organization website |
| `primavera3d` | `primavera3d.pro` | 3D portfolio site |
| `ceq` | `ceq.lol` | ComfyUI creative-engine wrapper |
| `nuit-one` | `nuit.one` | Audio platform |
| `subtext` | `subtext.live` | (standalone) |
| `accionables-madlab` | `madlab.quest` | (standalone) |
| `factlas` | `factl.as`, `factlas.com` | Geospatial facts engine |
| `penny` | `penny.onl` | → to merge into autoswarm-office post-Selva cutover |
| `zavlo` | — | Financial ops engine → to integrate into Karafiel (CFDI loyalty) |
| `panopticon-mx` | — | Mexican state structure → to integrate into Tezca |
| `social-sentiment-monitor` | — | Social signals → to integrate into Fortuna |
| `turnbased-engine` | — | Generic turn-based game engine (multi-cartridge server) |
| `stratum-tcg` | — | First cartridge for turnbased-engine |
| `server-auction-tracker` | `sniper.madfam.io` | Hetzner auction intelligence (binary: `foundry-scout`) |
| `gh-backups` | — | Automated repo backups to R2 |
| `proton-bridge-pipeline` | — | Proton Mail bridge automation |
| `leyes-como-codigo-mx` | — | Mexican law-as-code (in `legal-ops` org) |

### Yantra4D Commons (parametric-design library)

39 repos — `gridfinity`, `gridfinity_extended_openscad`, `rugged-box`, `microscope-slide-holder`, `microscope-slide-hyperobject`, `torus-knot`, `superformula`, `spiral-planter`, `relief`, `motor-mount`, `maze`, `gear-reducer`, `gears`, `cq-hyperobject-test`, `custom-msh`, `din-rail-clip`, `extrusion-hyperobject`, `faircap-filter`, `fasteners`, `framing-hyperobject`, `glia-diagnostic`, `hinge-hyperobject`, `implicit-lattice-hyperobject`, `julia-vase`, `keyv2`, `locking-mechanism-hyperobject`, `multiboard`, `parametric-connector`, `polydice`, `portacosas`, `prosthetic-socket`, `rubiks-hyperobject`, `scara-robotics`, `slide-holder`, `soft-jaw`, `stemfie`, `ultimate-box`, `voronoi`, `yapp-box`. Private within this class: `tablaco`.

### Repo visibility reality (verified via `gh repo list` on 2026-04-17)

**19 repos are PRIVATE**, not public as earlier versions of this doc implied: `blueprint-harvester`, `factlas`, `forgesight`, `forj`, `fortuna`, `gh-backups`, `internal-devops`, `karafiel`, `legal-ops`, `madfam-crawler`, `proton-bridge-pipeline`, `rondelio`, `routecraft`, `social-sentiment-monitor`, `stratum-tcg`, `symbiosis-hcm`, `tablaco`, `turnbased-engine`, `zavlo`.

**Additional platforms / repos** previously un-listed here: `symbiosis-hcm` (HCM — Mexican payroll, Shapley compensation, ONA, wellbeing), `kinship` (E2E-encrypted community logistics/energy platform), `electrochem-sim` (Galvana simulator core), `autoswarm-sandbox` (agent testing sandbox), `Auto-Claude` (automation toolkit), `claudecodeui` (third-party mobile Claude Code UI fork), `aureo-labs` (archived legacy brand repo).

The authoritative registry lives in [`internal-devops/ecosystem/repo-registry.md`](https://github.com/madfam-org/internal-devops/blob/main/ecosystem/repo-registry.md).

---

## 2. Live routes

Every production route flows through Cloudflare Tunnel → K8s Service → container. The authoritative mapping lives in
[`internal-devops/ecosystem/domain-map.md`](https://github.com/madfam-org/internal-devops/blob/main/ecosystem/domain-map.md).
A sanitized status board exposes the current up/down state at [`status.madfam.io`](https://status.madfam.io).

The Selva rebrand cutover will retire `agents-*.madfam.io` in favour of `*.selva.town`. Until that maintenance window runs, `agents-*` routes remain authoritative.

---

## 3. Ecosystem contracts (how platforms talk to each other)

### 3.1 Identity → every service

Janua is the only auth. Every service verifies RS256 JWTs against `auth.madfam.io/.well-known/jwks.json`. `X-Active-RFC` + tenant claims flow through the JWT; no service implements its own login, password reset, or session store.

### 3.2 Inference → Selva `/v1/` proxy

`nexus-api` exposes an OpenAI-compatible `/v1/chat/completions` + `/v1/embeddings`. Fortuna, Yantra4D, PhyneCRM, and any future LLM-consuming service point their OpenAI SDK `base_url` at this proxy. Provider credentials (Anthropic, OpenAI, DeepInfra, Together, Fireworks, SiliconFlow, Moonshot) live only on Selva's side, routed by `ModelRouter` per task-type.

### 3.3 Revenue attribution loop (MXN flywheel)

```
PhyneCRM lead → Nexus drafter (LLM) → email send (Resend) →
  Stripe / Conekta / Mercado Pago webhook → RouteCraft payments module →
    emitPaymentSucceeded() fires signed events in parallel to:
      ├─ Dhanam   /v1/billing/madfam-events   (writes BillingEvent row)
      └─ PhyneCRM /api/webhooks/routecraft     (writes conversions row,
                                                 credits source agent)
```

Signature scheme: `x-madfam-signature: t=<unix-seconds>,v1=<hex-hmac-sha256>` over `"${ts}.${raw-body}"`, per-target secret, 5-min replay window. Both receivers are idempotent by the RouteCraft event_id.

Revenue-loop probe synthesizes a hot lead every hour and exercises the full chain, failing loudly if any stage breaks. Probe endpoints: `POST /api/v1/probe/leads` + `GET /api/v1/probe/attribution` (PhyneCRM); `POST /v1/billing/madfam-events` + `GET /v1/probe/billing-events/:eventId` (Dhanam); `POST /api/v1/probe/draft` + `POST /api/v1/probe/email/send` (Selva).

### 3.4 Data boundaries (who owns what)

| Dataset | Owner | Everyone else |
|---|---|---|
| Identity / sessions / roles | Janua | Federates, never duplicates |
| Bank transactions, wealth, analytics, **ecosystem billing ledger** | Dhanam | Reads via API; never stores |
| Legal text, changelog, compliance rules | Tezca | Queries via `/api/v1/laws/...`; never forks |
| CFDI / SAT / tax compliance | Karafiel | Consumes Dhanam + Tezca data |
| Fabrication node capacity + pricing | Forj | Consumes ForgeSight pricing |
| Manufacturing execution telemetry | Pravara MES | Feeds into PhyneCRM federation |
| 3D geometry kernel | geom-core | Used by Sim4D + Yantra4D |

---

## 4. Operational pointers (non-public details)

All of the following live **only** in the private `internal-devops` repo:

| Topic | Internal-devops path |
|---|---|
| Node inventory + IPs + hardware + costs | `infrastructure/nodes.md`, `infrastructure/topology.md`, `infrastructure/capacity.md`, `infrastructure/cost-analysis.md` |
| SSH runbook + access matrix | `access/ssh-runbook.md`, `access/access-matrix.md` |
| K3s + ArgoCD + Grafana access | `access/k3s-access.md`, `access/argocd-access.md`, `access/grafana-access.md` |
| Credentials + API-key + OAuth patterns *(no actual secrets committed)* | `credentials/*.md` |
| Incident response, disaster recovery, secret rotation, node replacement | `runbooks/*.md` |
| Domain map (authoritative) | `ecosystem/domain-map.md` |
| Repo registry (authoritative) | `ecosystem/repo-registry.md` |
| Selva cutover sanitized infra reference | `ecosystem/autoswarm-office-infra.md` → becomes `ecosystem/selva-infra.md` post-cutover |
| GTM strategy | `ecosystem/gtm-strategy.md` |
| Compliance deadlines (SAT, DOF, etc.) | `ecosystem/compliance-deadlines.md` |
| Hardware evaluation + Hetzner auction checklist | `hardware/*.md` |
| Most recent full ecosystem audit (Feb 2026) | `audits/ecosystem-audit-2026-02.md` |
| Security-scrub audit (2026-03-13) | `audits/2026-03-13-security-scrub.md` |
| Latest session wrap | `ecosystem/session-2026-04-17-wrap.md` |
| Current remediation plan | `ecosystem/remediation-plan-2026-04.md` |
| Pricing + catalog + competitive-intelligence strategy | `ecosystem/pricing-strategy-2026-04.md` |
| Per-product ARCs + design decisions | `decisions/adr-*.md` |

---

## 5. Carried-forward operational gates (as of 2026-04-17)

These are the only open items blocking full ecosystem stability. Detail + runbooks for each live in the private repo; pointers only here.

| Gate | Runbook | Owner | Notes |
|---|---|---|---|
| **Selva rebrand cutover** (the last unmerged branch in all of labspace) | `autoswarm-office/REBRAND_CUTOVER_RUNBOOK.md` | DevOps on-call | 3,982 files / ~1M insertions on `chore/2026-04-17-madfam-ecosystem-sweep`. Requires Vault-path migration, K8s namespace swap, DNS cutover to `*.selva.town`, 30-min soak, and a rollback branch. |
| **Karafiel `AUTOSWARM_*` → `SELVA_*` secret rename** | `karafiel/infra/k8s/production/RENAME_AUTOSWARM_TO_SELVA_SECRETS.md` | karafiel-prod operator | Code path silent-no-ops when envs missing, so non-urgent. Gate after Selva cutover. |
| **24 overdue secret rotations** + **rotation-monitor CronJob apply** | `internal-devops/runbooks/secret-rotation.md` | SRE | Apple OAuth 137d overdue is oldest. |
| **HashiCorp Vault deploy** | `enclii/infra/argocd/apps/vault.yaml` + `scripts/migrate-secrets-to-vault.sh` | SRE | Manifests staged, never run. |
| **MXN flywheel activation (H1–H7)** | `internal-devops/ecosystem/remediation-plan-2026-04.md` §H | ecosystem-ops | H1 (Anthropic credits or DeepInfra bridge) is the sole blocker for the autonomous revenue loop. |

---

## 6. Conventions that apply ecosystem-wide

- **Feature branches only** — never commit to `main` directly.
- **Conventional commits** — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `perf:`.
- **No custom auth.** Every service uses Janua's RS256 JWT via JWKS.
- **No custom deployment.** Every service deploys through Enclii (push to `main` → Enclii webhook → Buildpacks / Dockerfile → GHCR → K8s reconciler). ArgoCD applies the resulting manifest.
- **No cross-repo data duplication.** Query the authoritative owner (§3.4).
- **Port allocation follows the solarpunk-foundry registry** (`docs/PORT_ALLOCATION.md` in that repo). Pattern: each service gets a 100-port block; API at `+00`, Web at `+01`, Admin at `+02`.
- **Zero-touch onboarding.** New repos self-provision via `enclii onboard --repo <owner/name>` + `.enclii.yml` + `enclii.yaml` + `infra/argocd/config.json` in the repo itself. The `enclii` repo never holds per-ecosystem-service config.
- **Secrets never in code.** ExternalSecret manifests + Vault (when deployed) or interim `kubectl create secret` + in-repo `secrets-template.yaml`. No literal secrets in any repo.
- **Every date in docs is ISO-8601** (`YYYY-MM-DD`).

---

## 7. Where to start (role-keyed)

- **New engineer, wants to run things locally:** `solarpunk-foundry/README.md` → `docs/DOGFOODING_GUIDE.md` → `enclii local up`.
- **Existing engineer, needs to deploy a new repo:** `enclii/docs/guides/ONBOARDING_GUIDE.md`.
- **Operator, needs SSH or cluster access:** `solarpunk-foundry/docs/SSH_ACCESS.md` (public-safe pointer) → request access per the Cloudflare Access policy.
- **Operator, needs IP / node / cost detail:** `internal-devops/infrastructure/nodes.md` (private).
- **Anyone auditing the ecosystem contract:** this doc + `internal-devops/ecosystem/domain-map.md` + `internal-devops/ecosystem/repo-registry.md`.
- **Anyone planning strategic work:** `internal-devops/ecosystem/gtm-strategy.md`, `internal-devops/ecosystem/pricing-strategy-2026-04.md`, `internal-devops/audits/ecosystem-audit-2026-02.md`.

---

*This is the only doc at `labspace/` root by design.* If you think something else belongs here, it probably belongs in the private `internal-devops` repo (strategic / operational / sensitive) or in a specific platform's repo (product-owned).
