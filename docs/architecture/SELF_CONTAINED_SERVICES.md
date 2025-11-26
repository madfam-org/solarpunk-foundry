# Self-Contained Services Architecture

## The Problem

The MADFAM ecosystem currently has **tightly coupled cross-repo dependencies**:

```
digifab-quoting ──depends on──> @forgesight/client (npm package)
madfam-site     ──depends on──> @avala/client (npm package)
multiple apps   ──depends on──> @janua/react-sdk (npm package)
multiple apps   ──depends on──> @coforma/client (npm package)
multiple apps   ──depends on──> @madfam/ui (file link)
```

This violates the Solarpunk Manifesto's sovereignty principle:
> *"Sovereignty is not just about owning your server; it's about owning your supply chain"*

**Current Pain Points:**
- Docker builds fail because npm packages aren't published
- `file:../../../` links break Docker context isolation
- Services can't be deployed independently
- Version coupling creates fragile dependencies

---

## The Solution: HTTP-First Architecture

### Principle: **Services communicate via APIs, not shared code**

Each client SDK (`@forgesight/client`, `@avala/client`, etc.) is just a **thin HTTP wrapper**. Instead of distributing these as npm packages, each consuming app should:

1. **Copy the types** it needs (or generate from OpenAPI)
2. **Make HTTP calls directly** to the service API
3. **Own its integration code** completely

### Before vs After

```
BEFORE (Coupled):
┌─────────────┐     npm install      ┌──────────────────┐
│   Cotiza    │ ─────────────────── │ @forgesight/client│
│   (app)     │                      │   (npm package)   │
└─────────────┘                      └──────────────────┘
       │                                     │
       │              HTTP                   │
       └──────────────────────────────────►  │
                                    ┌────────▼────────┐
                                    │  Forgesight API │
                                    └─────────────────┘

AFTER (Decoupled):
┌─────────────┐
│   Cotiza    │
│   (app)     │
│             │
│ /lib/       │
│  forgesight-│──────── HTTP ─────────►┌─────────────────┐
│  client.ts  │                        │  Forgesight API │
│  (owned)    │                        └─────────────────┘
└─────────────┘
```

---

## Implementation Strategy

### Step 1: Each Service Exposes OpenAPI Spec

Every MADFAM API should publish its OpenAPI specification:

```
GET /api/v1/openapi.json   # Machine-readable spec
GET /api/v1/docs           # Human-readable docs (Swagger UI)
```

### Step 2: Consuming Apps Generate/Copy Client Code

Each app that needs to call another service has two options:

**Option A: Copy Types + Simple Fetch (Recommended)**
```typescript
// cotiza/apps/api/src/integrations/forgesight/types.ts
// Copied/adapted from Forgesight's OpenAPI spec

export interface Material {
  id: string;
  name: string;
  pricing: PricingData;
  // ... only the fields Cotiza actually uses
}

// cotiza/apps/api/src/integrations/forgesight/client.ts
export class ForgesightClient {
  constructor(private baseUrl: string, private apiKey?: string) {}
  
  async getMaterial(id: string): Promise<Material> {
    const res = await fetch(`${this.baseUrl}/api/v1/materials/${id}`, {
      headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {},
    });
    if (!res.ok) throw new Error(`Forgesight error: ${res.status}`);
    return res.json();
  }
}
```

**Option B: Auto-generate from OpenAPI**
```bash
# Generate TypeScript client from OpenAPI spec
npx openapi-typescript-codegen \
  --input http://localhost:8100/api/v1/openapi.json \
  --output src/integrations/forgesight/generated \
  --client fetch
```

### Step 3: Remove npm Package Dependencies

Replace:
```json
{
  "dependencies": {
    "@forgesight/client": "^0.1.0"  // ❌ Remove
  }
}
```

With owned integration code:
```
src/
  integrations/
    forgesight/
      client.ts      # HTTP client (owned)
      types.ts       # Types (owned/generated)
    janua/
      client.ts
      types.ts
    coforma/
      client.ts
      types.ts
```

---

## Dependency Elimination Plan

### Tier 1: API Client Packages (Eliminate via HTTP)

| Package | Used By | Action |
|---------|---------|--------|
| `@forgesight/client` | digifab-quoting | Create `integrations/forgesight/` |
| `@avala/client` | madfam-site | Create `integrations/avala/` |
| `@coforma/client` | multiple | Create `integrations/coforma/` in each |
| `@cotiza/client` | primavera3d | Create `integrations/cotiza/` |
| `@janua/typescript-sdk` | multiple | See Tier 2 (special case) |

### Tier 2: Auth SDK (Janua) - Special Handling

Janua auth is used by almost every app. Two approaches:

**Option A: Standard JWT Middleware (Preferred)**
```typescript
// Each app implements standard JWT verification
// No SDK needed - just verify tokens from Janua

import jwt from 'jsonwebtoken';

export function verifyJanuaToken(token: string) {
  return jwt.verify(token, process.env.JANUA_JWT_SECRET, {
    issuer: process.env.JANUA_ISSUER_URL,
  });
}
```

**Option B: Minimal Copied Auth Helper**
```typescript
// Copy only what's needed for auth
// ~50 lines vs entire SDK
```

### Tier 3: UI Components (@madfam/ui, @madfam/analytics)

These have `file:../../../` links to external repos. Options:

**Option A: Inline Components (Preferred for small usage)**
- Copy the specific components each app actually uses
- Each app owns its UI completely

**Option B: True Shared Package Repo**
- Create `madfam-packages` monorepo
- All shared UI/utils live there
- Apps depend on it via git submodule (not npm)

**Option C: Remove the Abstraction**
- If madfam-ui is just re-exporting Tailwind/shadcn components
- Each app uses those directly

### Tier 4: Workspace Internal Packages

Packages like `@cotiza/shared`, `@janua/ui` that are **within** the same repo:
- These are fine - pnpm workspace handles them
- No cross-repo issues

---

## Migration Checklist

### For Each App:

- [ ] List all `@scope/client` dependencies
- [ ] Create `src/integrations/<service>/` directory
- [ ] Copy/generate types from OpenAPI spec
- [ ] Implement minimal HTTP client
- [ ] Replace imports: `from '@x/client'` → `from '@/integrations/x'`
- [ ] Remove npm dependency
- [ ] Verify Docker build works in isolation

### For Each Service:

- [ ] Expose `/api/v1/openapi.json` endpoint
- [ ] Document API in `/api/v1/docs`
- [ ] Ensure health endpoint exists
- [ ] Version API properly (v1, v2, etc.)

---

## Benefits

1. **Docker Builds Work**: No external npm dependencies needed
2. **True Sovereignty**: Each app owns all its code
3. **Independent Deployment**: Services can evolve independently
4. **Clearer Contracts**: HTTP APIs are the contract, not npm versions
5. **Simpler Mental Model**: Services talk via HTTP, period
6. **Resilience**: One service's npm issues don't break others

---

## Anti-Patterns to Avoid

❌ **Don't**: Create a "common" package that everything depends on
❌ **Don't**: Use git submodules for runtime dependencies  
❌ **Don't**: Publish to private npm registry (Verdaccio)
❌ **Don't**: Share database schemas across services
❌ **Don't**: Import types from other service's source code

✅ **Do**: Duplicate types when needed (it's okay!)
✅ **Do**: Keep integration code minimal and focused
✅ **Do**: Use HTTP for all cross-service communication
✅ **Do**: Generate clients from OpenAPI when possible
✅ **Do**: Own your dependencies completely

---

## Example: Cotiza → Forgesight Integration

### Current (Broken)
```json
// digifab-quoting/apps/api/package.json
{
  "dependencies": {
    "@forgesight/client": "^0.1.0"  // Fails: not published
  }
}
```

### Fixed (Self-Contained)
```
digifab-quoting/
  apps/
    api/
      src/
        integrations/
          forgesight/
            client.ts     # 50 lines of fetch wrapper
            types.ts      # Only types Cotiza needs
            index.ts      # Export facade
        services/
          pricing.service.ts  # Uses ForgesightClient
```

```typescript
// integrations/forgesight/client.ts
export class ForgesightClient {
  constructor(
    private baseUrl = process.env.FORGESIGHT_API_URL || 'http://forgesight-api:8100'
  ) {}

  async getQuotePricing(params: QuotePricingParams): Promise<QuotePricingResult> {
    const response = await fetch(`${this.baseUrl}/api/v1/quote/pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`Forgesight pricing failed: ${response.status}`);
    }
    
    return response.json();
  }
}
```

---

## Timeline

1. **Week 1**: Add OpenAPI specs to all services
2. **Week 2**: Migrate Cotiza (remove @forgesight/client)
3. **Week 3**: Migrate madfam-site (remove @avala/client, @madfam/ui)
4. **Week 4**: Migrate remaining apps
5. **Ongoing**: New integrations always use HTTP-first pattern

---

*This architecture aligns with the Solarpunk Manifesto: each service is sovereign, self-contained, and communicates through clear HTTP contracts.*
