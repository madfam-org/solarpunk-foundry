# Federated local-development architecture — historical record

**Status: HISTORICAL. Superseded.**
**Describes: 2025-11-24. Reviewed and labelled: 2026-07-25.**

> ## Read this first
>
> This document records a **local development** refactor completed on
> **2025-11-24**: moving from a single monolithic `docker-compose.yml` to
> per-repository compose files sharing one infrastructure stack.
>
> It is kept because the reasoning is sound and the pattern still describes the
> compose fallback path. It is **not** current guidance:
>
> - **The preferred local path is now `enclii local up`**, which manages shared
>   infrastructure plus Janua and Enclii directly. See
>   [`../DOGFOODING_GUIDE.md`](../DOGFOODING_GUIDE.md).
> - **This has never described production.** Production is k3s with ArgoCD
>   GitOps; `docker-compose` plays no part in it.
> - The previous revision was titled "Federated Architecture Implementation
>   **Complete**" while carrying an unstarted "Next Steps" list. A document
>   cannot declare completion and list unstarted work; that contradiction is
>   why the title changed.
>
> Corrections to factual errors in the original are inline below, marked
> **[Corrected 2026-07-25]**. The original text is otherwise preserved.

> **Terminology note.** The original opened by referring to "the MADFAM Revenue
> Shield". That name appears nowhere in the current private operational record,
> the repository registry, the domain map, or any 2026 roadmap. It is a retired
> internal project name from 2025 and carries no current meaning. Read it as
> "the MADFAM local development stack".

---

## What the refactor did

Replaced one monolithic compose file with:

1. **A shared infrastructure compose file** providing PostgreSQL, Redis and
   MinIO for every service.
2. **Per-repository compose files** that consume that shared infrastructure
   rather than each standing up its own database.

### Shared infrastructure

- **PostgreSQL** (5432) — one instance, multiple isolated databases
- **Redis** (6379) — one instance, database-index isolation
- **MinIO** (9000 / 9001) — S3-compatible object storage with pre-provisioned
  buckets

> **[Corrected 2026-07-25] Database names.** The original listed `janua_db`,
> `cotiza_db`, `forgesight_db`, `dhanam_db`, `avala_db`, `fortuna_db` and
> `blueprint_db`. **None of those exist.** The current init script
> (`ops/local/init-databases.sql`) creates nine databases, all with a `_dev`
> suffix: `janua_dev`, `enclii_dev`, `forgesight_dev`, `fortuna_dev`,
> `cotiza_dev`, `avala_dev`, `dhanam_dev`, `sim4d_dev`, `forj_dev`.
> `blueprint_db` has no creation statement anywhere. Verified 2026-07-25.

> **[Corrected 2026-07-25] MailHog.** The current shared stack also includes
> MailHog (SMTP 1025, UI 8025), which post-dates this document.

### Boot sequence

| Phase | Zone | Services |
|---|---|---|
| 0 | Bedrock | Shared infrastructure: PostgreSQL, Redis, MinIO |
| 1 | Infrastructure | Janua (API, admin, docs) |
| 2 | Data | ForgeSight (API, crawler, discovery, extractor, normalizer, admin UI) |
| 3 | Business | Cotiza / `digifab-quoting` (API, web, worker) |

> **[Corrected 2026-07-25] Ports.** The original assigned specific ports per
> phase (ForgeSight admin `4302`, Cotiza worker `4510`, and others). Several
> appear in no registry and none should be treated as current. The authority
> for a service's port is that repository's own `enclii.yaml` / `.enclii.yml`;
> the scheme itself, with its honest compliance statement, is in
> [`../PORT_ALLOCATION.md`](../PORT_ALLOCATION.md).

### Connection strings

Each app's `.env` points at the shared infrastructure rather than a local
sidecar — same host, different database and different Redis index per service.
The current database names are in the correction above.

---

## Problems it solved

| Before | After |
|---|---|
| Every app tried to bind 5432 | One PostgreSQL, isolated databases |
| Every app tried to bind 6379 | One Redis, database-index isolation |
| Multiple apps tried to bind 3000 | Per-app ports |

Benefits claimed at the time — repo isolation, no port conflicts, ability to
run one app without the full stack, one database server instead of nine — all
still hold for the compose path.

---

## Unfinished work (as of 2025-11-24)

Recorded as it stood. Whether any of it was later completed was **not** checked
in this pass; `enclii local up` largely made the question moot for the services
it manages.

- Remove `postgres` / `redis` service definitions from each repo's compose file
- Point each app at the shared external network
- Verify the boot sequence end to end

> **[Corrected 2026-07-25] Cited files.** The original's "Files Created" list
> named `infrastructure/postgres/init-shared-dbs.sql` and
> `DOCKER_COMPOSE_ANALYSIS.md`. Neither path exists. The real paths are
> `ops/db/init-shared-dbs.sql` and `ops/local/init-databases.sql`; there is no
> `DOCKER_COMPOSE_ANALYSIS.md` anywhere in the repository.

---

## Current guidance

| Need | Go to |
|---|---|
| Start a local environment | [`../DOGFOODING_GUIDE.md`](../DOGFOODING_GUIDE.md) — `enclii local up` |
| Database names and shared infra | same document; source is `ops/local/init-databases.sql` |
| Ports | [`../PORT_ALLOCATION.md`](../PORT_ALLOCATION.md) |
| Production architecture | [`CLUSTER_ARCHITECTURE.md`](./CLUSTER_ARCHITECTURE.md) |
| Ecosystem narrative | [`SYMBIOSIS.md`](./SYMBIOSIS.md) |
