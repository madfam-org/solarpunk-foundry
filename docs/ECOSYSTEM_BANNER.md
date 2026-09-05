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

> **License field mismatch — resolved 2026-09-04.** This package declared
> `"license": "UNLICENSED"` while the repository `LICENSE` is MIT and every
> other `@madfam/*` package declares `MIT`. It now declares `MIT`, per the
> shared-packages tier in [`LICENSING_STRATEGY.md`](./LICENSING_STRATEGY.md).

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

## Platform list membership — still hand-kept, and exactly why

`DEFAULT_ECOSYSTEM_PLATFORMS` in `packages/ecosystem-banner/src/platforms.ts` is
scheduled to become a filter over the vendored product projection
(`packages/core/src/products/projection.public.json`), so that membership stops
being typed by hand. The filter is: public product surface ∧ lifecycle live or
beta ∧ not retired ∧ `site.show_in_banner` ∧ primary domain not one of the
product's own infra hosts.

**It is not generated yet, and the blocker is one field.** Applying that filter
to registry version 4 selects 19 products, and 7 of them carry no
`site.banner_keyword` in the projection: `avala`, `voxa`, `acervo`, `kalya`,
`nauta`, `fashion-cabinet`, `factlas`. The banner renders
`KEYWORD: Name`, so a generated entry for those seven would need a keyword
invented here — which is precisely the hand-authored, unowned copy this pipeline
exists to remove. The keyword is brand copy and belongs in the registry.

**What would settle it:** add `site.banner_keyword` for those seven products in
`internal-devops/ecosystem/registry/products.yaml`, re-emit the projection,
re-vendor it here; the list can then be generated in full and this section
deleted. Until then the hand-kept list stands and the count is asserted in
`packages/ecosystem-banner/src/__tests__/ecosystem-banner.spec.tsx`.

**Probe, 2026-09-05 (HEAD, following no redirects).** The 19 candidate primary
domains answered: 17 × `200`, 1 × `307` (`dhan.am`), 1 × `404`
(`cto.madfam.io`, Nauta). `forgesight.quest` returned no status at all from the
probing environment (the connection was reset before any response), so it is
**unverified here, not down** — the current banner entry for it is unchanged.
`routecraft.app`, which the hand-kept list carries today, answered `200` but has
no entry in the registry projection at all; whether RouteCraft belongs in the
registry is a registry question, not a banner one.

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
