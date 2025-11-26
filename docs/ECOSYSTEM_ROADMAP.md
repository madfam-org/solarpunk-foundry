# MADFAM Ecosystem - Long-Term Health Roadmap

## Executive Summary

The ecosystem has **strong foundations** (well-architected apps, shared infrastructure, clear domain separation) but lacks **production-readiness infrastructure**. This roadmap prioritizes fixes by impact and effort.

---

## Current State

### ✅ What's Working
- Shared PostgreSQL, Redis, MinIO infrastructure
- Federated architecture with clear service boundaries
- Python APIs (Janua, Forgesight) build and run correctly
- Domain alignment (enclii.dev, janua.dev)
- Port allocation strategy documented

### 🔴 Critical Blockers (Production Impossible)
1. No pnpm lock files → Non-reproducible builds
2. Unpublished npm packages → Docker builds fail
3. No CI/CD pipelines → Manual deployment only
4. No deployment configuration → Production undefined

### 🟠 High Risk (Production Fragile)
1. Missing environment documentation
2. No health check integration
3. Hardcoded URLs/secrets
4. No API contracts/OpenAPI specs

---

## Phase 1: Foundation (Week 1-2)
**Goal: Reproducible builds that work anywhere**

### 1.1 Lock Files ⏱️ 2 hours
```bash
# In each repo root
pnpm install --lockfile-only
git add pnpm-lock.yaml
git commit -m "chore: add pnpm lock file for reproducible builds"
```

**Affected repos:** All 12+ repos

### 1.2 Environment Documentation ⏱️ 4 hours

Create `.env.example` in each repo:

```bash
# Template for all repos
cat > .env.example << 'EOF'
# ===========================================
# Required Environment Variables
# ===========================================

# Database (uses shared MADFAM PostgreSQL)
DATABASE_URL=postgresql://madfam:madfam_dev_password@localhost:5432/SERVICE_db

# Redis (uses shared MADFAM Redis)
REDIS_URL=redis://:redis_dev_password@localhost:6379/INDEX

# Authentication (Janua integration)
JANUA_API_URL=http://localhost:8001
JANUA_JWT_SECRET=dev-shared-janua-secret-32chars!!

# Application
NODE_ENV=development
PORT=XXXX

# ===========================================
# Optional / Service-Specific
# ===========================================
# Add service-specific variables below
EOF
```

### 1.3 Eliminate Cross-Repo Dependencies ⏱️ 8 hours

**Priority order:**

| Repo | Dependency | Action | Effort |
|------|-----------|--------|--------|
| digifab-quoting/api | ~~@forgesight/client~~ | ✅ Done | - |
| digifab-quoting/api | ~~@coforma/client~~ | ✅ Done | - |
| digifab-quoting/web | @janua/react-sdk | Create integrations/janua/ | 2h |
| madfam-site/web | @avala/client | Create integrations/avala/ | 1h |
| madfam-site | @madfam/ui-standalone | Decision needed (see below) | 2h |
| sim4d | @madfam/geom-core | Git submodule | 1h |
| Multiple apps | @janua/*-sdk | JWT verification utility | 2h |

**@madfam/ui Decision:**
- **Option A (Recommended):** Each app uses shadcn/tailwind directly, copy specific components as needed
- **Option B:** Convert madfam-ui to git submodule
- **Option C:** True monorepo consolidation

---

## Phase 2: Containerization (Week 2-3)
**Goal: Every service runs in Docker**

### 2.1 Dockerfile Templates ⏱️ 6 hours

**Next.js App Template:**
```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build --filter=@scope/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

**NestJS API Template:**
```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build --filter=@scope/api

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8000
CMD ["node", "dist/main.js"]
```

### 2.2 Update docker-compose Files ⏱️ 4 hours

Each repo's docker-compose.yml should:
1. Use the new Dockerfile
2. Connect to `madfam-shared-network`
3. Reference shared infrastructure by container name
4. Include health checks

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://madfam:madfam_dev_password@madfam-postgres-shared:5432/service_db
      REDIS_URL: redis://:redis_dev_password@madfam-redis-shared:6379/INDEX
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - madfam-shared-network

networks:
  madfam-shared-network:
    external: true
```

---

## Phase 3: CI/CD Pipeline (Week 3-4)
**Goal: Automated testing and deployment**

### 3.1 GitHub Actions Workflow ⏱️ 6 hours

Create `.github/workflows/ci.yml` template:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  docker:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - run: docker build -t ${{ github.repository }}:${{ github.sha }} .
```

### 3.2 Deployment Pipeline ⏱️ 8 hours

Options by service type:

| Service Type | Recommended Platform | Reason |
|--------------|---------------------|--------|
| Next.js frontend | Vercel / Cloudflare Pages | Zero-config, edge functions |
| NestJS/Python API | Hetzner + Docker | Cost-effective, sovereign |
| Static sites | GitHub Pages / Cloudflare | Free, fast |

---

## Phase 4: API Contracts (Week 4-5)
**Goal: Machine-readable API documentation**

### 4.1 OpenAPI Generation ⏱️ 4 hours

**For NestJS APIs (using @nestjs/swagger):**
```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Service Name API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

// Export OpenAPI spec
import { writeFileSync } from 'fs';
writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
```

**For Python APIs (FastAPI already does this):**
```python
# Already available at /docs and /openapi.json
```

### 4.2 Client Generation ⏱️ 2 hours

```bash
# Generate TypeScript client from OpenAPI
npx openapi-typescript-codegen \
  --input http://localhost:8100/openapi.json \
  --output src/generated/forgesight-client \
  --client fetch
```

---

## Phase 5: Observability (Week 5-6)
**Goal: Know when things break before users do**

### 5.1 Health Endpoints ⏱️ 4 hours

Standardize across all services:

```
GET /health          → {"status": "healthy", "version": "1.0.0"}
GET /health/ready    → {"status": "ready", "checks": {...}}
GET /health/live     → {"status": "alive"}
```

### 5.2 Structured Logging ⏱️ 4 hours

```typescript
// Use pino or winston consistently
logger.info({ 
  event: 'request_completed',
  duration_ms: 45,
  status: 200,
  path: '/api/v1/quotes'
});
```

### 5.3 Error Tracking ⏱️ 2 hours

Sentry is already in several apps. Standardize:
- Same DSN format across apps
- Source maps upload in CI
- Release tracking

---

## Phase 6: Security Hardening (Week 6-7)
**Goal: Production-safe defaults**

### 6.1 Security Headers ⏱️ 2 hours

Standardize Next.js security headers:

```typescript
// next.config.js - copy to all Next.js apps
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
```

### 6.2 Secrets Management ⏱️ 4 hours

- Move from .env files to proper secrets manager
- Options: Doppler, Infisical, or Hetzner's secret store
- Never commit secrets, even in .env.example

### 6.3 Dependency Auditing ⏱️ 2 hours

Add to CI pipeline:
```yaml
- run: pnpm audit --audit-level=high
```

---

## Phase 7: Testing Infrastructure (Week 7-8)
**Goal: Confidence in changes**

### 7.1 Unit Test Coverage ⏱️ 8 hours

Set minimum thresholds:
```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70
    }
  }
}
```

### 7.2 E2E Tests ⏱️ 8 hours

Playwright is installed but not configured:
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 7.3 Integration Tests ⏱️ 4 hours

Test service-to-service communication:
```typescript
describe('Cotiza → Forgesight Integration', () => {
  it('fetches material pricing', async () => {
    const forgesight = new ForgesightClient();
    const pricing = await forgesight.getQuotePricing({...});
    expect(pricing.totalCost).toBeGreaterThan(0);
  });
});
```

---

## Summary: Effort Estimation

| Phase | Effort | Priority | Dependencies |
|-------|--------|----------|--------------|
| 1. Foundation | 14 hours | 🔴 Critical | None |
| 2. Containerization | 10 hours | 🔴 Critical | Phase 1 |
| 3. CI/CD | 14 hours | 🔴 Critical | Phase 1, 2 |
| 4. API Contracts | 6 hours | 🟠 High | Phase 1 |
| 5. Observability | 10 hours | 🟠 High | Phase 2 |
| 6. Security | 8 hours | 🟠 High | Phase 1 |
| 7. Testing | 20 hours | 🟡 Medium | Phase 1, 3 |

**Total: ~82 hours (2-3 weeks focused work)**

---

## Quick Wins (Do This Week)

1. **Generate lock files** - 2 hours, massive impact
2. **Create .env.example files** - 4 hours, unblocks onboarding
3. **Finish Cotiza dependency migration** - 2 hours (web app)
4. **Document port allocations** - 1 hour (already done in PORT_ALLOCATION.md)

---

## Anti-Patterns to Avoid

❌ Don't add Verdaccio or private npm registry
❌ Don't create "shared" packages that everything depends on
❌ Don't use `npm ci` without lock files
❌ Don't hardcode URLs - always use environment variables
❌ Don't skip health checks in Docker
❌ Don't deploy without CI/CD pipeline

✅ Each service owns its dependencies completely
✅ HTTP APIs are the contract between services
✅ Lock files checked into git
✅ Environment variables documented in .env.example
✅ Every service has /health endpoint
✅ Automated tests run on every PR

---

*This roadmap aligns with the Solarpunk Manifesto: sovereign, self-contained services with clear contracts and reproducible builds.*
