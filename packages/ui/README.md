# @madfam/ui - DEPRECATED

> **This package is deprecated.** The MADFAM UI system has moved to a decentralized "incubator" model.

## New Architecture

Instead of a centralized npm package, each MADFAM app maintains its own UI package with:
- **Shared foundation**: Radix + Tailwind + CVA (shadcn/ui patterns)
- **Shared tokens**: Golden ratio design system
- **App-specific aesthetics**: Unique colors, shadows, and styles per app

## The Incubator: @dhanam/ui

**Dhanam** (`/labspace/dhanam/packages/ui`) serves as the UI incubator where:
- New components are battle-tested in a real application
- Golden ratio tokens are defined and refined
- Patterns are documented for other repos to copy

## Why This Change?

1. **Premature abstraction** - 3 components didn't justify npm package overhead
2. **Release friction** - npm publish cycle slowed iteration
3. **Fragmentation** - Multiple @madfam/ui packages caused confusion
4. **Ownership** - Copy-paste model aligns with shadcn/ui philosophy

## Migration

If you were using `@madfam/ui`:

1. Remove the dependency:
   ```bash
   pnpm remove @madfam/ui
   ```

2. Copy components you need from `@dhanam/ui`:
   - `packages/ui/src/components/` - UI components
   - `packages/ui/src/tokens/` - Golden ratio tokens
   - `packages/ui/src/lib/utils.ts` - The `cn()` utility

3. See `/labspace/dhanam/packages/ui/README.md` for setup guide.

## Golden Ratio Tokens

The golden ratio token system lives in `@dhanam/ui/tokens`:

```ts
import { 
  PHI,
  goldenSpacing,
  goldenTypography,
  madfamPreset 
} from '@dhanam/ui/tokens';
```

Copy the `/tokens` directory to your repo for local usage.

---

*This package will not receive updates. Use the incubator model instead.*
