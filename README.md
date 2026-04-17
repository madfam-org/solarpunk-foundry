# 🌞 MADFAM: The Solarpunk Foundry
### *From Bits to Atoms. High tech, deep roots.*

- **Organization:** Innovaciones MADFAM S.A.S. de C.V. (Cuernavaca, Morelos, MX)
- **Canonical domain:** [madfam.io](https://madfam.io)
- **GitHub:** [`madfam-org`](https://github.com/madfam-org) + [`legal-ops`](https://github.com/legal-ops)
- **Status board:** [status.madfam.io](https://status.madfam.io)
- **This repo's role:** Ecosystem orchestration hub — port registry, `@madfam/*` shared packages, local dogfooding scaffolds, public-safe architecture narrative. This README is the **public-facing single source of truth** for the MADFAM vision, platform map, and development contract.

---

## 🌍 I. Vision

> **"Sovereignty is not just about owning your server; it's about owning your supply chain, your money, and your mind."**

MADFAM is a **vertically-integrated venture studio** operating at the seam between the digital (software) and the physical (real-world fabrication, finance, and compliance), with a **LATAM-first, Mexico-rooted** posture.

### The problem — the "rented" existence

Today, a founder is a tenant in their own business. They rent their design tools, their cloud, their audience, their payment rails, and their compliance infrastructure. A change in API pricing, a platform ban, a SAT reform, or a venture cycle can kill a business overnight.

### The MADFAM answer — the sovereign loop

We build a **closed-loop ecosystem** where each tool supports the others. Every layer can be swapped for a competitor without toppling the rest — but because every layer is ours, the economics keep compounding inside the loop. The tools eat our own food first ("Primavera Mandate") and only then face outward.

---

## ⚙️ II. Architecture — the Solarpunk Stack

Our ecosystem grows as a **living system**. Every tool has a specific organ function, in symbiotic relationship with the others.

> For the core platform-relationship contract (Substrate · Trellis · Membrane), see [`docs/architecture/SYMBIOSIS.md`](docs/architecture/SYMBIOSIS.md).

### 🪨 Layer 1 — Soil (infrastructure)

*The bedrock. Without this, we are tenants.*

| Platform | Role | Domain |
|---|---|---|
| **Enclii** | Sovereign PaaS (Go Switchyard API + Next.js UI + ArgoCD GitOps + Roundhouse builders). Handles build, deploy, domain provisioning, NetworkPolicy generation, lifecycle events. | [enclii.dev](https://enclii.dev) |
| **Janua** | Identity, SSO, revenue management. OIDC + RS256 JWT via JWKS. **Every MADFAM service defers to Janua — no custom auth anywhere.** | [auth.madfam.io](https://auth.madfam.io) |

### 🌿 Layer 2 — Roots (sensing & input)

*Absorbing nutrients (data and truth) from the outside world.*

| Platform | Role | Domain |
|---|---|---|
| **Fortuna** | Problem Hunter — discovers + validates market gaps from multilingual signals. | [fortuna.tube](https://fortuna.tube) |
| **ForgeSight** | The Pricer — global manufacturing pricing data. | [forgesight.quest](https://forgesight.quest) |
| **BlueprintTube** | The Librarian — indexes and rates 3D models for printability. | [blueprint.tube](https://blueprint.tube) |
| **BloomScroll** | The Filter — "Slow Web" content aggregator. Serendipity over engagement. | [almanac.solar](https://almanac.solar) |
| **madfam-crawler** | Internal scraping-as-a-service (Crawl4AI + ScrapegraphAI). Feeds Tezca's fiscal monitoring and others. | — |

### 🪵 Layer 3 — Stem (core standards & verification)

*The structural logic that holds the system up.*

| Platform | Role |
|---|---|
| **geom-core** | Physics standard — C++ geometry analysis exposed to WASM + Python. Backs Sim4D + Yantra4D. |
| **AVALA** | Human standard — verification engine for applied learning (Mexico EC/CONOCER + DC-3). |
| **routecraft** | Trip-engine SaaS. Its `@routecraft/payments::emitPaymentSucceeded` is the **canonical payment-event producer** that fans out to Dhanam + PhyneCRM (see §IV). |

### 🍎 Layer 4 — Fruit (user platforms)

*Where value is created and captured.*

| Platform | Role | Domain |
|---|---|---|
| **Sim4D** *(née BrepFlow, renamed 2026-04)* | Web-first parametric CAD with exact B-Rep / NURBS via OCCT.wasm. | — |
| **Forj** | Decentralized fabrication storefronts with phygital NFT integration. | [forj.design](https://forj.design) |
| **Cotiza Studio** | Automated quoting engine connecting design → factory. Emits signed billing events to Dhanam. | [cotiza.studio](https://cotiza.studio) |
| **Dhanam** | Unified budgeting + wealth tracking + **ecosystem billing ledger**. Hosts `MadfamEventsController` receiver. | [dhan.am](https://dhan.am) |
| **Coforma Studio** | Customer Advisory Boards as growth engine. | [coforma.studio](https://coforma.studio) |
| **Galvana** | *(roadmap)* Phygital electrochemistry simulation. | — |
| **Karafiel** | Combat-accounting for Mexican tax defense. Consumes Tezca + Dhanam data; never duplicates. | [karafiel.mx](https://karafiel.mx) |
| **Tezca** | Legal-intelligence platform — authoritative source of Mexican law, changelog, and compliance rules. | [tezca.mx](https://tezca.mx) |
| **Yantra4D** | Parametric-design platform + its commons of OpenSCAD/CadQuery projects. | [yantra4d.com](https://yantra4d.com) |
| **Pravara MES** | Manufacturing-execution system. | [mes.madfam.io](https://mes.madfam.io) |
| **Rondelio** | Tabletop / TCG game-intelligence cloud. | [rondel.io](https://rondel.io) |

### 🤝 Layer 5 — Glue (cross-platform federation)

| Platform | Role | Domain |
|---|---|---|
| **PhyneCRM** | "Synthetic Single Pane of Glass" — federates data from 6 MADFAM platforms (Janua, Janua Telemetry, Dhanam, Cotiza, Pravara, Forj) without duplication. Hosts the ecosystem attribution receiver. | [crm.madfam.io](https://crm.madfam.io) |
| **Selva** *(née AutoSwarm Office, rename cutover pending)* | AI workforce + office simulator. Owns the `/v1/` OpenAI-compatible inference proxy every ecosystem service routes through. Hosts revenue-loop probe, HITL-confidence ledger, `nexus-api` orchestration. | `agents.madfam.io` → `selva.town` post-cutover |

### Adjacent / supporting

`madfam-site` ([madfam.io](https://madfam.io)), `primavera3d` ([primavera3d.pro](https://primavera3d.pro) — our in-house factory portfolio), `ceq` ([ceq.lol](https://ceq.lol) — ComfyUI wrapper), `nuit-one` ([nuit.one](https://nuit.one)), `subtext` ([subtext.live](https://subtext.live)), `accionables-madlab` ([madlab.quest](https://madlab.quest)), `factlas` ([factlas.com](https://factlas.com)), `server-auction-tracker` ([sniper.madfam.io](https://sniper.madfam.io) — Hetzner auction intelligence), `turnbased-engine` + `stratum-tcg`, `gh-backups`, `proton-bridge-pipeline`.

**Integration-path repos** (will fold into an existing platform rather than exist standalone long-term): `penny` → autoswarm-office, `zavlo` → karafiel, `panopticon-mx` → tezca, `social-sentiment-monitor` → fortuna.

---

## 🔄 III. The Primavera Mandate (dogfooding)

> **"We trust it because we survive on it."**

We do not build SaaS. We build **tools to run our own operations first** — then face outward once they've survived contact with us.

| Operational need | MADFAM tool |
|---|---|
| Finance & runway | **Dhanam** |
| Strategy validation | **Fortuna** (what to build next) |
| Factory quoting | **Cotiza** (Primavera3D quotes through it) |
| Hiring / verification | **AVALA** |
| Compliance | **Karafiel** + **Tezca** |
| Customer discovery | **Coforma Studio** + **PhyneCRM** |
| Revenue attribution | **RouteCraft emitter** → **Dhanam ledger** + **PhyneCRM conversions** |

If it isn't good enough to run MADFAM on, it isn't good enough to sell.

---

## 🔌 IV. Ecosystem protocols (how the platforms actually talk)

These are the four load-bearing contracts that make the sovereign loop work. They are stable; platforms implement them the same way or they don't participate.

### 1. Identity → every service uses Janua

No custom auth anywhere. Every service verifies RS256 JWTs against `auth.madfam.io/.well-known/jwks.json`. `sub`, `email`, `roles`, `org_id`, and (where applicable) `rfc` claims flow through the token.

### 2. Inference → every service routes through Selva's `/v1/` proxy

Selva's `nexus-api` exposes an OpenAI-compatible `/v1/chat/completions` + `/v1/embeddings`. Fortuna, Yantra4D, PhyneCRM, and any future LLM consumer point their SDK `base_url` here. Provider credentials (Anthropic, OpenAI, DeepInfra, Together, Fireworks, SiliconFlow, Moonshot) live only on Selva's side, routed by `ModelRouter` per task-type. **No other MADFAM repo holds direct LLM provider credentials.**

### 3. Payment attribution → signed fan-out

```
PhyneCRM lead → Selva drafter (LLM) → email (Resend) → PSP webhook →
    RouteCraft emitPaymentSucceeded() fires a signed event in parallel to:
        ├─ Dhanam   POST /v1/billing/madfam-events    → BillingEvent row
        └─ PhyneCRM POST /api/webhooks/routecraft     → conversions row + agent credit
```

Signature: `x-madfam-signature: t=<unix-seconds>,v1=<hex-hmac-sha256>` over `"${ts}.${raw-body}"`, per-target secret, 5-minute replay window. Both receivers are idempotent by the emitter's `event_id`. The revenue-loop-probe CronJob exercises this full chain hourly and pages if any stage breaks.

### 4. Data boundaries → own once, query everywhere

| Dataset | Owner | Everyone else |
|---|---|---|
| Identity / sessions / roles | Janua | Federate, never duplicate |
| Bank transactions, wealth, **ecosystem billing ledger** | Dhanam | API read; no local mirror |
| Mexican law + changelog + compliance rules | Tezca | Query `/api/v1/laws/...`; no local fork |
| CFDI / SAT / tax filings | Karafiel | Single authority |
| Fabrication node capacity + pricing | Forj | Consume ForgeSight |
| Manufacturing execution telemetry | Pravara MES | Feed into PhyneCRM federation |
| 3D geometry kernel | geom-core | Used by Sim4D + Yantra4D |

---

## 🏰 V. Repo & licensing strategy

> *"Give away the roads, toll the destinations."*

| Strategic class | What | Licensing |
|---|---|---|
| **Infrastructure** (Enclii, Janua) | Tools anyone should be able to self-host | **AGPL v3** — prevents cloud capture; anyone can run our infra, nobody can turn it into a closed service without contributing back |
| **Standards** (geom-core) | Neutral shared standard we want the whole industry on | **Apache 2.0** |
| **Community** (BloomScroll, Sim4D, Galvana, AVALA) | Open tool, commercial-friendly | **MPL 2.0** or **AGPL v3** |
| **Edge** (Fortuna, ForgeSight, BlueprintTube, Forj, Cotiza, Coforma, Karafiel, Tezca, Yantra4D, Pravara, PhyneCRM, Selva) | Our IP — the market-gap intelligence, pricing logic, compliance, customer data, revenue engine | **Proprietary** |

The public repos give the ecosystem something real to adopt. The proprietary ones are where we capture value. The licenses are the fence, not the wall — we want contributions flowing into the AGPL layer, we just don't want Amazon turning it into a managed service.

See [`docs/LICENSING_STRATEGY.md`](docs/LICENSING_STRATEGY.md) for the per-repo table and the reasoning for each call.

---

## 🗺️ VI. Roadmap posture

We have largely completed the bootstrap sequence. The current focus is **commercial activation** — turning architecturally-mature platforms into first paying customers.

- **Phase 1 — Foundation.** ✅ Done. Enclii + Janua + Dhanam + Coforma all in production.
- **Phase 2 — Intelligence.** ✅ Done for Fortuna + ForgeSight + BlueprintTube + BloomScroll (operational); data-collection ongoing.
- **Phase 3 — Engines.** 🟡 In progress. `geom-core` published; AVALA in alpha; Sim4D renamed and stabilising.
- **Phase 4 — Application.** 🟡 In progress. Cotiza live; Forj live; Karafiel + Tezca + Yantra4D + Pravara all in production. **Gap to revenue:** no production checkout UI on any platform yet — every product is one pricing decision from being revenue.
- **Phase 5 — Frontier.** ⏳ Galvana on deck once Phase 4 produces stabilising revenue.
- **Phase 6 — Horizontal integration.** 🟡 Active. PhyneCRM federating; RouteCraft attribution loop wired; revenue-loop probe running; Selva cutover staged and gated by a maintenance window.

The strategic detail (catalog audits, competitor benchmarking, launch-wedge selection, secret-rotation schedules, Selva-cutover runbook) lives in the private `internal-devops` repo. The public repo holds the ecosystem shape.

---

## 🛠️ VII. How to run this ecosystem

### Quickest path (using Enclii's local CLI)

```bash
cd ~/labspace
enclii local up         # Infra + all services
enclii local infra      # Only PostgreSQL, Redis, MinIO, MailHog
enclii local status     # Which ports are up
enclii local down       # Stop everything
```

### Fallback (legacy `madfam` script)

```bash
cd ~/labspace
./madfam start          # Core ecosystem (Janua + Enclii + databases)
./madfam full           # All 18 services
./madfam status
./madfam logs janua
./madfam stop           # --clean to wipe volumes
```

### Shared infrastructure

All services connect to shared `madfam-shared-network`:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO: `localhost:9000` / `localhost:9001`
- MailHog: `localhost:1025` / `localhost:8025`
- Verdaccio (NPM): `localhost:4873` (public: `npm.madfam.io`)

### Port allocation

The ecosystem-wide 4xxx/5xxx port scheme is **partially aspirational** — only Janua (4100-4104) and Enclii (4200-4201) fully follow it; every other service uses its framework default (usually `3000` for Next.js, `8000` for Django, `4200` for NestJS). **In production it doesn't matter** — K8s namespacing + Cloudflare Tunnel routing by hostname makes container ports invisible. It matters only for local multi-service dev. See [`docs/PORT_ALLOCATION.md`](docs/PORT_ALLOCATION.md) for the honest reality-vs-aspiration breakdown and per-repo declared ports.

---

## 📦 VIII. Shared packages (`@madfam/*`)

Published to the private `npm.madfam.io` Verdaccio registry. Consumed by every ecosystem app.

| Package | Purpose |
|---|---|
| `@madfam/core` | Brand, locales, currencies, event taxonomy, product definitions — **decisions, not implementations** |
| `@madfam/ui` | Shared design system (shadcn/ui + Radix + Tailwind, φ-ratio tokens, glassmorphism primitives) |
| `@madfam/analytics` | PostHog instrumentation + event-schema enforcement |
| `@madfam/auth-resilience` | Circuit breaker + retry for Janua calls |
| `@madfam/sentry` | Standardised Sentry init + context enrichment |
| `@madfam/logging` | Structured pino logger config |
| `@madfam/env` | Zod-validated env loading |
| `@madfam/constants` | Compile-time-safe enums for shared constants |
| `@madfam/error-boundary` | Next.js route boundary components |
| `@madfam/types` | Cross-repo shared types (events, webhook schemas, attribution) |

See `packages/<name>/README.md` for each. Publish with `./scripts/publish-ui.sh` (or per-package).

---

## 🔒 IX. What this repo does **NOT** contain

Solarpunk Foundry is **public**. It deliberately does not hold:

- Production IPs, hardware specs, hostnames, provider account numbers, costs, SSH targets → those live in the **private** `internal-devops` repo
- Actual secrets, API keys, Vault tokens → ExternalSecret manifests + Vault (when deployed); literal secrets live nowhere
- Strategic / competitive / pricing intelligence → `internal-devops/ecosystem/pricing-strategy-*.md`
- Full ecosystem audits with revenue / customer / cost data → `internal-devops/audits/`
- Per-session remediation plans, Selva-cutover runbooks, rotation schedules → `internal-devops/` under `runbooks/` and `ecosystem/`

If you're looking for any of those and have operator access: see `internal-devops/README.md`. If you don't have access, email `admin@madfam.io`.

---

## 🤝 X. Contributing

1. **One PR per concern.** Branch off `main`, target `main`.
2. **Conventional commits** (`feat:`, `fix:`, `chore:`, `docs:`, …).
3. **No custom auth** — use Janua.
4. **No literal secrets** — ever.
5. **No data duplication** — query the §IV.4 owner.
6. **Update `docs/PORT_ALLOCATION.md`** if your service claims a port.
7. **Run `./madfam status` or `enclii local status`** before asserting anything works.

---

## 🏛️ XI. License & attribution

This repo's own content is covered by individual package licenses (see `packages/*/package.json`). The `@madfam/core` package ships as **MIT**. Non-code docs (this README, `docs/*.md`) are **CC-BY-SA 4.0** unless otherwise noted.

Predecessor brand: **Aureo Labs** (`aureolabs.dev`) — retired 2026-04-17; every trace rebranded into **Innovaciones MADFAM**. The `aureo.studio` domain is held only for brand protection and redirects here.

---

> *"The best way to predict the future is to manufacture it."*
>
> **MADFAM** — High tech, deep roots. From bits to atoms.
