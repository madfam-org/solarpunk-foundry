# MADFAM Local Development (Dogfooding) Guide

**Last verified: 2026-07-25** — against
`enclii/packages/cli/internal/cmd/local.go`,
`solarpunk-foundry/ops/local/docker-compose.shared.yml`,
`solarpunk-foundry/ops/local/init-databases.sql`, and
`solarpunk-foundry/ops/bin/madfam.sh`.

> The previous revision was dated "January 2026", led with per-repo
> `docker compose up -d`, listed PostgreSQL databases that are created nowhere,
> published a production hostname that does not exist, and instructed readers to
> verify a shared JWT secret that should not exist. All four are corrected here.

---

## Quick start

```bash
# Shared infra + Janua + Enclii
enclii local up

# Shared infrastructure only (Postgres, Redis, MinIO, MailHog)
enclii local infra

# Specific services
enclii local up janua
enclii local up janua enclii

enclii local status
enclii local logs [service]
enclii local logs -f

enclii local down
enclii local down --keep-infra    # leave databases running
```

`up`, `down`, `status`, `logs` and `infra` are the complete subcommand set.
`enclii local up` with no arguments starts `janua` and `enclii`.
*Verified 2026-07-25 in `enclii/packages/cli/internal/cmd/local.go`.*

This is the preferred path. The `docker compose` route below still works and is
kept as a fallback, but it is the older mechanism and it is where most of the
drift in this document came from.

---

## Shared infrastructure

Declared in `ops/local/docker-compose.shared.yml`. *Verified 2026-07-25 by
parsing the file.*

| Service | Container | Host ports |
|---|---|---|
| PostgreSQL | `madfam-postgres-shared` | 5432 |
| Redis | `madfam-redis-shared` | 6379 |
| MinIO (API + console) | `madfam-minio-shared` | 9000, 9001 |
| MinIO provisioner | `madfam-minio-provisioner` | — |
| MailHog (SMTP + UI) | `madfam-mailhog` | 1025, 8025 |

Docker network: **`madfam-shared-network`**.

**Verdaccio is not part of local infrastructure.** The private npm registry
(`npm.madfam.io`) runs in the cluster from manifests in the `enclii`
repository. If a document tells you `enclii local infra` starts Verdaccio, it
is wrong — the CLI's own help text lists exactly four services.

> Cross-file inconsistency worth knowing: the repository-root
> `docker-compose.yml` declares a different network name (`madfam-network`) and
> a different Postgres password than `.env.example`. `ops/local/` is what the
> CLI uses. Root-level files are outside this document's scope.

---

## PostgreSQL databases

Created by `ops/local/init-databases.sql`. *Verified 2026-07-25 by reading the
`CREATE DATABASE` statements.* Nine databases, all `*_dev`:

| Database | Owner | Service |
|---|---|---|
| `janua_dev` | `janua` | Identity |
| `enclii_dev` | `enclii` | PaaS control plane |
| `forgesight_dev` | `forgesight` | Fabrication industry intelligence |
| `fortuna_dev` | `fortuna` | Problem intelligence |
| `cotiza_dev` | `cotiza` | Quoting (repo `digifab-quoting`) |
| `avala_dev` | `avala` | Learning verification |
| `dhanam_dev` | `dhanam` | Billing and payments |
| `sim4d_dev` | `sim4d` | CAD/simulation |
| `forj_dev` | `forj` | Fabrication commerce |

> **Correction.** The previous revision listed `madfam`, `janua_db`,
> `cotiza_db`, `forgesight_db`, `dhanam_db`, `fortuna_db`, `avala_db` and
> `blueprint_db`. **None of those exist.** The `_db` suffix comes from a
> superseded scheme; `blueprint_db` has no creation statement anywhere; and
> `enclii_dev`, `sim4d_dev` and `forj_dev` were missing entirely.

Local passwords are development values of the form `<service>_dev`, readable in
the init script. They are not secrets and have no production counterpart.

---

## Ports

This guide deliberately does **not** restate the port scheme. Duplicating it is
why several public documents disagreed with each other and with the registry.

- The scheme, and its own honest account of how much of it is followed:
  [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md).
- The authority for any one service: that repository's `enclii.yaml` (or legacy
  `.enclii.yml`), and for the CLI-managed subset, `enclii local status`, which
  prints the URLs it actually bound.

The only ports worth memorising are the shared-infrastructure ones in the table
above, because they are stable and shared.

---

## Redis database index allocation

The convention below is **aspirational and unverified**. It is recorded here
because it exists nowhere else and is occasionally useful, not because it has
been checked against running services. Several entries name platforms that no
longer exist under those names.

*Provenance: carried forward from earlier revisions of this document. It was
previously attributed to `PORT_ALLOCATION.md`, which does not and never did
contain a Redis allocation table — that citation was false and is removed.*

| DB | Service |
|---|---|
| 0 | Janua |
| 1 | Enclii |
| 2 | ForgeSight |
| 3 | Fortuna |
| 4 | Cotiza |
| 5 | AVALA |
| 6 | Dhanam |
| 7 | Sim4D |
| 8 | Forj |
| 9 | Coforma |
| 10–15 | claimed by earlier platform names (Galvana, BloomScroll, Compendium, Blueprint, CEQ, Furnace) — several of these names are retired |

**What would settle it:** a `CLIENT LIST`/`INFO keyspace` sample against a
running local Redis, or an explicit allocation declared in each repo's config.
Until then, treat a collision as likely and set the index explicitly.

---

## Fallback: the legacy `madfam.sh` script

`ops/bin/madfam.sh` predates `enclii local`. It is still present and still
works, with two caveats.

```bash
cd ~/labspace/solarpunk-foundry/ops/bin
./madfam.sh start
./madfam.sh status
./madfam.sh stop
./madfam.sh stop --clean     # removes volumes
./verify_databases.sh
./debug_logs.sh [service]
```

**Caveat 1 — it declares 10 services, not 18.** *Verified 2026-07-25 by reading
the service arrays:*

| Group | Services |
|---|---|
| Core | `janua`, `forgesight`, `digifab-quoting`, `madfam-site` |
| Portfolio | `madfam`, `primavera3d` |
| Platform | `dhanam`, `fortuna`, `sim4d` |
| Utility | `electrochem-sim` |

**Caveat 2 — two of those ten cannot start locally.** `madfam` and
`electrochem-sim` have no checkout in `~/labspace`, so `./madfam.sh full` will
not bring them up. (`madfam` is also not a repository name in the organisation;
see [`LICENSING_STRATEGY.md`](./LICENSING_STRATEGY.md).)

### Per-repository compose

```bash
cd ~/labspace/janua/deployment && docker compose up -d
cd ~/labspace/digifab-quoting  && docker compose up -d
cd ~/labspace/forgesight       && docker compose up -d
```

Each repo's compose file is that repo's business; check its README before
assuming service names.

---

## Health checks

Rather than a table of local health URLs — which drifted every time a port
changed — use:

```bash
enclii local status              # prints the URLs the CLI actually bound
```

For a service you started yourself, its health path is declared in its own
`enclii.yaml` (`healthCheckPath`). Note that health paths are **not** uniform
across the ecosystem: at least one production service serves health at
`/api/v1/health/` rather than `/health`, and a probe-path mismatch of exactly
this kind caused a restart loop in 2026-05.

---

## Troubleshooting

### "Network madfam-shared-network not found"

```bash
enclii local infra
# or, on the legacy path:
cd ~/labspace/solarpunk-foundry/ops/bin && ./madfam.sh start
```

### "Database does not exist"

```bash
enclii local down
enclii local up
# legacy path:
./madfam.sh stop --clean && ./madfam.sh start && ./verify_databases.sh
```

Check the name against the table above — the most common cause is a service
configured for a `*_db` name from the superseded scheme.

### Connection refused to Postgres or Redis

```bash
enclii local status
docker ps | grep madfam
```

### Authentication failures

**Do not grep for `JANUA_JWT_SECRET`.** There is no shared symmetric secret in
the Janua contract, and any service that has one is misconfigured — that
pattern is the 2026-04-23 audit findings H3/H4.

Verification is RS256 against Janua's JWKS. Check, in order:

1. The service can reach the JWKS endpoint
   (`<issuer>/.well-known/jwks.json`).
2. Its configured `JANUA_ISSUER` exactly matches the `iss` claim in a real
   token — locally `http://localhost:4100`, in production
   `https://auth.madfam.io`.
3. Its verifier allows `RS256` and nothing else.
4. The route you are calling includes the `/api/v1` prefix.

Full detail and working verifier code:
[`JANUA_INTEGRATION.md`](./JANUA_INTEGRATION.md).

### Port already in use

```bash
lsof -i :<port>
```

Pick a replacement from the aspirational blocks in
[`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md) rather than a framework default,
and set it explicitly with `PORT=<n>` or the repo's documented override.

---

## Production ingress — for orientation only

Production services are reached over Cloudflare Tunnel by hostname; there is no
port exposure and local ports have no production meaning.

| Service | Production URL |
|---|---|
| Enclii API | `https://api.enclii.dev` |
| Enclii UI | `https://app.enclii.dev` |
| Janua (OIDC issuer) | `https://auth.madfam.io` |
| Janua dashboard | `https://app.janua.dev` |

> **`dashboard.madfam.io` was published here previously and is not a MADFAM
> route.** It appears in no route table, no domain inventory and no tunnel rule.
> The Janua dashboard is `app.janua.dev`.

The full inventory, including retired and not-live hostnames, is in
[`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md).
