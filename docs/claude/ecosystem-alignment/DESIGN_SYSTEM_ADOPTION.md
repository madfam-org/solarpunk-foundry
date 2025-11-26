# Design System Adoption Plan

**Status**: Planning
**Priority**: 🔴 CRITICAL
**Current State**: aureo-labs has golden ratio (φ) design system, 0 other consumers

---

## Executive Summary

The aureo-labs repository contains a sophisticated golden ratio (φ) based design system with glassmorphism aesthetics. This design system should be extracted into a shared package within solarpunk-foundry for consumption across all business sites.

### Current State
- **aureo-labs**: Has complete φ-based design system
- **madfam-site**: Separate design approach (was Tailwind v4)
- **primavera3d**: Blueprint aesthetic theme (separate)
- **solarpunk-foundry**: Orchestration only, no UI packages

### Target State
- **@madfam/design-tokens**: Shared design tokens (colors, spacing, typography)
- **@madfam/tailwind-preset**: Shared Tailwind configuration
- **@madfam/ui**: Shared component library (extracted from aureo-labs)
- All business sites consume these packages

---

## Phase 1: Design Token Extraction

### 1.1 Create Token Package Structure

```
solarpunk-foundry/
└── packages/
    └── design-tokens/
        ├── package.json
        ├── src/
        │   ├── index.ts
        │   ├── colors.ts
        │   ├── spacing.ts      # Fibonacci: 8, 13, 21, 34, 54, 88
        │   ├── typography.ts   # φ-modular scale
        │   ├── breakpoints.ts
        │   └── animations.ts
        └── dist/
```

### 1.2 Golden Ratio Tokens (from aureo-labs)

```typescript
// spacing.ts - Fibonacci-based scale
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',      // Fib
  3: '13px',     // Fib
  4: '21px',     // Fib
  5: '34px',     // Fib
  6: '55px',     // Fib (rounded)
  7: '89px',     // Fib (rounded)
  phi: '1.618rem',
} as const;

// typography.ts - φ-modular scale
export const fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px (×φ)
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px (×φ)
} as const;

// colors.ts - Aureo Labs palette
export const colors = {
  brand: {
    gold: '#D4AF37',
    amber: '#FFBF00',
    bronze: '#CD7F32',
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.1)',
    stroke: 'rgba(255, 255, 255, 0.2)',
    blur: '12px',
  },
  // ... rest of palette
} as const;
```

---

## Phase 2: Tailwind Preset Creation

### 2.1 Create Preset Package

```
solarpunk-foundry/
└── packages/
    └── tailwind-preset/
        ├── package.json
        ├── src/
        │   ├── index.ts
        │   └── preset.ts
        └── dist/
```

### 2.2 Preset Configuration

```typescript
// preset.ts
import type { Config } from 'tailwindcss';
import { spacing, fontSize, colors } from '@madfam/design-tokens';

export const madfamPreset: Partial<Config> = {
  theme: {
    extend: {
      spacing,
      fontSize,
      colors: {
        brand: colors.brand,
      },
      aspectRatio: {
        phi: '1.618',
      },
      gridTemplateColumns: {
        phi: '1fr 1.618fr',
        'phi-reverse': '1.618fr 1fr',
      },
      backdropBlur: {
        glass: colors.glass.blur,
      },
    },
  },
  plugins: [
    // Glassmorphism utilities
    function({ addUtilities }) {
      addUtilities({
        '.glass': {
          background: colors.glass.bg,
          backdropFilter: `blur(${colors.glass.blur})`,
          border: `1px solid ${colors.glass.stroke}`,
        },
        '.panel-glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
        },
        '.grid-phi': {
          display: 'grid',
          gridTemplateColumns: '1fr 1.618fr',
        },
        '.aspect-phi': {
          aspectRatio: '1.618',
        },
      });
    },
  ],
};

export default madfamPreset;
```

### 2.3 Consumer Usage

```typescript
// tailwind.config.ts in consuming project
import type { Config } from 'tailwindcss';
import madfamPreset from '@madfam/tailwind-preset';

const config: Config = {
  presets: [madfamPreset],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // Project-specific overrides
  theme: {
    extend: {
      // Custom extensions
    },
  },
};

export default config;
```

---

## Phase 3: UI Component Library

### 3.1 Components to Extract from aureo-labs

| Component | Priority | Complexity | Notes |
|-----------|----------|------------|-------|
| Button | 🔴 High | Low | CVA variants |
| Card | 🔴 High | Low | Glass variants |
| Input | 🔴 High | Medium | Form integration |
| Dialog/Modal | 🟡 Medium | Medium | Radix-based |
| Dropdown | 🟡 Medium | Medium | Radix-based |
| Navigation | 🟡 Medium | High | Site-specific |
| Hero | 🟢 Low | High | Site-specific |
| ProductCard | 🟢 Low | Medium | Domain-specific |

### 3.2 Package Structure

```
solarpunk-foundry/
└── packages/
    └── ui/
        ├── package.json
        ├── src/
        │   ├── index.ts
        │   ├── components/
        │   │   ├── button/
        │   │   │   ├── button.tsx
        │   │   │   ├── button.stories.tsx
        │   │   │   └── index.ts
        │   │   ├── card/
        │   │   ├── input/
        │   │   └── ...
        │   └── primitives/
        │       └── ... (Radix wrappers)
        └── dist/
```

---

## Phase 4: Migration Plan

### 4.1 aureo-labs (Origin)
1. Extract design tokens → `@madfam/design-tokens`
2. Extract Tailwind config → `@madfam/tailwind-preset`
3. Extract UI components → `@madfam/ui`
4. Update aureo-labs to consume shared packages
5. Verify no regressions

### 4.2 madfam-site (Consumer)
1. Install shared packages
2. Update `tailwind.config.ts` to use preset
3. Replace custom components with `@madfam/ui`
4. Test all pages
5. Remove deprecated local components

### 4.3 primavera3d (Consumer)
1. Install shared packages
2. Layer Blueprint aesthetic on top of base preset
3. Use base components, customize styling
4. Preserve unique Blueprint theme elements

---

## Phase 5: Implementation Timeline

| Week | Task | Deliverable |
|------|------|-------------|
| 1 | Extract design tokens | `@madfam/design-tokens` published |
| 1 | Create Tailwind preset | `@madfam/tailwind-preset` published |
| 2 | Extract Button, Card, Input | Core components in `@madfam/ui` |
| 2 | Update aureo-labs | Origin consumes own extracts |
| 3 | Migrate madfam-site | Full preset + component adoption |
| 3 | Migrate primavera3d | Preset with Blueprint layer |
| 4 | Extract remaining components | Complete `@madfam/ui` library |
| 4 | Documentation | Storybook + usage guides |

---

## Success Criteria

- [ ] `@madfam/design-tokens` published and consumed by 3+ repos
- [ ] `@madfam/tailwind-preset` provides consistent styling
- [ ] `@madfam/ui` has 10+ components with Storybook docs
- [ ] aureo-labs, madfam-site, primavera3d all use shared packages
- [ ] No visual regressions in any consumer
- [ ] Bundle size impact < 5KB per consumer

---

## Immediate Actions

### Today
1. Create package structure in solarpunk-foundry
2. Extract color and spacing tokens from aureo-labs
3. Create minimal Tailwind preset

### This Week
1. Extract Button, Card, Input components
2. Publish packages to private registry / workspace
3. Update aureo-labs to consume

### Next Sprint
1. Full migration of madfam-site
2. primavera3d adoption
3. Complete component library
