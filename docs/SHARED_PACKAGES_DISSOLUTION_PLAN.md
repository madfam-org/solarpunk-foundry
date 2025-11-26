# Shared Packages Dissolution & Restructuring Plan

**Date**: 2025-11-26  
**Status**: Proposed  
**Scope**: madfam-ui, madfam-configs, madfam-analytics → Legitimate shared packages

---

## Executive Summary

Three repos (`madfam-ui`, `madfam-configs`, `madfam-analytics`) exist outside the Solarpunk Foundry governance structure and violate the ecosystem's core principles. This plan dissolves them while extracting genuinely valuable shared concerns into properly architected, published packages.

### The Problem

| Repo | In Manifesto? | Published? | Used By | Status |
|------|---------------|------------|---------|--------|
| madfam-ui | ❌ | ❌ | 3 apps (broken) | Violates governance |
| madfam-configs | ❌ | ❌ | 0 apps | Dead code |
| madfam-analytics | ❌ | ❌ | 8 apps (broken) | Violates governance |

**Violations**:
1. Not in the Governance Table (README.md Section IV)
2. Breaks anti-pattern rule: "Don't create shared packages that everything depends on"
3. Prevents independent deployment (npm install fails)

### The Solution

```
┌─────────────────────────────────────────────────────────────────┐
│                        DISSOLVE                                  │
├─────────────────────────────────────────────────────────────────┤
│  madfam-ui (3604 LOC)     → Components copied to each app       │
│  madfam-configs (6 files) → DELETE (unused)                     │
│  madfam-analytics (380 LOC) → Inline OR publish properly        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CREATE (Properly)                            │
├─────────────────────────────────────────────────────────────────┤
│  @madfam/tokens     → Design tokens only (colors, spacing)      │
│  @madfam/types      → Shared TypeScript types                   │
│  @madfam/analytics  → Properly published (if centralized)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Dissolution Plans

### 1.1 madfam-configs → DELETE

**Current State**: 6 tsconfig JSON files, 0 consumers

**Action**: Delete entirely

```bash
# Step 1: Verify no imports exist (already confirmed: 0)
grep -r "@madfam/tsconfig" --include="*.json" ~/labspace/*/

# Step 2: Archive for reference (optional)
mv ~/labspace/madfam-configs ~/labspace/.archive/madfam-configs-$(date +%Y%m%d)

# Step 3: Or delete completely
rm -rf ~/labspace/madfam-configs
```

**Rationale**: 
- Zero adoption despite existing for weeks
- Each app already has working tsconfig
- ECOSYSTEM_ROADMAP.md explicitly says: "Each service owns its dependencies completely"

**Migration Effort**: None (no consumers)

---

### 1.2 madfam-ui → DISSOLVE into apps

**Current State**: 3604 LOC across components, themes, hooks

**Content Analysis**:

| Category | Files | LOC | Disposition |
|----------|-------|-----|-------------|
| Brand Colors/Themes | 2 | ~150 | → `@madfam/tokens` |
| Lead Form Components | 6 | ~800 | → madfam-site only |
| Assessment Components | 8 | ~600 | → madfam-site only |
| Generic Components | 10 | ~500 | → shadcn pattern (copy to apps) |
| Brand Components | 2 | ~200 | → madfam-site only |
| Hooks | 2 | ~100 | → Copy to apps that need them |
| Types | 2 | ~50 | → `@madfam/types` |

**Migration Steps**:

```bash
# Step 1: Extract design tokens to new package
mkdir -p ~/labspace/janua/packages/tokens
cp ~/labspace/madfam-ui/src/themes/brandColors.ts \
   ~/labspace/janua/packages/tokens/src/colors.ts

# Step 2: Copy madfam-site specific components
cp -r ~/labspace/madfam-ui/src/components/lead-form \
      ~/labspace/madfam-site/apps/web/components/
cp -r ~/labspace/madfam-ui/src/components/assessment \
      ~/labspace/madfam-site/apps/web/components/
cp ~/labspace/madfam-ui/src/components/Hero.tsx \
   ~/labspace/madfam-site/apps/web/components/
# ... etc for madfam-site specific components

# Step 3: For sim4d - copy only what it uses
cp ~/labspace/madfam-ui/src/components/Button.tsx \
   ~/labspace/sim4d/apps/studio/components/ui/
# (Analyze actual imports first)

# Step 4: For dhanam - copy only what it uses  
cp ~/labspace/madfam-ui/src/components/Card.tsx \
   ~/labspace/dhanam/apps/web/components/ui/

# Step 5: Update imports in each app
# FROM: import { Button } from '@madfam/ui'
# TO:   import { Button } from '@/components/ui/button'

# Step 6: Remove @madfam/ui from package.json in each app
# Step 7: Archive or delete madfam-ui repo
```

**Per-App Migration**:

| App | Current Import | Components Used | Action |
|-----|----------------|-----------------|--------|
| madfam-site | `@madfam/ui-standalone` (file:) | All lead-form, assessment, brand | Copy all to apps/web/components |
| sim4d | `file:../../../madfam-ui` | Unknown - needs audit | Copy only used components |
| dhanam | `@madfam/ui` (^0.1.0 - fails) | Unknown - needs audit | Copy only used components |

**Migration Effort**: ~4 hours

---

### 1.3 madfam-analytics → DECISION REQUIRED

**Current State**: 380 LOC, 8 apps reference it (all broken - not published)

**The Analytics File is Actually Good**:
- Clean singleton pattern
- Comprehensive event tracking (30+ event types)
- React hooks for different tracking domains
- Batched event queue for performance
- Funnel tracking, A/B testing, revenue tracking

**Two Valid Options**:

#### Option A: Inline into Each App (Recommended for Independence)

```bash
# For each app that needs analytics:
cp ~/labspace/madfam-analytics/src/index.ts \
   ~/labspace/APP_NAME/apps/web/lib/analytics.ts

# Update imports
# FROM: import { analytics } from '@madfam/analytics'
# TO:   import { analytics } from '@/lib/analytics'
```

**Pros**: 
- Each app is fully independent
- Can customize events per app
- No external dependency

**Cons**:
- 380 LOC duplicated 8 times (~3000 LOC total)
- Updates need to be made in 8 places

#### Option B: Properly Publish to npm

```bash
cd ~/labspace/madfam-analytics
pnpm build
npm publish --access public

# Then in each app, the existing import works:
# import { analytics } from '@madfam/analytics'  # Now resolves!
```

**Pros**:
- Single source of truth
- Updates propagate to all apps
- Already well-architected

**Cons**:
- Creates shared dependency (against ecosystem principles)
- Requires npm publish workflow
- Version coordination across apps

#### Recommendation: **Option A (Inline)** for apps, BUT...

Keep a "reference implementation" in the solarpunk-foundry docs:

```bash
# Archive the good code as reference
cp ~/labspace/madfam-analytics/src/index.ts \
   ~/labspace/solarpunk-foundry/templates/analytics-reference.ts
```

This way:
- Apps own their analytics (independence)
- New apps have a template to copy from
- No shared dependency

---

## Part 2: Legitimate Shared Packages

Based on ecosystem analysis, these concerns ARE worth sharing properly:

### 2.1 @madfam/tokens (NEW - Lives in Janua)

**Purpose**: Design tokens only (no components, no React)

**Location**: `~/labspace/janua/packages/tokens/`

**Why Janua?**: Janua is the identity/auth layer - it makes sense for brand identity tokens to live there. All apps already depend on Janua for auth.

**Contents**:
```typescript
// packages/tokens/src/index.ts
export { brandColors, generateCSSVariables } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';
export { breakpoints } from './breakpoints';
```

**Package.json**:
```json
{
  "name": "@janua/tokens",
  "version": "1.0.0",
  "description": "MADFAM/Solarpunk design tokens",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "publishConfig": {
    "access": "public"
  }
}
```

**Why This is Different**:
- Pure data (colors, spacing values) - not components
- Rarely changes (brand identity is stable)
- Small (<500 LOC)
- Lives in existing governed repo (Janua)
- Published to npm properly

---

### 2.2 @janua/types (NEW - Lives in Janua)

**Purpose**: Shared TypeScript types for auth and common patterns

**Location**: `~/labspace/janua/packages/types/`

**Contents**:
```typescript
// User types (currently duplicated in 4+ apps)
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'owner';
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Common utility types
export type Locale = 'en' | 'es' | 'pt';
export type Currency = 'USD' | 'MXN' | 'EUR';
export type Theme = 'light' | 'dark' | 'system';
```

**Why This is Different**:
- Types are compile-time only (zero runtime cost)
- Prevents 500+ LOC of duplication
- Ensures type consistency across ecosystem
- Lives in existing governed repo (Janua)

---

### 2.3 @janua/react-sdk (Already Exists - Enhance)

**Current State**: Already exists and is used by 5 apps

**Enhancement**: Add the "bridge" pattern currently duplicated in Dhanam

```typescript
// Add to existing @janua/react-sdk
export function useJanuaBridge() {
  // The 80 LOC currently duplicated in apps
  // Standardize auth state mapping
}
```

**No new repo needed** - just enhance existing package

---

## Part 3: What NOT to Create

Based on the ecosystem principles, do NOT create:

| ❌ Don't Create | Why |
|-----------------|-----|
| @madfam/ui | Components should be owned by each app (shadcn pattern) |
| @madfam/api-client | Each app has different API needs |
| @madfam/configs | Each app owns its configuration |
| @madfam/utils | Too generic, leads to bloat |

---

## Part 4: Implementation Roadmap

### Week 1: Cleanup

| Day | Task | Effort |
|-----|------|--------|
| 1 | Delete madfam-configs | 15 min |
| 1 | Audit madfam-ui imports in sim4d, dhanam | 1 hour |
| 2 | Copy madfam-ui components to madfam-site | 2 hours |
| 2 | Copy needed components to sim4d, dhanam | 1 hour |
| 3 | Update imports in all 3 apps | 2 hours |
| 3 | Remove @madfam/ui from all package.json | 30 min |
| 4 | Inline analytics.ts to 8 apps | 2 hours |
| 4 | Update analytics imports | 1 hour |
| 5 | Archive madfam-ui, madfam-analytics repos | 30 min |
| 5 | Test all apps build correctly | 2 hours |

### Week 2: New Packages (in Janua)

| Day | Task | Effort |
|-----|------|--------|
| 1 | Create packages/tokens in janua | 2 hours |
| 1 | Extract brandColors.ts, add typography/spacing | 2 hours |
| 2 | Create packages/types in janua | 2 hours |
| 2 | Define User, ApiResponse, ApiError types | 2 hours |
| 3 | Publish @janua/tokens, @janua/types to npm | 1 hour |
| 4 | Update apps to use @janua/tokens | 2 hours |
| 4 | Update apps to use @janua/types | 2 hours |
| 5 | Enhance @janua/react-sdk with bridge pattern | 2 hours |

### Week 3: Validation

| Task | Effort |
|------|--------|
| Verify each app builds independently | 2 hours |
| Verify each app can be deployed standalone | 2 hours |
| Update ecosystem documentation | 2 hours |
| Update solarpunk-foundry README governance table | 1 hour |

---

## Part 5: Updated Governance Table

After implementation, add to README.md Section IV:

```markdown
### Janua Sub-Packages (Part of Janua Repo)

| Package | Purpose | Published | Consumers |
|---------|---------|-----------|-----------|
| @janua/tokens | Design tokens (colors, spacing) | npm | All frontend apps |
| @janua/types | Shared TypeScript types | npm | All apps |
| @janua/react-sdk | React auth integration | npm | React apps |
| @janua/node-sdk | Node.js auth integration | npm | Backend apps |
```

These are NOT separate repos - they live within the Janua monorepo and are governed by Janua's release cycle.

---

## Part 6: Verification Checklist

After completion, verify:

- [ ] `madfam-configs` deleted or archived
- [ ] `madfam-ui` deleted or archived
- [ ] `madfam-analytics` deleted or archived
- [ ] No `file:../` references in any package.json
- [ ] No unpublished `@madfam/*` dependencies
- [ ] Each app builds with `pnpm install && pnpm build`
- [ ] Each app can be deployed independently
- [ ] `@janua/tokens` published to npm
- [ ] `@janua/types` published to npm
- [ ] Governance table updated in README.md

---

## Appendix A: Files to Preserve

Before deletion, archive these valuable files:

```bash
# From madfam-ui (valuable design work)
~/labspace/madfam-ui/src/themes/brandColors.ts     → janua/packages/tokens/
~/labspace/madfam-ui/src/themes/tailwindPreset.ts  → janua/packages/tokens/

# From madfam-analytics (reference implementation)
~/labspace/madfam-analytics/src/index.ts → solarpunk-foundry/templates/

# From madfam-configs (for reference only)
~/labspace/madfam-configs/*.json → solarpunk-foundry/templates/tsconfig/
```

---

## Appendix B: Breaking Change Communication

Notify team members:

```markdown
## Breaking Change: Shared Package Dissolution

**Effective**: [DATE]

### What's Changing
- `@madfam/ui` → Components now live in each app
- `@madfam/configs` → Deleted (was unused)
- `@madfam/analytics` → Inlined to each app

### What's New
- `@janua/tokens` → Design tokens (published to npm)
- `@janua/types` → Shared types (published to npm)

### Migration Required
If your app imports from `@madfam/*`:
1. Check this document for migration steps
2. Update imports to use local components
3. Run `pnpm install && pnpm build` to verify

### Questions
Contact: tech@madfam.io
```

---

*This plan aligns with the Solarpunk Foundry Manifesto: sovereign, self-contained services that can run independently while sharing identity (Janua) and design language (tokens).*
