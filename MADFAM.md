# MADFAM Ecosystem — Master Reference

> [!IMPORTANT]
> MADFAM-ENCLII-FIRST-LEGACY-RAW v1: This document contains legacy raw infrastructure command examples.
> Routine production operations must use Enclii web, API, or CLI. Treat raw
> `kubectl`, `helm`, SSH, provider CLI/API, `docker exec`, and direct container
> access as platform bootstrap or documented break-glass only, and record any
> missing Enclii adapter gap.

**Last updated:** 2026-08-24

**Verification anchors — every claim below inherits one of these, and each section says which:**

| What | Source | Verified |
|---|---|---|
| Repo names, visibility, roles | `internal-devops/ecosystem/repo-registry.md` | **2026-08-24** (rebuilt from live enumeration) |
| Live org counts and archive flags | GitHub enumeration run for this edit | **2026-08-24** |
| Domains and routes | `internal-devops/ecosystem/domain-map.md` | **2026-08-24** (live HTTP probes of every routed domain) |
| Infrastructure shape | `internal-devops/infrastructure/nodes.md` (4-node since 2026-08-06), `topology.md` | **2026-08-05 / 2026-08-24** |
| Commercial / funnel status | internal launch-readiness audit (2026-07-16) **plus** the 2026-08-03 first-charge evidence record | **2026-08-02 event, recorded 2026-08-03** |
| Payment-emission state | internal payment-emission SoC execution plan | **2026-07-08** (unchanged; the 2026-08-02 charge used Dhanam's own PSP path) |
| Inference endpoint | internal Selva gateway cutover record; `/health` re-probed | **2026-07-07 / 2026-08-24** |

**This document contains no probes of its own** — route claims inherit the private domain
map's 2026-08-24 live-probe verification. Claims are labelled *verified*, *documented but
unverified*, or *aspirational*. Where two internal sources disagree, this document says so
rather than picking a winner.

**Purpose:** the fuller public-safe map of every MADFAM platform, repo, and ecosystem
contract. [`README.md`](README.md) is the front door and carries the same map in condensed
form; this document goes deeper per platform. All operational, strategic, cost and access
detail lives in the private `internal-devops` repo, pointed to by name only.

> **Boundary note.** Public repo, Lane B. Node identity, IPs, hardware, capacity, costs, the
> Cloudflare tunnel identifier, Vault paths, incident evidence and break-glass procedures live
> only in `internal-devops`. Canonical policy:
> `internal-devops/docs/repo-boundary-contract.md` (last updated 2026-06-14).

---

## 0. Org at a glance

- **Legal entity:** Innovaciones MADFAM S.A.S. de C.V., Cuernavaca, Morelos, Mexico.
- **Predecessor brand:** Aureo Labs (`aureolabs.dev`), retired 2026-04-17. The `aureo-labs`
  repo is public and **archived** (2026-04-08); `aureo.studio` is held for brand protection.
- **GitHub org:** [`madfam-org`](https://github.com/madfam-org). A separate `legal-ops` org
  hosts `leyes-como-codigo-mx`.
- **Primary canonical domain:** [`madfam.io`](https://madfam.io). Status board at
  [`status.madfam.io`](https://status.madfam.io) — the only surface reporting live state.
- **Infrastructure shape** *(per `internal-devops/infrastructure/nodes.md`, Last Updated
  2026-08-05)*: **4-node** bare-metal k3s cluster — one control-plane node, one worker, and
  **two CI builders** (one cloud instance, one dedicated box added 2026-08-06, which removed
  the single-builder SPOF), both tainted so only ARC runners schedule on them.
  Ingress is a **single** Cloudflare Tunnel with zero exposed node ports and TLS terminated at
  the Cloudflare edge. GitOps via ArgoCD with self-heal on. Longhorn CSI 2-replica block
  storage; Cloudflare R2 object storage. Prometheus + Grafana + Alertmanager. Kyverno, mostly
  in Audit mode (see [`ECOSYSTEM.md`](ECOSYSTEM.md) §3.6 for what actually fail-closes).
  **All specifics — IPs, hardware, hostnames, capacity, costs, SSH targets, tunnel identifier
  — live in `internal-devops/infrastructure/` and never in a public repo.**

---

## 1. Platform layers

Each platform has its own repo and, where deployed, its own domains. 🔒 marks a **private**
repo whose GitHub link 404s without org access — visibility re-checked 2026-07-25.

### 🪨 Soil — infrastructure

| Platform | Repo | Domains (verified 2026-07-01) | Role |
|---|---|---|---|
| **Enclii** | [`enclii`](https://github.com/madfam-org/enclii) | `enclii.dev`, `api.`, `app.`, `admin.`, `status.`, `docs.`, plus `npm.madfam.io`, `status.madfam.io` | Sovereign PaaS. Go Switchyard API + Next.js UIs (Switchyard UI, Dispatch admin, Roundhouse, Status). Build, deploy, domain provisioning, ArgoCD onboarding, NetworkPolicy generation, lifecycle events. AGPL-3.0 + `COMMERCIAL_LICENSE.md` (dual-licensed). |
| **Janua** | [`janua`](https://github.com/madfam-org/janua) | `auth.madfam.io`, `janua.dev`, `docs.janua.dev` | OIDC + RS256 JWT identity. Every other service defers to it — no custom auth anywhere (§3.1). Single-issuer per deployment. |
| **solarpunk-foundry** | [`solarpunk-foundry`](https://github.com/madfam-org/solarpunk-foundry) | — | This repo. Public ecosystem contract hub, `@madfam/*` packages, port registry, dogfooding scaffolds. Sanitized 2026-04-17; the `infrastructure/` tree was scrubbed 2026-07-25 (removal ledger in-tree) — identifier **rotation** remains an owed operator action because git history is not rewritten. |

### 🌿 Roots — sensing / input

| Platform | Repo | Domains | Role |
|---|---|---|---|
| **Fortuna** 🔒 | `fortuna` | `fortuna.tube`, `api.fortuna.tube` | Problem intelligence — discovers and validates market gaps from multilingual signals. Absorbed the archived `social-sentiment-monitor` (Perception Index + anomaly detector) per RFC 0016 on 2026-05-03. Consumes inference through Selva (§3.2). |
| **ForgeSight** 🔒 | `forgesight` | `forgesight.quest`, `app.`, `api.`, `admin.` | Manufacturing pricing intelligence; pricing/vendor feed into Cotiza. LICENSE file is AGPL-3.0 plus a separate `DATA_LICENSE` (checked 2026-07-25) — note `docs/LICENSING_STRATEGY.md` still lists it as Proprietary, which is wrong. |
| **BlueprintTube** 🔒 | `blueprint-harvester` | `blueprint.tube`, `api.`, `app.`, `admin.` (`app.`/`admin.` recorded live 2026-07-09) | 3D-model indexer and printability analyzer. |
| **BloomScroll** | [`bloom-scroll`](https://github.com/madfam-org/bloom-scroll) | `almanac.solar` | Slow-web content aggregator. A 2026-07-16 internal remediation found its OWID connector entirely broken and only 5 of 6 content types real after fixes — routes live is not the same as content healthy. |
| **madfam-crawler** 🔒 | `madfam-crawler` | — | Scraping-as-a-service (Crawl4AI + ScrapegraphAI). Feeds Tezca's DOF/RMF fiscal monitoring and others. |

### 🪵 Stem — core standards

| Platform | Repo | Role |
|---|---|---|
| **geom-core** | [`geom-core`](https://github.com/madfam-org/geom-core) | Geometry-analysis core exposed to WASM + Python. Backs Sim4D and Yantra4D. LICENSE is Apache-2.0; the 2026-07-04 audit notes the README badge says MIT — an unresolved contradiction. |
| **AVALA** 🔒 | `avala` | Learning verification (Mexican EC/CONOCER + DC-3). **Repo flipped private 2026-07-16.** The 2026-07-09 platform audit records catalog surfaces with published counts of zero, validation-gated by policy. |
| **routecraft** 🔒 | `routecraft` | Trip-engine SaaS. Today's payment-event emitter (§3.3); the ratified target moves emission to Dhanam. |

### 🍎 Fruit — user platforms

| Platform | Repo | Domains | Role |
|---|---|---|---|
| **Sim4D** | [`sim4d`](https://github.com/madfam-org/sim4d) | none (no service domain) | **ARCHIVED (by 2026-08-07).** Web-first parametric CAD, B-Rep / NURBS via OCCT.wasm; renamed from BrepFlow 2026-04-17. MPL-2.0. Parametric design consolidated into Yantra4D. |
| **Forj** 🔒 | `forj` | `forj.design` | Decentralized fabrication storefronts; 3D-first scroller, NFT-capable minting. |
| **Cotiza Studio** | [`digifab-quoting`](https://github.com/madfam-org/digifab-quoting) | `cotiza.studio`, `api.cotiza.studio` | Quoting engine. Emits billing events into Dhanam. Proprietary LICENSE. |
| **Dhanam** 🔒 | `dhanam` | `dhan.am`, `app.`, `api.`, `admin.` | Budget + wealth tracking + the **ecosystem billing ledger**. Receiver for signed MADFAM payment events. **Repo flipped private between 2026-07-16 and 2026-07-25.** An AGPLv3 open core was published as `dhanam-core` (public, created 2026-07-20). |
| **Coforma Studio** | [`coforma-studio`](https://github.com/madfam-org/coforma-studio) | `coforma.studio` | Customer advisory boards as a growth engine. Proprietary LICENSE. |
| **Karafiel** 🔒 | `karafiel` | `karafiel.mx`, `app.`, `api.`, `admin.` | Operational compliance — CFDI, NOM-151, e.firma, SAT-adjacent. Single authority for CFDI/SAT/tax filings. Absorbed the archived `legal-ops` contract/document generation as `legalgen`. Consumes Tezca + Dhanam; never duplicates either. |
| **Tezca** | [`tezca`](https://github.com/madfam-org/tezca) | `tezca.mx`, `api.tezca.mx`, `admin.tezca.mx` | Mexican law oracle — law, changelog, compliance rules. Informational; feeds Karafiel. `experiments/meta-harness/` hosts the meta-orchestration spike. |
| **Yantra4D** | [`yantra4d`](https://github.com/madfam-org/yantra4d) | `yantra4d.com`, `app.`, `api.`, `admin.` | Parametric design platform plus its commons (§1.1). |
| **Pravara MES** | [`pravara-mes`](https://github.com/madfam-org/pravara-mes) | `mes.madfam.io`, `mes-api.madfam.io` | Manufacturing execution system. Note: the repo's own `enclii.yaml` declares a different hostname set than the live routes — a known repo/map divergence. |
| **Rondelio** 🔒 | `rondelio` | `rondel.io`, `www.`, `api.`, `play.`, `studio.`, `admin.` (operator-gated), `sim.` — all re-probed 2026-07-09 | Tabletop / TCG game-intelligence cloud. `api.rondel.io` is `rondelio-gateway` on port 7000; earlier docs saying `rondelio-api:4300` were corrected on 2026-07-09. |
| **Voxa** | `voxa` | `voxa.madfam.io` — **live (probed 200, 2026-08-24)** | AAC platform, Apache-2.0. Controlled commercial launch; the hostname earlier editions carried as documented-but-unverified is settled. |
| **Fashion Cabinet** 🔒 | `fashion-cabinet` | `fc.madfam.io` — **live** (re-probed 2026-08-24) | Parametric fashion commons — made-to-measure, seam-verified garment patterns; soft-goods sibling of Yantra4D. Port block 6200-6299. AGPL-3.0. Private during incubation. |
| **Kalya** 🔒 | `kalya` | `kalya.app`, `kalya.madfam.io` — **live** (probed 2026-08-24) | Booking/scheduling engine. Private during incubation. |
| **Acervo** 🔒 | `acervo` | `acervo.madfam.io` — **live** (probed 2026-08-24) | Records engine — immutable versions, derived reports, egress-first. Private during incubation. |
| **Galvana** | — *(no repo)* | — | Roadmap only. Electrochemistry simulation. The simulator core lives in `electrochem-sim`, recorded **stale since 2025-11**. |

### 🤝 Glue — cross-platform

| Platform | Repo | Domains | Role |
|---|---|---|---|
| **PhyndCRM** | [`phynd-crm`](https://github.com/madfam-org/phynd-crm) | **`phynd.app` is registered and live** (probed 2026-08-24); `crm.madfam.io` also still answers. | Client-facing deliverables portal — one pane of glass per engagement, federating other MADFAM platforms without duplicating their data. Hosts `POST /api/webhooks/routecraft` and `/api/v1/probe/{leads,attribution}`. |
| **Nauta** 🔒 | `nauta` | `cto.madfam.io` — **live** (probed 2026-08-24); client workspaces auth-gated | Fractional-CTO operating system — internal cockpit + white-labeled client workspaces; the delivery layer through which client engagements exercise the rest of the ecosystem. |
| **Selva** | [`selva-office`](https://github.com/madfam-org/selva-office) | `selva.town` + `api.`, `app.`, `admin.`, `ws.`, `gw.`, `www.` — **cutover DONE, verified 2026-07-01**. Plus `inference.selva.town` (§3.2). | AI workforce / office simulator, agent orchestration, HITL-confidence ledger. **The GitHub repo is still named `selva-office`**; the rename to `selva` is pending per the registry (2026-07-04). The registry cites `REBRAND_CUTOVER_RUNBOOK.md` for that rename — **that file no longer exists in the selva-office checkout** (checked 2026-07-25), so the cited pointer is dead. |

### 1.1 Yantra4D Commons (parametric-design library)

**36 active public repos + 2 archived**, per `repo-registry.md` (re-verified 2026-08-24):
`cq-hyperobject-test`, `custom-msh`, `din-rail-clip`, `extrusion-hyperobject`,
`faircap-filter`, `fasteners`, `framing-hyperobject`, `gear-reducer`, `gears`,
`glia-diagnostic`, `gridfinity`, `hinge-hyperobject`, `implicit-lattice-hyperobject`,
`julia-vase`, `keyv2`, `locking-mechanism-hyperobject`, `maze`, `microscope-slide-holder`,
`microscope-slide-hyperobject`, `motor-mount`, `multiboard`, `parametric-connector`,
`polydice`, `portacosas`, `prosthetic-socket`, `relief`, `rubiks-hyperobject`, `rugged-box`,
`scara-robotics`, `slide-holder`, `soft-jaw`, `spiral-planter`, `stemfie`, `superformula`,
`torus-knot`, `ultimate-box`, `voronoi`, `yapp-box`. Private within this class: `tablaco`.

Corrections against earlier editions of this document, which listed 39 including
`gridfinity_extended_openscad`:

- **`gridfinity_extended_openscad` is no longer a standalone MADFAM repo.** It survives as the
  submodule consumed by `gridfinity` (registry, 2026-07-04). The live 2026-07-25 check shows a
  repo of that name in the org, but it is a **fork**, which is why the registry's search-API
  method did not see it.
- `rubiks-hyperobject` is new since the 2026-07-04 edition.
- `yapp-box` and `slide-holder` are **archived**. `cq-hyperobject-test` — archived at the
  2026-07-25 check — was **un-archived and is active again** (2026-08-24 enumeration; it is
  the CadQuery B-Rep test project for Yantra4D). The registry now marks all of this
  (rebuilt 2026-08-24). Private within the class, the `tablaco` family grew: `tablaco-v2`
  (CadQuery design trunk) and `tablaco-tabletop` (digital boardgame cartridge).
- License review is owed on several of these (2026-07-04 audit): `ultimate-box`, `multiboard`
  and `keyv2` relabel non-commercial/GPL upstreams as CERN-OHL-W; `stemfie` and `julia-vase`
  carry internal license contradictions; `custom-msh`'s LICENSE file is a saved HTML 404 page.

### 1.2 Other repos

**Public:** `madfam-site` (`madfam.io`, `cms.madfam.io`) · `primavera3d`
(`primavera3d.pro`) · `ceq` (`ceq.lol`) · `nuit-one` (`nuit.one`) · `subtext`
(`subtext.live`) · `accionables-madlab` (`madlab.quest`) · `server-auction-tracker`
(`sniper.madfam.io`, binary `foundry-scout`) · `selva-sandbox` · `kinship` · `panopticon-mx`
(→ Tezca integration path) · `electrochem-sim` (**stale since 2025-11**) · `dhanam-core`
(AGPLv3 open core, created 2026-07-20) · `coupler` (MADFAM Agent Tool Plane — delegated SaaS
tools, MCP, sandbox, triggers; AGPL-3.0; Phase 2) · `eido` (**live** — see the corrections
below; the "PRD-only, no working code" registry note is long superseded) · `dhanam-core`
(AGPLv3 open core — dormant since creation, its only CI run failed) · `meridian` (see below).

**Private 🔒:** `factlas` (`factl.as`, `factlas.com`) · `gh-backups` ·
`proton-bridge-pipeline` · `symbiosis-hcm` (Mexican payroll, Shapley compensation, ONA,
wellbeing; human-facing surfaces live since 2026-08-04) · `tulana` (internal pricing
intelligence; deployed, Janua-gated) · `converge-dash` (executive metrics; rollout blocked) ·
the games cluster: `turnbased-engine` + `stratum-tcg` + `tablaco`/`tablaco-v2`/
`tablaco-tabletop` + `arcanic-rosetta` + `madfam-baraja` · `zavlo` (→ Karafiel integration
path) · `periplo` (**DNS still NXDOMAIN — not live**, re-confirmed 2026-08-24) ·
`hyperobjects-spec` (conformance keystone for Yantra4D + Fashion Cabinet) ·
`migration-platform` (website migration; Wix→Enclii first adapter) · `marca` (short-links /
QR — onboarding in flight, not live) · `angelia` (messaging substrate; no product yet) ·
`avala-content` · `client-site-starter` + `enclii-onboard-kit` (client-delivery tooling).
A small number of **client-engagement repos** holding client-owned IP are counted in §1.3's
totals but excluded from this map by policy.

**Outside `madfam-org`:** `leyes-como-codigo-mx` (in the `legal-ops` org, public) — Mexican
law as code.

**Deployment-status corrections (probed 2026-08-24):**

- **`meridian`** (public, AGPL-3.0) — global migration law and logistics: pathway rules
  engine, ICAO 9303 travel-document validation, cross-border presence/tax day counting,
  document legalisation routing. **Partially live**: landing, portal and admin serve real
  content; **the API answers 502**. Earlier editions said "not deployed, no DNS" — no longer
  true. Still decisive: **no pathway has been counsel-reviewed**, which blocks all
  advice-class output by design. Hostnames are flat, not nested, because Cloudflare
  universal SSL covers `*.madfam.io` but not `*.*.madfam.io` — Pravara MES hit exactly this.
- **`eido`** — **live**: `eido.cam` 200 + `api.eido.cam/health` 200 (probed 2026-08-24).
  The same-day-contradiction earlier editions carried is settled in favor of the go-live
  records.

**Archived / removed** (state as history, not as pipeline):

| Repo | State |
|---|---|
| `social-sentiment-monitor` | **ARCHIVED 2026-05-03** — absorbed into Fortuna per RFC 0016. Not a pending integration. |
| `aureo-labs` | **ARCHIVED 2026-04-08.** Legacy brand repo; removed from the labspace checkout and active CI scope. |
| `sim4d` | **ARCHIVED by 2026-08-07.** Parametric CAD; consolidated into Yantra4D. |
| `legal-ops` (repo, private) | **ARCHIVED** — value migrated into karafiel `legalgen`. Distinct from the `legal-ops` GitHub org. |
| `ecosystem-banner` (repo, private) | **ARCHIVED** — canonical source is `solarpunk-foundry/packages/ecosystem-banner`. |
| `penny` | **ARCHIVED** by 2026-07-25; `penny.onl` now 301-redirects to `selva.town` (probed 2026-08-24). |
| `slide-holder`, `yapp-box` | **ARCHIVED** Yantra4D Commons projects. |
| `Auto-Claude`, `claudecodeui` | Both exist **as forks** (the old registry's "deleted" claim came from a fork-blind search API — the registry was rebuilt 2026-08-24 and now says so). `claudecodeui` is archived; its one unique piece of value, the `DiffViewer` component, lives on in `selva-office`. Neither is an active MADFAM project. |

### 1.3 Repo counts — live enumeration, 2026-08-24

**Live GitHub enumeration, run 2026-08-24:** **115 repos**, 3 of them forks. Excluding
forks: **112 = 43 private + 69 public**, with **8 archived** non-fork (plus the archived
`claudecodeui` fork). Against the previous enumeration (2026-07-25: 96 = 27 + 69):
**+16 non-fork repos, all private, all created 2026-08-04 → 2026-08-22** — the
vCTO/client-delivery cluster, the new platforms (Kalya, Acervo, Marca, Angelia, Fashion
Cabinet, hyperobjects-spec, migration-platform, Nauta), and the games cluster. Inside the
unchanged public 69: `sim4d` archived, `cq-hyperobject-test` un-archived.

The private registry was **rebuilt from this same enumeration on 2026-08-24**, so registry
and live org now agree — the "no registry row" and fork-"deletion" discrepancies earlier
editions tracked are resolved.

This public doc keeps counts and public-safe roles only. The authoritative per-repo registry
is `internal-devops/ecosystem/repo-registry.md` (Last Verified 2026-08-24).

---

## 2. Live routes

Every production route: Internet → Cloudflare Edge → cloudflared pods → K8s Service:80 →
container port. The authoritative mapping is `internal-devops/ecosystem/domain-map.md`
(Last Verified **2026-08-24** via live HTTP probes of every routed domain; the tunnel
ingress API was last re-read 2026-07-01). A sanitized status board reports current state at
[`status.madfam.io`](https://status.madfam.io) — that, not this document, is where live
state comes from.

**Standing route facts, verified 2026-08-24 unless noted:**

- **The Selva cutover to `*.selva.town` executed and is done.** `agents-*.madfam.io` is
  **retired** — no tunnel ingress rules, returns 502. Do not resurrect it. `selva.madfam.io`
  must never be used. *(An earlier edition of this document told readers `agents-*` "remain
  authoritative". That was wrong and is the correction most likely to matter.)*
- **`auth.selva.town` must never be routed.** Janua is single-issuer per deployment (issuer
  from `JANUA_CUSTOM_DOMAIN`, not the request `Host`), so serving Janua there would emit
  `issuer=auth.madfam.io` and break OIDC validation. Selva SSO uses `auth.madfam.io`
  (selva-office#195).
- **`metrics.enclii.dev` is a retired alias** with no DNS or tunnel route (525, falls through
  to a registrar parking CNAME). Canonical is `prometheus.enclii.dev`.
- **`phynd.app` is registered and live** (probed 200, 2026-08-24) — earlier editions'
  "not registered" is settled. `crm.madfam.io` also still answers.
- **`innovacionesmadfam.dev` was never owned** (owner confirmation 2026-07-09). Do not
  reference it anywhere, including any `security@` address on it.
- **`madfam.academy` and `madfam.info` are expired.**
- **`periplo.madfam.io` is NXDOMAIN** (re-confirmed 2026-08-24) — not live, though the
  platform's Argo application exists; the route was never provisioned.
- **`meridian` is partially live** (probed 2026-08-24): landing/app/admin serve;
  `meridian-api` answers 502.
- **`eido.cam` is live** (probed 2026-08-24: apex 200, `api.eido.cam/health` 200) — the
  contradiction earlier editions carried is settled; the go-live records were right.
- **Found down in the 2026-08-24 probe:** `api.fortuna.tube` (502 at `/` and `/health`) and
  the madfam-site CMS host (404) — recorded as gaps in the private map.
- **The route table is still not a complete inventory of declared hostnames.**
  `inference.selva.town` gained its row in the 2026-08-24 refresh, but hostnames declared in
  repos' `enclii.yaml` (e.g. `dash.madfam.io`, the `tulana` set, the `janua.dev` app hosts)
  remain unmapped. Absence from the map is a gap in the map, not proof a route does not exist.

---

## 3. Ecosystem contracts

The full statement of each convention lives in [`README.md`](README.md) §IV; this section is
the per-platform detail.

### 3.1 Identity → Janua

Janua is the only auth. Every authenticated service verifies **RS256** JWTs against
`https://auth.madfam.io/.well-known/jwks.json`. **HS256 is fail-closed** since the 2026-04-23
audit (findings H3/H4, which found symmetric-secret verification in live service code). No
service implements its own login, password reset, or session store. Claims: `sub`, `email`,
`roles`, `org_id`, and `rfc` for fiscal services.

*Conformance is not uniform.* The 2026-07-16 audit rates the janua-SSO-matrix edge YELLOW.
The matrix that recorded per-surface enforcement is noted in `internal-devops` as a session
artifact never committed to the repo, so per-surface status is **unestablished** — committing
it and citing it by path would settle it.

### 3.2 Inference → Selva `/v1`

**Endpoint: `https://inference.selva.town`.** On 2026-07-07 (RFC 0034 P2) the
OpenAI-compatible `/v1` proxy was extracted out of `nexus-api` into its own deployable,
`selva-inference-gateway`, and the `nexus-api` `/v1` mount was removed (selva-office#217).
Live-verified that day: gateway `/health` → 200, unauthenticated `/v1/chat/completions` → 401,
`api.selva.town/v1` → 404. Three real callers were repointed (dhanam, forj, tezca); the other
services that appeared to call Selva were calling `/api/v1` app routes and were correctly left
alone.

Provider credentials (Anthropic, OpenAI, DeepInfra, Together, Fireworks, SiliconFlow,
Moonshot) are intended to live only on Selva, routed per task type. **Known deviation:** the
2026-07-09 phynd-crm audit found its reddit-bot fails open to `api.openai.com` when its base
URL is unset, with a local `OPENAI_API_KEY` — recorded as an ecosystem violation. Deviations
are tracked privately.

### 3.3 Revenue attribution loop

```
PhyndCRM lead → Selva drafter (LLM) → email (Resend) →
  Stripe / Conekta / Mercado Pago webhook → payments module →
    payment.succeeded emitted, signed, in parallel to:
      ├─ Dhanam   POST /v1/billing/madfam-events   (BillingEvent row)
      └─ PhyndCRM POST /api/webhooks/routecraft    (conversions row, credits source agent)
```

Signature: `x-madfam-signature: t=<unix-seconds>,v1=<hex-hmac-sha256>` over
`"${ts}.${raw-body}"`, per-target secret, 5-minute replay window. Both receivers idempotent by
the emitter's `event_id`.

**As built, the emitter is `routecraft`. The ratified target is different:**
`internal-devops/decisions/2026-05-04-payment-emission-soc.md` — *Dhanam is the sole payment
emitter; routecraft becomes a payment consumer and attribution emitter.* That decision was
reaffirmed verbatim by the 2026-07-08 execution plan, which also records that none of the
migration had landed.

**Not flowing as of 2026-07-08** (verified against routecraft at HEAD): only the Conekta
webhook emits — the Stripe path emits nothing; the `attribution` sub-object is never
populated; there is no `payment.refunded`; and the emitter target secrets are absent from
production manifests. The fan-out is a silent no-op. The 2026-07-16 audit scores this edge RED:
"first sale leaves zero trace."

A **revenue-loop probe** is specified to synthesize a hot lead hourly and exercise the full
chain, failing loudly on any broken stage. Probe endpoints: `POST /api/v1/probe/leads` and
`GET /api/v1/probe/attribution` (PhyndCRM); `POST /v1/billing/madfam-events` and
`GET /v1/probe/billing-events/:eventId` (Dhanam); `POST /api/v1/probe/draft` and
`POST /api/v1/probe/email/send` (Selva). **As of 2026-07-16 the probe was off and alert
delivery had been dead for ≥31 days.** Re-enabling it is a tracked operator blocker.

**Dated clarification (2026-08-24):** the first completed live charge (2026-08-02) did not
use this routecraft fan-out — it ran Dhanam's own PSP webhook path (Stripe MX → Dhanam →
`billing_events` + entitlement → Karafiel CFDI), which is the direction the ratified target
points. No newer verification of the fan-out itself exists in this document's sources.

`@madfam/webhook-attribution` in this repo packages the signing contract so it is not
reimplemented per repo. As of 2026-07-08, **no repo had adopted it** — Dhanam and routecraft
each carry their own, byte-identical, implementation.

### 3.4 Data boundaries

| Dataset | Owner | Everyone else |
|---|---|---|
| Identity / sessions / roles | Janua | federates, never duplicates |
| Bank transactions, wealth, **billing ledger** | Dhanam | reads via API; never stores |
| Legal text, changelog, compliance rules | Tezca | queries `/api/v1/laws/...`; never forks |
| CFDI / SAT / tax filings | Karafiel | single authority; consumes Dhanam + Tezca |
| Fabrication node capacity + pricing | Forj | consumes ForgeSight |
| Manufacturing execution telemetry | Pravara MES | feeds PhyndCRM federation |
| 3D geometry kernel | geom-core | used by Sim4D + Yantra4D |

### 3.5 CORS

Explicit allowlist per service; wildcards banned (audit 2026-04-23, H2/H5/H6).

### 3.6 Deployment

Enclii is the mandatory control plane. Deploy flow, self-heal semantics, zero-touch
onboarding contract and the break-glass recording requirement are stated in
[`ECOSYSTEM.md`](ECOSYSTEM.md) §3.7–§3.8 and [`README.md`](README.md) §IV.6.

---

## 4. Operational pointers (private detail)

All of the following live **only** in the private `internal-devops` repo. Pointers are given
at **directory** level rather than by filename wherever the specific file rotates, because
per-file pointers in this document have gone stale before.

| Topic | Internal-devops location |
|---|---|
| Node inventory, capacity, topology, cost analysis | `infrastructure/` |
| Live cluster manifests (ArgoCD apps/appsets, K8s production, Helm values) | `infra/` |
| SSH, K3s, ArgoCD, Grafana access procedures | `access/` |
| Credential and OAuth patterns *(no secret values committed)* | `credentials/` |
| Incident response, disaster recovery, secret rotation, node replacement, per-session runbooks | `runbooks/` |
| Incident records and evidence snapshots | `incidents/` |
| Dated execution plans, blocker ledgers, definitions of done | `roadmaps/` |
| Security and platform audits — newest first | `audits/` |
| Domain map (authoritative) | `ecosystem/domain-map.md` |
| Repo registry (authoritative) | `ecosystem/repo-registry.md` |
| Deployment conventions | `ecosystem/deployment-conventions.md` |
| Decision records — owner decisions, custody model, payment-emission SoC | `decisions/` |
| Numbered design proposals | `rfcs/` |
| Cross-cutting policy — repo-boundary contract, brand, finance | `docs/` |
| Operator-only production gates (TUI + machine-readable) | `operator-console/` |
| Hardware evaluation and procurement | `hardware/` |

*Earlier editions of this table named specific "most recent audit" and "latest session wrap"
files. Those pointers were months out of date by the time anyone read them; directory
pointers are drift-proof.*

---

## 5. Open operational gates — pointer only

This section previously enumerated five gates and claimed they were "the only open items
blocking full ecosystem stability", as of 2026-04-17. **That claim was false at any date after
it was written, and gate tracking is Lane A material in the first place.** It has been
replaced with a pointer.

**Current open gates, blockers and their owners are tracked privately** in
`internal-devops/roadmaps/` (dated execution plans and blocker ledgers) and
`internal-devops/operator-console/` (the operator-gate catalog, queryable machine-readably).

For public context on where the commercial loop stands: the last whole-funnel audit is the
**2026-07-16 launch-readiness audit** (verdict NO-GO, six of eight hops RED, sixteen
enumerated blockers) — **but its central fact was overtaken on 2026-08-02, when the funnel
completed end to end for the first time**: a live charge with a real SAT-stamped CFDI,
`billing_events` off zero, and the entitlement behind it (internal evidence record,
2026-08-03). See [`README.md`](README.md) §VI for the full dated picture.

Three specific corrections to the gates this document used to list, recorded so the history is
not lost:

- **Selva rebrand cutover** — the *domain* cutover executed and is complete (verified
  2026-07-01). The GitHub *repo* rename `selva-office` → `selva` is still pending (registry,
  2026-07-04), and the runbook the registry cites for it no longer exists in the checkout.
  The branch statistics, Vault-path migration and namespace-swap sequencing that used to
  appear here are private cutover-runbook content and do not belong in a public repo.
- **"Karafiel `SELVA_*` → `SELVA_*` secret rename"** — this row was meaningless as written:
  both sides of the rename were identical, an artifact of a blanket rebrand find-and-replace
  that also mangled the referenced filename. Removed. If a rename gate is still real, it is
  Lane A.
- **"HashiCorp Vault deploy — manifests staged, never run"** — that was the 2026-04-25 state.
  Vault is deployed and in use; `internal-devops` carries custody, rotation and re-bootstrap
  runbooks, and secrets flow Vault → External Secrets Operator → K8s Secret (see
  [`ECOSYSTEM.md`](ECOSYSTEM.md) §4). Secret-store deployment state is Lane A regardless.

---

## 6. Conventions that apply ecosystem-wide

- **Feature branches only** — never commit to `main` directly.
- **Conventional commits** — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `perf:`.
- **No custom auth.** Janua RS256 via JWKS (§3.1).
- **No custom deployment.** Every service deploys through Enclii; ArgoCD reconciles. Nothing
  pushes to the cluster, and self-heal reverts live edits.
- **No cross-repo data duplication.** Query the owner (§3.4).
- **Explicit CORS allowlists.** Wildcards banned.
- **Port allocation is aspirational.** The 4xxx/5xxx block scheme in
  [`docs/PORT_ALLOCATION.md`](docs/PORT_ALLOCATION.md) is followed by almost nothing. Read
  that document before trusting any port number in any doc, then check the owning repo's
  `enclii.yaml`. The pattern the scheme *intends* is a 100-port block per service with API at
  `+00`, Web at `+01`, Admin at `+02`.
- **Zero-touch onboarding.** New repos self-provision via `enclii onboard`; deploy config
  lives in the app repo. The `enclii`, `janua` and `dhanam` repos must not need editing to
  onboard a service.
- **Secrets never in code.** Vault + ExternalSecrets; human handoff via `enclii secrets
  intake`. No literal secrets in any repo, and no secret-store paths in public repos.
- **Every date in docs is ISO-8601** (`YYYY-MM-DD`), and every status claim carries the date
  it was verified plus its source.

---

## 7. Where to start (role-keyed)

- **New engineer, running things locally:** [`README.md`](README.md) §0 → §VII →
  [`docs/DOGFOODING_GUIDE.md`](docs/DOGFOODING_GUIDE.md) → `enclii local up`.
- **Engineer deploying a new repo:** the onboarding contract in
  [`ECOSYSTEM.md`](ECOSYSTEM.md) §3.7, then the Enclii repo's onboarding guide.
- **LLM agent working in this repo:** [`AGENTS.md`](AGENTS.md) (canonical),
  [`llms.txt`](llms.txt) for the compact index.
- **Operator needing cluster or SSH access:** [`docs/SSH_ACCESS.md`](docs/SSH_ACCESS.md)
  (public-safe pointer) → the private `internal-devops/access/`.
- **Operator needing node, capacity or cost detail:** `internal-devops/infrastructure/` (private).
- **Anyone auditing the ecosystem contract:** this doc + [`README.md`](README.md) §IV +
  `internal-devops/ecosystem/domain-map.md` + `internal-devops/ecosystem/repo-registry.md`.
- **Anyone planning strategic work:** `internal-devops/roadmaps/` and
  `internal-devops/ecosystem/` (private).

---

*This document lives at `solarpunk-foundry/MADFAM.md`. An earlier edition claimed to be "the
only doc at `labspace/` root by design" — it is not at the labspace root, and that root holds
several other loose markdown files (checked 2026-07-25). The claim is removed rather than
corrected, because it described a layout no public reader could verify anyway.*

If you think something belongs here, check first whether it is strategic, operational or
sensitive — in which case it belongs in the private `internal-devops` repo — or product-owned,
in which case it belongs in that platform's own repo.
