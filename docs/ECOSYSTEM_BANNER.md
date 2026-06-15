# Ecosystem banner and footer contract

**Last Updated:** 2026-06-15

Public contract for the shared bottom marquee across MADFAM product landings.

## Package

- **npm:** `@madfam/ecosystem-banner` (published to `npm.madfam.io`)
- **Source:** `packages/ecosystem-banner/` in this repo
- **Current version:** `0.1.3`

Install in consumer apps:

```bash
pnpm add @madfam/ecosystem-banner@0.1.3
```

See [packages/ecosystem-banner/README.md](../packages/ecosystem-banner/README.md) for mount API, `testId`, and vendor script behavior.

## Banner (bottom marquee)

Every product landing mounts the shared ticker once — typically in the root layout footer region. The banner lists cross-platform links in a single scrolling strip.

Do **not** duplicate platform links elsewhere in the footer.

## Footer (product-owned)

Product footers contain only product-specific content:

- Product name, tagline, legal links
- Product support / docs links
- Copyright

**Exclude** from product footers: Janua, Enclii, Dhanam, Selva, and other ecosystem platform links (those live in the banner only).

## Rollout status

Phase 1 and Phase 2 landings were remediated in Jun 2026. Full matrix (private): `internal-devops/ecosystem/ecosystem-banner-footer-audit-2026-06-15.md`.

## Related

- [PORT_ALLOCATION.md](./PORT_ALLOCATION.md)
- [PUBLIC_REPO_BOUNDARY.md](./PUBLIC_REPO_BOUNDARY.md)
