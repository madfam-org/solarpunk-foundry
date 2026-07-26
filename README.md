# 🌞 MADFAM: The Solarpunk Foundry

### *From Bits to Atoms. High tech, deep roots.*

> **Last updated:** 2026-07-25
> **Verification anchors** — every status claim below inherits one of these dates, and each section says which:
> - **Repo names, visibility, and roles:** `internal-devops/ecosystem/repo-registry.md`, *Last Verified 2026-07-04*. Live org counts re-checked 2026-07-25 (§II.7).
> - **Production routes and domains:** `internal-devops/ecosystem/domain-map.md`, *Last Verified 2026-07-01* (live probes + Cloudflare tunnel ingress API). A few rows carry later dates and are marked in place.
> - **Funnel / commercial readiness:** the 2026-07-16 internal launch-readiness audit (§VI).
> - **Cross-repo conventions:** dates stated per convention in §IV.
>
> Nothing in this document was verified by probing production. Where a claim is *documented but unverified*, or *aspirational*, it says so.

- **Organization:** Innovaciones MADFAM S.A.S. de C.V. (Cuernavaca, Morelos, MX)
- **Canonical domain:** [madfam.io](https://madfam.io)
- **GitHub:** [`madfam-org`](https://github.com/madfam-org)
- **Status board:** [status.madfam.io](https://status.madfam.io) — the only surface that reports live up/down state. This repo does not.

---

## 0. What this repo is, and is not

### This repo IS — Lane B, the public ecosystem contract hub

`solarpunk-foundry` is the designated **public ecosystem contract repo** for MADFAM
(`internal-devops/docs/repo-boundary-contract.md`, last updated 2026-06-14). It holds:

- the **canonical ecosystem map** at a platform-public level (§II);
- the **cross-repo conventions** a platform implements, or else does not participate (§IV);
- the **`@madfam/*` shared packages** (`packages/`, §VIII);
- **local dogfooding scaffolds** (`ops/`, §VII);
- **sanitized architecture narrative** and redacted pointers into the private repo.

### This repo is NOT the operational source of truth

The operational source of truth is the **private `internal-devops` repo**. It is the only
allowed home for node identity, IPs, hardware and capacity figures, cost ledgers, secret
paths, incident internals, break-glass procedures, and the authoritative domain map and
repo registry. That repo exists because a 2026-03-13 audit found sensitive operational
data spread across 18 public repositories.

Concretely: this repo can tell you *that* ingress is a single Cloudflare Tunnel with zero
exposed node ports. It cannot tell you the tunnel's name or ID, the node hostnames, or what
any of it costs — and it must not.

### How the lanes divide

| Lane | Repo | Holds |
|---|---|---|
| **A — private operational source** | `internal-devops` | node identity, IPs, hardware/capacity, costs, secret paths and retrieval, incident evidence, break-glass runbooks, authoritative domain map + repo registry |
| **B — public ecosystem contract** | `solarpunk-foundry` (this repo) | ecosystem map at platform-public level, architecture narrative, shared contract surfaces, sanitized references, redacted pointers into Lane A |
| **C — public service repos** | e.g. `enclii` | service-specific implementation guidance, public-safe runbook structure, local/API workflows |
| **D — private service repos** | e.g. `tulana` | internal business logic, pricing evidence, customer-adjacent detail |

Policy: `internal-devops/docs/repo-boundary-contract.md`. Public-repo enforcement checklist:
[`docs/PUBLIC_REPO_BOUNDARY.md`](docs/PUBLIC_REPO_BOUNDARY.md).

### What a newcomer should read, in order

1. **§0–§II here** — what this repo is, and the platform map.
2. **§IV here** — the five cross-repo conventions. If you are building a service, these are
   the ones that will reject your work if you break them.
3. [`ECOSYSTEM.md`](ECOSYSTEM.md) — the standalone, agent-oriented ecosystem map + Enclii CLI reference.
4. [`docs/architecture/SYMBIOSIS.md`](docs/architecture/SYMBIOSIS.md) — the Substrate · Trellis · Membrane platform-relationship contract.
5. [`docs/PORT_ALLOCATION.md`](docs/PORT_ALLOCATION.md) — the port scheme, and an honest account of how little of it is followed. Read this before assuming any port number in any doc.
6. [`MADFAM.md`](MADFAM.md) — the fuller per-platform master reference.
7. `packages/*/README.md` — the concrete shared surfaces.

Agents: start at [`AGENTS.md`](AGENTS.md), which is canonical for LLM agents in this repo.
[`CLAUDE.md`](CLAUDE.md) is a compatibility redirect only.

---

## 🌍 I. Vision

> **"Sovereignty is not just about owning your server; it's about owning your supply chain, your money, and your mind."**

MADFAM is a **vertically-integrated venture studio** operating at the seam between the
digital (software) and the physical (fabrication, finance, and compliance), with a
**LATAM-first, Mexico-rooted** posture.

### The problem — the "rented" existence

A founder is a tenant in their own business: renting design tools, cloud, audience, payment
rails, and compliance infrastructure. A change in API pricing, a platform ban, a SAT reform,
or a venture cycle can end a business.

### The MADFAM answer — the sovereign loop

A closed-loop ecosystem where each tool supports the others. Every layer can be swapped for
a competitor without toppling the rest — but because every layer is ours, the economics
compound inside the loop. The tools run our own operations first ("Primavera Mandate", §III)
and only then face outward.

*This section is positioning, not a status claim. For where the ecosystem actually stands, see §VI.*

---

## ⚙️ II. Platform map

> **Sources and dates.** Repo names, visibility and roles follow
> `internal-devops/ecosystem/repo-registry.md` (**Last Verified 2026-07-04**), plus `meridian`
> (public, created 2026-07-25, **not deployed**), which postdates that verification. Domains
> follow `internal-devops/ecosystem/domain-map.md` (**Last Verified 2026-07-01**, live probes +
> Cloudflare tunnel ingress API); rows with a later verification date say so inline.
>
> **Visibility.** 🔒 marks a repo that is **private** — its `github.com/madfam-org/...` link
> will 404 without org access. Visibility re-checked against the GitHub API on 2026-07-25.
>
> "Live" below means *the route answered at its last recorded probe on the date given* — not
> that it is answering now, and not that the product behind it is feature-complete.

### 🪨 Layer 1 — Soil (infrastructure)

| Platform | Repo | Role | Domains (last verified 2026-07-01) |
|---|---|---|---|
| **Enclii** | `enclii` | Sovereign PaaS — Switchyard API (Go), Switchyard UI, Dispatch admin, Roundhouse builders, Status pages. Build, deploy, domain provisioning, NetworkPolicy generation, lifecycle events. | `enclii.dev`, `api.`, `app.`, `admin.`, `status.`, `docs.`, plus `npm.madfam.io` and `status.madfam.io` |
| **Janua** | `janua` | Identity and SSO. OIDC + RS256 JWT via JWKS. Single-issuer per deployment (see §IV.1). | `auth.madfam.io`, `janua.dev`, `docs.janua.dev` |
| **solarpunk-foundry** | `solarpunk-foundry` | This repo. Ecosystem contract hub, `@madfam/*` packages, port registry, dogfooding scaffolds. Ships no application deployable. | — |

### 🌿 Layer 2 — Roots (sensing and input)

| Platform | Repo | Role | Domains |
|---|---|---|---|
| **Fortuna** 🔒 | `fortuna` | Problem intelligence / zeitgeist analysis — discovers and validates market gaps from multilingual signals. | `fortuna.tube`, `api.fortuna.tube` |
| **ForgeSight** 🔒 | `forgesight` | Manufacturing pricing intelligence; feeds Cotiza. | `forgesight.quest`, `app.`, `api.`, `admin.` |
| **BlueprintTube** 🔒 | `blueprint-harvester` | 3D-model indexer and printability analyzer. | `blueprint.tube`, `api.`, `app.`, `admin.` (`app.`/`admin.` recorded live 2026-07-09) |
| **BloomScroll** | `bloom-scroll` | "Slow web" content aggregator. | `almanac.solar` |
| **madfam-crawler** 🔒 | `madfam-crawler` | Internal scraping-as-a-service (Crawl4AI + ScrapegraphAI). Feeds Tezca's fiscal monitoring and others. | — |

### 🪵 Layer 3 — Stem (core standards and verification)

| Platform | Repo | Role | Domains |
|---|---|---|---|
| **geom-core** | `geom-core` | Geometry-analysis core exposed to WASM + Python. Backs Sim4D and Yantra4D. | — |
| **AVALA** 🔒 | `avala` | Learning-verification engine (Mexico EC/CONOCER + DC-3). **Repo flipped private on 2026-07-16.** | `avala.studio` (landing), `app.avala.studio`, `admin.avala.studio`, `api.avala.studio` — landing/app split repointed 2026-07-18; `admin.` recorded live since 2026-07 |
| **routecraft** 🔒 | `routecraft` | Trip-engine SaaS. Today's payment-event emitter (§IV.3), which the ratified target moves to Dhanam. | `routecraft.app` |

### 🍎 Layer 4 — Fruit (user platforms)

| Platform | Repo | Role | Domains |
|---|---|---|---|
| **Sim4D** | `sim4d` | Web-first parametric CAD, exact B-Rep / NURBS via OCCT.wasm. Renamed from BrepFlow 2026-04-17. | no service domain |
| **Forj** 🔒 | `forj` | Decentralized fabrication storefronts. | `forj.design` |
| **Cotiza Studio** | `digifab-quoting` | Quoting engine connecting design → factory. Product name is Cotiza; repo name is `digifab-quoting`. | `cotiza.studio`, `api.cotiza.studio` |
| **Dhanam** 🔒 | `dhanam` | Budgeting, wealth tracking, and the **ecosystem billing ledger**. Hosts `MadfamEventsController` at `POST /v1/billing/madfam-events`. **Repo flipped private between 2026-07-16 and 2026-07-25.** An AGPLv3 open core was published separately as `dhanam-core` (public, created 2026-07-20). | `dhan.am`, `app.dhan.am`, `api.dhan.am`, `admin.dhan.am` |
| **Coforma Studio** | `coforma-studio` | Customer advisory boards as a growth engine. | `coforma.studio` |
| **Karafiel** 🔒 | `karafiel` | Operational compliance — CFDI, NOM-151, e.firma, SAT-adjacent. Single authority for CFDI/SAT/tax filings. Absorbed the archived `legal-ops` document generation as `legalgen`. | `karafiel.mx`, `app.`, `api.`, `admin.` |
| **Tezca** | `tezca` | Mexican law oracle — authoritative source of law, changelog, and compliance rules. Informational; feeds Karafiel. | `tezca.mx`, `api.tezca.mx`, `admin.tezca.mx` |
| **Yantra4D** | `yantra4d` | Parametric-design platform plus its commons of OpenSCAD/CadQuery projects. | `yantra4d.com`, `app.`, `api.`, `admin.` |
| **Pravara MES** | `pravara-mes` | Manufacturing-execution system — fabrication-node routing and dispatch for physical jobs. | `mes.madfam.io`, `mes-api.madfam.io` |
| **Rondelio** 🔒 | `rondelio` | Tabletop / TCG game-intelligence cloud. | `rondel.io`, `www.`, `api.`, `play.`, plus `studio.`, `admin.` (operator-gated), `sim.` — all seven re-probed 2026-07-09 |
| **Voxa** | `voxa` | AAC (augmentative and alternative communication) platform, Apache-2.0. Registry records a controlled commercial launch at `voxa.madfam.io`; that hostname is **not in the verified route table** — treat as documented-but-unverified. | `voxa.madfam.io` *(unverified)* |
| **Galvana** | — *(no repo; `electrochem-sim` holds the simulator core, recorded stale since 2025-11)* | Roadmap only. Phygital electrochemistry simulation. | — |

### 🤝 Layer 5 — Glue (cross-platform federation)

| Platform | Repo | Role | Domains |
|---|---|---|---|
| **PhyndCRM** | `phynd-crm` | Client-facing deliverables portal — one pane of glass per engagement, federating data from other MADFAM platforms without duplicating it. Hosts `POST /api/webhooks/routecraft` and `/api/v1/probe/{leads,attribution}`. | `crm.madfam.io` is the live host. `phynd.app` is **not registered** — it must be bought before the tunnel and DNS can be repointed. |
| **Selva** | `selva-office` | AI workforce / office simulator; agent orchestration. Owns the ecosystem's LLM inference chokepoint (§IV.3). **The GitHub repo is still named `selva-office`; the rename to `selva` is pending (registry, 2026-07-04).** | `selva.town` + `api.`, `app.`, `admin.`, `ws.`, `gw.`, `www.` — the domain cutover **executed and is done** (verified 2026-07-01). Plus `inference.selva.town` for the inference gateway (§IV.3). |

> **Standing route warnings** (`domain-map.md`, verified 2026-07-01):
> - `agents-*.madfam.io` and `selva.madfam.io` are **retired** — no tunnel ingress rules, they return 502. Do not resurrect them.
> - `auth.selva.town` must **never** be routed. Janua is single-issuer per deployment (the issuer is derived from `JANUA_CUSTOM_DOMAIN`, not the request `Host`), so serving Janua there would emit `issuer=auth.madfam.io` and break OIDC validation. Selva SSO uses `auth.madfam.io` (selva-office#195).
> - `metrics.enclii.dev` is a **retired alias** with no DNS or tunnel route. The canonical endpoint is `prometheus.enclii.dev`.
> - `innovacionesmadfam.dev` was **never owned** (owner confirmation 2026-07-09). Do not reference it — including any `security@` address on it. The company domain is `madfam.io`.
> - `madfam.academy` and `madfam.info` are **expired**.

### Adjacent / supporting — public

`madfam-site` ([madfam.io](https://madfam.io), `cms.madfam.io`) · `primavera3d`
([primavera3d.pro](https://primavera3d.pro), our in-house factory portfolio) · `ceq`
([ceq.lol](https://ceq.lol), ComfyUI wrapper) · `nuit-one` ([nuit.one](https://nuit.one))
· `subtext` (`subtext.live`) · `accionables-madlab` ([madlab.quest](https://madlab.quest))
· `server-auction-tracker` ([sniper.madfam.io](https://sniper.madfam.io), Hetzner auction
intelligence) · `selva-sandbox` · `kinship` (E2E-encrypted community logistics) ·
`panopticon-mx` (Mexican state-structure atlas; Tezca integration path) ·
`electrochem-sim` (**recorded stale since 2025-11**) · `dhanam-core` (AGPLv3 open core
extracted from Dhanam, created 2026-07-20) · `coupler` (MADFAM Agent Tool Plane — delegated
SaaS tools, MCP, sandbox, triggers; AGPL-3.0; registry records Phase 2 and very active) ·
`eido` (registry records a PRD-only README with no working code yet; see the eido note below)
· `meridian` (see below).

### Adjacent / supporting — private 🔒

`factlas` (geospatial facts, `factl.as` / `factlas.com`) · `gh-backups` ·
`proton-bridge-pipeline` · `symbiosis-hcm` (Mexican payroll + Shapley compensation + ONA +
wellbeing) · `tulana` (internal pricing intelligence; registry records it deployed and
Janua-gated) · `converge-dash` (executive metrics layer; registry records rollout blocked)
· `turnbased-engine` + `stratum-tcg` · `zavlo` (financial-ops engine; Karafiel integration
path) · `periplo` (route-collector app; **DNS still NXDOMAIN — not live**, re-confirmed
2026-07-25) · `tablaco`.

### Not deployed — say so before linking

- **`meridian`** (public, created 2026-07-25, AGPL-3.0) — global migration law and logistics:
  pathway rules engine, ICAO 9303 travel-document validation, cross-border presence/tax day
  counting, document legalisation routing. **Not deployed.** No operator gates have run, and
  **no pathway has been counsel-reviewed**, which blocks all advice-class output by design.
  Its four hostnames (`meridian.madfam.io`, `meridian-app.`, `meridian-api.`,
  `meridian-admin.`) have no DNS and no tunnel route. Hostnames are deliberately flat, not
  nested, because Cloudflare universal SSL covers `*.madfam.io` but not `*.*.madfam.io`.
- **`eido`** — status is **contradicted inside the private repo and unresolved.** The domain
  map (updated 2026-07-10) records `eido.cam` as pre-deploy; two other internal documents
  dated the same day record it going live that day. Nothing dated later settles it. A dated
  HTTP probe of `eido.cam` would.
- **`periplo`** — repo private and populated (last pushed 2026-07-18); DNS NXDOMAIN as of 2026-07-25.

### Integration-path repos

Intended to fold into an existing platform rather than exist standalone: `zavlo` → Karafiel,
`panopticon-mx` → Tezca. **Completed:** `social-sentiment-monitor` → Fortuna
(**archived 2026-05-03**, absorbed per RFC 0016 — Perception Index and anomaly detector
ported to Fortuna, IG/YT/TT collectors moved to `madfam-crawler`). `penny` was listed as a
`selva-office` integration path; the repo is **archived** as of the 2026-07-25 live check.

### II.7 Repo counts — two dates, both stated

**Registry position (`repo-registry.md`, Last Verified 2026-07-04):** 22 private + 69 public
= **91 repos**, 4 marked archived. That total is internally inconsistent with the registry's
own body, which excludes `periplo` by a note in its own row.

**Live GitHub API enumeration run for this document on 2026-07-25:** 99 repos, of which 3 are
forks (`gridfinity_extended_openscad`, `claudecodeui`, `Auto-Claude`). Excluding forks:
**96 repos = 27 private + 69 public**, with **8 archived** (aureo-labs, ecosystem-banner,
legal-ops, social-sentiment-monitor, penny, yapp-box, cq-hyperobject-test, slide-holder).

The gap reconciles with no unexplained repos: five repos were created after 2026-07-04
(`atelier-noir` private 07-05, `periplo` private 07-10, `avala-content` private 07-16,
`dhanam-core` public 07-20, `meridian` public 07-25) and two flipped public→private
(`avala` on 07-16, `dhanam` by 07-25). 22+3+2 = 27 private; 69+2−2 = 69 public.

Two corrections to the registry that the 2026-07-25 live check surfaced:

- `Auto-Claude`, `claudecodeui` and `gridfinity_extended_openscad` are recorded as "deleted
  from GitHub". They still exist in the org **as forks** — the 2026-07-04 audit used the
  GitHub search API, which most likely excluded forks. `claudecodeui` is archived; the other
  two are not.
- The registry's "4 archived" is understated; the live count is 8 non-fork archived repos.
  `penny` is still listed in the registry's active public software table.

This public doc keeps **counts and public-safe roles only**. The authoritative per-repo
registry lives in `internal-devops/ecosystem/repo-registry.md`.

**Three repos exist in the org but have no registry row:** `atelier-noir` (private, 2026-07-05
— documented elsewhere in `internal-devops` but with no registry entry), `avala-content`
(private, 2026-07-16), `dhanam-core` (public, 2026-07-20).

---

## 🔄 III. The Primavera Mandate (dogfooding)

> **"We trust it because we survive on it."**

We build tools to run our own operations first, then face outward once they have survived
contact with us.

| Operational need | MADFAM tool |
|---|---|
| Finance and runway | **Dhanam** |
| Strategy validation | **Fortuna** |
| Factory quoting | **Cotiza** (Primavera3D quotes through it) |
| Hiring / verification | **AVALA** |
| Compliance | **Karafiel** + **Tezca** |
| Customer discovery | **Coforma Studio** + **PhyndCRM** |
| Revenue attribution | payment emitter → **Dhanam** ledger + **PhyndCRM** conversions (§IV.3) |

*This is the mandate, i.e. intent. It is not a claim that each row is currently exercised in
production; §VI records where the commercial loop actually stands.*

---

## 🔌 IV. Cross-repo conventions

These are the load-bearing contracts. A platform implements them the same way or it does not
participate. Each carries the date of the newest source that establishes it.

### 1. Identity — Janua OIDC, RS256 via JWKS

Every authenticated service verifies Janua JWTs against the JWKS at
`https://auth.madfam.io/.well-known/jwks.json`. **RS256 only — HS256 is fail-closed** since
the 2026-04-23 ecosystem audit (findings H3/H4, which found symmetric-secret verification in
live service code). No service implements custom auth, password login, or session management.

Available claims: `sub`, `email`, `roles`, `org_id`, and `rfc` (fiscal services only).

Janua is **single-issuer per deployment**: the issuer is derived from `JANUA_CUSTOM_DOMAIN`,
not the request `Host`. A second Janua hostname cannot be served without breaking OIDC
validation — this is why `auth.selva.town` must never be routed.

*Convention source: 2026-04-23 audit + `internal-devops/ECOSYSTEM.md`.*
**Conformance is not uniform.** The 2026-07-16 launch-readiness audit rates the
janua-SSO-matrix edge YELLOW, not green. Per-surface enforcement is tracked privately; the
matrix that recorded it is noted in `internal-devops` as a session artifact not committed to
the repo, so per-surface SSO status is currently **unestablished**. Committing that matrix
and citing it by path would settle it.

### 2. Billing and entitlements — Dhanam

Credit metering, entitlements, invoices and the billing ledger flow through Dhanam
(`madfam-org/dhanam`). Other services read via API and keep **no local mirror**.

*Convention source: `internal-devops/ecosystem/repo-registry.md` + this repo's ECOSYSTEM.md, 2026-07-04.*

### 3. LLM inference — Selva `/v1`, no direct provider calls from service code

Every LLM-consuming service points its OpenAI SDK `base_url` at Selva's OpenAI-compatible
`/v1` surface. Service code must not talk directly to OpenAI, Anthropic, or any other
provider.

**The endpoint moved on 2026-07-07.** RFC 0034 P2 extracted the `/v1` proxy out of
`nexus-api` into its own deployable, `selva-inference-gateway`, at
**`https://inference.selva.town`**. The `nexus-api` `/v1` mount was removed (selva-office#217).
Live-verified that day: `inference.selva.town/health` → 200; unauthenticated
`/v1/chat/completions` → 401; `api.selva.town/v1` → 404. Any doc that still names
`nexus-api` or `selva.town/v1` as the inference endpoint is describing a surface that no
longer exists.

Provider credentials (Anthropic, OpenAI, DeepInfra, Together, Fireworks, SiliconFlow,
Moonshot) are intended to live **only** on Selva.

**Known deviations, dated.** This is the contract, not a verified fleet state. The
2026-07-09 phynd-crm platform audit found its reddit-bot builds its client from
`OPENAI_BASE_URL` with no fallback guard, so an unset value **fails open to
`api.openai.com`** with a local `OPENAI_API_KEY` — recorded as an ecosystem violation, with
the fix (repoint to the gateway, make the base URL fail-closed) ranked #3 on that audit's
remediation list. A 2026-07-19 activation runbook also writes an `openai_api_key` into
Fortuna's own secret. Deviations are tracked privately.

### 4. Payment attribution — signed fan-out

```
PhyndCRM lead → Selva drafter (LLM) → email (Resend) → PSP webhook →
    payment.succeeded emitted, signed, in parallel to:
        ├─ Dhanam   POST /v1/billing/madfam-events    → BillingEvent row
        └─ PhyndCRM POST /api/webhooks/routecraft     → conversions row + source-agent credit
```

Signature: `x-madfam-signature: t=<unix-seconds>,v1=<hex-hmac-sha256>` over
`"${ts}.${raw-body}"`, per-target secret, 5-minute replay window. Both receivers are
idempotent by the emitter's `event_id`.

**As built vs ratified target.** The emitter above is `routecraft`
(`@routecraft/payments::emitPaymentSucceeded`). The **decision of record**
(`internal-devops/decisions/2026-05-04-payment-emission-soc.md`, reaffirmed by the 2026-07-08
execution plan) is different: *Dhanam becomes the sole payment emitter; routecraft becomes a
payment consumer and attribution emitter.* None of that migration had landed as of 2026-07-08.

**Not flowing as of 2026-07-08.** That execution plan, verified against routecraft at HEAD,
records: only the Conekta webhook emits (the Stripe path emits nothing), the `attribution`
sub-object is never populated, there is no `payment.refunded`, and the emitter target
secrets are absent from production manifests — so the fan-out is *a silent no-op today*.
The 2026-07-16 audit independently scores this edge RED: "Fan-out targets wrong route +
secret + header → first sale leaves zero trace."

A revenue-loop-probe CronJob is **specified** to exercise this chain hourly and page on
failure. As of the 2026-07-16 audit the probe was **off** and alert delivery had been dead
for ≥31 days; re-enabling it is a tracked operator blocker.

### 5. CORS — explicit allowlist per service, wildcards banned

Every service ships an explicit origin allowlist. Wildcards are banned. The rule traces to
the 2026-04-23 audit (findings H2/H5/H6). The newest service implements it literally:
`meridian`'s API requires `CORS_ALLOWED_ORIGINS` and refuses to start without it rather than
defaulting to something permissive, and deliberately omits its own marketing host from the list.

### 6. Deployment — Enclii is the control plane for every deploy

Enclii (web, API, or CLI) is the **mandatory** control plane for routine production
operations: provisioning, deployment, observability, domains, secrets, provider operations,
scaling, rollback, remediation.

Raw `kubectl`, `helm`, SSH, provider CLIs/APIs, `docker exec` and direct container access are
permitted **only** for (a) platform bootstrap or (b) documented break-glass when Enclii is
unavailable or lacks an implemented adapter. Any such use must record the actor, the reason,
the target service and environment, the commands executed, the result, and a follow-up
Enclii adapter-gap note or incident link. Recording the adapter gap is mandatory, not optional.

Enforcement of this doctrine is **documentary, not technical** — a banner convention plus a
docs-linting script in `internal-devops`. There is no admission-time or CLI-time block on
raw `kubectl`.

Deploy flow (`internal-devops/ecosystem/deployment-conventions.md`): push to `main` → CI
builds the image → GHCR → image signed with cosign keyless → `kustomize edit set image` pins
the digest → CI commits that back to the app repo → **ArgoCD pulls and syncs**. Nothing
pushes to the cluster. ArgoCD self-heal is on, so a live `kubectl patch` will be reverted;
permanent config changes must be committed.

Onboarding is zero-touch by contract (RFC 0014): adding a service must **not** require
editing the `enclii`, `janua` or `dhanam` repos. All deploy config lives in the app repo.
If an onboarding cannot be done without a platform-repo edit, that is a platform gap to file,
not to route around.

### 7. Data boundaries — own once, query everywhere

| Dataset | Owner | Everyone else |
|---|---|---|
| Identity / sessions / roles | Janua | federate, never duplicate |
| Bank transactions, wealth, **billing ledger** | Dhanam | API read; no local mirror |
| Mexican law, changelog, compliance rules | Tezca | query `/api/v1/laws`; no local fork |
| CFDI / SAT / tax filings | Karafiel | single authority |
| Fabrication node capacity + pricing | Forj | consume ForgeSight |
| Manufacturing execution telemetry | Pravara MES | feeds PhyndCRM federation |
| 3D geometry kernel | geom-core | used by Sim4D + Yantra4D |

### Other public-safe contract surfaces

- **Cross-service event bus.** Services exchange lifecycle events over a shared bus (domain
  streams, per-service consumer groups, dead-letter queues). The event-schema registry is
  governed privately; the event *shapes* used by public code live in `@madfam/types`.
- **Payment-method vocabulary.** Dhanam and Karafiel share a versioned payment-method /
  settlement-rail vocabulary and its SAT `c_FormaPago` mapping. Canonical copy governed in
  `internal-devops`; each consuming repo vendors a byte-identical copy enforced by contract tests.

---

## 🏰 V. Repo and licensing strategy

> *"Give away the roads, toll the destinations."*

The strategy is: infrastructure and standards open so the ecosystem has something real to
adopt; the market-gap intelligence and revenue engines closed.

**The public licensing matrix in [`docs/LICENSING_STRATEGY.md`](docs/LICENSING_STRATEGY.md)
is stale and in at least one case wrong** — it lists ForgeSight as Proprietary when
`forgesight/LICENSE` is AGPL-3.0 (with a separate `DATA_LICENSE`). Rather than restate a
strategic class here, the table below reports what the LICENSE file in each working tree
actually says, checked 2026-07-25:

| Repo | LICENSE file says |
|---|---|
| `enclii`, `janua` | AGPL-3.0 (`enclii` additionally carries `COMMERCIAL_LICENSE.md` — dual-licensed) |
| `geom-core` | Apache-2.0 *(the 2026-07-04 audit notes its README badge says MIT — a contradiction to arbitrate)* |
| `sim4d`, `bloom-scroll` | MPL-2.0 |
| `avala`, `forgesight`, `dhanam`, `karafiel`, `tezca`, `phynd-crm`, `selva-office` | AGPL-3.0 |
| `digifab-quoting` (Cotiza), `coforma-studio` | Proprietary, all rights reserved |
| `voxa` | Apache-2.0 *(per registry, 2026-07-04)* |
| `coupler`, `meridian`, `dhanam-core` | AGPL-3.0 *(per registry / repo record)* |
| `solarpunk-foundry` (this repo) | MIT |

The Yantra4D Commons class is CERN-OHL-W-2.0. The 2026-07-04 org-wide audit found roughly
ten active repos with **no LICENSE file at all**, `custom-msh`'s LICENSE file is a saved HTML
404 page, and `ultimate-box` / `multiboard` / `keyv2` / `stemfie` / `julia-vase` carry
license contradictions. Licensing compliance across the org is **an open gap**, not a
finished matrix.

---

## 🗺️ VI. Where the ecosystem actually stands

> **This section is dated and deliberately unflattering.** The most recent whole-ecosystem
> assessment available to this document is the **2026-07-16 internal launch-readiness audit**
> (8 platforms, 7 integration edges, 4 boundary rules). Its verdict was **NO-GO**, with the
> revenue funnel structurally dead at four consecutive hops and **`billing_events = 0` — no
> real charge has ever completed end to end.** Sixteen enumerated blockers gate the first
> sale and the campaign around it. The blocker ledger itself is Lane A and lives in
> `internal-devops/roadmaps/`.

Funnel scoreboard at that audit (`Ad → Landing → Signup → Checkout → Entitlement → CFDI → CRM → Ops`):
Landing GREEN (pricing public and deep-linkable), CFDI YELLOW, and six hops RED. The
Checkout note is worth stating precisely because an earlier edition of this README got it
backwards: **checkout exists** — Dhanam's Stripe MX path can charge. What has never happened
is a completed charge with entitlement, CFDI and CRM trace behind it.

Phase status, with the honest date on each:

- **Phase 1 — Foundation.** Enclii, Janua, Dhanam and Coforma all have live production routes (verified 2026-07-01).
- **Phase 2 — Intelligence.** Routes live for Fortuna, ForgeSight, BlueprintTube and BloomScroll (verified 2026-07-01). **Functional depth is a separate question and is not uniformly good:** the 2026-07-16 BloomScroll remediation found its OWID connector entirely broken (all `owid-datasets` GitHub paths 404) and only 5 of 6 content types real after remediation. Fortuna's operational depth is not established by anything in this repo.
- **Phase 3 — Engines.** `geom-core` published. AVALA and Sim4D status is **not independently verified here**; the nearest dated source is the 2026-07-09 AVALA platform audit, which records catalog surfaces with published counts of zero, validation-gated by policy.
- **Phase 4 — Application.** Cotiza, Forj, Karafiel, Tezca, Yantra4D, Pravara and Rondelio all have live production routes (verified 2026-07-01, Rondelio re-probed 2026-07-09). The gap to revenue is the funnel above, not a missing checkout UI.
- **Phase 5 — Frontier.** Galvana has no repo; `electrochem-sim` (the simulator core) is recorded stale since 2025-11.
- **Phase 6 — Horizontal integration.** The Selva domain cutover **is complete** (verified 2026-07-01) and the inference gateway was extracted (2026-07-07). The payment-attribution fan-out is **designed but not flowing** (verified 2026-07-08), and the revenue-loop probe was **off** with alert delivery dead ≥31 days as of 2026-07-16.

Strategic detail — catalog audits, competitor benchmarking, launch-wedge selection, rotation
schedules, the blocker ledger — lives in the private `internal-devops` repo.

---

## 🛠️ VII. Running the ecosystem locally

*Verified against the enclii CLI source and this repo's compose files on 2026-07-25.*

### Preferred path — the Enclii local CLI

```bash
enclii local up         # starts shared infra, then Janua + Enclii
enclii local infra      # shared infra only: PostgreSQL, Redis, MinIO, MailHog
enclii local status
enclii local logs [service]
enclii local down
```

Two corrections to earlier editions of this doc, both checked in
`enclii/packages/cli/internal/cmd/local.go`:

- `enclii local up` with **no arguments starts Janua and Enclii only**, not "all services".
  Pass service names to start more.
- `enclii local infra` starts **PostgreSQL, Redis, MinIO and MailHog**. It does **not**
  include Verdaccio — a claim that appeared in an earlier version of `AGENTS.md`.

The CLI drives `solarpunk-foundry/ops/local/docker-compose.shared.yml` on the Docker network
`madfam-shared-network`. That is the canonical local stack.

### Fallback — the legacy `madfam` script

```bash
cd ~/labspace
./madfam start   # core: janua, forgesight, digifab-quoting, madfam-site
./madfam full    # 10 declared services (see caveat)
./madfam status
./madfam logs janua
./madfam stop    # --clean to wipe volumes
```

`./madfam` is a symlink to `solarpunk-foundry/ops/bin/madfam.sh`. **`full` declares 10
services, not 18** (verified against the script's four service arrays on 2026-07-25):
`janua`, `forgesight`, `digifab-quoting`, `madfam-site`, `madfam`, `primavera3d`, `dhanam`,
`fortuna`, `sim4d`, `electrochem-sim`. Two of those — `madfam` and `electrochem-sim` — have
no checkout under `~/labspace`, so `full` cannot start them.

### Shared infrastructure (from `ops/local/docker-compose.shared.yml`)

| Service | Host port |
|---|---|
| PostgreSQL | 5432 |
| Redis | 6379 |
| MinIO | 9000 (API) / 9001 (console) |
| MailHog | 1025 (SMTP) / 8025 (UI) |

Databases created by `ops/local/init-databases.sql`: `janua_dev`, `enclii_dev`,
`forgesight_dev`, `fortuna_dev`, `cotiza_dev`, `avala_dev`, `dhanam_dev`, `sim4d_dev`,
`forj_dev`. A second, older file — `ops/db/init-shared-dbs.sql` — creates `*_db`-suffixed
names from a superseded scheme; several public docs still quote those. The `_dev` set is the
one the CLI provisions.

### Known-broken local scaffolding (do not trust it yet)

The **root `docker-compose.yml`** is not currently usable and is not the canonical path:
its `janua` service targets a `development` stage that does not exist in
`janua/apps/api/Dockerfile` (which defines only `builder` and `runner`, both Python), and
its `enclii-api` service points at `enclii/Dockerfile`, which does not exist — Enclii's
Dockerfiles are per app under `enclii/apps/*/Dockerfile`. It also declares the network
`madfam-network`, while the canonical stack uses `madfam-shared-network`. Use `enclii local
up`. *(Checked 2026-07-25.)*

### Ports

The ecosystem-wide 4xxx/5xxx port scheme is **aspirational**. Do not read a port out of any
document and assume it is what a service listens on — read
[`docs/PORT_ALLOCATION.md`](docs/PORT_ALLOCATION.md), which is honest about how few services
follow the scheme, and then check the owning repo's `enclii.yaml`.

In production, hostname routing makes container ports invisible to callers — but they are
**not** irrelevant: the Enclii control plane generates NetworkPolicies from `enclii.yaml`'s
`network.services[].port` and applies them via the K8s API. If that declared number does not
intersect the pod's actual `containerPort`, the CNI drops the traffic silently, and it
presents as a rendering or timeout bug rather than a network one.

---

## 📦 VIII. Shared packages (`@madfam/*`)

Thirteen packages under `packages/`, published to the private `npm.madfam.io` Verdaccio
registry. Directory listing and versions verified 2026-07-25.

| Package | Version | Purpose |
|---|---|---|
| `@madfam/core` | 0.1.0 | Brand, locales, currencies, event taxonomy, product definitions — decisions, not implementations |
| `@madfam/ui` | 0.2.0 | **Deprecated** — the UI system moved to a decentralized per-app "incubator" model (`packages/ui/README.md`) |
| `@madfam/analytics` | 0.1.0 | PostHog instrumentation + event-schema enforcement |
| `@madfam/auth-resilience` | 0.1.0 | Circuit breaker + retry for Janua calls |
| `@madfam/sentry` | 0.1.0 | Standardised Sentry init + context enrichment |
| `@madfam/logging` | 0.1.0 | Structured pino logger config |
| `@madfam/env` | 0.1.0 | Zod-validated env loading |
| `@madfam/constants` | 0.1.0 | Compile-time-safe shared enums |
| `@madfam/error-boundary` | 0.1.0 | Next.js route boundary components |
| `@madfam/types` | 0.1.0 | Cross-repo shared types (events, webhook schemas, attribution) |
| `@madfam/telemetry` | 0.1.0 | Shared OpenTelemetry tracing + W3C trace-context propagation |
| `@madfam/webhook-attribution` | 0.1.0 | Signed payment-attribution HMAC sign/verify + idempotency — the §IV.4 contract, packaged |
| `@madfam/ecosystem-banner` | 0.1.3 | Dismissible ecosystem ticker for product landings ([`docs/ECOSYSTEM_BANNER.md`](docs/ECOSYSTEM_BANNER.md)) |

**Whether these versions are actually present on `npm.madfam.io` is unverified** — that needs
a registry query or a dated operator attestation. The versions above are what `package.json`
declares in the working tree.

`@madfam/webhook-attribution` exists precisely so the §IV.4 signing contract is not
reimplemented per repo. As of the 2026-07-08 verification, **no repo had adopted it**;
Dhanam and routecraft each carry their own byte-identical implementation.

Publishing: `scripts/publish-ui.sh` publishes **`@madfam/ui` only** (which is deprecated).
`pnpm publish:all` → `scripts/publish-all-sdks.sh` publishes the per-platform client SDKs
from other repos, not this repo's `@madfam/*` set. The CI path is
`.github/workflows/publish-package.yml` (`workflow_dispatch`, with a `dry_run` input).

---

## 🔒 IX. What this repo does NOT contain

This repo is public. It deliberately does not hold:

- Node hostnames, public IPs, hardware models or capacity figures, provider account numbers, costs, SSH targets, or the Cloudflare tunnel identifier → private `internal-devops`
- Actual secrets, API keys or Vault tokens, or Vault paths with retrieval detail → ExternalSecrets + Vault; literal secrets live nowhere
- Strategic, competitive or pricing intelligence → `internal-devops/ecosystem/`
- Ecosystem audits carrying revenue, customer or cost data → `internal-devops/audits/`
- Per-session remediation plans, cutover runbooks, rotation schedules, incident evidence trails → `internal-devops/runbooks/` and `internal-devops/incidents/`
- Raw break-glass `kubectl` / SSH procedures → `internal-devops`

If you have operator access, start at `internal-devops/README.md`. Otherwise, contact
`admin@madfam.io`. (Do **not** use any `@innovacionesmadfam.dev` address — that domain was
never owned; owner confirmation 2026-07-09.)

> **Known open exposure in this repo, disclosed rather than hidden.** As of 2026-07-25 the
> file `infrastructure/docs/SSH_SECURITY_EVOLUTION.md` carries a live infrastructure
> identifier and an SSH admin roster in plaintext on `main`; a scrub of that tree was in
> flight when this section was written. Removing the line from HEAD does **not** undo git
> history — rotation is an operator action and remains owed. This is tracked as an open
> incident in `internal-devops`, and remediating `infrastructure/` is out of scope for this
> document. Do not treat the absence of such material from *this* file as evidence that the
> whole repo is clean.

---

## 🤝 X. Contributing

1. **One PR per concern.** Branch off `main`, target `main`. Never commit to `main` directly.
2. **Conventional commits** (`feat:`, `fix:`, `chore:`, `docs:`, …).
3. **No custom auth** — use Janua (§IV.1).
4. **No literal secrets** — ever.
5. **No data duplication** — query the §IV.7 owner.
6. **No undated status claims.** If you assert that something works, name the source and the
   date it was verified, and distinguish *verified* / *documented but unverified* /
   *aspirational*. [`docs/PORT_ALLOCATION.md`](docs/PORT_ALLOCATION.md) is the model.
7. **Update [`docs/PORT_ALLOCATION.md`](docs/PORT_ALLOCATION.md)** if your service claims a port.
8. **No marketing language.** No superlatives, no invented metrics, no adoption numbers.

CI on this repo runs documentation lint, package quality, a production-readiness ratchet,
public-hygiene scanning and repository hygiene (`.github/workflows/`). Note that the
public-hygiene scanner covers `.md` / `.mdx` / `.txt` only and has no pattern for
infrastructure identifiers — passing CI is not proof a change is boundary-clean.

---

## 🏛️ XI. License and attribution

This repo is MIT (`LICENSE`, `package.json`). Individual packages declare their own license
in `packages/*/package.json`. Non-code docs (this README, `docs/*.md`) are CC-BY-SA 4.0
unless otherwise noted.

Predecessor brand: **Aureo Labs** (`aureolabs.dev`), retired 2026-04-17; the `aureo-labs`
repo is public and archived (2026-04-08). `aureo.studio` is held for brand protection and
redirects here.

---

> *"The best way to predict the future is to manufacture it."*
>
> **MADFAM** — High tech, deep roots. From bits to atoms.

## Repository boundary note

This repository is public (Lane B). Live secrets, node identity, IPs, hardware and capacity
figures, cost ledgers, incident internals, and production break-glass material belong in the
private `internal-devops` repository or in Vault/ExternalSecrets — never here. Canonical
policy: `internal-devops/docs/repo-boundary-contract.md` (last updated 2026-06-14).
Public-repo checklist: [`docs/PUBLIC_REPO_BOUNDARY.md`](docs/PUBLIC_REPO_BOUNDARY.md).
