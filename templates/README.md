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

TypeScript configurations for different app types.

```bash
# For Next.js apps
cp templates/tsconfig/next.json ~/your-app/tsconfig.json

# For Vite/React apps
cp templates/tsconfig/vite.json ~/your-app/tsconfig.json

# For Node.js backends
cp templates/tsconfig/node.json ~/your-app/tsconfig.json

# For publishable libraries
cp templates/tsconfig/library.json ~/your-package/tsconfig.json
```

## When to Use Templates vs @madfam/core

| Need | Use |
|------|-----|
| Brand colors, design tokens | `@madfam/core` (import) |
| Supported locales/currencies | `@madfam/core` (import) |
| Analytics event taxonomy | `@madfam/core` (import) |
| Legal info, product registry | `@madfam/core` (import) |
| Analytics implementation | Template (copy) |
| Tailwind configuration | Template (copy) |
| TypeScript configuration | Template (copy) |
| UI components | Write your own / shadcn |

## The Rule

**`@madfam/core`** = Organizational decisions (import as dependency)
**Templates** = Reference implementations (copy and own)

This ensures apps can always:
1. `pnpm install` without failures
2. Deploy independently
3. Customize without coordination
