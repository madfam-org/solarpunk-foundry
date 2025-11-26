# Solarpunk Foundry Templates

Reference implementations for ecosystem applications. **Copy, don't depend.**

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
pnpm add plausible-tracker @solarpunk/core
```

**Features:**
- Type-safe events from `@solarpunk/core` taxonomy
- Automatic session tracking
- Convenience methods for common events
- React hook support

### Tailwind Config (`tailwind/`)

Tailwind CSS configuration using `@solarpunk/core` design tokens.

```bash
# Copy to your app
cp templates/tailwind/tailwind.config.ts ~/your-app/tailwind.config.ts

# Install @solarpunk/core
pnpm add @solarpunk/core
```

**Features:**
- Brand colors from `@solarpunk/core`
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

## When to Use Templates vs @solarpunk/core

| Need | Use |
|------|-----|
| Brand colors, design tokens | `@solarpunk/core` (import) |
| Supported locales/currencies | `@solarpunk/core` (import) |
| Analytics event taxonomy | `@solarpunk/core` (import) |
| Legal info, product registry | `@solarpunk/core` (import) |
| Analytics implementation | Template (copy) |
| Tailwind configuration | Template (copy) |
| TypeScript configuration | Template (copy) |
| UI components | Write your own / shadcn |

## The Rule

**`@solarpunk/core`** = Organizational decisions (import as dependency)
**Templates** = Reference implementations (copy and own)

This ensures apps can always:
1. `pnpm install` without failures
2. Deploy independently
3. Customize without coordination
