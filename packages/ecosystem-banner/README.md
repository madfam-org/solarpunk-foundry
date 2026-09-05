# @madfam/ecosystem-banner

> **Boundary checkpoint (2026-09-05, platform ops):** public package surface.
> Public-safe API and usage detail only. Every platform fact here is derived
> from the public-safe projection vendored in `@madfam/core`; no private
> topology, node identity, credential or cost data.
> Policy: [`docs/PUBLIC_REPO_BOUNDARY.md`](../../docs/PUBLIC_REPO_BOUNDARY.md)

A dismissible stock-ticker banner that surfaces the MADFAM platform ecosystem at the very bottom of every landing app. All platform names scroll horizontally in a continuous marquee (NYSE-style).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  MADFAM ECOSYSTEM /  BUDGETING & WEALTH: Dhanam ↗  AI AGENT OFFICE: Selva ↗ … × │
└──────────────────────────────────────────────────────────────────────────────┘
```

*The keywords above are the registry's own `site.banner_keyword` values, as `src/platforms.ts` derives them.*

## Install

```bash
pnpm add @madfam/ecosystem-banner @madfam/core --registry=https://npm.madfam.io
# or
npm install @madfam/ecosystem-banner @madfam/core --registry=https://npm.madfam.io
```

`@madfam/core` is a **runtime dependency**, not an optional peer: the ticker's
membership is a filter over that package's product registry (see below).

You'll need a valid `~/.npmrc` with a token for `npm.madfam.io` — see the operator registry notes in `internal-devops/access/npm-registry.md`.

## Usage

```tsx
// app/layout.tsx (Next.js, sticky bottom of every page)
import { EcosystemBanner } from '@madfam/ecosystem-banner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <EcosystemBanner />
      </body>
    </html>
  );
}
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `platforms` | `EcosystemPlatform[]` | `DEFAULT_ECOSYSTEM_PLATFORMS` | Override the platform list. Each entry: `{ keyword, name, url }`. |
| `marqueeDurationSec` | `number` | `platforms.length × 6` | Seconds for one full marquee loop. |
| `label` | `string` | `'MADFAM ECOSYSTEM'` | Override the mono chip label on the left. Hidden on small viewports. |
| `className` | `string` | `''` | Optional className appended to the outer fixed wrapper. |
| `testId` | `string` | `undefined` | Optional `data-testid` for host-app E2E selectors. |
| `forceVisible` | `boolean` | `false` | Force-render even if the user dismissed the current banner version. Useful for previews. |

### Subset for a specific landing

```tsx
import { EcosystemBanner, DEFAULT_ECOSYSTEM_PLATFORMS } from '@madfam/ecosystem-banner';

const compliancePlatforms = DEFAULT_ECOSYSTEM_PLATFORMS.filter((p) =>
  ['Karafiel', 'Tezca', 'Janua'].includes(p.name)
);

<EcosystemBanner platforms={compliancePlatforms} />;
```

## Behavior

- **Dismissible.** A 44×44 hit-area `×` button on the right writes a `{ v, dismissed_at }` record to `localStorage.madfam_ecosystem_banner` and hides the banner for 30 days. Bumping `BANNER_VERSION` in source resets dismissals so users see new platform lineups.
- **Linked.** Each platform name is a real `<a target="_blank" rel="noopener noreferrer">` to its apex domain. `title=` exposes the full pair on hover for users who scrolled mid-read.
- **Accessible.** The banner is a `role="complementary"` landmark whose `aria-label` lists every platform in the ticker, so a screen reader gets the full lineup once, in one place, rather than being interrupted by a scrolling region. There is deliberately **no** `aria-live` on the ticker: the content never changes, it only moves. Under `prefers-reduced-motion` the marquee animation is switched off entirely and the track wraps to a static, fully readable list — there is no cross-fade (it was removed in 0.1.3).
- **Mobile-friendly.** Collapses to single-line ≤640px viewports; the brand chip hides on small screens to keep the ticker readable.

## Platform list — derived, not kept here

This package holds **no platform list**. `src/platforms.ts` exports
`DEFAULT_ECOSYSTEM_PLATFORMS` as `getBannerProducts()` from
[`@madfam/core/products`](../core/README.md#downstream-contract), mapped into the
ticker's `{ keyword, name, url }` shape. The product facts live once, in the
projection vendored in `@madfam/core` — one JSON, one committed hash.

The filter (stated and implemented in `@madfam/core`): a routed primary domain
that is **not** one of the product's own infra hosts, AND `lifecycle` `live` or
`beta`, AND not a tombstone, AND `site.showInBanner` — ordered by the registry's
`site.order`. **19 platforms at registry version 4** (2026-09-05).

To add, remove or rename a platform, change the private product registry and
re-vendor the projection into `@madfam/core`; do not edit this package. Two
checks hold that line: `scripts/check-product-projection.mjs` (Package Quality)
fails if a rendered list reappears here, if `platforms.ts` stops importing the
core filter, or if a literal ticker row is typed in; and `src/__tests__/platforms.spec.ts`
asserts this list matches the guard's independent selection over the vendored
projection, one for one.

Bumping `BANNER_VERSION` in `ecosystem-banner.tsx` re-engages previously-dismissed
users after a lineup change.

History: the list was hand-kept until 2026-09-05, when #46 made it a second
generated file; Wave 2.7 removed that second copy in favour of the shared filter.

## Adopting in a new landing

1. `pnpm add @madfam/ecosystem-banner` (with the registry configured)
2. Mount `<EcosystemBanner />` at the bottom of your root layout — outside provider trees if you have any client-side state, since the banner has its own SSR-safe local state
3. If you want a subset of platforms, pass `platforms={...}` (the default list has 19 entries at registry version 4)

That's it. No CSS to import, no provider to wrap, no theme to extend, and no Tailwind content scanning required.

## Footer contract

Mount the banner once at the bottom of the landing layout. **Do not** duplicate
ecosystem platform links in the product footer — footers are product-owned
(legal, support, product docs only). Public contract: `docs/ECOSYSTEM_BANNER.md`.

## Development

```bash
pnpm install
pnpm test       # vitest, 17 tests
pnpm typecheck  # tsc --noEmit
pnpm build      # tsup → dist/
```

## Publishing

Use the `Publish Package` workflow with `package_path=packages/ecosystem-banner` and `dry_run=false`:

```bash
gh workflow run publish-package.yml \
  -f package_path=packages/ecosystem-banner \
  -f dry_run=false
```

The CI workflow uses the `NPM_MADFAM_TOKEN` org Actions secret; rotation and smoke-test procedure lives in `internal-devops/access/npm-registry.md`.
