# @madfam/ecosystem-banner

A dismissible stock-ticker banner that surfaces the MADFAM platform ecosystem at the very bottom of every landing app. All platform names scroll horizontally in a continuous marquee (NYSE-style).

```
┌──────────────────────────────────────────────────────────────────────┐
│  MADFAM ECOSYSTEM /  BUDGETING: Dhanam ↗  AI OFFICE: Selva ↗  …  × │
└──────────────────────────────────────────────────────────────────────┘
```

## Install

```bash
pnpm add @madfam/ecosystem-banner --registry=https://npm.madfam.io
# or
npm install @madfam/ecosystem-banner --registry=https://npm.madfam.io
```

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
- **Accessible.** `aria-live="polite"` on the ticker so screen readers announce each new pair without interrupting; `prefers-reduced-motion` swaps the cross-fade for an instant transition (same content cadence, zero motion).
- **Mobile-friendly.** Collapses to single-line ≤640px viewports; the brand chip hides on small screens to keep the ticker readable.

## Platform list (single source of truth)

`src/platforms.ts` exports `DEFAULT_ECOSYSTEM_PLATFORMS`. Add a new platform by editing that one file and bumping the package minor version. Bumping `BANNER_VERSION` in `ecosystem-banner.tsx` re-engages previously-dismissed users.

## Adopting in a new landing

1. `pnpm add @madfam/ecosystem-banner` (with the registry configured)
2. Mount `<EcosystemBanner />` at the bottom of your root layout — outside provider trees if you have any client-side state, since the banner has its own SSR-safe local state
3. If you want a subset of platforms, pass `platforms={...}` (defaults to all 13 confirmed-live)

That's it. No CSS to import, no provider to wrap, no theme to extend, and no Tailwind content scanning required.

## Footer contract

Mount the banner once at the bottom of the landing layout. **Do not** duplicate
ecosystem platform links in the product footer — footers are product-owned
(legal, support, product docs only). Public contract: `docs/ECOSYSTEM_BANNER.md`.

## Development

```bash
pnpm install
pnpm test       # vitest, 21 tests
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
