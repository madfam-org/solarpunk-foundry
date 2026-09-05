# scripts/archive

> **Boundary checkpoint (2026-09-05, platform ops):** public operator tooling,
> retired. Public-safe abstractions only; node identities, credentials, provider
> account detail and cost data stay in `internal-devops`.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

Scripts that are **retired, not deleted**. Nothing in this directory is part of
any workflow, and nothing here should be run: each one operates on something that
no longer exists. They are kept because they are the record of how that thing was
built, released or linked — deleting them loses the record and answers no
question a reader will have.

The same convention as a product tombstone in `@madfam/core`: keep the record so
a reader recognises a dead thing as dead, rather than not recognising it at all.

| Script | Retired | Why |
|---|---|---|
| `publish-ui.sh` | 2026-09-05 | published `@madfam/ui`, retired in Wave 4.5 (see [`packages/ui/README.md`](../../packages/ui/README.md)) |
| `link-ecosystem.sh` | 2026-09-05 | linked `@madfam/ui` into other checkouts for local development; it existed only for that package |

**Before adding to this directory:** an archived script must name what it
operated on and where the successor is, and it must not be referenced by any
workflow, script or document as a live path. If something still calls it, it is
not retired yet.
