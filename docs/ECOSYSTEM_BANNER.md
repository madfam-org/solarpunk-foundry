# Ecosystem banner and footer contract

**Last verified: 2026-07-25** — package name, version and source path checked
against `packages/ecosystem-banner/package.json` on that date.

Public contract for the shared bottom marquee across MADFAM product landings.

## Package

| Field | Value |
|---|---|
| npm package | `@madfam/ecosystem-banner` |
| Source | `packages/ecosystem-banner/` in this repository |
| Version in the source tree | **0.1.4** (verified 2026-08-24) |
| Publish target | `npm.madfam.io` |

```bash
pnpm add @madfam/ecosystem-banner@0.1.4
```

> **Publication is not verified here.** `0.1.4` is what the package manifest in
> this repository declares; whether that version is actually published to
> `npm.madfam.io` needs a registry query. If `pnpm add` fails, that is the first
> thing to check — not a version bump.

> **License field mismatch, noted 2026-07-25.** This package declares
> `"license": "UNLICENSED"` while the repository `LICENSE` is MIT and every
> other `@madfam/*` package declares `MIT`. Reconcile before wider adoption —
> see [`LICENSING_STRATEGY.md`](./LICENSING_STRATEGY.md).

See [`packages/ecosystem-banner/README.md`](../packages/ecosystem-banner/README.md)
for the mount API, `testId`, and vendor-script behaviour.

## Banner (bottom marquee)

Every product landing mounts the shared ticker **once** — typically in the root
layout footer region. The banner lists cross-platform links in a single
scrolling strip.

Do **not** duplicate platform links elsewhere in the footer.

## Footer (product-owned)

Product footers contain only product-specific content:

- Product name, tagline, legal links
- Product support and documentation links
- Copyright

**Exclude** from product footers: Janua, Enclii, Dhanam, Selva and other
ecosystem platform links. Those live in the banner only.

## Link hygiene

Two constraints that apply to anything the banner links to:

- **Never link a retired hostname.** `agents-*.madfam.io`, `selva.madfam.io`,
  `metrics.enclii.dev` and `dashboard.madfam.io` are retired or were never
  MADFAM routes. `auth.selva.town` must never be routed at all. See
  [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md#retired-never-route-and-not-live).
- **Never link `innovacionesmadfam.dev`.** That domain was never acquired
  (owner confirmation recorded 2026-07-09). The canonical company domain is
  `madfam.io`.

## Rollout status

Phase 1 and Phase 2 landings were remediated in **June 2026**. The full
per-landing matrix is private:
`internal-devops/ecosystem/ecosystem-banner-footer-audit-2026-06-15.md`
(dated 2026-06-15).

**Not re-verified since.** Whether every current landing mounts the banner, and
whether any has drifted back to duplicating platform links in its footer, is
unestablished as of 2026-07-25. **What would settle it:** re-run the per-landing
audit and record the date.

## Related

- [`PORT_ALLOCATION.md`](./PORT_ALLOCATION.md)
- [`PUBLIC_REPO_BOUNDARY.md`](./PUBLIC_REPO_BOUNDARY.md)
- [`ECOSYSTEM_STATUS.md`](./ECOSYSTEM_STATUS.md)
