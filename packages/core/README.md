# @madfam/core

> **Boundary checkpoint (2026-09-04, platform ops):** public package surface.
> Public-safe API and usage detail only; no private topology, node identities,
> credentials or cost data.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

> Authoritative organizational constants for the MADFAM/Solarpunk ecosystem

This package contains **decisions**, not implementations. It provides the foundational constants that all ecosystem applications MUST use for consistency.

## Philosophy

This package exists because some things should be **authoritative** across the ecosystem:

- Brand identity (colors, fonts) → Every app should look like MADFAM
- Supported locales → Users get consistent language support
- Analytics taxonomy → Cross-app user journeys are trackable
- Legal information → Compliance is consistent

This is fundamentally different from "shared utility code" - these are **organizational decisions** codified as constants.

## Installation

```bash
pnpm add @madfam/core
# or
npm install @madfam/core
```

## Usage

### Brand Identity

```typescript
import { brand, colors, typography, spacing } from '@madfam/core';

// Use in Tailwind config
module.exports = {
  theme: {
    colors: {
      primary: colors.primary,
      semantic: colors.semantic,
    },
    fontFamily: {
      sans: [typography.fonts.body, 'sans-serif'],
      mono: [typography.fonts.mono, 'monospace'],
    },
  },
};

// Use in components
<h1 style={{ color: colors.primary.green }}>{brand.tagline}</h1>
```

### Localization

```typescript
import { 
  locales, 
  defaultLocale, 
  parseLocale, 
  getLocaleMetadata,
  type Locale 
} from '@madfam/core';

// Type-safe locale handling
function setUserLocale(locale: string): Locale {
  return parseLocale(locale); // Returns valid locale or fallback
}

// Get locale metadata
const meta = getLocaleMetadata('es');
console.log(meta.nativeName); // "Español"
console.log(meta.dateFormat); // "DD/MM/YYYY"
```

### Currencies

```typescript
import { 
  currencies, 
  formatCurrency, 
  getCurrencyMetadata,
  type Currency 
} from '@madfam/core';

// Format amounts
formatCurrency(1234.56, 'MXN'); // "$1,234.56"
formatCurrency(1234.56, 'EUR'); // "1,234.56€"

// Get currency info
const mxn = getCurrencyMetadata('MXN');
console.log(mxn.name); // "Mexican Peso"
```

### Analytics Events

```typescript
import { 
  analyticsEvents,
  type AnalyticsEventName,
  type UserSignedUpProps 
} from '@madfam/core';

// Type-safe event tracking (you implement the tracker)
function track<T extends AnalyticsEventName>(
  event: T, 
  props: EventProps<T>
): void {
  // Your Plausible/PostHog/etc implementation
  plausible.trackEvent(event, { props });
}

// Usage with full type safety
track('user.signed_up', {
  app: 'dhanam',
  source: 'organic',
  referralCode: 'FRIEND10',
});
```

### Product Registry

**Generated, not hand-kept.** Product facts come from
`src/products/projection.public.json`, the public-safe projection of the one
private product registry, rendered into `src/products.generated.ts`. The
hand-kept half (`src/products.ts`) is the `Product` type, the licence/layer/
lifecycle vocabularies and the lookups. `scripts/check-product-projection.mjs`
fails CI if the vendored projection is edited in place, if the generated module
drifts from it, if a retired brand would render, or if a licence leaves the enum
documented in [`LICENSING_STRATEGY.md`](../../docs/LICENSING_STRATEGY.md).

```typescript
import {
  products,
  getProduct,
  getProductsByLayer,
  getProductsByLifecycle,
  getBannerProducts,
  getProductGitHubUrl,
  getProductWebsiteUrl,
  retiredProducts,
  type ProductId,
} from '@madfam/core';

// Get product info. Keys are registry slugs.
const janua = getProduct('janua');
console.log(janua.domain); // "janua.dev"
console.log(janua.license); // "AGPL-3.0"
console.log(janua.lifecycle); // "live"

// Get products by layer
const infrastructure = getProductsByLayer('soil');

// Get products by lifecycle stage
const shipping = getProductsByLifecycle('live', 'beta');

// The ecosystem-ticker membership, as one shared filter (see "Downstream contract")
const ticker = getBannerProducts();

// Generate URLs. `null`, never a fabricated one, when the fact is absent.
getProductGitHubUrl('geom-core'); // "https://github.com/madfam-org/geom-core"
getProductWebsiteUrl('geom-core'); // null — a library, no routed host

// Retired brands are tombstones, never products: recognise and redirect.
retiredProducts.sim4d.redirectTo; // "https://yantra4d.com"
```

**Not carried, deliberately:** `description` (per-locale copy lives in the
registry's copy bundles, not in the projection), `defaultPort` (private
topology), `phase` (a roadmap number no record owned).

<a id="downstream-contract"></a>

### Downstream contract

What a consuming repo imports, and what it must not re-implement. This is the
contract `@madfam/ecosystem-banner` already consumes inside this monorepo and
the one `madfam-site` consumes in its own migration step. **A consumer keeps no
product list, no product JSON and no copy of the filters.** Six such lists across
three repos is the defect this shape exists to end.

**1. Import path.** `@madfam/core/products` (or the package root, which
re-exports the same names). Product facts:

| Export | What it is |
|---|---|
| `products` | `Record<ProductId, Product>` — every renderable product, keyed by registry slug, in registry order. Never contains a retired brand. |
| `productIds`, `isValidProductId` | the slug list and its type guard |
| `getProduct(id)` | one product, typed |
| `retiredProducts`, `getRetiredProduct(id)`, `isRetiredProductId(v)` | tombstones for retired brands, so a consumer can **recognise and redirect** rather than fail to recognise and render |
| `getProductGitHubUrl(id)`, `getProductWebsiteUrl(id)` | `string \| null` — `null`, never a fabricated URL, when the registry carries no repo or no routed host |
| `ecosystemLayers`, `licenseTypes`, `lifecycles` | the vocabularies |
| `PRODUCT_PROJECTION`, `registryVersion` | the projection stamp (see 4) |

**2. The `Product` type.** `id`, `name`, optional `acronym` / `aliases` /
`siteSlug`; `lifecycle` + `lifecycleVerified` (the ISO date the claim was last
probed — render the date, not the word "live"); `license`, optional
`dataLicense`; `layer`; optional `repo` / `githubOrg` / `repoVisibility` /
`openCoreRepo` / `isPublic` (present only while the registry's
`export_private_repo_names` flag is set — ruling R15 — so treat them as
optional, always); optional `domain` plus `hosts` and `infraHosts`; `site`
(`category`, `track`, `order`, `icon`, `bannerKeyword`, `showInBanner`); and
`commerce` (`tiers`, `adminTier`, `checkoutSlug`, `tierLabels`). Deliberately
absent: `description` (per-locale copy), `defaultPort` (private topology),
`phase`. `RetiredProduct` carries `id`, `name`, `lifecycle: "retired"`,
`retiredOn`, optional `successorSlug` and `redirectTo`.

**3. The filters — use these, do not re-derive them.**

| Filter | Selects |
|---|---|
| `getActiveProducts()` | everything renderable (tombstones excluded by construction) |
| `getProductsByLifecycle('live', 'beta')` | shipping products. `lifecycles` also carries `renderable` / `live` flags — read those rather than hard-coding a lifecycle set |
| `getSurfaceProducts()` | products with a **public surface**: a routed `domain` that is not one of that product's own `infraHosts`. This is the clause that makes Janua link `janua.dev` instead of an auth endpoint |
| `getBannerProducts()` | the ecosystem-ticker membership: public surface ∧ lifecycle `live`\|`beta` ∧ `site.showInBanner`, ordered by `site.order` |
| `getProductsByLayer(layer)`, `getProductsByLicense(licence)`, `getPublicProducts()` | layer, licence, publicly-readable repo |

Two rules carried with them. **Public surface is not `repoVisibility`** — Dhanam
and Forgesight are private repositories with live public products, and filtering
on the repository deletes them from every catalog. And a selected product with a
missing field (a banner entry with no `site.bannerKeyword`) is a **failure to
fix in the registry**, never a row to drop quietly or a value to invent
downstream: a short list that renders cleanly is indistinguishable from a
correct one.

**4. Stamping the projection version in a downstream freshness check.** Every
build carries its provenance:

```typescript
import { PRODUCT_PROJECTION, registryVersion } from '@madfam/core/products';

PRODUCT_PROJECTION.schema;          // "madfam-product-projection/v1"
PRODUCT_PROJECTION.registryVersion; // 4  — also exported as `registryVersion`
PRODUCT_PROJECTION.lastUpdated;     // "2026-09-05"
PRODUCT_PROJECTION.sourceSha256;    // sha256 of the projection this build was rendered from
PRODUCT_PROJECTION.exportPrivateRepoNames; // whether `repo` fields are present at all
```

A downstream freshness check is a test that pins the two it read and fails on a
drift it did not review:

```typescript
// apps/www/src/__tests__/product-registry-freshness.spec.ts
const EXPECTED_REGISTRY_VERSION = 4;
const EXPECTED_PROJECTION_SHA = '759119046a…'; // paste the full 64 hex chars

expect(PRODUCT_PROJECTION.schema).toBe('madfam-product-projection/v1');
expect(PRODUCT_PROJECTION.registryVersion).toBe(EXPECTED_REGISTRY_VERSION);
expect(PRODUCT_PROJECTION.sourceSha256).toBe(EXPECTED_PROJECTION_SHA);
```

Bumping those two constants is the review surface: a product fact changed
upstream, someone read the diff, and the copy deck and routes were checked
against it. Do **not** assert on product counts or on a slug list — that is a
second registry in test form, and it is how the lists drifted in the first place.
Assert on the stamp, and let the types fail the build when a slug goes away.

**5. What stays out of a consumer.** No vendored `projection.public.json`, no
generated product module, no re-implemented filter, no hand-typed brand name in
a catalog, and no product copy in this package (copy is per-locale and lives in
the registry's copy bundles). To change a product fact: change the private
registry, re-run its generator, re-vendor the projection here, run
`node scripts/check-product-projection.mjs --write`, publish `@madfam/core`, and
bump the pin in step 4.

### Legal Information

```typescript
import { 
  company, 
  legalUrls, 
  getCopyrightNotice, 
  footerLinks 
} from '@madfam/core';

// Footer component
function Footer() {
  return (
    <footer>
      {footerLinks.legal.map(link => (
        <a key={link.href} href={link.href}>{link.label}</a>
      ))}
      <p>{getCopyrightNotice()}</p>
    </footer>
  );
}
```

## What's Included

| Module | Contents | Purpose |
|--------|----------|---------|
| `brand` | Colors, typography, spacing, shadows | Visual identity |
| `locales` | Supported languages, metadata | Internationalization |
| `currencies` | Supported currencies, formatting | Financial operations |
| `events` | Analytics event taxonomy | Cross-app tracking |
| `products` | Product registry (generated from the projection) | Ecosystem awareness |
| `legal` | Company info, legal URLs | Compliance |

## What's NOT Included

This package intentionally does NOT include:

- ❌ UI components (apps own their components)
- ❌ React hooks (apps own their implementations)
- ❌ API clients (apps own their integrations)
- ❌ Utility functions (apps own their helpers)
- ❌ Configuration files (apps own their configs)

## Governance

Changes to this package require governance approval because they affect the entire ecosystem.

**To propose changes:**

1. Open an issue in [solarpunk-foundry](https://github.com/madfam-org/solarpunk-foundry)
2. Discuss with stakeholders
3. Submit PR with governance approval
4. Package is versioned with semver

**Breaking changes** (major version bumps) include:
- Removing colors, locales, or currencies
- Changing event names in the taxonomy
- Modifying legal URLs or company information

## License

MIT © Innovaciones MADFAM SAS de CV
