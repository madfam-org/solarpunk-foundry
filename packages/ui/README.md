# @madfam/ui — RETIRED

> **Boundary checkpoint (2026-09-05, platform ops):** public package surface.
> A tombstone record only; no private topology, node identities, credentials or
> cost data.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

|                |                                                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lifecycle**  | `retired`                                                                                                                                                |
| **Retired on** | 2026-09-05 (Wave 4.5). Deprecated in this README since 2026-05; the retirement is the formal act.                                                        |
| **Successor**  | `@dhanam/ui` — the per-app UI incubator (`labspace/dhanam/packages/ui`)                                                                                  |
| **Source**     | removed from `main` on 2026-09-05; recoverable from git history at the commit before this one                                                            |
| **Published**  | never confirmed on any registry. `@madfam/ui` returns 404 on public npm; presence on the private `npm.madfam.io` Verdaccio is unverified from this repo. |

## Why this directory still exists

The same reason a retired **product** keeps a tombstone in the registry: so a
consumer that meets the name can recognise it as dead and be redirected, instead
of failing to recognise it and treating a stale copy as current. `packages/ui`
carries the record — this README and a `private: true` `package.json` with the
retirement metadata — and no source, no build, no publish path.

**It is not counted in the package set.** `packages/` holds 16 directories: 15
shared packages and this tombstone.

## What replaced it

The UI system moved to a decentralised **incubator** model. Each app owns its own
UI package, built on the shared foundation (Radix + Tailwind + CVA, shadcn/ui
patterns) and the golden-ratio token set. **Dhanam** is the incubator where
components are battle-tested and tokens are refined; other repos copy from it.

Why the change, as recorded when the package was deprecated:

1. **Premature abstraction** — three components did not justify the overhead of a published package.
2. **Release friction** — the publish cycle slowed iteration more than the sharing saved.
3. **Fragmentation** — several `@madfam/ui` packages existed and caused confusion.
4. **Ownership** — the copy-and-own model matches how these components are actually maintained.

## If you were using it

```bash
pnpm remove @madfam/ui
```

Then copy what you need from the incubator (`packages/ui/src/components/`,
`packages/ui/src/tokens/`, `packages/ui/src/lib/utils.ts` in `dhanam`) and own it
in your repo. The golden-ratio tokens (`PHI`, `goldenSpacing`,
`goldenTypography`, `madfamPreset`) live in `@dhanam/ui/tokens`.

Design tokens that are **organizational decisions** — brand colours, typography
scale, spacing — are in [`@madfam/core`](../core/README.md) and are imported, not
copied. Only the components are copy-and-own.

## What was retired with it

- `scripts/publish-ui.sh` → [`scripts/archive/publish-ui.sh`](../../scripts/archive/publish-ui.sh)
- `scripts/link-ecosystem.sh` → [`scripts/archive/link-ecosystem.sh`](../../scripts/archive/link-ecosystem.sh)
  (it existed only to link this package into other checkouts)

Both are archived rather than deleted: they are the record of how the package was
released. See [`scripts/archive/README.md`](../../scripts/archive/README.md).
