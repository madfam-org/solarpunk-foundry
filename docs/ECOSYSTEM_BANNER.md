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

## Platform list membership — derived, not hand-kept

`DEFAULT_ECOSYSTEM_PLATFORMS` is **derived at import time**: it is
`getBannerProducts()` from `@madfam/core/products`, mapped into the ticker's
`{ keyword, name, url }` shape by `packages/ecosystem-banner/src/platforms.ts`.
The banner package carries no product facts of its own — no hand list, and since
Wave 2.7 no generated second copy either. There is one vendored projection
(`packages/core/src/products/projection.public.json`) with one committed hash,
and one filter, in `@madfam/core`, that this package and every downstream repo
apply rather than re-implement.

Package Quality holds that shape from two directions:
`scripts/check-product-projection.mjs` fails if `platforms.generated.ts`
reappears, if `platforms.ts` stops importing the core filter, or if a literal
ticker row is typed into it; and the banner package's own
`src/__tests__/platforms.spec.ts` asserts the derived list matches the guard's
independent selection over the vendored JSON — two implementations of the filter,
one source, compared every run.

**The filter.** A product is in the ticker when all of these hold:

- it has a **public product surface** — a routed `domains.primary` — and that
  domain is **not** one of its own `domains.infra_hosts` (this is why Janua links
  `janua.dev` rather than an auth endpoint);
- its `lifecycle` is `live` or `beta`;
- it is not a tombstone;
- `site.show_in_banner` is true.

Order is the registry's `site.order`. "Public surface" is deliberately *not*
`repo.visibility`: Dhanam and Forgesight are private repositories with live
public products, and filtering on the repository would have deleted them.

**19 platforms at registry version 4.** Against the hand-kept list this repo
carried until 2026-09-05 (the list #46 first generated, and 2.7 turned into a
derivation — the membership is unchanged by 2.7):

| Change | Slugs |
|---|---|
| Added (7) | `avala`, `voxa`, `acervo`, `kalya`, `nauta`, `fashion-cabinet`, `factlas` |
| Removed (1) | `routecraft` — it has no entry in the product registry at all, so nothing selects it; recorded as O25 |
| Unchanged (12) | `enclii`, `janua`, `selva`, `forgesight`, `dhanam`, `rondelio`, `karafiel`, `tezca`, `yantra4d`, `cotiza`, `pravara-mes`, `phynd-crm` |

A selected product with no `site.banner_keyword` is a **hard failure** of the
check, never a silently dropped row: the seven added products had no keyword
until the registry gained one on 2026-09-05, and the only safe answers are "add
it to the registry" or "fail" — never "invent a keyword in a public repo". A
shorter ticker that renders cleanly is indistinguishable from a correct one.

**Probe, 2026-09-05 (HEAD, following no redirects).** The 19 primary domains
answered: 17 × `200`, 1 × `307` (`dhan.am`), 1 × `404` (`cto.madfam.io`, Nauta).
`forgesight.quest` returned no status at all from the probing environment (the
connection was reset before any response), so it is **unverified here, not down**.
Neither the 404 nor the unverified host is fixed by editing this list: the
lifecycle and domain claims are registry facts, and `cto.madfam.io` answering 404
while Nauta is `lifecycle: live` is a registry question.

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
