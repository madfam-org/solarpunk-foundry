# Dependency Migration Status

## Overview

Migration from npm package dependencies to self-contained HTTP integrations, aligned with the Solarpunk Manifesto's sovereignty principle.

## Completed

### ✅ Cotiza API (`digifab-quoting/apps/api`)

**Removed Dependencies:**
- `@forgesight/client` → Replaced with `src/integrations/forgesight/`
- `@coforma/client` → Replaced with `src/integrations/coforma/`

**Files Created:**
```
apps/api/src/integrations/
├── forgesight/
│   ├── types.ts      # Type definitions
│   ├── client.ts     # HTTP client
│   └── index.ts      # Public exports
└── coforma/
    ├── types.ts
    ├── client.ts
    └── index.ts
```

**Updated:**
- `apps/api/package.json` - Removed external deps
- `apps/api/src/modules/pricing/forgesight.service.ts` - Updated imports

---

## Remaining Migration Work

### 🔴 High Priority (Blocking Docker Builds)

#### madfam-site
| Dependency | Type | Recommended Action |
|------------|------|-------------------|
| `@avala/client` | API client | Create `integrations/avala/` |
| `@madfam/ui-standalone` | UI library (40 files) | Use shadcn/tailwind directly OR git submodule |
| `@madfam/analytics-standalone` | Analytics (1 file) | Inline the code |

#### digifab-quoting/apps/web
| Dependency | Type | Recommended Action |
|------------|------|-------------------|
| `@janua/react-sdk` | Auth SDK | Implement JWT verification directly |

#### sim4d
| Dependency | Type | Recommended Action |
|------------|------|-------------------|
| `@madfam/geom-core` | Geometry library | Git submodule (large C++/WASM) |
| `@madfam/ui` | UI library | Use underlying components |
| `@madfam/analytics` | Analytics | Inline |
| `@janua/react-sdk` | Auth SDK | Implement JWT verification directly |

### 🟡 Medium Priority

#### Multiple Apps - Janua Auth
Apps using `@janua/react-sdk` or `@janua/typescript-sdk`:
- avala/apps/web
- coforma-studio/packages/web
- dhanam/apps/web
- forgesight/apps/app
- forj/apps/web
- primavera3d/apps/web

**Recommended Solution:** Create a simple JWT verification utility that each app owns:

```typescript
// Each app: src/lib/auth/janua.ts
import jwt from 'jsonwebtoken';

export function verifyJanuaToken(token: string) {
  return jwt.verify(token, process.env.JANUA_JWT_SECRET!, {
    issuer: process.env.JANUA_ISSUER_URL,
  });
}

export function getAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}
```

### 🟢 Low Priority (Internal Workspace)

These are **workspace internal** and work correctly:
- `@cotiza/pricing-engine` (within digifab-quoting)
- `@cotiza/shared` (within digifab-quoting)
- `@janua/ui` (within janua)
- `@forgesight/config` (within forgesight)

No action needed - pnpm workspaces handle these.

---

## Migration Pattern

For each external `@scope/client` dependency:

### 1. Create Integration Directory
```bash
mkdir -p src/integrations/<service>
```

### 2. Define Types (types.ts)
```typescript
// Only include types YOUR app actually uses
export interface Material { ... }
export interface PricingResult { ... }
```

### 3. Create HTTP Client (client.ts)
```typescript
export class ServiceClient {
  constructor(private baseUrl = process.env.SERVICE_URL) {}
  
  async getData(): Promise<Data> {
    const res = await fetch(`${this.baseUrl}/api/v1/data`);
    if (!res.ok) throw new Error(`Service error: ${res.status}`);
    return res.json();
  }
}
```

### 4. Update Imports
```typescript
// Before
import { Client } from '@service/client';

// After
import { ServiceClient } from '@/integrations/service';
```

### 5. Remove from package.json
```json
{
  "dependencies": {
    "@service/client": "^0.1.0"  // DELETE THIS
  }
}
```

---

## Shared UI Strategy

The `@madfam/ui` package is a special case - it's a real component library with 40+ files.

### Options:

**Option A: Direct Component Usage (Recommended)**
- Each app uses shadcn/ui + tailwind directly
- Copy specific components as needed
- Full ownership, no external deps

**Option B: Git Submodule**
```bash
# In each consuming repo
git submodule add ../madfam-ui packages/ui
```
- Pros: Single source of truth
- Cons: Submodule complexity

**Option C: Monorepo Consolidation**
- Move UI components into a true monorepo
- All apps in one repo
- Pros: Simplest dependency management
- Cons: Large repo, less flexibility

### Recommendation
Start with **Option A** - each app owns its UI. If patterns emerge, extract shared components into a proper monorepo structure later.

---

## Docker Build Verification

After migration, verify each service builds in isolation:

```bash
# Test isolated build (no network to other repos)
cd <service>
docker build --network=none -t test-build .
```

If it builds with `--network=none`, it's truly self-contained.

---

## Timeline Estimate

| Service | Effort | Priority |
|---------|--------|----------|
| madfam-site | 2-3 hours | High |
| digifab-quoting/web | 1 hour | High |
| sim4d | 3-4 hours | Medium |
| Other apps (Janua auth) | 30 min each | Medium |

Total: ~1-2 days of focused work to complete all migrations.

---

*Last Updated: November 26, 2025*
