# Port Allocation — reality check

> **Last verified:** 2026-04-17
>
> **TL;DR:** The ecosystem-wide 4xxx/5xxx port scheme described below
> is **aspirational**. Only Janua and Enclii fully follow it; every
> other service uses framework defaults (Next.js `3000`, NestJS /
> Django `8000`, `4200`, etc.). In production this is a no-op —
> K8s namespaces isolate ports, and Cloudflare Tunnel routes by
> hostname, not container port. The scheme matters **only for local
> dev when you try to run multiple services on a single laptop**, and
> even then only the `enclii local up`-managed subset enforces it.

---

## What actually happens today

### Production (K8s on the 3-node cluster)

Every pod has its own network namespace. The container port is an
internal detail; Cloudflare Tunnel routes traffic from
`foo.madfam.io` → K8s Service:80 → container port. **Two pods can
both listen on `3000` and never see each other.** Port allocation is
irrelevant here.

### Local development

Two code paths today:

1. **`enclii local up`** (preferred) — boots shared infra (Postgres,
   Redis, MinIO, MailHog) plus Janua (4100-4104) + Enclii
   (4200-4201) with scheme-compliant host ports. **This is the only
   path that actively follows the scheme.**
2. **Running any other repo's `pnpm dev` / `make dev`** — uses
   whatever port the repo's own `package.json` or Makefile
   declares, usually `3000` (Next.js), `4200` (NestJS default),
   `8000` (Django / FastAPI), or a repo-specific override (`3050`
   for karafiel web, `3040` for dhanam web, etc.). If you boot two
   of these on the same laptop, you will hit conflicts — resolve
   with `PORT=<n>` or the repo's documented override flag.

### Ports services actually declare (from their `.enclii.yml`)

| Repo | Declared container ports | Scheme-compliant? |
|---|---|---|
| enclii | 8080 (api), 3000 (ui) | API yes (mapped to 4200 in local), UI no |
| janua | 8080 (api), 3000 (ui) | API yes (mapped to 4100 in local), UI no |
| dhanam | 4200 | No (generic NestJS default) |
| karafiel | 3050 | No (Next.js override) |
| tezca | 3050 | No |
| yantra4d | 3050 | No |
| forgesight | 8000 | No (Django default) |
| fortuna | 4700, 8000, 3000 | Fortuna-block claim matches (4700), APIs on 8000 |
| phyne-crm | 4700, 8000, 3000 | Collides with Fortuna's 4700, but they're in different prod namespaces |
| rondelio | 4700, 8000, 3000 | Same |
| routecraft | 3000, 3002, 8081 | No |
| sim4d | 3000 | No |
| forj | 3000 | No |
| coforma-studio | 3000 | No |
| ceq | 3000 | No |
| avala | 3000 | No |
| bloom-scroll | 5200, 80 | **Yes** (52xx block) |
| primavera3d | 3000 | No |
| nuit-one | 3000 | No |
| blueprint-harvester | 8000, 3000 | No |
| digifab-quoting | 3000 | No |
| pravara-mes | 3000 | No |
| autoswarm-office | 3000 | No |

**Reality:** 3 out of 23 production services follow the scheme. The
other 20 use framework defaults.

---

## Aspirational scheme (original design)

This is the scheme the doc set out to describe. Kept below for
reference and because it still informs new-service port picks when
someone does bother to set `PORT` explicitly.

### Design principles

1. **100 ports per service** — each platform gets a 100-port block.
2. **Layer-based grouping** — ports grouped by Solarpunk Stack layer.
3. **Predictable offsets** — API at `+00`, Web at `+01`, Admin at
   `+02`, etc.
4. **Collision avoidance** — stays out of the `3000` (React /
   Next.js default), `5000` (Flask default), `8000` / `8080`
   (Django / generic API) common-conflict zones.

### Port range strategy

| Range | Layer | Services |
|---|---|---|
| 4100-4199 | Soil — Janua | Janua API (4100), Dashboard (4101), Admin (4102), Docs (4103), Website (4104) |
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
| 6000-6999 | Reserved | Future expansion |

**Reserved (do NOT use):** `4000-4099` (near Webpack HMR),
`5000-5049` (Flask default), `3000-3999` (Next.js defaults),
`8000-8999` (Django defaults). Modern reality: most services
happily live on `3000` because they're in their own namespace.

---

## When this doc actually matters

- **Before `PORT=<n>` hunting** — if you're setting `PORT=3001` on
  your dev laptop because `3000` is taken, picking from this scheme
  keeps you out of the defaults and avoids the next conflict.
- **Writing new `enclii local up`-managed boot code** — stick to
  the layer's allocated block so the printed service URLs stay
  predictable.
- **Never** — in production. The K8s + Cloudflare Tunnel chain
  makes container ports invisible.

---

## Follow-up work (honest punch-list)

1. Either **retire this doc** entirely in favour of a short "local
   dev port conventions" section in each repo's README, or
   **enforce the scheme** in `enclii local up` for all ecosystem
   services (not just Janua + Enclii).
2. Fix the overlap between Fortuna / PhyneCRM / Rondelio all
   declaring `4700` in their `.enclii.yml` (no-op in prod because
   they're in different namespaces, but misleading to anyone
   reading the file).
3. Add a local-dev port registry table to each app's root README so
   the default `pnpm dev` port is discoverable without grep.
