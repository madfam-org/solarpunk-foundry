# Port Allocation — reality check

> **Last verified:** 2026-07-25
>
> **Verified against:** every `enclii.yaml` and `.enclii.yml` at the root of the
> 43 MADFAM repositories checked out locally — 35 of them carry one or both —
> parsed rather than eyeballed; plus `enclii/packages/cli/internal/cmd/local.go`
> for what `enclii local up` actually binds. No production probing was performed:
> this document describes what repositories **declare**, which is not the same
> thing as what is **running**. Where those differ, the repo file is the only
> half I can see from here.
>
> **TL;DR:** the ecosystem-wide 4xxx/5xxx port scheme below is **aspirational**.
> By declared container port, **exactly one service follows it.** That is fine
> and mostly harmless — in production the container port has no effect at all.
> It matters for two narrow things, and [those two things](#when-the-number-actually-matters)
> are the reason this document still exists.

---

## The one thing worth taking away

**In production, the container port you choose has no effect.**

Every pod gets its own network namespace. Cloudflare Tunnel routes by
*hostname* to a Kubernetes Service on port 80, and the Service's `targetPort`
maps to whatever the container listens on:

```
Internet → Cloudflare edge → cloudflared pods → K8s Service:80 → container:<any port>
```

Two pods can both listen on `3000` and never see each other, in the same
cluster or even the same namespace. There is no global port registry to
collide with, because there is no global port space. A service that picks its
framework's default is not doing anything wrong.

### When the number actually matters

Only twice.

**1. Internal consistency within a single service.** The number has to agree
with itself in four places, or traffic fails:

| Must agree | Where |
|---|---|
| `containerPort` | the Deployment |
| `targetPort` | the Service |
| liveness / readiness probe port | the Deployment |
| `ports:` in the generated NetworkPolicy | `enclii.yaml` → `spec.network.services[].port` |

The NetworkPolicy one is the trap. The Enclii control plane **generates**
NetworkPolicies from the `network.services[].port` values in `enclii.yaml` and
applies them through the Kubernetes API — they are deliberately not committed to
git, so you cannot review them in a PR. If that declared number does not
intersect the pod's real `containerPort`, **the CNI drops the traffic silently**.
No error, no event, no log line. It surfaces as a page that will not render or a
request that times out, and it will be debugged as an application bug for hours
before anyone suspects the network.

This is a live failure mode, not a hypothetical. As of this verification,
`converge-dash/enclii.yaml` declares `runtime.port: 80` and
`network.services[converge-web].port: 4581` — **for the same service name, in
the same file.** One of the two is wrong; which one cannot be determined from
the repository alone. It is the only such intra-file disagreement across all 28
`enclii.yaml` files, so it reads as an oversight rather than a pattern.

**2. Local development.** When several services run on one laptop they share one
host port space, and there they genuinely do collide. This is the only context
in which the aspirational scheme below buys you anything.

Everything else about port choice is aesthetics.

---

## What services actually declare

Verified 2026-07-25 by parsing every root `enclii.yaml` / `.enclii.yml` on disk.
"Container ports declared" means `spec.runtime.port` plus any `services[].port`
— the ports a pod is expected to listen on. NetworkPolicy-only ports are not
counted here.

| Repo | Config | Declared container ports | Block the scheme assigns | Inside it? |
|---|---|---|---|---|
| `accionables-madlab` | `enclii.yaml` | accionables-madlab `80` | — none — | — |
| `avala` | `enclii.yaml` + `.enclii.yml` | avala-api `4000`; avala-web `3000` | 4600-4699 | no |
| `bloom-scroll` | `enclii.yaml` + `.enclii.yml` | bloom-api `5200`; bloom-web `80` | 5200-5299 | **yes** |
| `blueprint-harvester` | `enclii.yaml` + `.enclii.yml` | **none declared** | 5400-5499 | n/a |
| `ceq` | `enclii.yaml` | **none declared** | — none — | — |
| `coforma-studio` | `enclii.yaml` + `.enclii.yml` | coforma-studio `3000` | 5050-5149 | no |
| `converge-dash` | `enclii.yaml` | converge-web `80` *(but see the mismatch above)* | — none — | — |
| `dhanam` | `enclii.yaml` + `.enclii.yml` | dhanam `80`; dhanam-web `4200` | 4700-4799 | no |
| `digifab-quoting` (Cotiza) | `enclii.yaml` + `.enclii.yml` | digifab-quoting `3000` | 4500-4599 | no |
| `eido` | `enclii.yaml` | eido-api `8000`; eido-web `3000` | — none — | — |
| `enclii` | `.enclii.yml` | switchyard-api `8080`; switchyard-ui `3000` | 4200-4299 | no |
| `factlas` | `enclii.yaml` | **none declared** | — none — | — |
| `forgesight` | `enclii.yaml` + `.enclii.yml` | forgesight `8000`; forgesight-api `8000` | 4400-4499 | no |
| `forj` | `enclii.yaml` + `.enclii.yml` | forj `3000` | 4900-4999 | no |
| `fortuna` | `.enclii.yml` | fortuna-api `4700`; fortuna-nlp `8000`; fortuna-web `3000` | 4300-4399 | no |
| `janua` | `enclii.yaml` | janua `8080` | 4100-4199 | no |
| `karafiel` | `enclii.yaml` + `.enclii.yml` | karafiel `3050` | — none — | — |
| `madfam-crawler` | `.enclii.yml` | crawler-api `8000`; redis-broker `6379` | — none — | — |
| `madfam-site` | `enclii.yaml` + `.enclii.yml` | madfam-site `3000` | 5500-5599 | no |
| `meridian` | `enclii.yaml` | meridian-api `8000`; meridian-app `3000`; meridian-landing `3000`; meridian-admin `3000` | — none — | — |
| `phynd-crm` | `enclii.yaml` + `.enclii.yml` | phynd-crm-web `3000` | — none — | — |
| `pravara-mes` | `enclii.yaml` | pravara-mes `4500` | — none — | — |
| `primavera3d` | `.enclii.yml` | primavera3d `3000` | 5700-5799 | no |
| `proton-bridge-pipeline` | `enclii.yaml` | proton-bridge-engine `4400`; proton-bridge-dashboard `4401` | — none — | — |
| `rondelio` | `enclii.yaml` | web `3000`; studio `3010`; admin `3020`; gateway `7000`; benchmarks `7010`; processing `7020`; search `7030`; exports `7040`; ingestion `7050`; simulator `7060`; play `8080` | — none — | — |
| `routecraft` | `enclii.yaml` + `.enclii.yml` | dashboard `3000`; admin `3002`; bff `8081` *(from `.enclii.yml` only)* | — none — | — |
| `selva-office` | `enclii.yaml` | nexus-api `4300`; colyseus `4303`; gateway `4304`; inference-gateway `4306`; office-ui `3000`; admin `3000` | — none — | — |
| `server-auction-tracker` | `enclii.yaml` | deal-sniper `4205` | — none — | — |
| `sim4d` | `.enclii.yml` | sim4d `3000` | 4800-4899 | no |
| `solarpunk-foundry` | `.enclii.yml` | npm-registry `4873` | — none — | — |
| `subtext` | `.enclii.yml` | api `8000`; realtime `8001`; web `3000` | — none — | — |
| `symbiosis-hcm` | `enclii.yaml` + `.enclii.yml` | symbiosis-hcm `8000` | — none — | — |
| `tezca` | `enclii.yaml` | tezca-api `8000` | — none — | — |
| `tulana` | `enclii.yaml` | tulana `80` | — none — | — |
| `yantra4d` | `enclii.yaml` | yantra4d `5000` | — none — | — |

### The count, with the arithmetic shown

The previous edition of this document claimed **"3 out of 23 production services
follow the scheme."** Measured against declared container ports, the real figure
is **1**.

- **35** repos on disk carry a root `enclii.yaml` and/or `.enclii.yml`.
- **3** of those declare no container port anywhere at all — `blueprint-harvester`,
  `ceq`, `factlas`. For these the number is not "wrong", it is simply absent.
- **14** repos are ones the scheme actually names a block for. The other 21 have
  **no block assigned**, so "compliant?" is not a meaningful question for them —
  a column the old table answered "No" for services the scheme never addressed.
- **1** repo declares a port inside its own assigned block: `bloom-scroll`
  (`bloom-api` on `5200`, inside 5200-5299). It does so in the *legacy*
  `.enclii.yml`, not in `enclii.yaml`.
- Against the 23 rows of the old table specifically: 22 are on disk with a
  config (`nuit-one` has neither file), and **1** of them complies.

**Why the old figure was 3.** It counted Janua and Enclii as compliant. They are
not, by declared container port — Janua declares `8080`, Enclii declares `8080`
and `3000`. They qualify only through the *host* ports that `enclii local up`
maps them to on a developer laptop (Janua 4100-4104, Enclii 4200-4201, verified
in `enclii/packages/cli/internal/cmd/local.go`). That is a real and useful
property, but it is a local-dev convenience, not adherence by the services
themselves. Counting it made the scheme look three times as adopted as it is.

### Other corrections to the previous table

- `fortuna` was annotated "Fortuna-block claim matches (4700)". It does not:
  this document assigns Fortuna **4300-4399** and gives **4700-4799** to Dhanam.
  Fortuna declaring `4700` is a claim on Dhanam's block, not a match.
- The advertised three-way `4700` collision between Fortuna, PhyndCRM and
  Rondelio **no longer exists**. Only `fortuna` declares `4700` today;
  `phynd-crm` declares `3000` and `rondelio` declares no `4700` at all. Two
  thirds of that punch-list item resolved themselves.
- `tezca` and `yantra4d` were listed at `3050`. Neither declares it — tezca
  declares `8000`, yantra4d `5000`. `3050` belongs to `karafiel`, which the old
  table got right.
- `rondelio` and `phynd-crm` were both listed as `4700, 8000, 3000`. Neither
  declares any of that set as written.
- `routecraft` was listed as `3000, 3002, 8081`, which is correct — but only in
  its legacy `.enclii.yml`. Its newer `enclii.yaml` lists the same services and
  declares **no ports for any of them**.
- `avala`, `coforma-studio`, `digifab-quoting`, `forj`, `phynd-crm` and
  `bloom-scroll` are in the same position: the newer `enclii.yaml` declares no
  ports, the legacy `.enclii.yml` does. **9 of the 13 repos carrying both files
  disagree between them.** The old table cited `.enclii.yml` as its source
  throughout, which for most repos is now the older of the two.

---

## Local development

Two code paths.

1. **`enclii local up`** (preferred) — boots shared infrastructure and then
   Janua on 4100-4104 and Enclii on 4200-4201, with scheme-compliant *host*
   ports. This is the only path that actively follows the scheme.
   `enclii local infra` starts the shared layer only: **PostgreSQL, Redis,
   MinIO, MailHog** (verified in `local.go`, 2026-07-25 — Verdaccio is not
   among them, contrary to at least one other doc in this repo).
2. **Any other repo's `pnpm dev` / `make dev`** — uses whatever the repo's own
   `package.json`, Makefile or dev script declares, typically `3000`, `4200`,
   `8000`, or a repo-specific override. Boot two of these together and you will
   hit a conflict. Resolve with `PORT=<n>` or the repo's documented flag.

> **Clarification (2026-06-13, still true 2026-07-25):** Dhanam's local-dev port
> is referenced inconsistently across docs (`4200` here, `4700/4701` in
> `DOGFOODING_GUIDE.md`, `3030/3031` in `ops/local/`). The source of truth for
> local ports is `enclii local up` plus each repo's own config and dev script.
> **Production is unaffected** — namespace and hostname routing make it moot.

---

## Aspirational scheme (original design)

> **This section is aspirational and has been since it was written.** It is kept
> because it is a reasonable tiebreaker when you *are* setting `PORT=` by hand,
> and because deleting it would not make the services that ignore it any more
> consistent. It is **not** a registry, nothing enforces it, and nothing checks
> it in CI.
>
> **A new service is under no obligation to claim a block.** Framework defaults
> are fine. Picking `3000` costs nothing in production. What a new service *does*
> owe is internal consistency — see [the two cases that matter](#when-the-number-actually-matters).

### Design principles

1. **100 ports per service** — each platform gets a 100-port block.
2. **Layer-based grouping** — grouped by Solarpunk Stack layer.
3. **Predictable offsets** — API at `+00`, Web at `+01`, Admin at `+02`.
4. **Collision avoidance** — stays out of the `3000` (Next.js), `5000` (Flask),
   `8000`/`8080` (Django / generic API) conflict zones.

### Port range strategy

| Range | Layer | Services |
|---|---|---|
| 4100-4199 | Soil — Janua | API (4100), Dashboard (4101), Admin (4102), Docs (4103), Website (4104) |
| 4200-4299 | Soil — Enclii | Switchyard API (4200), UI (4201), Dispatch (4203), Status (4204) |
| 4300-4399 | Roots — Fortuna | Fortuna API (4300+), UI, analyzer |
| 4400-4499 | Roots — ForgeSight | ForgeSight API (4400+), UI, crawler |
| 4500-4599 | Stem — Cotiza | Cotiza Studio API (4500+), UI, admin |
| 4600-4699 | Stem — AVALA | AVALA API (4600+), UI, admin, assess |
| 4700-4799 | Fruit — Dhanam | Dhanam API (4700+), Web, admin |
| 4800-4899 | Fruit — Sim4D | Sim4D Studio (4800+), Collaboration WS (+20) |
| 4900-4999 | Fruit — Forj | Forj API, storefront, admin |
| 5050-5149 | Fruit — Coforma | Coforma Studio (skips 5000 to avoid Flask default) |
| 5150-5249 | Fruit — Galvana | Galvana API (5150+), UI, +60 compute |
| 5200-5299 | Content — BloomScroll | BloomScroll API/web (5200+), +10 crawler |
| 5300-5399 | Content — Compendium | almanac.solar (5300+) |
| 5400-5499 | Content — Blueprint | Blueprint Harvester (5400+), +10 indexer |
| 5500-5599 | Sites — madfam-site | |
| 5600-5699 | Sites — madfam | |
| 5700-5799 | Sites — primavera3d | |
| 6200-6299 | Fruit — Fashion Cabinet | `fc` single-service (API + landing + studio) on `6200`; declared in `fashion-cabinet/enclii.yaml` (claimed 2026-08-17) |
| 6000-6199, 6300-6999 | Reserved | Future expansion |

**Reserved (do NOT use):** `4000-4099` (near Webpack HMR), `5000-5049` (Flask),
`3000-3999` (Next.js), `8000-8999` (Django). Modern reality: most services
happily live on `3000` because they are in their own namespace.

### Known defects in the scheme itself

Recorded so nobody spends time discovering them again:

- **The scheme overlaps itself.** Galvana is given `5150-5249` and BloomScroll
  `5200-5299`. `5200-5249` is assigned to both. BloomScroll — the only compliant
  service in the ecosystem — sits exactly on the contested boundary.
- **It names services that no longer exist under those names**, including
  Galvana and Compendium. `almanac.solar`, listed under Compendium at 5300-5399,
  is served by `bloom-scroll` today, whose block is 5200-5299.
- **It has holes.** `5800-5899` is assigned to nobody, which is where the
  unbuilt `autochess` sketch proposed to sit. `5900-5999` is likewise
  unassigned — a doc elsewhere in this repo refers to a 5900-5999 block as
  "already allocated"; no such allocation exists here.
- **`6000-6999` is unclaimed** as of this verification. A recent internal record
  described `meridian` as having taken `6100-6199` out of that range. That is not
  what the repository declares today: as re-read at 17:44 on 2026-07-25,
  `meridian/enclii.yaml` declares `8000`/`3000`/`3000`/`3000`. That file was
  modified minutes before this check, so treat the meridian row above as the
  most volatile line in the table and re-read the file rather than trusting it.
- **Nothing enforces any of this.** There is no CI check, no admission policy,
  and no linter for port-block adherence, which is the honest explanation for a
  1-in-14 adherence rate.

---

## Follow-up work (honest punch-list)

Re-scoped 2026-07-25. Two of the three previous items are closed.

1. ~~Fix the Fortuna / PhyndCRM / Rondelio `4700` overlap.~~ **Mostly resolved on
   its own** — only `fortuna` still declares `4700`. Remaining: `fortuna` is
   sitting in Dhanam's block. Cosmetic; a no-op in production. Low priority.
2. **Decide whether this document should survive at all.** The choice has not
   changed: either *retire the scheme* and keep only the two-cases-that-matter
   section plus a per-repo local-dev note in each README, or *enforce it* in
   `enclii local up` for every service rather than Janua and Enclii alone. What
   should not continue is a third state where the scheme is neither followed nor
   withdrawn and gets re-cited downstream as a registry it is not.
3. **Fix the Fortuna / ForgeSight block swap still living in `ops/`.** The prose
   docs that carried this were corrected on 2026-07-25, but two runnable files
   were not and still contradict the table above:
   `ops/bin/madfam.sh:286-287` prints "ForgeSight 4300-4399 / Fortuna 4400-4499"
   and health-checks ForgeSight on 4300, and `ops/local/init-databases.sql:28,33`
   carries the same swapped comments. Both are outside this document's scope but
   are the last places the swap survives. *(Verified 2026-07-25.)*
4. **Converge on one config-file convention.** 13 repos carry both `enclii.yaml`
   and `.enclii.yml`; 9 of those disagree about ports, usually because the newer
   `enclii.yaml` omits them entirely. Until that is settled, "what port does this
   service use?" has two answers per repo and no rule for choosing.
5. **Resolve the `converge-dash` intra-file port disagreement** (`runtime.port:
   80` vs NetworkPolicy `4581` for `converge-web`). This is the one entry in the
   table with a plausible production consequence rather than a cosmetic one.
6. **Add a declared-vs-deployed reconciliation.** This document can only see what
   repos declare. Whether those numbers match the ports the running Services and
   NetworkPolicies actually use is not checkable from a public repository, and
   internal records are known to disagree with repo declarations for several
   services. Settling it needs an operator with cluster read access; the
   discrepancies are tracked privately in `internal-devops`.
7. **Add a local-dev port line to each app's root README**, so the default
   `pnpm dev` port is discoverable without grep. *(Carried forward — still not
   done.)*

---

*Public-safe: declared container ports from repository config only. No node identifiers, IP addresses, tunnel identifiers, or production topology.*
