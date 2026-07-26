# `infrastructure/monitoring/` — unverified artifact

> **Last reviewed:** 2026-07-25
> **Status:** one file, provenance unestablished. Not the production monitoring stack.

## What is here

`grafana-dashboard.json` — a Grafana dashboard definition.

**I could not establish whether this is an ancestor of any live dashboard, or
dead scaffolding.** It shipped alongside a Docker Compose observability stack
that was removed on 2026-07-25 (see the removal ledger in
`../README.md`), and that stack scraped `host.docker.internal`, which only
resolves under Docker Desktop — so the surrounding material was a laptop
artifact. That is suggestive but not decisive about the dashboard itself.

It is kept rather than deleted precisely because the question is open, and
deleting a possible ancestor of a live dashboard is not a reversible-enough
mistake to make on a guess.

**What would settle it:** export the dashboards currently provisioned in the
`monitoring` namespace and diff their panel queries against this file. If the
metric names do not match anything production exposes, delete it. If it is an
ancestor, it belongs in the repo that owns the monitoring stack — not here.

## What is not here

MADFAM's real observability stack — Grafana, Prometheus and Alertmanager — runs
in-cluster in the `monitoring` namespace and is not configured from this
repository. Provisioned dashboards, access paths and alert routing are recorded
in `internal-devops`.

One thing worth stating rather than implying: as of the 2026-07-16 internal
launch-readiness assessment, **alert delivery was recorded as not working**, and
a route serving the Alertmanager UI returned 502 at the 2026-07-01 probe. Any
public document showing this stack as uniformly healthy is describing a
frozen observation, not a live check. Current status is tracked privately.

---

*Public-safe. No endpoints, credentials, or node identifiers.*
