# Solarpunk Foundry Templates

Reference implementations for ecosystem applications. **Copy, don't depend.**

> **Developer machine setup** (shell, Cursor MCP, Enclii CLI, agent preflight) lives in [internal-devops `TERMINAL_AND_DEV_HARNESS.md`](https://github.com/madfam-org/internal-devops/blob/main/docs/TERMINAL_AND_DEV_HARNESS.md) — not here.

## Philosophy

These templates embody the principle: **"Each service owns its dependencies completely."**

Instead of creating shared npm packages for everything, we provide reference implementations that apps copy and own. This ensures:

- ✅ Apps can deploy independently
- ✅ Apps can customize without affecting others
- ✅ No version coordination headaches
- ✅ No unpublished dependency failures

## Available Templates

### Analytics (`analytics/`)

Privacy-first analytics implementation using Plausible.

```bash
# Copy to your app
cp templates/analytics/analytics.ts ~/your-app/src/lib/analytics.ts

# Install dependencies
cd ~/your-app
pnpm add plausible-tracker @madfam/core
```

**Features:**
- Type-safe events from `@madfam/core` taxonomy
- Automatic session tracking
- Convenience methods for common events
- React hook support

### Honest-Status Scorecard (`HONEST_STATUS_SCORECARD.md`)

Evidence-backed status scorecard mandated by internal-devops RFC 0024 P3,
modeled on internal MADFAM GA-readiness scorecards and truth audits
(exemplar pointers in the private internal-devops repo).

```bash
# Copy to your repo and fill in
cp templates/HONEST_STATUS_SCORECARD.md ~/your-app/docs/HONEST_STATUS.md
```

**Features:**
- Verified / built-but-unverified / claimed-but-not-built claim states
- Evidence-linked claims with verification dates
- Blocker table with owners, severity, and unblock criteria
- Readiness score rubric mapped to allowed public-copy tiers

### Tailwind Config (`tailwind/`)

Tailwind CSS configuration using `@madfam/core` design tokens.

```bash
# Copy to your app
cp templates/tailwind/tailwind.config.ts ~/your-app/tailwind.config.ts

# Install @madfam/core
pnpm add @madfam/core
```

**Features:**
- Brand colors from `@madfam/core`
- Typography, spacing, shadows from design tokens
- Dark mode support
- Extensible for app-specific needs

### TypeScript Configs (`tsconfig/`)

**These are stubs, not the configs.** The settings live in
[`@madfam/tsconfig`](../packages/tsconfig/README.md); each file here is a
three-line `extends` you copy.

```bash
pnpm add -D @madfam/tsconfig

# For Next.js apps
cp templates/tsconfig/next.json ~/your-app/tsconfig.json

# For Vite/React apps
cp templates/tsconfig/vite.json ~/your-app/tsconfig.json

# For Node.js backends
cp templates/tsconfig/node.json ~/your-app/tsconfig.json

# For publishable libraries
cp templates/tsconfig/library.json ~/your-package/tsconfig.json
```

A compiler baseline is the one thing in this directory that should **not** be
copied and owned: when a copied `tsconfig.json` drifts, nothing reports it, and
the estate ends up with as many strictness levels as it has repositories. This
repo measured exactly that on 2026-09-05 — thirteen packages, thirteen
hand-written configs, two `target`s and four strictness sets. Same for lint and
format: see [`@madfam/eslint-config`](../packages/eslint-config/README.md) and
[`@madfam/prettier-config`](../packages/prettier-config/README.md).

`outDir`, `rootDir`, `baseUrl`, `paths`, `include` and `exclude` stay in your own
`tsconfig.json`: TypeScript resolves every relative path against the file it was
written in, so a path set in a shared config resolves inside
`node_modules/@madfam/tsconfig`.

### CI (`ci/`)

Workflow templates **and** the [consumer CI contract](ci/README.md) — the seven
checks a repo consuming these packages must run, the exact commands, and the
exit-code contract (0 pass / 1 findings / 2 UNDETERMINED, which is also a
failure).

## When to Use Templates vs @madfam/core

| Need | Use |
|------|-----|
| Brand colors, design tokens | `@madfam/core` (import) |
| Supported locales/currencies | `@madfam/core` (import) |
| Analytics event taxonomy | `@madfam/core` (import) |
| Legal info, product registry | `@madfam/core` (import) |
| Analytics implementation | Template (copy) |
| Tailwind configuration | Template (copy) |
| TypeScript configuration | `@madfam/tsconfig` (extend) |
| ESLint configuration | `@madfam/eslint-config` (extend) |
| Prettier configuration | `@madfam/prettier-config` (reference) |
| UI components | Write your own / shadcn |

## The Rule

**`@madfam/core`** = Organizational decisions (import as dependency)
**`@madfam/tsconfig` / `@madfam/eslint-config` / `@madfam/prettier-config`** = Toolchain baselines (extend as dependency)
**Templates** = Reference implementations (copy and own)

This ensures apps can always:
1. `pnpm install` without failures
2. Deploy independently
3. Customize without coordination
