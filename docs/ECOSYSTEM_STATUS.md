# MADFAM Ecosystem — service and route inventory

**Last verified: 2026-07-25**

> **This is a point-in-time inventory, not a live status page.** It records what
> is *documented* about MADFAM's services and routes, with the date each fact
> was last verified and the source it came from. It cannot and does not report
> current health.
>
> The live surfaces are `status.enclii.dev` and `status.madfam.io`. If you need
> to know whether something is up right now, look there or probe it — do not
> read a checked-in glyph in a public git repository.

The previous revision of this file called itself "Live Infrastructure Status",
carried "Last updated: May 9, 2026", declared "All issues resolved as of
May 9, 2026", and showed green dots for services that later dated records
contradict. That framing is the failure mode this rewrite exists to remove.

---

## Provenance of every claim below

| Class of claim | Source | Last verified |
|---|---|---|
| Production routes (hostname → service) | `internal-devops/ecosystem/domain-map.md` | **2026-07-01** by live probes + the Cloudflare tunnel ingress API; four row groups carry later dates, marked inline |
| Retired / never-route endpoints | same | **2026-07-01**, with owner confirmations dated 2026-07-09 where noted |
| Repository inventory and visibility | live GitHub org enumeration | **2026-07-25** |
| Repo roles and registry rows | `internal-devops/ecosystem/repo-registry.md` | **2026-07-04** (registry's own verification date; updated 2026-07-25) |
| Cluster shape, namespaces, ArgoCD apps | `internal-devops/infrastructure/topology.md` | **2026-05-04** |
| Inference routing | `internal-devops/audits/2026-07-07-selva-gateway-and-cluster-rightsizing-session.md` | **2026-07-07** |

**No production probe was performed for this document.** Every status word here
is graded against the newest dated record that could be read, never against a
live check. Where that is not good enough, the probe that would settle it is
named.

One qualification, stated so it is not a hidden exception: running this
repository's own documentation link-checker over this file caused it to issue
HTTP requests to two hostnames mentioned in the text. Those incidental results
are reported inline where they are relevant, labelled as what they are. They
are link-reachability observations, not health checks, and nothing else in this
document rests on them.

---

## Cluster shape (public-safe)

| Property | Value | Verified |
|---|---|---|
| Distribution | k3s (`v1.33.7+k3s3`) | 2026-05-04 |
| Nodes | **2 dedicated bare-metal + 1 cloud VPS builder** (3 total) | 2026-05-04 |
| Provider | Hetzner | 2026-05-04 |
| Ingress | Single Cloudflare Tunnel; zero exposed node ports for application traffic | 2026-07-01 |
| Namespaces | 22 at last snapshot | 2026-05-04 |
| Data layer | PostgreSQL single in-cluster instance; Redis single instance (Sentinel staged, not deployed). No auto-failover. | 2026-05-04 |

> The previous revision said "3-node cluster (… bare-metal)" in one row and
> "Hetzner dedicated + 1 VPS builder" in the next — self-contradictory within a
> single table. The builder is a cloud instance, not dedicated hardware.

Node inventory, addresses, hardware, capacity and costs are Lane A:
`internal-devops/infrastructure/nodes.md`. Full configuration detail is in
[`INFRASTRUCTURE_STATUS.md`](./INFRASTRUCTURE_STATUS.md).

---

## Production routes

All rows below were **last verified 2026-07-01** unless a later date is given.
Container ports are deliberately omitted — they are namespace-internal, they
have drifted from what the owning repos declare in at least a dozen cases, and
each repo's own `enclii.yaml` is the source of truth. See
[`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md).

### Platform (Enclii)

| Hostname | Service |
|---|---|
| `api.enclii.dev` | switchyard-api (control plane) |
| `app.enclii.dev` | switchyard-ui |
| `admin.enclii.dev` | dispatch (admin) |
| `enclii.dev` | landing page |
| `docs.enclii.dev` | docs site |
| `status.enclii.dev` | status page |
| `status.madfam.io` | status page (MADFAM-branded) |
| `npm.madfam.io` | Verdaccio private npm registry |

> **Correction.** The previous revision listed 7 Enclii services and claimed
> "7/7 pods healthy". The inventory was incomplete — dispatch, both status
> surfaces and Verdaccio were missing — and the health count was a stale
> point-in-time reading against that incomplete list.

> **Verdaccio ownership.** `npm.madfam.io` runs from manifests in the **enclii**
> repository, in the `enclii` namespace. This repository (`solarpunk-foundry`)
> *publishes to* it; it does not host it.

### Identity (Janua)

| Hostname | Service |
|---|---|
| `auth.madfam.io` | janua-api — **the canonical OIDC issuer** |
| `janua.dev` | janua-website |
| `docs.janua.dev` | janua-docs |

> **`app.janua.dev`, `admin.janua.dev` and `api.janua.dev` are used throughout
> internal operations but appear in no row of the canonical route table.** This
> is a gap in the route map rather than evidence the hosts do not exist. They
> are listed here as **documented, route table incomplete** — not as healthy.
> **What would settle it:** add the three rows to
> `internal-devops/ecosystem/domain-map.md` with a probe date.
>
> Separately, a 2026-07-11 private GA plan records `app.janua.dev/auth/signup`
> returning 404.

### Products and platforms

| Hostname(s) | Service |
|---|---|
| `madfam.io`, `cms.madfam.io` | madfam-site |
| `dhan.am`, `app.dhan.am`, `api.dhan.am`, `admin.dhan.am` | Dhanam (billing, payments) |
| `tezca.mx`, `api.tezca.mx`, `admin.tezca.mx` | Tezca (Mexican law oracle) |
| `karafiel.mx`, `app.karafiel.mx`, `api.karafiel.mx`, `admin.karafiel.mx` | Karafiel (operational compliance, CFDI/SAT) |
| `cotiza.studio`, `api.cotiza.studio` | Cotiza (repo `digifab-quoting`) |
| `forgesight.quest`, `app.`, `api.`, `admin.` | ForgeSight (fabrication industry intelligence) |
| `fortuna.tube`, `api.fortuna.tube` | Fortuna (problem intelligence) |
| `avala.studio`, `app.avala.studio`, `api.avala.studio`, `admin.avala.studio` | AVALA (learning verification) — `avala.studio` repointed to the standalone landing **2026-07-18**; `admin.` live since 2026-07 |
| `yantra4d.com`, `app.`, `api.`, `admin.` | Yantra4D |
| `mes.madfam.io`, `mes-api.madfam.io` | Pravara MES |
| `crm.madfam.io` | PhyndCRM |
| `blueprint.tube`, `api.`, `app.`, `admin.` | Blueprint Harvester — `app.` and `admin.` verified **2026-07-09** |
| `rondel.io`, `www.`, `api.`, `play.`, `studio.`, `admin.`, `sim.` | Rondelio — all six surfaces re-probed **2026-07-09**; `api.rondel.io` is `rondelio-gateway`, correcting an earlier `rondelio-api` entry |
| `primavera3d.pro` | primavera3d |
| `forj.design` | Forj |
| `ceq.lol` | CEQ |
| `nuit.one` | nuit-one |
| `almanac.solar` | BloomScroll |
| `coforma.studio` | Coforma Studio |
| `sniper.madfam.io` | deal-sniper-web |
| `lav.madfam.io`, `lav-api.madfam.io` | atelier-noir — marked **LIVE 2026-07-07** |
| `factl.as`, `factlas.com` | Factlas (geospatial) |
| `subtext.live` | subtext |
| `madlab.quest` | accionables-madlab |
| `routecraft.app` | RouteCraft |

### Selva

| Hostname | Service |
|---|---|
| `selva.town`, `www.selva.town` | office-ui |
| `app.selva.town` | office-ui (307 → login at last probe) |
| `api.selva.town` | nexus-api |
| `admin.selva.town` | admin (307 → login at last probe) |
| `ws.selva.town` | colyseus |
| `gw.selva.town` | gateway |
| `inference.selva.town` | **selva-inference-gateway** — see below |

> **The Selva domain cutover is DONE (verified 2026-07-01).** Selva serves on
> `selva.town` and its subdomains. Only the GitHub repository rename
> (`selva-office` → `selva`) is still pending, per the registry verified
> 2026-07-04.

> **`inference.selva.town` is declared in `selva-office/enclii.yaml` and was
> live-verified on 2026-07-07, but appears in no row of the canonical route
> table.** Another route-map gap. **What would settle it:** add the row with a
> probe date.

### Internal operator surfaces

| Hostname | Service | Status published here |
|---|---|---|
| `grafana.enclii.dev` | Grafana | **Not asserted.** Internal operator surface. |
| `prometheus.enclii.dev` | Prometheus — **canonical metrics endpoint** | **Not asserted.** |
| `alertmanager.enclii.dev` | Alertmanager | **Known gap at the last internal probe (2026-07-01).** Do not assume alerting is delivering. |
| `<SSH_ZERO_TRUST_HOST>` | SSH via Cloudflare Access | Intermittent client-side token expiry; re-login resolves. Not an infrastructure fault. |

This repository does not publish health for internal operator surfaces, and
**absence of a status here is not a claim that they are healthy.** The current
gap list lives in `internal-devops/ecosystem/domain-map.md` under "Known
endpoint gaps", last probed 2026-07-01.

One thing that does need saying plainly, because a public doc previously
implied the opposite: the internal launch-readiness assessment dated
**2026-07-16** recorded alert delivery as not working and the synthetic revenue
probe as disabled. Nothing dated after that records recovery. **What would
settle it:** an operator-run check of alert delivery with the date recorded.

---

## Retired, never-route, and not-live

This section is the most useful one in the document. Every entry here is a
guardrail: acting on a stale doc that lists these as live is how time gets
wasted or, in two cases, how something gets actively broken.

### Retired — do not resurrect

| Endpoint | Status | Why |
|---|---|---|
| `agents.madfam.io`, `agents-*.madfam.io` | **Retired.** No tunnel ingress rules; returns 502. | The Selva cutover to `selva.town` executed. Verified 2026-07-01. |
| `selva.madfam.io` | **Never use.** | Superseded by the same cutover. |
| `metrics.enclii.dev` | **Retired alias**, orphaned. No DNS or tunnel route; falls through to a registrar parking record. | Canonical endpoint is `prometheus.enclii.dev`. Verified 2026-07-01. |
| `dashboard.madfam.io` | **Not a MADFAM route.** Appears in no route table, no domain inventory, no tunnel rule. | The Janua dashboard is `app.janua.dev`. A previous revision of `DOGFOODING_GUIDE.md` published this hostname; it was wrong. |
| `agents-api.madfam.io` | **Retired** along with the rest of `agents-*`. | — |

### `auth.selva.town` — must never be routed

This one deserves its own heading because the reason is a design constraint,
not an accident, and re-creating the record would break OIDC.

**Janua is single-issuer per deployment.** The issuer is derived from
`JANUA_CUSTOM_DOMAIN`, **not** from the request `Host`. Serving Janua on
`auth.selva.town` would therefore emit `issuer=https://auth.madfam.io` while
being reached at a different hostname — and every relying party validating the
issuer claim would reject the token.

`selva-office` once set `NEXT_PUBLIC_JANUA_URL` to that hostname, which never
resolved. The fix canonicalised **all** Selva surfaces to `auth.madfam.io`. No
DNS or tunnel record for `auth.selva.town` should ever be created.

*Corroborated incidentally 2026-07-25:* this repository's documentation
link-checker failed to resolve `auth.selva.town` (DNS resolution error) while
validating this file — consistent with the record that no DNS entry exists.

*Source: `internal-devops/ecosystem/domain-map.md`, verified 2026-07-01;
issuer derivation independently verified 2026-07-25 by reading
`janua/apps/api/app/main.py`.*

### Not live — pre-deploy or unregistered

| Hostname | State | Verified |
|---|---|---|
| `periplo.madfam.io` | **NXDOMAIN.** The repo is private and populated; nothing is routed. | 2026-07-25 |
| `meridian.madfam.io`, `meridian-app.`, `meridian-api.`, `meridian-admin.` | **Pre-deploy.** No tunnel routes, no DNS. | 2026-07-25 |
| `phynd.app` | **Not registered.** Must be acquired before the tunnel and DNS can be updated. `crm.madfam.io` is the live host today. | 2026-07-01 |
| `innovacionesmadfam.dev` | **Never owned.** A prior entry listing it as expiring was wrong. Canonical company domain is `madfam.io`. Do not use any address at this domain. | owner confirmation 2026-07-09 |
| `madfam.academy`, `madfam.info` | **Expired.** | 2026-07-01 |

### Contradiction: `eido.cam`

Unresolved in the private record, so it is unresolved here. The domain map
(updated 2026-07-10) lists eido as pre-deploy and `eido.cam` as "provisioning
staged, not yet deployed". A same-repo roadmap **and** an as-built runbook,
**both dated 2026-07-10**, record `eido.cam` as having gone live that day —
Cloudflare zone created, NS delegated, R2 buckets and `cdn.eido.cam` attached,
Enclii project and three services registered.

**One incidental data point, 2026-07-25.** This repository's documentation
link-checker (`doc-guard`, run as part of the CI documentation lint) issued an
HTTP request to `api.eido.cam/health` while validating this file and received
**HTTP 405 Method Not Allowed**. That is not a health check and was not
intended as one — but a 405 means DNS resolved and a server answered, which is
inconsistent with "no DNS, pre-deploy". It does **not** establish that the eido
services are healthy, correctly configured, or serving the expected payload; a
405 is equally consistent with a proxy or placeholder responding to the wrong
HTTP method.

**What would settle it properly:** a dated `GET` against `eido.cam` and
`api.eido.cam/health` recorded with its response body (the as-built runbook
records the expected healthy body), or an `enclii ps` on the eido project.
Whichever way it resolves, the domain map needs updating — it currently
contradicts two same-day sibling documents.

### Other hostnames declared but unmapped

At least 11 hostnames are declared in a repository's own `enclii.yaml` but
appear in no row of the canonical route table — including
`inference.selva.town`, `dash.madfam.io`, four `tulana` hostnames,
`hcm-api.madfam.io`, three `inbox*.madfam.io` hostnames, `madlab.quest`,
`api.almanac.solar`, `docs.madfam.io`, and three `*.janua.dev` hostnames.
**The route table is not a complete inventory of declared hostnames.** Treat
"absent from the map" as "unknown", not as "not deployed".

Two specific unknowns worth naming:

- **`tulana.madfam.io`.** Recorded NXDOMAIN in an RFC dated 2026-04-28; recorded
  at HTTP 200 in an audit dated 2026-07-06; the registry says "deployed,
  Janua-gated". Whether all four declared tulana hostnames resolve today is
  unestablished. **Settled by:** a dated probe of the four, plus a route-map row.
- **`dash.madfam.io` (converge-dash).** Declared in its `enclii.yaml`; a
  2026-05-13 runbook records HTTP 200; a 2026-07-13 runbook lists six steps to
  take it from deployed to fully operational, **including enabling auth
  enforcement**, none of which is recorded as done. **Settled by:** the
  disposition of those six steps and whether an unauthenticated request
  currently returns content or redirects to login.

---

## Ecosystem-wide contracts

These are the cross-repo rules a new service must follow. They are contracts —
statements of what *should* be true — and where fleet conformance is known to be
partial, that is said.

### Identity

Every authenticated service verifies Janua JWTs against the JWKS at
`https://auth.madfam.io/.well-known/jwks.json`. **RS256 only — HS256 is
fail-closed** following the 2026-04-23 audit findings H3/H4. No service
implements custom auth, password login, or session management. Available
claims: `sub`, `email`, `roles`, `org_id`, and `rfc` (fiscal services only).

*Contract verified 2026-04-23. **Fleet conformance is partial** — the
2026-07-16 launch-readiness assessment rated the Janua SSO edge yellow rather
than green, and the private SSO uniformity matrix that would resolve per-surface
enforcement is recorded as unavailable (a session artifact, not committed).*

Integration detail: [`JANUA_INTEGRATION.md`](./JANUA_INTEGRATION.md).

### Inference

Every LLM-consuming service points its OpenAI SDK `base_url` at the
**standalone inference gateway** at `inference.selva.town`. Provider
credentials (Anthropic, OpenAI, DeepInfra, Together, Fireworks, SiliconFlow,
Moonshot) should live only on Selva.

> **This changed on 2026-07-07 and older docs are wrong.** The OpenAI-compatible
> `/v1` proxy was extracted out of `nexus-api` into its own deployable. The
> `nexus-api` `/v1` mount was **removed**; `api.selva.town/v1` returns 404.
> Three real callers were repointed. Any doc telling you to send inference
> traffic to `nexus-api` or to `selva.town/v1` is describing the pre-cutover
> world.
>
> *Source: `internal-devops/audits/2026-07-07-selva-gateway-and-cluster-rightsizing-session.md`
> and `internal-devops/rfcs/0034-selva-concerns-remediation.md`, verified
> 2026-07-07.*

**Known deviation from the credential-exclusivity half:** a 2026-07-09 platform
audit records at least one product service failing open to `api.openai.com`
with its own `OPENAI_API_KEY`, and a 2026-07-19 activation runbook writes an
OpenAI key into another service's secret. State the rule as a rule; deviations
are tracked privately.

### Payment attribution

`routecraft` emits `payment.succeeded`, signed
`x-madfam-signature: t=<unix-seconds>,v1=<hex hmac-sha256>` over the literal
`` `${t}.${rawBody}` ``, to exactly two receivers — Dhanam
(`POST /v1/billing/madfam-events`) and PhyndCRM
(`POST /api/webhooks/routecraft`). Idempotent by emitter `event_id`, 5-minute
replay window.

> **Designed, not flowing.** A 2026-07-08 verification against routecraft at a
> named commit found only the Conekta webhook emits (the Stripe path emits
> nothing), the `attribution` sub-object is never populated, there is no
> `payment.refunded`, and the emitter target secrets are absent from production
> manifests — so the fan-out is a silent no-op. See
> [`MONETIZATION_PATH_READINESS.md`](./MONETIZATION_PATH_READINESS.md).

### Data boundaries — own once, query everywhere

| Data | Owner | Rule |
|---|---|---|
| Identity and sessions | Janua | Federate; never duplicate |
| Bank transactions, billing ledger | Dhanam | Read via API; keep no local mirror |
| Mexican law and compliance rules | Tezca | Query `/api/v1/laws`; do not fork the dataset |
| CFDI / SAT / tax filings | Karafiel | Single authority |
| 3D geometry kernel | geom-core | Shared by Sim4D and Yantra4D |

### CORS

Explicit allowlist per service. Wildcards are banned — the rule traces to the
2026-04-23 audit findings H2/H5/H6. The newest service implements it literally:
meridian's API requires `CORS_ALLOWED_ORIGINS` and refuses to start without it
rather than defaulting to something permissive.

### Deployment

*"Core repos define the platform. Client repos define themselves."* Onboarding
a service to Enclii must not require modifying the enclii, janua or dhanam
repositories; all deployment configuration lives in the app's own repository.
If an onboarding cannot be done without a platform-repo edit, that is a
platform gap to file, not to route around (RFC 0014, zero-touch onboarding).

---

## Repository inventory

*Verified 2026-07-25 by live enumeration of the `madfam-org` GitHub
organisation.*

| Measure | Count |
|---|---|
| Repositories returned by the org listing | 99 |
| Of which forks | 3 |
| **Non-fork repositories** | **96** |
| Private | 27 |
| Public | 69 |
| Archived (non-fork) | 8 |

This reconciles cleanly against the private registry's own headline of
22 private + 69 public = 91 (that registry's figure carries `Last Verified:
2026-07-04`): five repositories were created after 2026-07-04, and two flipped
public → private in the same window.

Two corrections to registry claims, both **verified 2026-07-25**:

- `Auto-Claude`, `claudecodeui` and `gridfinity_extended_openscad` are recorded
  as "deleted from GitHub". All three **still exist in the org as forks**
  (`claudecodeui` archived; the other two not). The 2026-07-04 audit method
  almost certainly excluded forks.
- The registry's "4 archived" figure is understated; the live count of archived
  non-fork repositories is **8**.

**Visibility matters when reading any platform map.** Five of the twelve core
platform repositories are private as of 2026-07-25 — `karafiel`, `forgesight`,
`fortuna`, `avala`, and `dhanam` (which flipped private between 2026-07-16 and
2026-07-25). Public documents that link all twelve by `madfam-org/<repo>` path
are linking five URLs that 404 for anyone outside the organisation.

---

## Core platforms

| Platform | Repository | Role | Visibility (2026-07-25) |
|---|---|---|---|
| Enclii | `enclii` | PaaS control plane — all deploys route through it | Public |
| Janua | `janua` | OIDC/OAuth 2.0 provider; single-issuer per deployment | Public |
| Dhanam | `dhanam` | Billing and payment gateways (Stripe, Mercado Pago, SPEI) | **Private** |
| Selva | `selva-office` | LLM inference routing + agent orchestration (rename to `selva` pending) | Public |
| Karafiel | `karafiel` | Operational compliance — CFDI, NOM-151, e.firma, SAT | **Private** |
| Tezca | `tezca` | Mexican law oracle, informational; feeds Karafiel | Public |
| Cotiza | `digifab-quoting` | Quoting engine for fabrication and services | Public |
| ForgeSight | `forgesight` | Fabrication industry intelligence; pricing/vendor feed into Cotiza | **Private** |
| Pravara MES | `pravara-mes` | Fabrication-node routing and dispatch | Public |
| PhyndCRM | `phynd-crm` | Client-facing deliverables portal | Public |
| Fortuna | `fortuna` | Problem intelligence / zeitgeist analysis | **Private** |
| AVALA | `avala` | Learning verification (EC/CONOCER, DC-3) | **Private** (flipped 2026-07-16) |
| RouteCraft | `routecraft` | Trip-engine SaaS; canonical payment-attribution emitter | Public |

*Roles from `internal-devops/ecosystem/repo-registry.md` (verified 2026-07-04);
visibility from a live query 2026-07-25.*

---

## What was removed

| Removed | Reason |
|---|---|
| The entire "Upcoming: AutoChess Deployment" section, including deploy commands | Both repositories in it (`Auto-Claude`, `claudecodeui`) were recorded as gone in the 2026-07-04 audit and survive only as forks; **both target domains (`agents.madfam.io`, `agents-api.madfam.io`) are retired** and must not be resurrected. The claimed "5900-5999 port block (already allocated)" corresponds to no block in `PORT_ALLOCATION.md`. |
| "All issues resolved as of May 9, 2026" | Contradicted by two later dated records. A blanket clearance is not a status. |
| Green dots on every service and route | Unverifiable from a public repo, and at least two were demonstrably false against later records. |
| Named cloudflared pods with ReplicaSet hashes | Pod identities change on every rollout and cannot be checked from here. |
| "Janua Summary: 5/5 pods healthy, 202 REST endpoints, 8 SDKs" | Undated. Counted directly on 2026-07-25: **352** route decorators under `janua/apps/api/app/routers/` and **9** SDK packages (`typescript`, `nextjs`, `react`, `react-native`, `vue`, `sveltekit`, `python`, `go`, `flutter`). Pod health is not published here. |
| "Enclii Summary: 7/7 pods healthy" | Stale count against an incomplete inventory — four routed Enclii-namespace services were missing from the list. |
| A ten-row "Domain Routing" table covering only `*.janua.dev` and `*.enclii.dev` | It implied the ecosystem is ten routes wide. The canonical map carries roughly 70 active production routes across 20+ platforms; the public-safe form is above. |
| "grafana — Dashboards (pending config)" | Overtaken; dashboards are provisioned. Health is still not asserted here. |
| Enclii CLI command block with `--api-endpoint` and an exported API token | Superseded by `enclii login` / scoped `ENCLII_TOKEN`; and a public doc should not model token handling. |

---

## Related

- [`INFRASTRUCTURE_STATUS.md`](./INFRASTRUCTURE_STATUS.md) — declared
  configuration, local dev, GitOps, admission policy
- [`JANUA_INTEGRATION.md`](./JANUA_INTEGRATION.md) — the auth contract
- [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md) — port registry
- [`MONETIZATION_PATH_READINESS.md`](./MONETIZATION_PATH_READINESS.md) — payment
  contract status
- [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md) — Lane B rules
